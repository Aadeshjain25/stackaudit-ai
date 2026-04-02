import fs from "node:fs/promises";
import * as parser from "@babel/parser";
import traverse, { type NodePath } from "@babel/traverse";
import type { CallExpression, Node } from "@babel/types";
import { calculateFileRiskLevel } from "@/src/services/scoreService";
import type { ScannedFile } from "@/src/services/scanService";
import type { FileFinding, FindingIssue } from "@/src/types/audit";

type AnalyzeRepositoryResult = {
  fileFindings: FileFinding[];
  parseErrors: number;
  warnings: string[];
};

type RawFileMetrics = {
  complexity: number;
  functionCount: number;
  loopCount: number;
  branchCount: number;
  maxNestingDepth: number;
  dependencyCount: number;
  lineCount: number;
};

const MAX_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  limit = MAX_CONCURRENCY,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    }),
  );

  return results;
}

function createIssue(issue: FindingIssue): FindingIssue {
  return issue;
}

function isControlFlowNode(node: Node) {
  return [
    "CatchClause",
    "ConditionalExpression",
    "DoWhileStatement",
    "ForInStatement",
    "ForOfStatement",
    "ForStatement",
    "IfStatement",
    "SwitchStatement",
    "TryStatement",
    "WhileStatement",
  ].includes(node.type);
}

function isRequireCall(path: NodePath<CallExpression>) {
  return path.get("callee").isIdentifier({ name: "require" });
}

