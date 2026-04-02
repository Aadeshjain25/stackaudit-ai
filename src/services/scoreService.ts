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
      return sum + 18;
    }

    if (issue.severity === "medium") {
      return sum + 10;
    }

    return sum + 4;
  }, 0);

  const total =
    input.complexity * 1.8 +
    input.maxNestingDepth * 7 +
    Math.max(0, input.lineCount - 120) * 0.06 +
    Math.max(0, input.dependencyCount - 6) * 3 +
    issueWeight;

  if (total >= 90) {
    return "critical";
  }

  if (total >= 60) {
    return "high";
  }

  if (total >= 32) {
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
  const averageDependencies =
    fileFindings.length > 0
      ? fileFindings.reduce((sum, finding) => sum + finding.dependencyCount, 0) / fileFindings.length
      : 0;

  const maintainability = clamp(
    100 -
      summaryMetrics.averageComplexity * 2.8 -
      summaryMetrics.maxNestingDepth * 6 -
      summaryMetrics.totalBranches * 0.3,
  );
  const reliability = clamp(
    100 -
      highRiskFiles * 10 -
      criticalFiles * 8 -
      summaryMetrics.parseErrors * 12 -
      summaryMetrics.filesSkipped * 2,
  );
  const modularity = clamp(
    100 -
      averageDependencies * 5 -
      fileFindings.filter((finding) => finding.lineCount > 350).length * 7,
  );
  const resilience = clamp(
    100 -
      summaryMetrics.totalComplexity * 0.2 -
      summaryMetrics.totalLoops * 1.8 -
      summaryMetrics.totalFunctions * 0.15,
  );

  const value = Math.round(
    maintainability * 0.35 +
      reliability * 0.3 +
      modularity * 0.2 +
      resilience * 0.15,
  );

  const rationale = [
    `Average complexity is ${summaryMetrics.averageComplexity}, with ${highRiskFiles} high-risk files.`,
    `${summaryMetrics.parseErrors} files failed parsing and ${summaryMetrics.filesSkipped} files were skipped by safety limits.`,
    `Maximum nesting depth reached ${summaryMetrics.maxNestingDepth}, which affects maintainability.`,
  ];

  return {
    value,
    grade: getGrade(value),
    breakdown: {
      maintainability: Math.round(maintainability),
      reliability: Math.round(reliability),
      modularity: Math.round(modularity),
      resilience: Math.round(resilience),
    },
    rationale,
  };
}

