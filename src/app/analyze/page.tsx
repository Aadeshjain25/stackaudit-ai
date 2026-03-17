"use client";

import { useState } from "react";

type AuditReport = {
  scan: {
    filesAnalyzed: number;
    complexity: number;
    functions: number;
    loops: number;
    ifStatements: number;
  };
  metrics: {
    functionCount: number;
    loopCount: number;
    ifCount: number;
    complexity: number;
    maintainabilityScore: number;
    riskScore: number;
  };
  aiReport: string | null;
  error?: string;
};

export default function AnalyzePage() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  async function runAudit() {
    setLoading(true);

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl: repo }),
    });

    const data = await res.json();

    setReport(data);
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-10">

      <h1 className="text-3xl font-semibold mb-6">
        Analyze GitHub Repository
      </h1>

      <input
        className="w-full p-3 rounded bg-[#0B1220] border border-white/10"
        placeholder="https://github.com/user/repo"
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
      />

      <button
        onClick={runAudit}
        className="mt-4 px-6 py-2 bg-cyan-600 rounded"
      >
        {loading ? "Scanning..." : "Run Audit"}
      </button>

      {report && (
        <pre className="mt-8 text-sm bg-[#0B1220] p-6 rounded">
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </div>
  );
}
