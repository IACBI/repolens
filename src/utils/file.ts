import path from "node:path";
import type { Language } from "../types/index.js";
import { normalizeRelativePath } from "./path.js";

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".go",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".py",
  ".rs",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

export function detectLanguage(filePath: string): Language {
  const normalized = normalizeRelativePath(filePath);
  const extension = path.posix.extname(normalized).toLowerCase();

  if (extension === ".ts" || extension === ".tsx") return "typescript";
  if (extension === ".js" || extension === ".jsx" || extension === ".mjs" || extension === ".cjs") return "javascript";
  if (extension === ".py") return "python";
  if (extension === ".go") return "go";
  if (extension === ".rs") return "rust";
  if (extension === ".md") return "markdown";
  if (extension === ".json") return "json";
  if (extension === ".toml") return "toml";
  if (extension === ".yaml" || extension === ".yml") return "yaml";
  return "other";
}

export function looksTextLike(filePath: string): boolean {
  const extension = path.posix.extname(normalizeRelativePath(filePath)).toLowerCase();
  if (TEXT_EXTENSIONS.has(extension)) {
    return true;
  }

  const baseName = path.posix.basename(normalizeRelativePath(filePath)).toLowerCase();
  return ["dockerfile", "makefile", "license", "go.mod", "go.sum"].includes(baseName);
}

export function isProbablyBinary(buffer: Buffer): boolean {
  if (buffer.includes(0)) {
    return true;
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
  if (sample.length === 0) {
    return false;
  }

  let controlCharacters = 0;
  for (const byte of sample) {
    const isAllowedControl = byte === 9 || byte === 10 || byte === 13;
    if (byte < 32 && !isAllowedControl) {
      controlCharacters += 1;
    }
  }

  return controlCharacters / sample.length > 0.1;
}

export function isGeneratedPath(filePath: string): boolean {
  const normalized = normalizeRelativePath(filePath).toLowerCase();
  const baseName = path.posix.basename(normalized);

  return (
    normalized.includes("/__generated__/") ||
    normalized.includes("/generated/") ||
    baseName.includes(".generated.") ||
    baseName.includes(".gen.") ||
    baseName.endsWith(".pb.go") ||
    baseName.endsWith(".min.js") ||
    baseName.endsWith(".min.css")
  );
}
