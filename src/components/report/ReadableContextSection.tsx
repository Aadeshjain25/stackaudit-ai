import type { ReadableContext } from "@/src/lib/readableContext";

type ReadableContextSectionProps = {
  context: ReadableContext;
  riskyFilePaths: string[];
};

export default function ReadableContextSection({
  context,
  riskyFilePaths,
}: ReadableContextSectionProps) {
  return (
    <>
      <h2 className="section-title">Readable context</h2>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Executive summary
      </h3>
      <p className="section-copy mt-3">{context.executiveSummary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
          {context.riskDistributionLabel}
        </span>
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Most important engineering risks
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
        {context.engineeringRisks.map((risk) => (
          <li key={risk} className="flex gap-2">
            <span className="text-slate-400" aria-hidden="true">
              •
            </span>
            <span>{risk}</span>
          </li>
        ))}
      </ul>

      {riskyFilePaths.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {riskyFilePaths.map((filePath) => (
            <span
              key={filePath}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
            >
              {filePath}
            </span>
          ))}
        </div>
      ) : null}

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Most practical next fixes
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
        {context.practicalNextFixes.map((fix) => (
          <li key={fix} className="flex gap-2">
            <span className="text-slate-400" aria-hidden="true">
              •
            </span>
            <span>{fix}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

