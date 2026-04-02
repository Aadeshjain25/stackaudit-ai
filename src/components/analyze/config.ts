import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FolderKanban,
  Gauge,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type { TopIssue } from "@/src/types/audit";

export const loadingMessages = [
  "Scanning repository...",
  "Analyzing code structure...",
  "Calculating score...",
  "Generating insights...",
];

export const metricItems = [
  { key: "filesAnalyzed", label: "Files analyzed", icon: FolderKanban },
  { key: "averageComplexity", label: "Average complexity", icon: Gauge },
  { key: "maxNestingDepth", label: "Max nesting", icon: TriangleAlert },
  { key: "totalDependencies", label: "Dependencies", icon: BrainCircuit },
] as const;

export const severityAccent = {
  high: "text-rose-300",
  medium: "text-amber-200",
  low: "text-cyan-200",
};

export const riskAccent = {
  critical: "text-rose-300",
  high: "text-rose-300",
  medium: "text-amber-200",
  low: "text-emerald-300",
};

export function issueIcon(severity: TopIssue["severity"]) {
  if (severity === "high") {
    return ShieldAlert;
  }

  if (severity === "medium") {
    return AlertTriangle;
  }

  return CheckCircle2;
}
