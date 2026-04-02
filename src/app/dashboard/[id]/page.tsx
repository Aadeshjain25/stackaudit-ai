import Link from "next/link";
import { ArrowLeft, BrainCircuit, FolderKanban, Gauge, Sparkles, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import TechStackIcons from "@/src/components/TechStackIcons";
import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { getReportById } from "@/src/services/reportService";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const breakdownItems = [
  { key: "maintainability", label: "Maintainability", icon: Gauge },
  { key: "reliability", label: "Reliability", icon: TriangleAlert },
  { key: "modularity", label: "Modularity", icon: FolderKanban },
  { key: "resilience", label: "Resilience", icon: BrainCircuit },
] as const;

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const report = await getReportById(Number(id));

  if (!report) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-grid">
        <Reveal className="surface px-6 py-7 sm:px-8">
          <span className="window-ornament" aria-hidden="true" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {report.repoName}
            </h1>
            <p className="section-copy mt-3">{report.repoUrl}</p>
            <TechStackIcons techStack={report.techStack} className="mt-4" />
          </div>
            <div className="text-left sm:text-right">
              <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">{report.score.value}</p>
              <p className="mt-2 text-sm text-slate-300">Code Health Score · Grade {report.score.grade}</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.08}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="grid gap-5 border-b border-white/8 pb-6 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-slate-400">Files analyzed</p>
              <p className="mt-2 text-3xl font-semibold text-white">{report.summaryMetrics.filesAnalyzed}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Average complexity</p>
              <p className="mt-2 text-3xl font-semibold text-white">{report.summaryMetrics.averageComplexity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Dependencies</p>
              <p className="mt-2 text-3xl font-semibold text-white">{report.summaryMetrics.totalDependencies}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Generated</p>
              <p className="mt-2 text-base font-semibold text-white">
                {report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {breakdownItems.map((item) => {
              const Icon = item.icon;
              const value = report.score.breakdown[item.key];

              return (
                <div key={item.key}>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icon className="h-4 w-4 text-cyan-200" />
                    <p className="text-sm">{item.label}</p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.12}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2">
              <Sparkles className="h-4 w-4 text-cyan-200" />
            </div>
            <div>
              <h2 className="section-title">AI explanation</h2>
              <p className="section-copy mt-2">Readable summary of what the audit surfaced.</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl whitespace-pre-line text-[15px] leading-8 text-slate-300">
            {report.aiReport ?? "AI explanation was unavailable when this report was generated."}
          </p>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.16}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Top issues</h2>
              <p className="section-copy mt-2">The most important findings in this report.</p>
            </div>
            <p className="text-sm text-slate-400">{report.topIssues.length} findings</p>
          </div>
          <div className="mt-6 divide-y divide-white/8">
            {report.topIssues.map((issue, index) => (
              <RevealItem
                key={`${issue.filePath}-${index}`}
                delay={0.2 + index * 0.03}
                className="grid gap-4 py-5 lg:grid-cols-[1.3fr_0.7fr]"
              >
                <div>
                  <p className="font-semibold text-white">{issue.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{issue.detail}</p>
                  <p className="mt-3 text-sm text-cyan-200">Fix: {issue.recommendation}</p>
                </div>
                <div className="lg:text-right">
                  <p className="text-sm text-slate-400">File</p>
                  <p className="mt-2 break-all text-sm text-slate-300">{issue.filePath}</p>
                  <p className="mt-3 text-sm text-slate-400">{issue.riskLevel} risk</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        <Reveal className="surface px-6 py-7 sm:px-8" delay={0.2}>
          <span className="window-ornament" aria-hidden="true" />
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">File-level findings</h2>
              <p className="section-copy mt-2">Detailed signals for each scanned file.</p>
            </div>
            <p className="text-sm text-slate-400">{report.fileFindings.length} files analyzed</p>
          </div>
          <div className="mt-6 divide-y divide-white/8">
            {report.fileFindings.map((finding, index) => (
              <RevealItem
                key={finding.filePath}
                delay={0.24 + index * 0.02}
                className="grid gap-4 py-5 lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-white">{finding.filePath}</p>
                    <p className="text-sm text-slate-400">{finding.riskLevel} risk</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-300">
                    <p>Functions {finding.functionCount}</p>
                    <p>Dependencies {finding.dependencyCount}</p>
                    <p>Lines {finding.lineCount}</p>
                    <p>Loops {finding.loopCount}</p>
                  </div>
                </div>
                <div className="lg:text-right">
                  <p className="text-sm text-slate-400">Complexity {finding.complexity}</p>
                  <p className="mt-2 text-sm text-slate-400">Nesting {finding.maxNestingDepth}</p>
                </div>
                <div className="lg:col-span-2">
                  {finding.issues.length > 0 ? (
                    <div className="space-y-3">
                      {finding.issues.map((issue) => (
                        <div
                          key={`${finding.filePath}-${issue.code}`}
                          className="flex flex-col gap-2 text-sm text-slate-300 lg:flex-row lg:justify-between"
                        >
                          <div className="max-w-3xl">
                            <p className="font-medium text-white">{issue.title}</p>
                            <p className="mt-1 leading-7">{issue.detail}</p>
                          </div>
                          <p className="text-cyan-200 lg:max-w-xs lg:text-right">Fix: {issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No issue thresholds were triggered for this file.</p>
                  )}
                </div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
