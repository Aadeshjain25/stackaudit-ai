import type { reports } from "@prisma/client";
import { getPrisma } from "@/src/lib/prisma";
import type { AuditRunResult, ReportListItem } from "@/src/types/audit";

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

function hydrateReport(record: reports): AuditRunResult {
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

export async function getReportById(id: number) {
  const prisma = getPrisma();
  const report = await prisma.reports.findUnique({
    where: { id },
  });

  if (!report) {
    return null;
  }

  return hydrateReport(report);
}
