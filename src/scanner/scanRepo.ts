import fs from "fs"
import { cloneRepo } from "./cloneRepo"
import { getCodeFiles } from "./getCodeFiles"
import { analyzeCode } from "../analyzer/analyzeCode"

export async function scanRepo(repoUrl: string) {

  const repoPath = await cloneRepo(repoUrl)

  const files = getCodeFiles(repoPath)

  let totalComplexity = 0
  let totalFunctions = 0
  let totalLoops = 0
  let totalIfs = 0

  for (const file of files) {
    const code = fs.readFileSync(file, "utf-8")

    const metrics = analyzeCode(code)

    totalComplexity += metrics.complexity
    totalFunctions += metrics.functionCount
    totalLoops += metrics.loopCount
    totalIfs += metrics.ifCount
  }

  return {
    filesAnalyzed: files.length,
    complexity: totalComplexity,
    functions: totalFunctions,
    loops: totalLoops,
    ifStatements: totalIfs
  }
}