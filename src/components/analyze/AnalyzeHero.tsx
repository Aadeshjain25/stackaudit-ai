"use client";

import { ArrowRight, Gauge, Lightbulb, LoaderCircle, ShieldAlert } from "lucide-react";
import { Reveal } from "@/src/components/ui/Reveal";

type AnalyzeHeroProps = {
  isLoading: boolean;
  repoUrl: string;
  onRepoUrlChange: (value: string) => void;
  onRunAudit: () => void;
};

const heroBadges = [
  {
    label: "Score",
    icon: Gauge,
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  {
    label: "Insights",
    icon: Lightbulb,
    className: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  },
  {
    label: "Risk",
    icon: ShieldAlert,
    className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
];

export default function AnalyzeHero({
  isLoading,
  repoUrl,
  onRepoUrlChange,
  onRunAudit,
}: AnalyzeHeroProps) {
  return (
    <Reveal className="surface px-6 py-7 sm:px-8 sm:py-8" delay={0.04}>
      <span className="window-grid" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-white">
            Paste GitHub URL
          </p>

          <div className="flex flex-wrap gap-2 text-sm text-slate-300 sm:justify-end">
            {heroBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${badge.className}`}
                >
                  <Icon className="h-4 w-4" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={repoUrl}
            onChange={(event) => onRepoUrlChange(event.target.value)}
            placeholder="https://github.com/owner/repo"
            className="input-shell h-16 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-base shadow-none"
          />
          <button
            type="button"
            onClick={onRunAudit}
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
  );
}
