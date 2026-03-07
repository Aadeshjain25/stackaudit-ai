export default function Loading() {
  return (
    <main className="loader-screen" aria-label="Loading page">
      <div className="loader-shell">
        <div className="loader-ring" aria-hidden="true"></div>

        <div className="loader-title-wrap">
          <p className="loader-title">Booting StackAudit Engine</p>
          <p className="loader-subtitle">Parsing code graph and warming risk model...</p>
        </div>

        <div className="loader-stages" aria-hidden="true">
          <span className="loader-stage loader-stage-1">Parse</span>
          <span className="loader-stage loader-stage-2">Analyze</span>
          <span className="loader-stage loader-stage-3">Report</span>
        </div>

        <div className="loader-progress" aria-hidden="true">
          <span className="loader-progress-bar"></span>
        </div>
      </div>
    </main>
  );
}
