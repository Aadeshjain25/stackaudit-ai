"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Reveal } from "@/src/components/ui/Reveal";
import type { UiErrorState } from "@/src/components/analyze/helpers";

type AnalyzeErrorStateProps = {
  error: UiErrorState;
  onRetry: () => void;
  onReset: () => void;
};

export default function AnalyzeErrorState({
  error,
  onRetry,
  onReset,
}: AnalyzeErrorStateProps) {
  return (
    <Reveal className="surface px-6 py-10 sm:px-8" delay={0.08}>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
          <TriangleAlert className="h-7 w-7 text-slate-200" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-white">{error.title}</h2>
        <p className="section-copy mt-3 max-w-xl">{error.message}</p>

        {error.title === "Unsupported Repository" ? (
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
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-100 hover:border-cyan-300/40 hover:bg-white/[0.06]"
          >
            <RefreshCcw className="h-4 w-4" />
            {error.retryLabel}
          </button>

          {error.secondaryLabel ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white"
            >
              {error.secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
