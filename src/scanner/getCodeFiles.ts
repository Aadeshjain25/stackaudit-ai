import fs from "fs"
import path from "path"

const EXTENSIONS = [".js", ".ts", ".tsx", ".jsx"]

export function getCodeFiles(dir: string): string[] {
  let results: string[] = []

  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory()) {
      results = results.concat(getCodeFiles(filePath))
    } else {
      if (EXTENSIONS.includes(path.extname(file))) {
        results.push(filePath)
      }
    }
  })

  return results
}