import AdmZip from "adm-zip";
import fs from "node:fs/promises";
import path from "node:path";

const TMP_ROOT = path.join("/tmp", ".stackaudit-tmp", "audits");
const DOWNLOAD_TIMEOUT_MS = 60_000;

export class CloneTimeoutError extends Error {
  code = "CLONE_TIMEOUT" as const;
  constructor(message = "Repository download took too long. Try a smaller repo.") {
    super(message);
    this.name = "CloneTimeoutError";
  }
}

function sanitizeRepoName(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-");
}

function parseGitHubUrl(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) throw new Error("Invalid GitHub URL");
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    const repoName = sanitizeRepoName(repo) || "repository";
    return { owner, repo, repoName };
  } catch {
    throw new Error("Invalid repository URL.");
  }
}

export function getRepoNameFromUrl(repoUrl: string) {
  return parseGitHubUrl(repoUrl).repoName;
}

export async function cloneRepository(repoUrl: string) {
  const { owner, repo, repoName } = parseGitHubUrl(repoUrl);
  const repoPath = path.join(TMP_ROOT, `${repoName}-${Date.now()}`);
  const zipPath = path.join("/tmp", `${repoName}-${Date.now()}.zip`);

  await fs.mkdir(TMP_ROOT, { recursive: true });
  await fs.mkdir(repoPath, { recursive: true });

  const downloadUrl = `https://github.com/${owner}/${repo}/archive/HEAD.zip`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(downloadUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "StackAudit-AI/1.0" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new CloneTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new Error("Repository not found. Make sure it is public.");
  }
  if (!response.ok) {
    throw new Error(`Failed to download repository: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(zipPath, buffer);

  try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    const topFolder = entries[0]?.entryName.split("/")[0] ?? "";

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const relativePath =
        topFolder && entry.entryName.startsWith(topFolder + "/")
          ? entry.entryName.slice(topFolder.length + 1)
          : entry.entryName;
      if (!relativePath) continue;
      const destPath = path.join(repoPath, relativePath);
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, entry.getData());
    }
  } finally {
    await fs.rm(zipPath, { force: true });
  }

  return { repoName, repoPath };
}

export async function cleanupRepository(repoPath: string) {
  await fs.rm(repoPath, { recursive: true, force: true });
}