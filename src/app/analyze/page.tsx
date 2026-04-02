"use client";

import { useEffect, useMemo, useState } from "react";
import AnalyzeAiSection from "@/src/components/analyze/AnalyzeAiSection";
import AnalyzeErrorState from "@/src/components/analyze/AnalyzeErrorState";
import AnalyzeHero from "@/src/components/analyze/AnalyzeHero";
import AnalyzeIssuesSection from "@/src/components/analyze/AnalyzeIssuesSection";
import AnalyzeLoadingState from "@/src/components/analyze/AnalyzeLoadingState";
import AnalyzeReportSummary from "@/src/components/analyze/AnalyzeReportSummary";
import AnalyzeRiskyFilesSection from "@/src/components/analyze/AnalyzeRiskyFilesSection";
import AnalyzeWarningsSection from "@/src/components/analyze/AnalyzeWarningsSection";
import { loadingMessages } from "@/src/components/analyze/config";
import {
  getUiError,
  getUiErrorFromApi,
  isHighPriorityFinding,
  type UiErrorState,
} from "@/src/components/analyze/helpers";
import ReportFeedback from "@/src/components/ReportFeedback";
import { Reveal } from "@/src/components/ui/Reveal";
import type {
  AuditApiErrorResponse,
  AuditRunResult,
  ApiSuccessResponse,
} from "@/src/types/audit";

const sampleRepo = "";

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const [report, setReport] = useState<AuditRunResult | null>(null);
  const [uiError, setUiError] = useState<UiErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const prioritizedFindings = useMemo(
    () =>
      report
        ? report.fileFindings.filter(isHighPriorityFinding).slice(0, 8)
        : [],
    [report],
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const id = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % loadingMessages.length);
    }, 1200);

    return () => window.clearInterval(id);
  }, [isLoading]);

  async function runAudit() {
    if (!repoUrl.trim()) {
      setUiError({
        title: "Something went wrong during analysis.",
        message: "Paste a GitHub repository URL to start the audit.",
        retryLabel: "Try Again",
      });
      return;
    }

    setIsLoading(true);
    setUiError(null);
    setReport(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data = (await response.json()) as ApiSuccessResponse<AuditRunResult> | AuditApiErrorResponse;

      if (!response.ok) {
        if ("error" in data && "message" in data) {
          setUiError(getUiErrorFromApi(data));
          return;
        }

        throw new Error("Audit failed.");
      }

      if (!("success" in data) || data.success !== true) {
        throw new Error("Audit failed.");
      }

      setReport(data.data);
    } catch (error) {
      setReport(null);
      setUiError(getUiError(error));
    } finally {
      setIsLoading(false);
    }
  }

  const showErrorState = uiError;

  return (
    <main className="page-shell">
      <div className="page-grid">
        <AnalyzeHero
          isLoading={isLoading}
          repoUrl={repoUrl}
          onRepoUrlChange={setRepoUrl}
          onRunAudit={() => void runAudit()}
        />

        <span suppressHydrationWarning>
  {loadingMessages[loadingIndex]}
</span>

        {showErrorState && !isLoading ? (
          <AnalyzeErrorState
            error={showErrorState}
            onRetry={() => {
              setUiError(null);
              void runAudit();
            }}
            onReset={() => {
              setRepoUrl("");
              setReport(null);
              setUiError(null);
            }}
          />
        ) : null}

        {report && !showErrorState ? (
          <>
            <AnalyzeReportSummary report={report} />
            <AnalyzeIssuesSection issues={report.topIssues} />
            <AnalyzeRiskyFilesSection findings={prioritizedFindings} summaryMetrics={report.summaryMetrics} />
            <AnalyzeAiSection aiReport={report.aiReport} />
            <AnalyzeWarningsSection warnings={report.warnings} />

            <Reveal delay={0.28}>
              <ReportFeedback key={report.reportId ?? report.repoName} reportId={report.reportId} repoName={report.repoName} />
            </Reveal>
          </>
        ) : null}
      </div>
    </main>
  );
}
