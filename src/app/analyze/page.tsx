"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FolderKanban,
  Gauge,
  Lightbulb,
  LoaderCircle,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import CopyReportLinkButton from "@/src/components/CopyReportLinkButton";
import ReportFeedback from "@/src/components/ReportFeedback";
import TechStackIcons from "@/src/components/TechStackIcons";
import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import type {
  AuditApiErrorResponse,
  AuditRunResult,
  ApiSuccessResponse,
  FileFinding,
  TopIssue,
} from "@/src/types/audit";

const sampleRepo = "";
const loadingMessages = [
  "Scanning repository...",
  "Analyzing code structure...",
  "Calculating score...",
  "Generating insights...",
];

const metricItems = [
  { key: "filesAnalyzed", label: "Files analyzed", icon: FolderKanban },
  { key: "averageComplexity", label: "Average complexity", icon: Gauge },
  { key: "maxNestingDepth", label: "Max nesting", icon: TriangleAlert },
  { key: "totalDependencies", label: "Dependencies", icon: BrainCircuit },
] as const;

const severityAccent = {
  high: "text-rose-300",
  medium: "text-amber-200",
  low: "text-cyan-200",
};

const riskAccent = {
  critical: "text-rose-300",
  high: "text-rose-300",
  medium: "text-amber-200",
  low: "text-emerald-300",
};

type UiErrorState = {
  title: string;
  message: string;
  retryLabel: string;
  secondaryLabel?: string;
};

function issueIcon(severity: TopIssue["severity"]) {
  if (severity === "high") {
    return ShieldAlert;
  }

  if (severity === "medium") {
    return AlertTriangle;
  }

  return CheckCircle2;
}

function summarizeFinding(finding: FileFinding) {
  if (finding.issues[0]) {
    return finding.issues[0].detail;
  }

  return "This file did not breach issue thresholds, but it remains visible for code-health monitoring.";
}

function getUiError(error: unknown): UiErrorState {
  if (error instanceof TypeError) {
    return {
      title: "Something went wrong during analysis.",
      message: "We couldn't reach StackAudit right now. Check your connection and try again.",
      retryLabel: "Try Again",
    };
  }

  return {
    title: "Something went wrong during analysis.",
    message: "We couldn't finish the audit for this repository. Please try again.",
    retryLabel: "Try Again",
  };
}