function analyzeCodeContent(code: string, file: ScannedFile): FileFinding {
  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    errorRecovery: true,
    plugins: ["typescript", "jsx"],
  });

  const dependencies = new Set<string>();
  const rawMetrics: RawFileMetrics = {
    complexity: 1,
    functionCount: 0,
    loopCount: 0,
    branchCount: 0,
    maxNestingDepth: 0,
    dependencyCount: 0,
    lineCount: code.split(/\r?\n/).length,
  };

  let activeDepth = 0;

  traverse(ast, {
    enter(path) {
      if (isControlFlowNode(path.node)) {
        activeDepth += 1;
        rawMetrics.maxNestingDepth = Math.max(rawMetrics.maxNestingDepth, activeDepth);
      }
    },
    exit(path) {
      if (isControlFlowNode(path.node)) {
        activeDepth = Math.max(0, activeDepth - 1);
      }
    },
    FunctionDeclaration() {
      rawMetrics.functionCount += 1;
    },
    FunctionExpression() {
      rawMetrics.functionCount += 1;
    },
    ArrowFunctionExpression() {
      rawMetrics.functionCount += 1;
    },
    ClassMethod() {
      rawMetrics.functionCount += 1;
    },
    ClassPrivateMethod() {
      rawMetrics.functionCount += 1;
    },
    ObjectMethod() {
      rawMetrics.functionCount += 1;
    },
    ForStatement() {
      rawMetrics.loopCount += 1;
      rawMetrics.complexity += 1;
    },
    ForInStatement() {
      rawMetrics.loopCount += 1;
      rawMetrics.complexity += 1;
    },
    ForOfStatement() {
      rawMetrics.loopCount += 1;
      rawMetrics.complexity += 1;
    },
    WhileStatement() {
      rawMetrics.loopCount += 1;
      rawMetrics.complexity += 1;
    },
    DoWhileStatement() {
      rawMetrics.loopCount += 1;
      rawMetrics.complexity += 1;
    },
    IfStatement() {
      rawMetrics.branchCount += 1;
      rawMetrics.complexity += 1;
    },
    SwitchCase(path) {
      if (path.node.test) {
        rawMetrics.branchCount += 1;
        rawMetrics.complexity += 1;
      }
    },
    ConditionalExpression() {
      rawMetrics.branchCount += 1;
      rawMetrics.complexity += 1;
    },
    TryStatement() {
      rawMetrics.branchCount += 1;
    },
    CatchClause() {
      rawMetrics.branchCount += 1;
      rawMetrics.complexity += 1;
    },
    LogicalExpression(path) {
      if (path.node.operator === "&&" || path.node.operator === "||") {
        rawMetrics.complexity += 1;
      }
    },
    ImportDeclaration(path) {
      dependencies.add(path.node.source.value);
    },
    CallExpression(path) {
      if (isRequireCall(path)) {
        const arg = path.node.arguments[0];
        if (arg?.type === "StringLiteral") {
          dependencies.add(arg.value);
        }
      }
    },
  });

  rawMetrics.dependencyCount = dependencies.size;

  const issues: FindingIssue[] = [];

  if (rawMetrics.complexity >= 25) {
    issues.push(
      createIssue({
        code: "complexity-high",
        title: "High control-flow complexity",
        detail: `Cyclomatic complexity is ${rawMetrics.complexity}, which makes this file harder to reason about and test safely.`,
        severity: "high",
        recommendation: "Split long branches into smaller helpers and move decision tables into dedicated modules.",
      }),
    );
  } else if (rawMetrics.complexity >= 14) {
    issues.push(
      createIssue({
        code: "complexity-medium",
        title: "Control flow is getting dense",
        detail: `Cyclomatic complexity reached ${rawMetrics.complexity}, which is above a comfortable maintenance threshold.`,
        severity: "medium",
        recommendation: "Refactor nested decision paths before this file becomes a hotspot.",
      }),
    );
  }

  if (rawMetrics.maxNestingDepth >= 5) {
    issues.push(
      createIssue({
        code: "nesting-high",
        title: "Nested logic is too deep",
        detail: `Maximum nesting depth is ${rawMetrics.maxNestingDepth}, which increases cognitive load and defect risk.`,
        severity: "high",
        recommendation: "Introduce guard clauses and extract conditional branches into named functions.",
      }),
    );
  } else if (rawMetrics.maxNestingDepth >= 3) {
    issues.push(
      createIssue({
        code: "nesting-medium",
        title: "Nested logic needs attention",
        detail: `Maximum nesting depth is ${rawMetrics.maxNestingDepth}, suggesting branching is concentrated in this file.`,
        severity: "medium",
        recommendation: "Flatten branching where possible and separate orchestration from business rules.",
      }),
    );
  }

  if (rawMetrics.lineCount >= 450) {
    issues.push(
      createIssue({
        code: "file-large",
        title: "File is too large",
        detail: `This file contains ${rawMetrics.lineCount} lines, which makes ownership and code review harder.`,
        severity: "high",
        recommendation: "Break the file into smaller domain-focused modules with clearer boundaries.",
      }),
    );
  } else if (rawMetrics.lineCount >= 250) {
    issues.push(
      createIssue({
        code: "file-large-medium",
        title: "File size is trending large",
        detail: `This file contains ${rawMetrics.lineCount} lines and is starting to accumulate too much responsibility.`,
        severity: "medium",
        recommendation: "Extract lower-level helpers and keep the top-level file focused on orchestration.",
      }),
    );
  }

  if (rawMetrics.dependencyCount >= 14) {
    issues.push(
      createIssue({
        code: "dependency-high",
        title: "Dependency surface is broad",
        detail: `This file pulls in ${rawMetrics.dependencyCount} dependencies, which can indicate coupling and lower portability.`,
        severity: "medium",
        recommendation: "Consolidate cross-cutting utilities and reduce module responsibilities.",
      }),
    );
  }

  const finding: FileFinding = {
    filePath: file.relativePath,
    fileSizeBytes: file.fileSizeBytes,
    lineCount: rawMetrics.lineCount,
    functionCount: rawMetrics.functionCount,
    dependencyCount: rawMetrics.dependencyCount,
    complexity: rawMetrics.complexity,
    loopCount: rawMetrics.loopCount,
    branchCount: rawMetrics.branchCount,
    maxNestingDepth: rawMetrics.maxNestingDepth,
    issues,
    riskLevel: "low",
  };

  finding.riskLevel = calculateFileRiskLevel(finding);

  return finding;
}

export async function analyzeRepository(files: ScannedFile[]): Promise<AnalyzeRepositoryResult> {
  const warnings: string[] = [];
  let parseErrors = 0;

  const analyzed = await mapWithConcurrency(files, async (file) => {
    try {
      const code = await fs.readFile(file.absolutePath, "utf8");
      return analyzeCodeContent(code, file);
    } catch (error) {
      parseErrors += 1;
      warnings.push(
        `Failed to analyze ${file.relativePath}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      return null;
    }
  });

  const fileFindings = analyzed
    .filter((finding): finding is FileFinding => Boolean(finding))
    .sort((left, right) => right.complexity - left.complexity);

  return {
    fileFindings,
    parseErrors,
    warnings,
  };
}
