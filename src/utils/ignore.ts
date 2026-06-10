import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeRelativePath } from "./path.js";

export function parseGitignore(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("!"));
}

export async function loadGitignoreEntries(root: string): Promise<string[]> {
  try {
    const content = await readFile(path.join(root, ".gitignore"), "utf8");
    return parseGitignore(content);
  } catch {
    return [];
  }
}

export function ignoreEntryToGlobs(entry: string): string[] {
  const normalized = normalizeRelativePath(entry.trim()).replace(/\/$/, "");
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("/")) {
    const anchored = normalized.slice(1);
    return [anchored, `${anchored}/**`];
  }

  if (normalized.includes("/")) {
    return [normalized, `${normalized}/**`];
  }

  return [`**/${normalized}`, `**/${normalized}/**`];
}

export function buildIgnoreGlobs(entries: string[]): string[] {
  const globs = new Set<string>();
  for (const entry of entries) {
    for (const glob of ignoreEntryToGlobs(entry)) {
      globs.add(glob);
    }
  }
  return [...globs];
}
