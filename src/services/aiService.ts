import Groq from "groq-sdk";
import type { AuditRunResult } from "@/src/types/audit";

export async function generateAiReport(
  input: Pick<AuditRunResult, "repoName" | "summaryMetrics" | "topIssues" | "score">,
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  const groq = new Groq({ apiKey });

  const prompt = `
You are explaining a static-analysis audit for a software repository.

Explain ONLY the provided findings. Do not invent issues. Provide actionable fixes.
If the findings are limited, say that clearly.
Do not mention files, defects, or risks that are not present in the supplied data.
If no major issues are present, explicitly say that no major issues were detected.

Repository: ${input.repoName}
Overall Score: ${input.score.value}/100 (${input.score.grade})

Summary Metrics:
${JSON.stringify(input.summaryMetrics, null, 2)}

Top Issues:
${JSON.stringify(input.topIssues, null, 2)}

Return:
1. A short executive summary
2. The most important engineering risks
3. The most practical next fixes

Keep it concise, specific, and grounded in the supplied findings.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content ?? null;
}
