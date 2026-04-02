"use client";

import { motion, useReducedMotion } from "framer-motion";

function BreakingWord({ animated }: { animated: boolean }) {
  const topAnimation = animated
    ? {
        x: [0, -1, 1, -2, 0],
        y: [0, -1, 0, -1, 0],
        rotate: [0, -1, 1, -1.5, 0],
      }
    : undefined;

  const bottomAnimation = animated
    ? {
        x: [0, 1, -1, 2, 0],
        y: [0, 1, 0, 1, 0],
        rotate: [0, 1, -1, 1.5, 0],
      }
    : undefined;

  const slashAnimation = animated
    ? {
        opacity: [0.35, 0.9, 0.5, 0.85, 0.35],
        scaleX: [0.94, 1.03, 0.97, 1.05, 0.94],
      }
    : undefined;

  return (
    <span className="relative inline-flex items-center text-amber-200">
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-0 text-amber-100/90"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 48%, 0 42%)" }}
        animate={topAnimation}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
      >
        breaks
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-0 text-amber-300/90"
        style={{ clipPath: "polygon(0 55%, 100% 50%, 100% 100%, 0 100%)" }}
        animate={bottomAnimation}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
      >
        breaks
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="absolute left-[6%] top-[56%] h-px w-[88%] bg-gradient-to-r from-transparent via-amber-100/90 to-transparent"
        animate={slashAnimation}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
      />

      <span className="relative z-10 text-amber-200">breaks</span>
    </span>
  );
}

export default function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();
  const animated = !prefersReducedMotion;

  return (
    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      <motion.span
        className="text-cyan-300"
        initial={false}
        animate={animated ? { opacity: [0.78, 1], y: [12, 0] } : undefined}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        Analyze
      </motion.span>{" "}
      before the{" "}
      <motion.span
        className="bg-gradient-to-r from-violet-200 to-sky-200 bg-clip-text text-transparent"
        initial={false}
        animate={animated ? { opacity: [0.78, 1], y: [12, 0] } : undefined}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        production
      </motion.span>{" "}
      <BreakingWord animated={animated} />
    </h1>
  );
}
