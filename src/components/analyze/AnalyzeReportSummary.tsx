"use client";

import CopyReportLinkButton from "@/src/components/CopyReportLinkButton";
import TechStackIcons from "@/src/components/TechStackIcons";
import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { metricItems } from "@/src/components/analyze/config";
import type { AuditRunResult } from "@/src/types/audit";

type AnalyzeReportSummaryProps = {
  report: AuditRunResult;
};

export default function AnalyzeReportSummary({
  report,
}: AnalyzeReportSummaryProps) {
  return (
    <Reveal className="surface px-6 py-7 text-center sm:px-8" delay={0.08}>
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
  );
}
