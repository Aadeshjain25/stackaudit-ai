export function logScan(repoUrl: string) {
  console.log("[analytics] scan", {
    repoUrl,
    timestamp: new Date().toISOString(),
  });
}

export function logReportView(reportId: number) {
  console.log("[analytics] report_view", {
    reportId,
    timestamp: new Date().toISOString(),
  });
}

export function logFeedback(reportId: number) {
  console.log("[analytics] feedback", {
    reportId,
    timestamp: new Date().toISOString(),
  });
}
