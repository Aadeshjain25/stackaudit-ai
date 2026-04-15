import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, BrainCircuit, FolderKanban, Gauge, Sparkles, TriangleAlert } from "lucide-react";
import CopyReportLinkButton from "@/src/components/CopyReportLinkButton";
import ReportFeedback from "@/src/components/ReportFeedback";
import TechStackIcons from "@/src/components/TechStackIcons";
import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { logReportView } from "@/src/lib/analytics";
import {
  getImprovementActions,
  getKeyInsight,
  getReadableContext,
  getRiskyFiles,
  getTopIssuesSummary,
} from "@/src/lib/reportInsights";
import type { ApiSuccessResponse, AuditApiErrorResponse, AuditRunResult } from "@/src/types/audit";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

const metricItems = [
  { key: "filesAnalyzed", label: "Files", icon: FolderKanban },
  { key: "totalFunctions", label: "Functions", icon: BrainCircuit },
  { key: "totalComplexity", label: "Complexity", icon: Gauge },
  { key: "highRisk", label: "Risk", icon: TriangleAlert },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "StackAudit Report – Code Health Analysis",
    description: "Analyze GitHub repositories and get code health score, risks, and insights.",
  };
}

function isValidReportId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function getBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return null;
  }

  return `${proto}://${host}`;
}

async function fetchReport(id: string): Promise<AuditRunResult | null> {
  const baseUrl = await getBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl}/api/reports/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiSuccessResponse<AuditRunResult> | AuditApiErrorResponse;

  if (!("success" in payload) || payload.success !== true) {
    return null;
  }

  return payload.data;
}

export default async function ShareableReportPage({ params }: PageProps) {
  const { id } = await params;

  if (!isValidReportId(id)) {
    return (
      <main className="page-shell">
        <div className="page-grid">
          <Reveal className="surface px-6 py-12 text-center sm:px-8">
            Report not found. Try another shared link or analyze a repository first.
          </Reveal>
        </div>
      </main>
    );
  }

  const report = await fetchReport(id);

  if (!report) {
    return (
      <main className="page-shell">
        <div className="page-grid">
          <Reveal className="surface px-6 py-12 text-center sm:px-8">
            Report not found. Try another shared link or analyze a repository first.
          </Reveal>
        </div>
      </main>
    );
  }

  logReportView(report.reportId ?? id);

  const keyInsight = getKeyInsight(report);
  const topIssues = getTopIssuesSummary(report, 5);
  const riskyFiles = getRiskyFiles(report, 5);
  const improvementActions = getImprovementActions(report);
  const readableContext = getReadableContext(report);
  const riskValue =
    report.summaryMetrics.riskDistribution.high + report.summaryMetrics.riskDistribution.critical;

  return (
    <main className="page-shell">
      <div className="page-grid">
        <Reveal className="surface px-6 py-8 text-center sm:px-8" delay={0.04}>
          <span className="window-ornament" aria-hidden="true" />
          <p className="text-2xl font-semibold text-white">{report.repoName}</p>
          <p className="section-copy mt-3 break-all">{report.repoUrl}</p>
          <div className="mt-6 flex items-end justify-center gap-3">
            <span className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">
              {report.score.value}
            </span>
            <span className="mb-2 text-base text-slate-400">/100</span>
          </div>
          <p className="mt-3 text-sm text-slate-300">Code Health Score</p>
          <div className="mt-6 flex justify-center">
            <CopyReportLinkButton />
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.08}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Key insight</h2>
          <p className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 px-5 py-4 text-sm leading-7 text-slate-200">
            {keyInsight}
          </p>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.12}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {metricItems.map((item) => {
              const Icon = item.icon;
              const value =
                item.key === "highRisk"
                  ? riskValue
                  : report.summaryMetrics[item.key];

              return (
                <div key={item.key}>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icon className="h-4 w-4 text-cyan-200" />
                    <p className="text-sm">{item.label}</p>
                  </div>
                  <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.16}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Tech stack</h2>
          <TechStackIcons techStack={report.techStack} className="mt-5" />
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.2}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Top issues</h2>
          <div className="mt-5 divide-y divide-white/8">
            {topIssues.length > 0 ? (
              topIssues.map((issue, index) => (
                <RevealItem key={`${issue.filePath}-${index}`} delay={0.24 + index * 0.03} className="py-4">
                  <p className="text-sm font-medium text-white">{issue.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{issue.detail}</p>
                </RevealItem>
              ))
            ) : (
              <p className="py-4 text-sm text-slate-300">No major issues detected. Good job.</p>
            )}
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.24}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Risky files</h2>
          <div className="mt-5 divide-y divide-white/8">
            {riskyFiles.length > 0 ? (
              riskyFiles.map((file, index) => (
                <RevealItem
                  key={`${file.filePath}-${index}`}
                  delay={0.28 + index * 0.03}
                  className="grid gap-3 py-4 lg:grid-cols-[0.9fr_1.1fr]"
                >
                  <p className="text-sm font-medium text-white">{file.filePath}</p>
                  <p className="text-sm leading-7 text-slate-300">{file.reason}</p>
                </RevealItem>
              ))
            ) : (
              <p className="py-4 text-sm text-slate-300">No high-risk files found.</p>
            )}
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.26}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Readable context</h2>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Executive summary
          </h3>
          <p className="section-copy mt-3">{readableContext.executiveSummary}</p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Most important engineering risks
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {readableContext.engineeringRisks.map((risk) => (
              <li key={risk} className="flex gap-2">
                <span className="text-slate-400" aria-hidden="true">
                  •
                </span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>

          {riskyFiles.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {riskyFiles.map((file) => (
                <span
                  key={file.filePath}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                >
                  {file.filePath}
                </span>
              ))}
            </div>
          ) : null}

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Most practical next fixes
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {readableContext.practicalNextFixes.map((fix) => (
              <li key={fix} className="flex gap-2">
                <span className="text-slate-400" aria-hidden="true">
                  •
                </span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.28}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2">
              <Sparkles className="h-4 w-4 text-cyan-200" />
            </div>
            <h2 className="section-title">AI explanation</h2>
          </div>
          <p
            className="mt-5 overflow-hidden text-[15px] leading-8 text-slate-300"
            style={{ display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" }}
          >
            {report.aiReport ?? "No additional AI insight was generated for this report, but the audit findings above remain valid."}
          </p>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.32}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">What to improve</h2>
          <div className="mt-5 divide-y divide-white/8">
            {improvementActions.map((action, index) => (
              <RevealItem key={action} delay={0.36 + index * 0.03} className="py-4">
                <p className="text-sm leading-7 text-slate-300">• {action}</p>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.36}>
          <ReportFeedback reportId={report.reportId} repoName={report.repoName} />
        </Reveal>

        <Reveal className="surface px-6 py-8 text-center sm:px-8" delay={0.4}>
          <span className="window-ornament" aria-hidden="true" />
          <h2 className="section-title">Analyze your own repo</h2>
          <p className="section-copy mt-3">
            Run a fresh audit and generate a shareable report for your team.
          </p>
          <Link href="/analyze" className="cta-button mt-6">
            Analyze your own repo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
