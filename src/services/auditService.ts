import { scanRepo } from "../scanner/scanRepo";
import { generateAIReport } from "../ai/generateReport";

export async function auditRepository(repoUrl: string) {
  const scanResult = await scanRepo(repoUrl);
  const metrics = {
    functionCount: scanResult.functions,
    loopCount: scanResult.loops,
    ifCount: scanResult.ifStatements,
    complexity: scanResult.complexity,

    // temporary calculated scores
    maintainabilityScore: Math.max(0, 100 - scanResult.complexity),

    riskScore: Math.min(
      100,
      scanResult.complexity * 2 +
      scanResult.loops * 1 +
      scanResult.ifStatements * 1
    )
  };

  let aiReport: string | null = null;

  try {
    aiReport = await generateAIReport(metrics);
  } catch (error) {
    console.error("AI REPORT ERROR:", error);
  }

  return {
    scan: scanResult,
    metrics,
    aiReport
  };
}
