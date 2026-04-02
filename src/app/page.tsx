import Link from "next/link";
import {
  Activity,
  Clock,
  Cpu,
  Database,
  ShieldAlert,
} from "lucide-react";

const scrollingCode = `for (const file of files) {
  const complexity = graph.metrics(file).cyclomatic;
  const imports = graph.neighbors(file).length;
  const risk = evaluateRisk({ complexity, imports });

  findings.push({
    file,
    complexity,
    risk,
    notes: [
      complexity > 18 ? "Refactor long control flow" : "Flow looks healthy",
      imports > 12 ? "High coupling detected" : "Coupling under threshold",
    ],
  });
}

return findings.sort((a, b) => b.complexity - a.complexity);
}

export async function createExecutiveSummary(root: string) {
  const findings = await runAudit(root);
  const highRisk = findings.filter((x) => x.risk === "high");
  const avg = findings.reduce((s, x) => s + x.complexity, 0) / findings.length;

  return {
    files: findings.length,
    highRiskFiles: highRisk.length,
    averageComplexity: Math.round(avg),
    recommendation: highRisk.length > 0 ? "Stabilize critical modules" : "Scale confidently",
  };
}`;

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-hidden">
      <section className="hero flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="hero-content relative md:translate-x-6 md:translate-y-4 lg:translate-x-10 lg:translate-y-6">
            <h1 className="hero-title max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Analyze your codebase automatically
              <br />
              before <span className="hero-accent">production breaks</span>
            </h1>

            <p className="hero-sub mt-5 max-w-xl text-base text-white/60 sm:text-lg">
              Find system-level issues before users do.
            </p>

            <div className="relative z-10 mt-10 flex flex-wrap gap-4">
              <Link
                href="/analyze"
                className="backdrop-blur-lg rounded-md border border-white/15 bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent px-4 py-2 text-sm font-medium text-zinc-300 shadow transition duration-700 hover:text-zinc-100 hover:shadow-zinc-400/40"
              >
                Audit Code {"</>"}
              </Link>

              <Link
                href="/analyze"
                className="rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_28px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-700 hover:bg-white/15 hover:text-white hover:shadow-[0_10px_34px_rgba(147,197,253,0.28)]"
              >
                Start Audit -&gt;
              </Link>
            </div>
          </div>

          <div className="relative hidden h-[520px] items-center justify-center md:flex md:translate-y-4 lg:translate-y-6">
            <div className="code-panel-tilt h-[430px] w-[480px] rounded-2xl border border-white/10 bg-[#0B1220]/75 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <div className="analysis-status mb-3" aria-label="Live analysis status">
                <span className="status-chip status-chip-1">Parsing</span>
                <span className="status-chip status-chip-2">Dependency Graph</span>
                <span className="status-chip status-chip-3">Risk Model</span>
              </div>

              <div className="code-scroll-wrap">
                <div className="scan-beam" aria-hidden="true" />
                <div className="code-scroll-track">
                  <pre className="code-scroll-block">{scrollingCode}</pre>
                  <pre className="code-scroll-block" aria-hidden="true">
                    {scrollingCode}
                  </pre>
                </div>
              </div>
            </div>

            <div className="feature-card tilt-card tilt-card-1 metric-refresh metric-refresh-1 absolute right-0 top-10 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="icon-chip icon-cpu" />
                Complexity: <span className="text-yellow-400">Moderate</span>
              </div>
            </div>

            <div className="feature-card tilt-card tilt-card-2 metric-refresh metric-refresh-2 absolute bottom-6 left-0 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="icon-chip icon-shield" />
                Risk: <span className="text-cyan-400">Low</span>
              </div>
            </div>

            <div className="feature-card tilt-card tilt-card-3 metric-refresh metric-refresh-3 absolute right-28 top-0 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Activity size={16} className="icon-chip icon-activity" />
                Functions: <span className="text-white">14</span>
              </div>
            </div>

            <div className="feature-card tilt-card tilt-card-4 metric-refresh metric-refresh-4 absolute bottom-0 right-20 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="icon-chip icon-clock" />
                Time: <span className="text-cyan-400">O(n²)</span>
              </div>
            </div>

            <div className="feature-card tilt-card tilt-card-5 metric-refresh metric-refresh-5 absolute right-0 top-44 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Database size={16} className="icon-chip icon-db" />
                Tech Debt: <span className="text-cyan-400">62%</span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 font-mono text-xs text-cyan-400/12">
              <div className="animate-float absolute left-10 top-10">O(n log n)</div>
              <div className="animate-float-slow absolute right-16 top-36">T(n) = 2T(n/2) + n</div>
              <div className="animate-float absolute bottom-24 left-20">DFS(node)</div>
              <div className="animate-float-slow absolute bottom-10 right-10">space = O(n)</div>
              <div className="animate-float absolute left-40 top-60">hash(key) % m</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
