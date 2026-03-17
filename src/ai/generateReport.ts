import Groq from "groq-sdk";

type Metrics = {
  functionCount: number;
  loopCount: number;
  ifCount: number;
  complexity: number;
  maintainabilityScore: number;
  riskScore: number;
};

export async function generateAIReport(metrics: Metrics) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const groq = new Groq({ apiKey });

  const prompt = `
You are a senior software engineer reviewing a junior developer's code.

Static Analysis Metrics:

Functions: ${metrics.functionCount}
Loops: ${metrics.loopCount}
Conditions: ${metrics.ifCount}
Cyclomatic Complexity: ${metrics.complexity}
Maintainability Score: ${metrics.maintainabilityScore}/100
Production Risk Score: ${metrics.riskScore}/100

Write a short professional code review including:
- Overall quality
- Potential risks
- Practical improvements

Keep it clear, concise, and professional.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices?.[0]?.message?.content || "No report generated.";
}
