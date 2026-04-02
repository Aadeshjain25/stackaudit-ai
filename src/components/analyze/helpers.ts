import type {
  AuditApiErrorResponse,
  FileFinding,
  TopIssue,
} from "@/src/types/audit";

export type UiErrorState = {
  title: string;
  message: string;
  retryLabel: string;
  secondaryLabel?: string;
};

export function summarizeFinding(finding: FileFinding) {
  if (finding.issues[0]) {
    return finding.issues[0].detail;
  }

  return "This file did not breach issue thresholds, but it remains visible for code-health monitoring.";
}

export function getUiError(error: unknown): UiErrorState {
  if (error instanceof TypeError) {
    return {
      title: "Something went wrong during analysis.",
      message: "We couldn't reach StackAudit right now. Check your connection and try again.",
      retryLabel: "Try Again",
    };
  }

  return {
    title: "Something went wrong during analysis.",
    message: "We couldn't finish the audit for this repository. Please try again.",
    retryLabel: "Try Again",
  };
}

export function getUiErrorFromApi(error: AuditApiErrorResponse): UiErrorState {
  if (error.error === "UNSUPPORTED_REPO") {
    return {
      title: "Unsupported Repository",
      message: error.message,
      retryLabel: "Try Again",
      secondaryLabel: "Try another repo",
    };
  }

  return {
    title: "Something went wrong during analysis.",
    message: error.message,
    retryLabel: "Try Again",
  };
}

export function isHighPriorityFinding(finding: FileFinding) {
  return finding.riskLevel === "high" || finding.riskLevel === "critical";
}

export function getIssueKey(issue: TopIssue, index: number) {
  return `${issue.filePath}-${issue.code}-${index}`;
}
