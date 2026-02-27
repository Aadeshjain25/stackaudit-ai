import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIReport(metrics: {
  functionCount: number;
  loopCount: number;
  ifCount: number;
  complexity: number;
  maintainabilityScore: number;
  riskScore: number;
}) {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

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
• Overall quality
• Potential risks
• Practical improvements
Keep it clear and concise.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const response = result.response;
  return response.text();
}