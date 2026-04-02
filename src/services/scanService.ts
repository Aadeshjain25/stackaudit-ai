import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { TechStack } from "@/src/types/audit";

export type ScannedFile = {
  absolutePath: string;
  relativePath: string;
  fileSizeBytes: number;
};

export type ScanResult = {
  files: ScannedFile[];
  techStack: TechStack[];
  warnings: string[];
  filesSkipped: number;
};

export class RepoTooLargeError extends Error {
  code = "REPO_TOO_LARGE" as const;

  constructor(message = "Repository too large to analyze. Try a smaller project.") {
    super(message);
    this.name = "RepoTooLargeError";
  }
}

const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const MAX_FILE_COUNT = 300;
const MAX_FILE_SIZE_BYTES = 300_000;
const SCAN_TIMEOUT_MS = 20_000;

function normalizeRelativePath(value: string) {
  return value.split(path.sep).join("/");
}

export async function scanRepository(repoPath: string): Promise<ScanResult> {
  const files: ScannedFile[] = [];
  const detectedStack = new Set<TechStack>();
  const warnings: string[] = [];
  let filesSkipped = 0;
  let packageJsonDetected = false;
  const startedAt = Date.now();

  function assertWithinLimits() {
    if (Date.now() - startedAt > SCAN_TIMEOUT_MS) {
      throw new RepoTooLargeError();
    }
  }

  async function walk(currentPath: string) {
    assertWithinLimits();
    let entries: Dirent[] = [];

    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      warnings.push(
        `Skipped ${normalizeRelativePath(path.relative(repoPath, currentPath)) || "."}: ${
          error instanceof Error ? error.message : "Unable to read directory"
        }`,
      );
      return;
    }

    for (const entry of entries) {
      assertWithinLimits();

      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        await walk(entryPath);
        continue;
      }

      if (entry.name === "package.json") {
        packageJsonDetected = true;
      }

      const extension = path.extname(entry.name);

      if (!CODE_EXTENSIONS.has(extension)) {
        continue;
      }

      if (files.length >= MAX_FILE_COUNT) {
        throw new RepoTooLargeError();
      }

      let stats: Awaited<ReturnType<typeof fs.stat>>;

      try {
        stats = await fs.stat(entryPath);
      } catch (error) {
        warnings.push(
          `Skipped ${normalizeRelativePath(path.relative(repoPath, entryPath))}: ${
            error instanceof Error ? error.message : "Unable to read file metadata"
          }`,
        );
        filesSkipped += 1;
        continue;
      }

      if (stats.size > MAX_FILE_SIZE_BYTES) {
        warnings.push(
          `Skipped ${normalizeRelativePath(path.relative(repoPath, entryPath))} because it exceeds ${MAX_FILE_SIZE_BYTES / 1000} KB.`,
        );
        continue;
      }

      files.push({
        absolutePath: entryPath,
        relativePath: normalizeRelativePath(path.relative(repoPath, entryPath)),
        fileSizeBytes: stats.size,
      });

      if (extension === ".js") {
        detectedStack.add("javascript");
      }

      if (extension === ".ts") {
        detectedStack.add("typescript");
      }

      if (extension === ".jsx") {
        detectedStack.add("javascript");
        detectedStack.add("react");
      }

      if (extension === ".tsx") {
        detectedStack.add("typescript");
        detectedStack.add("react");
      }
    }
  }

  await walk(repoPath);

  if (packageJsonDetected && detectedStack.size > 0) {
    detectedStack.add("nodejs");
  }

  return {
    files,
    techStack: Array.from(detectedStack),
    warnings,
    filesSkipped,
  };
}
