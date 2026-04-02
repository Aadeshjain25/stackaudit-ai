import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const TMP_ROOT = path.join(process.cwd(), ".stackaudit-tmp", "audits");
const CLONE_TIMEOUT_MS = 15_000;
const execFileAsync = promisify(execFile);

export class CloneTimeoutError extends Error {
  code = "CLONE_TIMEOUT" as const;

  constructor(message = "Repository cloning took too long. Try a smaller repo.") {
    super(message);
    this.name = "CloneTimeoutError";
  }
}

function sanitizeRepoName(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-");
}

export function getRepoNameFromUrl(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    const slug = url.pathname.split("/").filter(Boolean).pop() ?? "repository";
    return sanitizeRepoName(slug.replace(/\.git$/, "")) || "repository";
  } catch {
    throw new Error("Invalid repository URL.");
  }
}

export async function cloneRepository(repoUrl: string) {
  const repoName = getRepoNameFromUrl(repoUrl);
  const repoPath = path.join(TMP_ROOT, `${repoName}-${Date.now()}`);

  await fs.mkdir(TMP_ROOT, { recursive: true });

  try {
    await execFileAsync(
      "git",
      ["clone", "--depth", "1", "--single-branch", repoUrl, repoPath],
      { timeout: CLONE_TIMEOUT_MS },
    );
  } catch (error) {
    await fs.rm(repoPath, { recursive: true, force: true });

    if (
      error &&
      typeof error === "object" &&
      ("code" in error || "killed" in error) &&
      ((error as { code?: string }).code === "ETIMEDOUT" || (error as { killed?: boolean }).killed)
    ) {
      throw new CloneTimeoutError();
    }

    throw error;
  }

  return { repoName, repoPath };
}

export async function cleanupRepository(repoPath: string) {
  await fs.rm(repoPath, { recursive: true, force: true });
}
