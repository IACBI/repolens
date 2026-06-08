import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { RepoLensConfig, ScannedFile } from "../types/index.js";
import { detectLanguage, isGeneratedPath, isProbablyBinary, looksTextLike } from "../utils/file.js";
import { normalizeRelativePath } from "../utils/path.js";

const ROOT_FILE_PATTERNS = [
  "*.js",
  "*.cjs",
  "*.mjs",
  "*.ts",
  "*.tsx",
  "*.jsx",
  "*.py",
  "*.go",
  "*.rs",
  "*.md",
  "*.json",
  "*.toml",
  "Dockerfile",
  "Makefile",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml"
];

export async function scanFiles(root: string, config: RepoLensConfig): Promise<ScannedFile[]> {
  const absoluteRoot = path.resolve(root);
  const patterns = buildScanPatterns(config);
  const ignore = buildIgnorePatterns(config.exclude);
  const maxBytes = config.maxFileSizeKb * 1024;

  const paths = await fg(patterns, {
    cwd: absoluteRoot,
    onlyFiles: true,
    unique: true,
    dot: false,
    ignore
  });

  const files: ScannedFile[] = [];
  for (const foundPath of paths.sort()) {
    const relative = normalizeRelativePath(foundPath);
    if (isGeneratedPath(relative)) {
      continue;
    }

    const absolutePath = path.join(absoluteRoot, relative);
    const fileStat = await stat(absolutePath);
    if (fileStat.size > maxBytes || (!looksTextLike(relative) && fileStat.size > 0)) {
      continue;
    }

    const buffer = await readFile(absolutePath);
    if (isProbablyBinary(buffer)) {
      continue;
    }

    files.push({
      path: relative,
      absolutePath,
      sizeKb: Number((fileStat.size / 1024).toFixed(2)),
      language: detectLanguage(relative),
      content: buffer.toString("utf8")
    });
  }

  return files;
}

function buildScanPatterns(config: RepoLensConfig): string[] {
  const includePatterns = config.include.map((entry) => `${normalizeRelativePath(entry).replace(/\/$/, "")}/**/*`);
  return [...ROOT_FILE_PATTERNS, ...config.docs, ...includePatterns];
}

function buildIgnorePatterns(exclude: string[]): string[] {
  const ignored = new Set([".repolens", ...exclude].map((entry) => normalizeRelativePath(entry).replace(/\/$/, "")));
  return [...ignored].flatMap((entry) => [entry, `${entry}/**`]);
}
