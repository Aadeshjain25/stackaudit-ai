import Link from "next/link";
import { Activity, ShieldAlert, Cpu, Clock, Database } from "lucide-react";

export default function Home() {
  const scrollingCode = `import { scanProject } from "@/core/scanner";
import { buildGraph } from "@/core/graph";
import { evaluateRisk } from "@/core/risk";

type Finding = {
  file: string;
  complexity: number;
  risk: "low" | "medium" | "high";
  notes: string[];
};

async function runAudit(root: string): Promise<Finding[]> {
  const files = await scanProject(root, {
    include: ["ts", "tsx", "js", "jsx"],
    ignore: ["node_modules", ".next", "dist"],
  });

  const graph = buildGraph(files);
  const findings: Finding[] = [];

  for (const file of files) {
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

  return (
    <main className="h-screen overflow-hidden bg-[#070B14] text-white">

      {/* HERO */}
      <section className="hero relative h-full w-full px-8 py-12 grid md:grid-cols-2 items-center gap-12">

        {/* LEFT */}
        <div className="hero-content relative -translate-y-6 md:translate-x-16 lg:translate-x-20">
          <h1 className="hero-title">
            Audit your codebase automatically
            <br />
            before <span className="hero-accent">production breaks</span>
          </h1>

          <p className="hero-sub text-lg text-white/60 max-w-xl">
            Find system-level issues before users do.
          </p>



          {/* BUTTONS */}
          <div className="relative z-10 mt-10 flex gap-6">

            {/* Start Audit */}
            <Link
              href="/analyze"
              className="text-zinc-300 hover:text-zinc-100 backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent rounded-md py-2 px-4 shadow hover:shadow-zinc-400/40 duration-700 text-sm font-medium border border-white/15"
            >
              Audit Code {"</>"}
            </Link>

            {/* View Reports */}
           <Link
  href="/dashboard"
  className="text-white hover:text-white backdrop-blur-xl bg-white/10 rounded-md py-2 px-4 shadow-[0_8px_28px_rgba(15,23,42,0.35)] hover:shadow-[0_10px_34px_rgba(147,197,253,0.28)] duration-700 text-sm font-medium border border-white/30 hover:bg-white/15"
>
  View Reports →
</Link>

          </div>
        </div>

        {/* RIGHT SIDE VISUAL */}
        <div className="relative h-[580px] hidden md:flex items-center justify-center">

          {/* CODE PANEL */}
          <div className="code-panel-tilt w-[500px] h-[470px] rounded-2xl border border-white/10 bg-[#0B1220]/75 backdrop-blur-xl shadow-2xl p-5">

            {/* Mac Dots */}
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            <div className="analysis-status mb-3" aria-label="Live analysis status">
              <span className="status-chip status-chip-1">Parsing</span>
              <span className="status-chip status-chip-2">Dependency Graph</span>
              <span className="status-chip status-chip-3">Risk Model</span>
            </div>

            <div className="code-scroll-wrap">
              <div className="scan-beam" aria-hidden="true"></div>
              <div className="code-scroll-track">
                <pre className="code-scroll-block">{scrollingCode}</pre>
                <pre className="code-scroll-block" aria-hidden="true">{scrollingCode}</pre>
              </div>
            </div>

          </div>

          {/* FLOATING METRIC CARDS */}

          <div className="feature-card tilt-card tilt-card-1 metric-refresh metric-refresh-1 absolute right-2 top-14 bg-[#0B1220] border border-white/10 rounded-xl px-4 py-3 text-sm">
            <div className="flex gap-2 items-center">
              <Cpu size={16} className="icon-chip icon-cpu" />
              Complexity: <span className="text-yellow-400">Moderate</span>
            </div>
          </div>

          <div className="feature-card tilt-card tilt-card-2 metric-refresh metric-refresh-2 absolute left-2 bottom-6 bg-[#0B1220] border border-white/10 rounded-xl px-4 py-3 text-sm">
            <div className="flex gap-2 items-center">
              <ShieldAlert size={16} className="icon-chip icon-shield" />
              Risk: <span className="text-cyan-400">Low</span>
            </div>
          </div>

          <div className="feature-card tilt-card tilt-card-3 metric-refresh metric-refresh-3 absolute top-3 right-32 bg-[#0B1220] border border-white/10 rounded-xl px-4 py-3 text-sm">
            <div className="flex gap-2 items-center">
              <Activity size={16} className="icon-chip icon-activity" />
              Functions: <span className="text-white">14</span>
            </div>
          </div>

          <div className="feature-card tilt-card tilt-card-4 metric-refresh metric-refresh-4 absolute bottom-0 right-24 bg-[#0B1220] border border-white/10 rounded-xl px-4 py-3 text-sm">
            <div className="flex gap-2 items-center">
              <Clock size={16} className="icon-chip icon-clock" />
              Time: <span className="text-cyan-400">O(n²)</span>
            </div>
          </div>

          <div className="feature-card tilt-card tilt-card-5 metric-refresh metric-refresh-5 absolute top-48 right-0 bg-[#0B1220] border border-white/10 rounded-xl px-4 py-3 text-sm">
            <div className="flex gap-2 items-center">
              <Database size={16} className="icon-chip icon-db" />
              Tech Debt: <span className="text-cyan-400">62%</span>
            </div>
          </div>
{/* moving equations behind panel */}
<div className="absolute inset-0 pointer-events-none opacity-10 text-xs font-mono text-cyan-400">

  <div className="absolute top-10 left-10 animate-float">
    O(n log n)
  </div>

  <div className="absolute top-40 right-16 animate-float-slow">
    T(n) = 2T(n/2) + n
  </div>

  <div className="absolute bottom-24 left-20 animate-float">
    DFS(node)
  </div>

  <div className="absolute bottom-10 right-10 animate-float-slow">
    space = O(n)
  </div>

  <div className="absolute top-60 left-40 animate-float">
    hash(key) % m
  </div>

</div>
        </div>

      </section>
    </main>
  );
}
