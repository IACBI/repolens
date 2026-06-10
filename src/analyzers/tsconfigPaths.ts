import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeRelativePath } from "../utils/path.js";

export interface TsPathAlias {
  pattern: string;
  targets: string[];
}

export async function loadTsconfigAliases(root: string): Promise<TsPathAlias[]> {
  let raw: string;
  try {
    raw = await readFile(path.join(root, "tsconfig.json"), "utf8");
  } catch {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonComments(raw));
  } catch {
    return [];
  }

  if (typeof parsed !== "object" || parsed === null) {
    return [];
  }

  const compilerOptions = (parsed as { compilerOptions?: unknown }).compilerOptions;
  if (typeof compilerOptions !== "object" || compilerOptions === null) {
    return [];
  }

  const { baseUrl, paths } = compilerOptions as { baseUrl?: unknown; paths?: unknown };
  if (typeof paths !== "object" || paths === null) {
    return [];
  }

  const base = typeof baseUrl === "string" ? baseUrl : ".";
  const aliases: TsPathAlias[] = [];
  for (const [pattern, targets] of Object.entries(paths as Record<string, unknown>)) {
    if (!Array.isArray(targets)) {
      continue;
    }

    const resolvedTargets = targets
      .filter((target): target is string => typeof target === "string")
      .map((target) => normalizeRelativePath(path.posix.normalize(path.posix.join(normalizeRelativePath(base), normalizeRelativePath(target)))));

    if (resolvedTargets.length > 0) {
      aliases.push({ pattern, targets: resolvedTargets });
    }
  }

  return aliases.sort((a, b) => b.pattern.length - a.pattern.length);
}

export function resolveAliasCandidates(specifier: string, aliases: TsPathAlias[]): string[] | undefined {
  for (const alias of aliases) {
    const starIndex = alias.pattern.indexOf("*");
    if (starIndex === -1) {
      if (specifier === alias.pattern) {
        return alias.targets;
      }
      continue;
    }

    const prefix = alias.pattern.slice(0, starIndex);
    const suffix = alias.pattern.slice(starIndex + 1);
    if (
      specifier.length >= prefix.length + suffix.length &&
      specifier.startsWith(prefix) &&
      specifier.endsWith(suffix)
    ) {
      const captured = specifier.slice(prefix.length, specifier.length - suffix.length);
      return alias.targets.map((target) => target.replace("*", captured));
    }
  }

  return undefined;
}

function stripJsonComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[\s,{[])\/\/.*$/gm, "$1")
    .replace(/,\s*([}\]])/g, "$1");
}
