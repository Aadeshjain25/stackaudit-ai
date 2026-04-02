"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

type AnalyzeLoadingStateProps = {
  isLoading: boolean;
  message: string;
};

export default function AnalyzeLoadingState({
  isLoading,
  message,
}: AnalyzeLoadingStateProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.section
          key="loading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="surface px-6 py-10 sm:px-8"
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <LoaderCircle className="h-7 w-7 animate-spin text-cyan-300" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white sm:text-2xl">{message}</h2>
            <p className="section-copy mt-3 max-w-xl">
              This usually takes a moment while StackAudit scans the repository and prepares the report.
            </p>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