function getUiErrorFromApi(error: AuditApiErrorResponse): UiErrorState {
  if (error.error === "UNSUPPORTED_REPO") {
    return {
      title: "Unsupported Repository",
      message: error.message,
      retryLabel: "Try Again",
      secondaryLabel: "Try another repo",
    };
  }

  if (error.error === "RATE_LIMITED") {
    return {
      title: "Something went wrong during analysis.",
      message: error.message,
      retryLabel: "Try Again",
    };
  }

  if (error.error === "REPO_TOO_LARGE") {
    return {
      title: "Something went wrong during analysis.",
      message: error.message,
      retryLabel: "Try Again",
    };
  }

  if (error.error === "CLONE_TIMEOUT") {
    return {
      title: "Something went wrong during analysis.",
      message: error.message,
      retryLabel: "Try Again",
    };
  }

  return {
    title: "Something went wrong during analysis.",
    message: error.message,
    retryLabel: "Try Again",
  };
}

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState(sampleRepo);
  const [report, setReport] = useState<AuditRunResult | null>(null);
  const [uiError, setUiError] = useState<UiErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const prioritizedFindings = useMemo(
    () =>
      report
        ? report.fileFindings
            .filter((finding) => finding.riskLevel === "high" || finding.riskLevel === "critical")
            .slice(0, 8)
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
        <Reveal className="surface px-6 py-7 sm:px-8 sm:py-8" delay={0.04}>
          <span className="window-ornament" aria-hidden="true" />
          <span className="window-grid" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-white">
                  Paste GitHub URL
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-slate-300 sm:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-200">
                  <Gauge className="h-4 w-4" />
                  Score
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-200">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm font-medium text-amber-200">
                  <ShieldAlert className="h-4 w-4" />
                  Risk
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                type="text"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
                className="input-shell h-16 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-base shadow-none"
              />
              <button
                type="button"
                onClick={runAudit}
                disabled={isLoading}
                className="inline-flex h-16 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 px-6 text-base font-semibold text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(96,165,250,0.3)] lg:min-w-52"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run audit
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="surface px-6 py-10 sm:px-8"
            >
              <span className="window-ornament" aria-hidden="true" />
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                  <LoaderCircle className="h-7 w-7 animate-spin text-cyan-300" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-white sm:text-2xl">
                  {loadingMessages[loadingIndex]}
                </h2>
                <p className="section-copy mt-3 max-w-xl">
                  This usually takes a moment while StackAudit scans the repository and prepares the report.
                </p>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        {showErrorState && !isLoading ? (
          <Reveal className="surface px-6 py-10 sm:px-8" delay={0.08}>
            <span className="window-ornament" aria-hidden="true" />
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                <TriangleAlert className="h-7 w-7 text-slate-200" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white">{uiError?.title}</h2>
              <p className="section-copy mt-3 max-w-xl">
                {uiError?.message}
              </p>

              {uiError?.title === "Unsupported Repository" ? (
                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-5 text-left">
                  <p className="text-sm leading-7 text-slate-300">Currently, StackAudit supports:</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>• JavaScript (.js, .jsx)</li>
                    <li>• TypeScript (.ts, .tsx)</li>
                    <li>• Support for more languages coming soon.</li>
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUiError(null);
                    void runAudit();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-100 hover:border-cyan-300/40 hover:bg-white/[0.06]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {uiError?.retryLabel}
                </button>

                {uiError?.secondaryLabel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRepoUrl("");
                      setReport(null);
                      setUiError(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white"
                  >
                    {uiError.secondaryLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </Reveal>
        ) : null}

        {report && !showErrorState ? (
          <>
            <Reveal className="surface px-6 py-7 text-center sm:px-8" delay={0.08}>
              <span className="window-ornament" aria-hidden="true" />
              <p className="text-sm text-slate-400">{report.repoName}</p>
              <TechStackIcons techStack={report.techStack} className="mt-4 justify-center" />
              <div className="mt-4 flex items-end justify-center gap-3">
                <span className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  {report.score.value}
                </span>
                <span className="mb-2 text-base text-slate-400">/100</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Code Health Score · Grade {report.score.grade}</p>
              {report.reportId ? (
                <div className="mt-6 flex justify-center">
                  <CopyReportLinkButton path={`/report/${report.reportId}`} />
                </div>
              ) : null}

              <div className="mt-7 grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-2 xl:grid-cols-4">
                {metricItems.map((item, index) => {
                  const value = report.summaryMetrics[item.key];
                  const Icon = item.icon;

                  return (
                    <RevealItem key={item.key} delay={0.12 + index * 0.04} className="text-left">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Icon className="h-4 w-4 text-cyan-200" />
                        <p className="text-sm">{item.label}</p>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                    </RevealItem>
                  );
                })}
              </div>
            </Reveal>

            <Reveal className="surface px-6 py-7 sm:px-8" delay={0.12}>
              <span className="window-ornament" aria-hidden="true" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="section-title">What needs attention first</h2>
                  <p className="section-copy mt-2">Prioritized issues based on the audit pipeline.</p>
                </div>
                <p className="text-sm text-slate-400">{report.topIssues.length} findings</p>
              </div>

              <div className="mt-6 divide-y divide-white/8">
                {report.topIssues.length > 0 ? (
                  report.topIssues.map((issue, index) => {
                    const Icon = issueIcon(issue.severity);

                    return (
                      <RevealItem
                        key={`${issue.filePath}-${issue.code}-${index}`}
                        delay={0.16 + index * 0.03}
                        className="grid gap-4 py-5 lg:grid-cols-[1.35fr_0.65fr]"
                      >
                        <div className="flex gap-4">
                          <div className="mt-0.5 rounded-full border border-white/8 bg-white/[0.04] p-2">
                            <Icon className={`h-4 w-4 ${severityAccent[issue.severity]}`} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-base font-semibold text-white">{issue.title}</p>
                              <span className={`text-xs font-medium uppercase tracking-[0.2em] ${severityAccent[issue.severity]}`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-300">{issue.detail}</p>
                            <p className="mt-3 text-sm text-cyan-200">Fix: {issue.recommendation}</p>
                          </div>
                        </div>
                        <div className="lg:text-right">
                          <p className="text-sm text-slate-400">Location</p>
                          <p className="mt-2 break-all text-sm text-slate-300">{issue.filePath}</p>
                          <p className={`mt-3 text-sm font-medium ${riskAccent[issue.riskLevel]}`}>
                            {issue.riskLevel} risk
                          </p>
                        </div>
                      </RevealItem>
                    );
                  })
                ) : (
                  <p className="py-6 text-sm text-slate-400">No major issues detected. Good job.</p>
                )}
              </div>
            </Reveal>

            <Reveal className="surface px-6 py-7 sm:px-8" delay={0.16}>
              <span className="window-ornament" aria-hidden="true" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="section-title">Top risky files</h2>
                  <p className="section-copy mt-2">The files where the audit sees the most concentrated risk.</p>
                </div>
                <p className="text-sm text-slate-400">
                  {report.summaryMetrics.riskDistribution.low} low / {report.summaryMetrics.riskDistribution.medium} medium /{" "}
                  {report.summaryMetrics.riskDistribution.high} high / {report.summaryMetrics.riskDistribution.critical} critical
                </p>
              </div>

              <div className="mt-6 divide-y divide-white/8">
                {prioritizedFindings.length > 0 ? (
                  prioritizedFindings.map((finding, index) => (
                    <RevealItem
                      key={finding.filePath}
                      delay={0.2 + index * 0.03}
                      className="grid gap-4 py-5 lg:grid-cols-[1.1fr_0.9fr]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-white">{finding.filePath}</p>
                          <span className={`text-xs font-medium uppercase tracking-[0.2em] ${riskAccent[finding.riskLevel]}`}>
                            {finding.riskLevel} risk
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{summarizeFinding(finding)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4 lg:text-right">
                        <div>
                          <p className="text-sm text-slate-400">Complexity</p>
                          <p className="mt-2 text-lg font-semibold text-white">{finding.complexity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Functions</p>
                          <p className="mt-2 text-lg font-semibold text-white">{finding.functionCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Dependencies</p>
                          <p className="mt-2 text-lg font-semibold text-white">{finding.dependencyCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Lines</p>
                          <p className="mt-2 text-lg font-semibold text-white">{finding.lineCount}</p>
                        </div>
                      </div>
                    </RevealItem>
                  ))
                ) : (
                  <p className="py-6 text-sm text-slate-400">No high-risk files detected.</p>
                )}
              </div>
            </Reveal>

            <Reveal className="surface px-6 py-7 sm:px-8" delay={0.2}>
              <span className="window-ornament" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                </div>
                <h2 className="section-title">AI explanation</h2>
              </div>
              <p className="section-copy mt-3">Readable context for the findings above.</p>
              <p className="mt-6 max-w-4xl whitespace-pre-line text-[15px] leading-8 text-slate-300">
                {report.aiReport ?? "No additional AI insight was generated for this report, but the static findings above are still valid."}
              </p>
            </Reveal>

            {report.warnings.length > 0 ? (
              <Reveal className="surface px-6 py-7 sm:px-8" delay={0.24}>
                <span className="window-ornament" aria-hidden="true" />
                <h2 className="section-title">Scan caveats</h2>
                <p className="section-copy mt-2">A few conditions affected scan coverage.</p>
                <ul className="mt-6 divide-y divide-white/8">
                  {report.warnings.map((warning, index) => (
                    <RevealItem key={`${warning}-${index}`} delay={0.28 + index * 0.02} className="py-4">
                      <li className="text-sm leading-7 text-slate-300">{warning}</li>
                    </RevealItem>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <Reveal delay={0.28}>
              <ReportFeedback key={report.reportId ?? report.repoName} reportId={report.reportId} repoName={report.repoName} />
            </Reveal>
          </>
        ) : null}
      </div>
    </main>
  );
}
