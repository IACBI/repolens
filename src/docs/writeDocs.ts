import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedDocs } from "../types/index.js";

const OUTPUT_FILES: Array<[keyof GeneratedDocs, string]> = [
  ["architecture", "ARCHITECTURE.md"],
  ["modules", "MODULES.md"],
  ["onboarding", "ONBOARDING.md"],
  ["dependencyMap", "DEPENDENCY_MAP.md"],
  ["docsHealth", "DOCS_HEALTH.md"]
];

export async function writeGeneratedDocs(root: string, outputDir: string, docs: GeneratedDocs): Promise<string[]> {
  const absoluteOutputDir = path.resolve(root, outputDir);
  await mkdir(absoluteOutputDir, { recursive: true });

  const writtenFiles: string[] = [];
  for (const [key, fileName] of OUTPUT_FILES) {
    const targetPath = path.join(absoluteOutputDir, fileName);
    await writeFile(targetPath, `${docs[key].trimEnd()}\n`, "utf8");
    writtenFiles.push(targetPath);
  }

  return writtenFiles;
}
