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
    const entries = await readDirectoryEntries(currentPath, repoPath, warnings);

    if (!entries) {
      return;
    }

    for (const entry of entries) {
      assertWithinLimits();

      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (shouldIgnoreDirectory(entry.name)) {
          continue;
        }

        await walk(entryPath);
        continue;
      }

      if (isPackageManifest(entry.name)) {
        packageJsonDetected = true;
      }

      const extension = path.extname(entry.name);

      if (!isSupportedCodeExtension(extension)) {
        continue;
      }

      if (files.length >= MAX_FILE_COUNT) {
        throw new RepoTooLargeError();
      }

      const stats = await readFileStats(entryPath, repoPath, warnings);

      if (!stats) {
        filesSkipped += 1;
        continue;
      }

      if (stats.size > MAX_FILE_SIZE_BYTES) {
        warnings.push(createOversizedFileWarning(entryPath, repoPath));
        continue;
      }

      files.push({
        absolutePath: entryPath,
        relativePath: normalizeRelativePath(path.relative(repoPath, entryPath)),
        fileSizeBytes: stats.size,
      });

      registerTechStack(extension, detectedStack);
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

async function readDirectoryEntries(
  currentPath: string,
  repoPath: string,
  warnings: string[],
) {
  try {
    return await fs.readdir(currentPath, { withFileTypes: true });
  } catch (error) {
    warnings.push(
      `Skipped ${normalizeRelativePath(path.relative(repoPath, currentPath)) || "."}: ${
        error instanceof Error ? error.message : "Unable to read directory"
      }`,
    );
    return null;
  }
}

async function readFileStats(entryPath: string, repoPath: string, warnings: string[]) {
  try {
    return await fs.stat(entryPath);
  } catch (error) {
    warnings.push(
      `Skipped ${normalizeRelativePath(path.relative(repoPath, entryPath))}: ${
        error instanceof Error ? error.message : "Unable to read file metadata"
      }`,
    );
    return null;
  }
}

function shouldIgnoreDirectory(name: string) {
  return IGNORED_DIRECTORIES.has(name);
}

function isPackageManifest(name: string) {
  return name === "package.json";
}

function isSupportedCodeExtension(extension: string) {
  return CODE_EXTENSIONS.has(extension);
}

function createOversizedFileWarning(entryPath: string, repoPath: string) {
  return `Skipped ${normalizeRelativePath(path.relative(repoPath, entryPath))} because it exceeds ${MAX_FILE_SIZE_BYTES / 1000} KB.`;
}

function registerTechStack(extension: string, detectedStack: Set<TechStack>) {
  if (extension === ".js") {
    detectedStack.add("javascript");
    return;
  }

  if (extension === ".ts") {
    detectedStack.add("typescript");
    return;
  }

  if (extension === ".jsx") {
    detectedStack.add("javascript");
    detectedStack.add("react");
    return;
  }

  if (extension === ".tsx") {
    detectedStack.add("typescript");
    detectedStack.add("react");
  }
}
