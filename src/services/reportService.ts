import type { reports } from "@prisma/client";
import { getPrisma } from "@/src/lib/prisma";
import type { AuditRunResult, ReportListItem } from "@/src/types/audit";

const publicReportSelect = {
  id: true,
  repoName: true,
  repoUrl: true,
  techStack: true,
  summaryMetrics: true,
  fileFindings: true,
  topIssues: true,
  score: true,
  scoreGrade: true,
  scoreBreakdown: true,
  aiReport: true,
  warnings: true,
  createdAt: true,
} as const;

type PublicReportRecord = Pick<
  reports,
  | "id"
  | "repoName"
  | "repoUrl"
  | "techStack"
  | "summaryMetrics"
  | "fileFindings"
  | "topIssues"
  | "score"
  | "scoreGrade"
  | "scoreBreakdown"
  | "aiReport"
  | "warnings"
  | "createdAt"
>;

function serializeReport(report: AuditRunResult) {
  return {
    repoName: report.repoName,
    repoUrl: report.repoUrl,
    techStack: report.techStack,
    summaryMetrics: report.summaryMetrics,
    fileFindings: report.fileFindings,
    topIssues: report.topIssues,
    score: report.score.value,
    scoreGrade: report.score.grade,
    scoreBreakdown: {
      ...report.score.breakdown,
      rationale: report.score.rationale,
    },
    aiReport: report.aiReport,
    warnings: report.warnings,
  };
}

function hydrateReport(record: PublicReportRecord): AuditRunResult {
  const storedScore = (record.scoreBreakdown ?? {}) as Record<string, unknown>;

  return {
    reportId: record.id,
    repoName: record.repoName,
    repoUrl: record.repoUrl,
    techStack: (record.techStack as AuditRunResult["techStack"]) ?? [],
    summaryMetrics: record.summaryMetrics as AuditRunResult["summaryMetrics"],
    fileFindings: record.fileFindings as AuditRunResult["fileFindings"],
    topIssues: record.topIssues as AuditRunResult["topIssues"],
    score: {
      value: record.score,
      grade: record.scoreGrade as AuditRunResult["score"]["grade"],
      breakdown: {
        maintainability: Number(storedScore.maintainability ?? 0),
        reliability: Number(storedScore.reliability ?? 0),
        modularity: Number(storedScore.modularity ?? 0),
        resilience: Number(storedScore.resilience ?? 0),
      },
      rationale: Array.isArray(storedScore.rationale)
        ? storedScore.rationale.filter((item): item is string => typeof item === "string")
        : [],
    },
    aiReport: record.aiReport,
    warnings: (record.warnings as string[]) ?? [],
    createdAt: record.createdAt.toISOString(),
  };
}

export async function saveAuditReport(report: AuditRunResult) {
  const prisma = getPrisma();

  return prisma.reports.create({
    data: serializeReport(report),
  });
}

export async function listReports(): Promise<ReportListItem[]> {
  const prisma = getPrisma();
  const reports = await prisma.reports.findMany({
    orderBy: { createdAt: "desc" },
  });

  return reports.map((report) => ({
    id: report.id,
    repoName: report.repoName,
    repoUrl: report.repoUrl,
    score: report.score,
    scoreGrade: report.scoreGrade as ReportListItem["scoreGrade"],
    topIssueCount: Array.isArray(report.topIssues) ? report.topIssues.length : 0,
    createdAt: report.createdAt.toISOString(),
  }));
}

export function isValidReportId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function getReportById(id: string) {
  const prisma = getPrisma();
  const report = await prisma.reports.findUnique({
    where: { id },
    select: publicReportSelect,
  });

  if (!report) {
    return null;
  }

  return hydrateReport(report);
}
