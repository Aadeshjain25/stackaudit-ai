import type { AuditRunResult, FileFinding, RiskLevel } from "@/src/types/audit";

export type ReadableContext = {
  executiveSummary: string;
  engineeringRisks: string[];
  practicalNextFixes: string[];
  riskDistributionLabel: string;
  topRiskyFiles: string[];
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function rankRisk(value: RiskLevel) {
  const rank: Record<RiskLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };

  return rank[value] ?? 0;
}

export function compareFindingsByRisk(a: FileFinding, b: FileFinding) {
  const riskDiff = rankRisk(b.riskLevel) - rankRisk(a.riskLevel);
  if (riskDiff !== 0) {
    return riskDiff;
  }

  return (
    b.complexity - a.complexity ||
    b.maxNestingDepth - a.maxNestingDepth ||
    b.lineCount - a.lineCount ||
    b.dependencyCount - a.dependencyCount
  );
}

function formatRiskDistribution(report: AuditRunResult) {
  const distribution = report.summaryMetrics.riskDistribution;

  return `${distribution.low} low / ${distribution.medium} medium / ${distribution.high} high / ${distribution.critical} critical`;
}

function getTopRiskyFilePaths(report: AuditRunResult, limit: number) {
  return [...report.fileFindings]
    .filter((finding) => finding.riskLevel !== "low")
    .sort(compareFindingsByRisk)
    .slice(0, limit)
    .map((finding) => finding.filePath);
}

function getDrivers(report: AuditRunResult) {
  const drivers = [
    report.fileFindings.some((finding) => finding.complexity >= 14) ? "high cyclomatic complexity" : "",
    report.fileFindings.some((finding) => finding.maxNestingDepth >= 3) ? "deep nesting" : "",
    report.fileFindings.some((finding) => finding.lineCount >= 250) ? "large files" : "",
    report.fileFindings.some((finding) => finding.dependencyCount >= 14) ? "broad dependency usage" : "",
  ].filter(Boolean);

  return unique(drivers);
}

export function getReadableContext(report: AuditRunResult): ReadableContext {
  const repoLabel = report.repoName ? `'${report.repoName}'` : "This repository";
  const scoreSentence = `${repoLabel} has an overall score of ${report.score.value}/100`;
  const riskDistributionLabel = formatRiskDistribution(report);
  const topRiskyFiles = getTopRiskyFilePaths(report, 7);

  const drivers = getDrivers(report);
  const driverSentence =
    drivers.length > 0
      ? `The analysis identified issues related to ${drivers.join(", ")}, which can make the code harder to maintain and reason about.`
      : "The analysis identified hotspots that can make the code harder to maintain and reason about.";

  const executiveSummary = `${scoreSentence}, indicating significant areas for improvement. Risk distribution: ${riskDistributionLabel}. ${driverSentence}`;

  const riskyFileSentence =
    topRiskyFiles.length > 0
      ? `The top engineering risks are concentrated in: ${topRiskyFiles.join(", ")}.`
      : "The top engineering risks are driven more by patterns than by a small set of individual hotspots.";

  const engineeringRisks = [
    "High cyclomatic complexity and deep nesting create maintenance hotspots, slow down refactors, and increase regression risk.",
    "Large or highly-coupled modules raise review overhead and make it harder to test changes in isolation.",
    riskyFileSentence,
  ];

  const practicalNextFixes: string[] = [];

  if (topRiskyFiles.length > 0) {
    practicalNextFixes.push(`Start with small, safe refactors in: ${topRiskyFiles.slice(0, 5).join(", ")}.`);
  }

  if (report.fileFindings.some((finding) => finding.complexity >= 14)) {
    practicalNextFixes.push("Split long branches into smaller helpers and reduce nested decision paths to bring complexity down.");
  }

  if (report.fileFindings.some((finding) => finding.maxNestingDepth >= 3)) {
    practicalNextFixes.push("Introduce guard clauses and extract conditional branches into named functions to flatten nesting.");
  }

  if (report.fileFindings.some((finding) => finding.lineCount >= 250)) {
    practicalNextFixes.push("Extract lower-level helpers from large files so the top-level modules focus on orchestration.");
  }

  if (report.fileFindings.some((finding) => finding.dependencyCount >= 14)) {
    practicalNextFixes.push("Reduce dependency surface in heavily coupled files by splitting responsibilities and consolidating shared utilities.");
  }

  const uniqueFixes = unique(practicalNextFixes).slice(0, 5);

  if (uniqueFixes.length === 0) {
    uniqueFixes.push("Keep the current structure consistent and monitor complexity, nesting, and file size as the codebase evolves.");
  }

  return {
    executiveSummary,
    engineeringRisks,
    practicalNextFixes: uniqueFixes,
    riskDistributionLabel,
    topRiskyFiles,
  };
}

