import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

export function analyzeCode(code: string) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let functionCount = 0;
  let loopCount = 0;
  let ifCount = 0;
  let complexity = 1; // base path

  traverse(ast, {
    FunctionDeclaration() {
      functionCount++;
    },

    ForStatement() {
      loopCount++;
      complexity++;
    },

    WhileStatement() {
      loopCount++;
      complexity++;
    },

    IfStatement() {
      ifCount++;
      complexity++;
    },

    LogicalExpression(path) {
      // handles && and ||
      if (path.node.operator === "&&" || path.node.operator === "||") {
        complexity++;
      }
    },
  });

  // Calculate a maintainability score (0-100)
  let maintainabilityScore = 100;

  maintainabilityScore -= functionCount * 2;
  maintainabilityScore -= loopCount * 5;
  maintainabilityScore -= ifCount * 3;
  maintainabilityScore -= complexity * 2;

  if (maintainabilityScore < 0) maintainabilityScore = 0;

  // Production Risk Score (higher = worse)
  let riskScore = Math.min(100, complexity * 5 + loopCount * 5 + ifCount * 3);

  return {
    functionCount,
    loopCount,
    ifCount,
    complexity,
    maintainabilityScore,
    riskScore,
  };
}