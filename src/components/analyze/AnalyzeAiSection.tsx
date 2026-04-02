"use client";

import { Sparkles } from "lucide-react";
import { Reveal } from "@/src/components/ui/Reveal";

type AnalyzeAiSectionProps = {
  aiReport: string | null;
};

export default function AnalyzeAiSection({
  aiReport,
}: AnalyzeAiSectionProps) {
  return (
    <Reveal className="surface px-6 py-7 sm:px-8" delay={0.2}>
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2">
          <Sparkles className="h-4 w-4 text-cyan-200" />
        </div>
        <h2 className="section-title">AI explanation</h2>
      </div>
      <p className="section-copy mt-3">Readable context for the findings above.</p>
      <p className="mt-6 max-w-4xl whitespace-pre-line text-[15px] leading-8 text-slate-300">
        {aiReport ?? "No additional AI insight was generated for this report, but the static findings above are still valid."}
      </p>
    </Reveal>
  );
}
