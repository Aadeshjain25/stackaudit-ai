import fs from "node:fs/promises";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import {
  buildFileFinding,
  buildIssues,
  createRawMetrics,
  createTraversalHandlers,
} from "@/src/services/analyzeService.helpers";
import type { ScannedFile } from "@/src/services/scanService";
import type { FileFinding } from "@/src/types/audit";

type AnalyzeRepositoryResult = {
  fileFindings: FileFinding[];
  parseErrors: number;
  warnings: string[];
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

function analyzeCodeContent(code: string, file: ScannedFile): FileFinding {
  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    errorRecovery: true,
    plugins: ["typescript", "jsx"],
  });

  const rawMetrics = createRawMetrics(code);
  const state = {
    activeDepth: 0,
    dependencies: new Set<string>(),
    rawMetrics,
  };

  traverse(ast, createTraversalHandlers(state));

  rawMetrics.dependencyCount = state.dependencies.size;
  return buildFileFinding(file, rawMetrics, buildIssues(rawMetrics));
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
