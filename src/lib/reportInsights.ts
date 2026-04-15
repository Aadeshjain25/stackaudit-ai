import type { AuditRunResult, FileFinding } from "@/src/types/audit";
import { compareFindingsByRisk } from "@/src/lib/readableContext";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export { getReadableContext, type ReadableContext } from "@/src/lib/readableContext";

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
