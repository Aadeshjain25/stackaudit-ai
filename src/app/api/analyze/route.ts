import { NextResponse } from "next/server";
import { analyzeCode } from "../../../analyzer/analyzeCode";
import { prisma } from "../../../lib/prisma";
import { generateAIReport } from "../../../ai/generateReport";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body?.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Static analysis
    const metrics = analyzeCode(code);

    // AI (optional)
    let aiExplanation: string | null = null;

    try {
      aiExplanation = await generateAIReport(metrics);
    } catch (err) {
      console.log("AI temporarily unavailable");
    }

    // Save to DB
    const savedReport = await prisma.reports.create({
      data: {
        filename: "manual-input",
        functionCount: metrics.functionCount,
        loopCount: metrics.loopCount,
        ifCount: metrics.ifCount,
        complexity: metrics.complexity,
        maintainabilityScore: metrics.maintainabilityScore,
        riskScore: metrics.riskScore,
      },
    });

    return NextResponse.json({
      report: savedReport,
      aiExplanation,
    });

  } catch (err) {
    console.error("ERROR OCCURRED:", err);

    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}