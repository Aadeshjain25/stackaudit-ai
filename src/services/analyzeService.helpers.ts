import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { CallExpression, Node } from "@babel/types";
import { calculateFileRiskLevel } from "@/src/services/scoreService";
import type { ScannedFile } from "@/src/services/scanService";
import type { FileFinding, FindingIssue } from "@/src/types/audit";

export type RawFileMetrics = {
  complexity: number;
  functionCount: number;
  loopCount: number;
  branchCount: number;
  maxNestingDepth: number;
  dependencyCount: number;
  lineCount: number;
};

type MetricsState = {
  activeDepth: number;
  dependencies: Set<string>;
  rawMetrics: RawFileMetrics;
};

const CONTROL_FLOW_NODES = new Set([
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
]);

export function createRawMetrics(code: string): RawFileMetrics {
  return {
    complexity: 1,
    functionCount: 0,
    loopCount: 0,
    branchCount: 0,
    maxNestingDepth: 0,
    dependencyCount: 0,
    lineCount: code.split(/\r?\n/).length,
  };
}

export function createTraversalHandlers(state: MetricsState): TraverseOptions {
  return {
    enter(path) {
      if (!isControlFlowNode(path.node)) {
        return;
      }

      state.activeDepth += 1;
      state.rawMetrics.maxNestingDepth = Math.max(
        state.rawMetrics.maxNestingDepth,
        state.activeDepth,
      );
    },
    exit(path) {
      if (!isControlFlowNode(path.node)) {
        return;
      }

      state.activeDepth = Math.max(0, state.activeDepth - 1);
    },
    FunctionDeclaration() {
      state.rawMetrics.functionCount += 1;
    },
    FunctionExpression() {
      state.rawMetrics.functionCount += 1;
    },
    ArrowFunctionExpression() {
      state.rawMetrics.functionCount += 1;
    },
    ClassMethod() {
      state.rawMetrics.functionCount += 1;
    },
    ClassPrivateMethod() {
      state.rawMetrics.functionCount += 1;
    },
    ObjectMethod() {
      state.rawMetrics.functionCount += 1;
    },
    ForStatement() {
      incrementLoopComplexity(state.rawMetrics);
    },
    ForInStatement() {
      incrementLoopComplexity(state.rawMetrics);
    },
    ForOfStatement() {
      incrementLoopComplexity(state.rawMetrics);
    },
    WhileStatement() {
      incrementLoopComplexity(state.rawMetrics);
    },
    DoWhileStatement() {
      incrementLoopComplexity(state.rawMetrics);
    },
    IfStatement() {
      incrementBranchComplexity(state.rawMetrics);
    },
    SwitchCase(path) {
      if (path.node.test) {
        incrementBranchComplexity(state.rawMetrics);
      }
    },
    ConditionalExpression() {
      incrementBranchComplexity(state.rawMetrics);
    },
    TryStatement() {
      state.rawMetrics.branchCount += 1;
    },
    CatchClause() {
      incrementBranchComplexity(state.rawMetrics);
    },
    LogicalExpression(path) {
      if (path.node.operator === "&&" || path.node.operator === "||") {
        state.rawMetrics.complexity += 1;
      }
    },
    ImportDeclaration(path) {
      state.dependencies.add(path.node.source.value);
    },
    CallExpression(path) {
      const dependency = getRequireDependency(path);
      if (dependency) {
        state.dependencies.add(dependency);
      }
    },
  };
}

export function buildIssues(rawMetrics: RawFileMetrics): FindingIssue[] {
  return [
    getComplexityIssue(rawMetrics.complexity),
    getNestingIssue(rawMetrics.maxNestingDepth),
    getFileSizeIssue(rawMetrics.lineCount),
    getDependencyIssue(rawMetrics.dependencyCount),
  ].filter((issue): issue is FindingIssue => Boolean(issue));
}

export function buildFileFinding(
  file: ScannedFile,
  rawMetrics: RawFileMetrics,
  issues: FindingIssue[],
): FileFinding {
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

function isControlFlowNode(node: Node) {
  return CONTROL_FLOW_NODES.has(node.type);
}

function incrementLoopComplexity(rawMetrics: RawFileMetrics) {
  rawMetrics.loopCount += 1;
  rawMetrics.complexity += 1;
}

function incrementBranchComplexity(rawMetrics: RawFileMetrics) {
  rawMetrics.branchCount += 1;
  rawMetrics.complexity += 1;
}

function getRequireDependency(path: NodePath<CallExpression>) {
  if (!path.get("callee").isIdentifier({ name: "require" })) {
    return null;
  }

  const arg = path.node.arguments[0];
  if (arg?.type === "StringLiteral") {
    return arg.value;
  }

  return null;
}

function createIssue(issue: FindingIssue) {
  return issue;
}

function getComplexityIssue(complexity: number) {
  if (complexity >= 25) {
    return createIssue({
      code: "complexity-high",
      title: "High control-flow complexity",
      detail: `Cyclomatic complexity is ${complexity}, which makes this file harder to reason about and test safely.`,
      severity: "high",
      recommendation: "Split long branches into smaller helpers and move decision tables into dedicated modules.",
    });
  }

  if (complexity >= 14) {
    return createIssue({
      code: "complexity-medium",
      title: "Control flow is getting dense",
      detail: `Cyclomatic complexity reached ${complexity}, which is above a comfortable maintenance threshold.`,
      severity: "medium",
      recommendation: "Refactor nested decision paths before this file becomes a hotspot.",
    });
  }

  return null;
}

function getNestingIssue(maxNestingDepth: number) {
  if (maxNestingDepth >= 5) {
    return createIssue({
      code: "nesting-high",
      title: "Nested logic is too deep",
      detail: `Maximum nesting depth is ${maxNestingDepth}, which increases cognitive load and defect risk.`,
      severity: "high",
      recommendation: "Introduce guard clauses and extract conditional branches into named functions.",
    });
  }

  if (maxNestingDepth >= 3) {
    return createIssue({
      code: "nesting-medium",
      title: "Nested logic needs attention",
      detail: `Maximum nesting depth is ${maxNestingDepth}, suggesting branching is concentrated in this file.`,
      severity: "medium",
      recommendation: "Flatten branching where possible and separate orchestration from business rules.",
    });
  }

  return null;
}

function getFileSizeIssue(lineCount: number) {
  if (lineCount >= 450) {
    return createIssue({
      code: "file-large",
      title: "File is too large",
      detail: `This file contains ${lineCount} lines, which makes ownership and code review harder.`,
      severity: "high",
      recommendation: "Break the file into smaller domain-focused modules with clearer boundaries.",
    });
  }

  if (lineCount >= 250) {
    return createIssue({
      code: "file-large-medium",
      title: "File size is trending large",
      detail: `This file contains ${lineCount} lines and is starting to accumulate too much responsibility.`,
      severity: "medium",
      recommendation: "Extract lower-level helpers and keep the top-level file focused on orchestration.",
    });
  }

  return null;
}

function getDependencyIssue(dependencyCount: number) {
  if (dependencyCount >= 14) {
    return createIssue({
      code: "dependency-high",
      title: "Dependency surface is broad",
      detail: `This file pulls in ${dependencyCount} dependencies, which can indicate coupling and lower portability.`,
      severity: "medium",
      recommendation: "Consolidate cross-cutting utilities and reduce module responsibilities.",
    });
  }

  return null;
}
