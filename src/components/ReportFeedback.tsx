"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ReportFeedbackProps = {
  reportId?: number;
  repoName: string;
};

type FeedbackValue = "yes" | "not-really";

type StoredFeedback = {
  value: FeedbackValue;
  note: string;
  savedAt: string;
};

function storageKey(reportId: number | undefined, repoName: string) {
  return `stackaudit-feedback:${reportId ?? repoName}`;
}

function readStoredFeedback(key: string): StoredFeedback | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.localStorage.getItem(key);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as StoredFeedback;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export default function ReportFeedback({ reportId, repoName }: ReportFeedbackProps) {
  const key = useMemo(() => storageKey(reportId, repoName), [reportId, repoName]);
  const [storedFeedback, setStoredFeedback] = useState<StoredFeedback | null>(() => readStoredFeedback(key));
  const [selection, setSelection] = useState<FeedbackValue | null>(storedFeedback?.value ?? null);
  const [draftNote, setDraftNote] = useState(storedFeedback?.note ?? "");
  const isSaved = Boolean(storedFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function saveFeedback(value: FeedbackValue, text: string) {
    const payload: StoredFeedback = {
      value,
      note: text.trim(),
      savedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    if (reportId) {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId,
            rating: value === "yes" ? "yes" : "no",
            message: payload.note || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Feedback save failed");
        }

        const data = (await response.json()) as
          | { success: true; data: { reportId: number; saved: boolean } }
          | { success: false; error: string; message: string };

        if (!("success" in data) || data.success !== true) {
          throw new Error("Feedback save failed");
        }
      } catch (error) {
        console.error("FEEDBACK ERROR:", error);
        setIsSubmitting(false);
        setSubmitError("Failed to save feedback. Try again.");
        return;
      }
    }

    window.localStorage.setItem(key, JSON.stringify(payload));
    setStoredFeedback(payload);
    setSelection(value);
    setDraftNote(payload.note);
    setIsSubmitting(false);
  }

  return (
    <section className="surface p-6 sm:p-7">
      <span className="window-ornament" aria-hidden="true" />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="section-title">Does this match your repo?</h2>
          <p className="section-copy mt-3 max-w-2xl">
            Quick feedback helps us understand whether the report feels grounded and useful.
          </p>
        </div>
        {isSaved ? (
          <span className="inline-flex h-fit items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Feedback saved
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void saveFeedback("yes", "")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selection === "yes"
              ? "bg-cyan-400 text-slate-950"
              : "border border-white/12 bg-white/5 text-slate-200 hover:border-cyan-300/40 hover:bg-white/8"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => {
            setSelection("not-really");
            setStoredFeedback(null);
            setSubmitError(null);
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selection === "not-really"
              ? "bg-white/12 text-white"
              : "border border-white/12 bg-white/5 text-slate-200 hover:border-cyan-300/40 hover:bg-white/8"
          }`}
        >
          Not really
        </button>
      </div>

      <AnimatePresence initial={false}>
        {selection === "not-really" ? (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-white/8 pt-5">
              <label className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                What feels wrong or missing?
              </label>
              <textarea
                value={draftNote}
                onChange={(event) => {
                  setDraftNote(event.target.value);
                  setSubmitError(null);
                }}
                rows={4}
                placeholder="Example: the report missed where complexity is actually concentrated, or the AI explanation felt too generic."
                className="input-shell mt-3 min-h-28 resize-y"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveFeedback("not-really", draftNote)}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {isSubmitting ? "Saving..." : "Save feedback"}
                </button>
                <p className="text-sm text-slate-400">Saved after confirmation from the report API.</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {submitError ? <p className="mt-4 text-sm text-amber-200">{submitError}</p> : null}
    </section>
  );
}
