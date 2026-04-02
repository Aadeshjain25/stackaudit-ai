export function logScan(repoUrl: string) {
  console.log("[analytics] scan", {
    repoUrl,
    timestamp: new Date().toISOString(),
  });
}

export function logReportView(reportId: string) {
  console.log("[analytics] report_view", {
    reportId,
    timestamp: new Date().toISOString(),
  });
}

export function logFeedback(reportId: string) {
  console.log("[analytics] feedback", {
    reportId,
    timestamp: new Date().toISOString(),
  });
}
