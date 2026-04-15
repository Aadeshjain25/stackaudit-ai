import type { AuditRunResult, FileFinding } from "@/src/types/audit";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export type ReadableContext = {
  executiveSummary: string;
  engineeringRisks: string[];
  practicalNextFixes: string[];
};

export function getKeyInsight(report: AuditRunResult) {
  const fileWithNesting = report.fileFindings.find((finding) => finding.maxNestingDepth >= 5);
  const largeFile = report.fileFindings.find((finding) => finding.lineCount >= 250);
  const coupledFile = report.fileFindings.find((finding) => finding.dependencyCount >= 14);

  const points: string[] = [];

  if (fileWithNesting) {
    points.push("High complexity is being driven by deep nesting in a few key files.");
  }

  if (largeFile) {
    points.push("Large files are making maintainability harder and increasing review overhead.");
  }

  if (coupledFile) {
    points.push("Broad dependency usage suggests coupling is contributing to risk.");
  }

  if (points.length === 0 && report.topIssues[0]) {
    points.push(report.topIssues[0].detail);
  }

  if (points.length === 0) {
    return "No major issues stood out in this scan. The repository looks stable based on the available code-health signals.";
  }

  return points.slice(0, 2).join(" ");
}

export function getImprovementActions(report: AuditRunResult) {
  const actions: string[] = [];

  if (report.fileFindings.some((finding) => finding.lineCount >= 250)) {
    actions.push("Break large files into smaller, focused modules.");
  }

  if (report.fileFindings.some((finding) => finding.maxNestingDepth >= 3)) {
    actions.push("Reduce deep nesting with guard clauses and extracted helpers.");
  }

  if (report.fileFindings.some((finding) => finding.dependencyCount >= 14)) {
    actions.push("Simplify dependencies to reduce coupling between modules.");
  }

  if (report.fileFindings.some((finding) => finding.complexity >= 14)) {
    actions.push("Refactor dense control flow before it becomes harder to test.");
  }

  const uniqueActions = unique(actions).slice(0, 4);

  if (uniqueActions.length === 0) {
    return ["Keep the current structure consistent and monitor future changes for complexity growth."];
  }

  return uniqueActions;
}

export function getRiskyFiles(report: AuditRunResult, limit = 5) {
  return [...report.fileFindings]
    .filter(
      (finding) =>
        finding.riskLevel === "medium" ||
        finding.riskLevel === "high" ||
        finding.riskLevel === "critical",
    )
    .sort(compareFindingsByRisk)
    .slice(0, limit)
    .map((finding) => ({
    filePath: finding.filePath,
    reason: getRiskReason(finding),
  }));
}

export function getTopIssuesSummary(report: AuditRunResult, limit = 5) {
  return report.topIssues.slice(0, limit).map((issue) => ({
    title: issue.title,
    detail: issue.detail,
    filePath: issue.filePath,
  }));
}

export function getReadableContext(report: AuditRunResult): ReadableContext {
  const repoLabel = report.repoName ? `'${report.repoName}'` : "This repository";
  const score = report.score.value;
  const scoreSentence = `${repoLabel} has an overall score of ${score}/100`;

  const drivers = unique([
    report.fileFindings.some((finding) => finding.complexity >= 14) ? "high cyclomatic complexity" : "",
    report.fileFindings.some((finding) => finding.maxNestingDepth >= 3) ? "deep nesting" : "",
    report.fileFindings.some((finding) => finding.lineCount >= 250) ? "large files" : "",
    report.fileFindings.some((finding) => finding.dependencyCount >= 14) ? "broad dependency usage" : "",
  ].filter(Boolean));

  const driverSentence =
    drivers.length > 0
      ? `The biggest contributors are ${drivers.join(", ")}, which can impact maintainability and scalability.`
      : "The scan surfaced a few structural hotspots that can impact maintainability over time.";

  const executiveSummary = `${scoreSentence}, indicating significant areas for improvement. ${driverSentence}`;

  const riskyFiles = getRiskyFiles(report, 5).map((file) => file.filePath);
  const riskFileSentence =
    riskyFiles.length > 0
      ? `These risks are concentrated in a small set of files (for example: ${riskyFiles.join(", ")}).`
      : "The risks are driven more by patterns than by a small set of individual hotspots.";

  const engineeringRisks = [
    `Dense control flow and deep nesting create maintenance hotspots and increase regression risk when making changes.`,
    `Large or highly-coupled modules raise review overhead and make refactors slower and more error-prone.`,
    riskFileSentence,
  ];

  const practicalNextFixes: string[] = [];

  if (report.fileFindings.some((finding) => finding.complexity >= 14)) {
    practicalNextFixes.push("Refactor nested decision paths in the highest-risk files to reduce cyclomatic complexity.");
  }

  if (report.fileFindings.some((finding) => finding.maxNestingDepth >= 3)) {
    practicalNextFixes.push("Flatten branching where possible and separate orchestration from business rules.");
  }

  if (report.fileFindings.some((finding) => finding.lineCount >= 250)) {
    practicalNextFixes.push("Extract lower-level helpers from large files to reduce file size and improve maintainability.");
  }

  if (report.fileFindings.some((finding) => finding.dependencyCount >= 14)) {
    practicalNextFixes.push("Reduce dependency surface in heavily coupled files by splitting responsibilities and consolidating shared utilities.");
  }

  const uniqueFixes = unique(practicalNextFixes).slice(0, 4);

  if (uniqueFixes.length === 0) {
    uniqueFixes.push("Keep the current structure consistent and monitor complexity, nesting, and file size as the codebase evolves.");
  }

  return {
    executiveSummary,
    engineeringRisks,
    practicalNextFixes: uniqueFixes,
  };
}

function getRiskReason(finding: FileFinding) {
  if (finding.maxNestingDepth >= 5) {
    return "Deep nesting is making this file harder to reason about.";
  }

  if (finding.lineCount >= 250) {
    return "Large file size is reducing maintainability.";
  }

  if (finding.dependencyCount >= 14) {
    return "Dependency surface suggests strong coupling.";
  }

  if (finding.complexity >= 14) {
    return "Control flow is denser than ideal.";
  }

  return "This file ranks high relative to the rest of the repository.";
}

function compareFindingsByRisk(a: FileFinding, b: FileFinding) {
  const rank = (value: FileFinding["riskLevel"]) => {
    switch (value) {
      case "critical":
        return 3;
      case "high":
        return 2;
      case "medium":
        return 1;
      default:
        return 0;
    }
  };

  const riskDiff = rank(b.riskLevel) - rank(a.riskLevel);
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
