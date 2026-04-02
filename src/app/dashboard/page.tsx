import Link from "next/link";
import { ArrowUpRight, FolderClock } from "lucide-react";
import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { listReports } from "@/src/services/reportService";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const reports = await listReports();

  return (
    <main className="page-shell">
      <div className="page-grid">
        <Reveal className="surface px-6 py-7 sm:px-8">
          <span className="window-ornament" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Saved audits, ready to review.
              </h1>
              <p className="section-copy mt-4">
                Browse previous reports, compare scores, and reopen details without rerunning the scan.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
              <FolderClock className="h-4 w-4 text-cyan-200" />
              {reports.length} saved reports
            </div>
          </div>
        </Reveal>

        {reports.length === 0 ? (
          <Reveal className="surface px-6 py-12 text-center text-slate-400 sm:px-8" delay={0.08}>
            No reports yet. Run your first repository audit from the Analyze page.
          </Reveal>
        ) : (
          <Reveal className="surface px-6 py-7 sm:px-8" delay={0.08}>
            <span className="window-ornament" aria-hidden="true" />
            <div className="divide-y divide-white/8">
              {reports.map((report, index) => (
                <RevealItem key={report.id} delay={0.12 + index * 0.03} className="group">
                  <Link
                    href={`/dashboard/${report.id}`}
                    className="grid gap-4 py-5 transition first:pt-0 last:pb-0 hover:text-white lg:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">{report.repoName}</p>
                        <span className="pill">{report.scoreGrade} grade</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{report.repoUrl}</p>
                      <p className="mt-3 text-sm text-slate-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-6 lg:justify-end">
                      <div className="text-left lg:text-right">
                        <p className="text-3xl font-semibold text-white">{report.score}</p>
                        <p className="text-sm text-slate-400">{report.topIssueCount} top issues</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-cyan-300" />
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
