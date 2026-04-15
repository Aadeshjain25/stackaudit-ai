/**
 * Scoring model (high-level):
 * - Per-file risk: converts complexity/nesting/size/dependencies/issues into a point total and maps to low/medium/high/critical.
 *   Thresholds: complexity <10 low driver, 10-20 moderate, >25 strong driver; nesting <=3 acceptable, >4 risky.
 * - Repo score: weighted blend of 4 sub-scores (0-100): maintainability, reliability, modularity, resilience.
 *   Penalties are thresholded + normalized per-file so large repos aren't punished just for being large.
 * - Positive signals: +5 if average complexity <8, +5 if no critical files, +5 if majority files are low risk.
 * - Final score is clamped to 0-100 and graded A-F.
 */
import type { AuditScore, FileFinding, RiskLevel, SummaryMetrics } from "@/src/types/audit";

type FileRiskInput = Pick<
  FileFinding,
  "complexity" | "maxNestingDepth" | "lineCount" | "dependencyCount" | "issues"
>;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateFileRiskLevel(input: FileRiskInput): RiskLevel {
  const issueWeight = input.issues.reduce((sum, issue) => {
    if (issue.severity === "high") {
      return sum + 12;
    }

    if (issue.severity === "medium") {
      return sum + 6;
    }

    return sum + 2;
  }, 0);

  const complexityPoints = (() => {
    if (input.complexity < 10) {
      return 0;
    }

    if (input.complexity <= 20) {
      return (input.complexity - 9) * 1.8;
    }

    if (input.complexity <= 25) {
      return 19.8 + (input.complexity - 20) * 2.4;
    }

    return 31.8 + (input.complexity - 25) * 3;
  })();

  const nestingPoints = (() => {
    if (input.maxNestingDepth <= 3) {
      return 0;
    }

    if (input.maxNestingDepth === 4) {
      return 8;
    }

    return 8 + (input.maxNestingDepth - 4) * 10;
  })();

  const sizePoints = Math.max(0, input.lineCount - 200) * 0.04;
  const dependencyPoints = Math.max(0, input.dependencyCount - 8) * 2.2;

  const total = complexityPoints + nestingPoints + sizePoints + dependencyPoints + issueWeight;

  if (total >= 80) {
    return "critical";
  }

  if (total >= 55) {
    return "high";
  }

  if (total >= 28) {
    return "medium";
  }

  return "low";
}

function getGrade(score: number): AuditScore["grade"] {
  if (score >= 90) {
    return "A";
  }

  if (score >= 80) {
    return "B";
  }

  if (score >= 70) {
    return "C";
  }

  if (score >= 60) {
    return "D";
  }

  return "F";
}

export function calculateScore(summaryMetrics: SummaryMetrics, fileFindings: FileFinding[]): AuditScore {
  const highRiskFiles = fileFindings.filter(
    (finding) => finding.riskLevel === "high" || finding.riskLevel === "critical",
  ).length;
  const criticalFiles = fileFindings.filter((finding) => finding.riskLevel === "critical").length;
  const lowRiskFiles = fileFindings.filter((finding) => finding.riskLevel === "low").length;
  const averageDependencies =
    fileFindings.length > 0
      ? fileFindings.reduce((sum, finding) => sum + finding.dependencyCount, 0) / fileFindings.length
      : 0;

  const totalFiles = Math.max(1, fileFindings.length);
  const highRiskRatio = highRiskFiles / totalFiles;
  const criticalRatio = criticalFiles / totalFiles;
  const averageBranchesPerFile = summaryMetrics.totalBranches / totalFiles;
  const averageLoopsPerFile = summaryMetrics.totalLoops / totalFiles;
  const averageFunctionsPerFile = summaryMetrics.totalFunctions / totalFiles;
  const averageComplexityPerFile = summaryMetrics.totalComplexity / totalFiles;

  const complexityPenalty = (() => {
    const averageComplexity = summaryMetrics.averageComplexity;

    if (averageComplexity < 10) {
      return 0;
    }

    if (averageComplexity <= 20) {
      return (averageComplexity - 10) * 1.68;
    }

    if (averageComplexity <= 25) {
      return 16.8 + (averageComplexity - 20) * 2.2;
    }

    return 27.8 + (averageComplexity - 25) * 2.8;
  })();

  const nestingPenalty = (() => {
    const maxDepth = summaryMetrics.maxNestingDepth;

    if (maxDepth <= 3) {
      return 0;
    }

    if (maxDepth === 4) {
      return 4.2;
    }

    return 4.2 + (maxDepth - 4) * 7.5;
  })();

  const maintainability = clamp(
    100 -
      complexityPenalty -
      nestingPenalty -
      averageBranchesPerFile * 1.1,
  );

  const reliability = clamp(
    100 -
      highRiskRatio * 35 -
      criticalRatio * 35 -
      summaryMetrics.parseErrors * 10 -
      summaryMetrics.filesSkipped * 1.2,
  );

  const modularity = clamp(
    100 -
      Math.max(0, averageDependencies - 8) * 3.2 -
      fileFindings.filter((finding) => finding.lineCount > 450).length * 6,
  );

  const resilience = clamp(
    100 -
      averageComplexityPerFile * 1.4 -
      averageLoopsPerFile * 6.2 -
      averageFunctionsPerFile * 0.85,
  );

  const baseValue = Math.round(
    maintainability * 0.35 +
      reliability * 0.3 +
      modularity * 0.2 +
      resilience * 0.15,
  );

  let bonus = 0;

  if (summaryMetrics.averageComplexity < 8) {
    bonus += 5;
  }

  if (criticalFiles === 0) {
    bonus += 5;
  }

  if (lowRiskFiles > totalFiles / 2) {
    bonus += 5;
  }

  const value = clamp(baseValue + bonus, 0, 100);
  const finalValue = Math.round(value);

  const rationale = [
    `Average complexity is ${summaryMetrics.averageComplexity}, with ${highRiskFiles} high-risk files.`,
    `${summaryMetrics.parseErrors} files failed parsing and ${summaryMetrics.filesSkipped} files were skipped by safety limits.`,
    `Maximum nesting depth reached ${summaryMetrics.maxNestingDepth}, which affects maintainability.`,
    bonus > 0 ? `Positive signals added +${bonus} score.` : "No positive-signal bonus applied.",
  ];

  return {
    value: finalValue,
    grade: getGrade(finalValue),
    breakdown: {
      maintainability: Math.round(maintainability),
      reliability: Math.round(reliability),
      modularity: Math.round(modularity),
      resilience: Math.round(resilience),
    },
    rationale,
  };
}
