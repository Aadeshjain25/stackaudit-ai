import { generateAiReport } from "@/src/services/aiService";
import { analyzeRepository } from "@/src/services/analyzeService";
import { cleanupRepository, CloneTimeoutError, cloneRepository } from "@/src/services/repoService";
import { saveAuditReport } from "@/src/services/reportService";
import { RepoTooLargeError, scanRepository } from "@/src/services/scanService";
import { calculateScore } from "@/src/services/scoreService";
import type { AuditRunResult, FileFinding, SummaryMetrics, TopIssue } from "@/src/types/audit";

const UNSUPPORTED_REPO_MESSAGE =
  "This repository does not contain JavaScript or TypeScript files. StackAudit currently supports JS/TS-based projects only.";

export class UnsupportedRepoError extends Error {
  code = "UNSUPPORTED_REPO" as const;

  constructor(message = UNSUPPORTED_REPO_MESSAGE) {
    super(message);
    this.name = "UnsupportedRepoError";
  }
}

export { RepoTooLargeError };
export { CloneTimeoutError };

function buildSummaryMetrics(
  fileFindings: FileFinding[],
  filesDiscovered: number,
  filesSkipped: number,
  parseErrors: number,
): SummaryMetrics {
  const baseDistribution: SummaryMetrics["riskDistribution"] = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const finding of fileFindings) {
    baseDistribution[finding.riskLevel] += 1;
  }

  const totalComplexity = fileFindings.reduce((sum, finding) => sum + finding.complexity, 0);

  return {
    filesDiscovered,
    filesAnalyzed: fileFindings.length,
    filesSkipped,
    parseErrors,
    totalFileSizeBytes: fileFindings.reduce((sum, finding) => sum + finding.fileSizeBytes, 0),
    totalLines: fileFindings.reduce((sum, finding) => sum + finding.lineCount, 0),
    totalFunctions: fileFindings.reduce((sum, finding) => sum + finding.functionCount, 0),
    totalDependencies: fileFindings.reduce((sum, finding) => sum + finding.dependencyCount, 0),
    totalComplexity,
    totalLoops: fileFindings.reduce((sum, finding) => sum + finding.loopCount, 0),
    totalBranches: fileFindings.reduce((sum, finding) => sum + finding.branchCount, 0),
    averageComplexity:
      fileFindings.length > 0 ? Math.round((totalComplexity / fileFindings.length) * 10) / 10 : 0,
    maxNestingDepth: fileFindings.reduce((max, finding) => Math.max(max, finding.maxNestingDepth), 0),
    riskDistribution: baseDistribution,
  };
}

function buildTopIssues(fileFindings: FileFinding[]): TopIssue[] {
  const severityOrder = { high: 3, medium: 2, low: 1 };

  return fileFindings
    .flatMap((finding) =>
      finding.issues.map((issue) => ({
        ...issue,
        filePath: finding.filePath,
        riskLevel: finding.riskLevel,
        complexity: finding.complexity,
      })),
    )
    .sort((left, right) => {
      const severityDelta = severityOrder[right.severity] - severityOrder[left.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.complexity - left.complexity;
    })
    .slice(0, 8)
    .map((issue) => ({
      code: issue.code,
      title: issue.title,
      detail: issue.detail,
      severity: issue.severity,
      recommendation: issue.recommendation,
      filePath: issue.filePath,
      riskLevel: issue.riskLevel,
    }));
}

export async function runAudit(repoUrl: string): Promise<AuditRunResult> {
  const { repoName, repoPath } = await cloneRepository(repoUrl);

  try {
    const scanResult = await scanRepository(repoPath);

    if (scanResult.files.length === 0 || scanResult.techStack.length === 0) {
      throw new UnsupportedRepoError();
    }

    const analysisResult = await analyzeRepository(scanResult.files);
    const summaryMetrics = buildSummaryMetrics(
      analysisResult.fileFindings,
      scanResult.files.length,
      scanResult.filesSkipped,
      analysisResult.parseErrors,
    );
    const topIssues = buildTopIssues(analysisResult.fileFindings);
    const score = calculateScore(summaryMetrics, analysisResult.fileFindings);

    let aiReport: string | null = null;

    try {
      aiReport = await generateAiReport({
        repoName,
        summaryMetrics,
        topIssues,
        score,
      });
    } catch (error) {
      console.error("AI REPORT ERROR:", error);
    }

    const report: AuditRunResult = {
      repoName,
      repoUrl,
      techStack: scanResult.techStack,
      summaryMetrics,
      fileFindings: analysisResult.fileFindings,
      topIssues,
      score,
      aiReport,
      warnings: [...scanResult.warnings, ...analysisResult.warnings],
    };

    const saved = await saveAuditReport(report);

    return {
      ...report,
      reportId: saved.id,
      createdAt: saved.createdAt.toISOString(),
    };
  } finally {
    await cleanupRepository(repoPath);
  }
}
