"use client";

import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { issueIcon, riskAccent, severityAccent } from "@/src/components/analyze/config";
import { getIssueKey } from "@/src/components/analyze/helpers";
import type { TopIssue } from "@/src/types/audit";

type AnalyzeIssuesSectionProps = {
  issues: TopIssue[];
};

export default function AnalyzeIssuesSection({
  issues,
}: AnalyzeIssuesSectionProps) {
  return (
    <Reveal className="surface px-6 py-7 sm:px-8" delay={0.12}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">What needs attention first</h2>
          <p className="section-copy mt-2">Prioritized issues based on the audit pipeline.</p>
        </div>
        <p className="text-sm text-slate-400">{issues.length} findings</p>
      </div>

      <div className="mt-6 divide-y divide-white/8">
        {issues.length > 0 ? (
          issues.map((issue, index) => {
            const Icon = issueIcon(issue.severity);

            return (
              <RevealItem
                key={getIssueKey(issue, index)}
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
                      <span
                        className={`text-xs font-medium uppercase tracking-[0.2em] ${severityAccent[issue.severity]}`}
                      >
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
  );
}
