"use client";

import { Reveal, RevealItem } from "@/src/components/ui/Reveal";

type AnalyzeWarningsSectionProps = {
  warnings: string[];
};

export default function AnalyzeWarningsSection({
  warnings,
}: AnalyzeWarningsSectionProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Reveal className="surface px-6 py-7 sm:px-8" delay={0.24}>
      <h2 className="section-title">Scan caveats</h2>
      <p className="section-copy mt-2">A few conditions affected scan coverage.</p>
      <ul className="mt-6 divide-y divide-white/8">
        {warnings.map((warning, index) => (
          <RevealItem key={`${warning}-${index}`} delay={0.28 + index * 0.02} className="py-4">
            <li className="text-sm leading-7 text-slate-300">{warning}</li>
          </RevealItem>
        ))}
      </ul>
    </Reveal>
  );
}
