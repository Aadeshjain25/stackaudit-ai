"use client";

import { Reveal, RevealItem } from "@/src/components/ui/Reveal";
import { riskAccent } from "@/src/components/analyze/config";
import { summarizeFinding } from "@/src/components/analyze/helpers";
import type { FileFinding, SummaryMetrics } from "@/src/types/audit";

type AnalyzeRiskyFilesSectionProps = {
  findings: FileFinding[];
  summaryMetrics: SummaryMetrics;
};

export default function AnalyzeRiskyFilesSection({
  findings,
  summaryMetrics,
}: AnalyzeRiskyFilesSectionProps) {
  return (
    <Reveal className="surface px-6 py-7 sm:px-8" delay={0.16}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">Top risky files</h2>
          <p className="section-copy mt-2">The files where the audit sees the most concentrated risk.</p>
        </div>
        <p className="text-sm text-slate-400">
          {summaryMetrics.riskDistribution.low} low / {summaryMetrics.riskDistribution.medium} medium /{" "}
          {summaryMetrics.riskDistribution.high} high / {summaryMetrics.riskDistribution.critical} critical
        </p>
      </div>

      <div className="mt-6 divide-y divide-white/8">
        {findings.length > 0 ? (
          findings.map((finding, index) => (
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
                <RiskStat label="Complexity" value={finding.complexity} />
                <RiskStat label="Functions" value={finding.functionCount} />
                <RiskStat label="Dependencies" value={finding.dependencyCount} />
                <RiskStat label="Lines" value={finding.lineCount} />
              </div>
            </RevealItem>
          ))
        ) : (
          <p className="py-6 text-sm text-slate-400">No high-risk files detected.</p>
        )}
      </div>
    </Reveal>
  );
}

type RiskStatProps = {
  label: string;
  value: number;
};

function RiskStat({ label, value }: RiskStatProps) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
