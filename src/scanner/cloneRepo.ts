import simpleGit from "simple-git"
import path from "path"
import fs from "fs"

export async function cloneRepo(repoUrl: string): Promise<string> {
  const repoName =
    repoUrl
      .split("/")
      .pop()
      ?.replace(".git", "")
      .replace(/[^a-zA-Z0-9-_]/g, "") || "repo"

  const repoPath = path.join(process.cwd(), "tmp", `${repoName}-${Date.now()}`)

  if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp")
  }

  const git = simpleGit()

  await git.clone(repoUrl, repoPath)

  return repoPath
}
