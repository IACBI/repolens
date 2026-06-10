import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { normalizeRelativePath } from "../utils/path.js";

export interface WorkspacePackage {
  name: string;
  dir: string;
}

export async function detectWorkspacePackages(root: string): Promise<WorkspacePackage[]> {
  const globs = [...(await packageJsonWorkspaceGlobs(root)), ...(await pnpmWorkspaceGlobs(root))];
  const normalizedGlobs = [
    ...new Set(
      globs
        .map((glob) => normalizeRelativePath(glob).replace(/\/$/, ""))
        .filter((glob) => glob.length > 0 && !glob.startsWith("!"))
    )
  ];

  if (normalizedGlobs.length === 0) {
    return [];
  }

  const manifestPaths = await fg(
    normalizedGlobs.map((glob) => `${glob}/package.json`),
    { cwd: root, onlyFiles: true, dot: false, unique: true, ignore: ["**/node_modules/**"] }
  );

  const packages: WorkspacePackage[] = [];
  for (const manifestPath of manifestPaths.sort()) {
    const normalized = normalizeRelativePath(manifestPath);
    try {
      const parsed = JSON.parse(await readFile(path.join(root, normalized), "utf8")) as { name?: unknown };
      if (typeof parsed.name === "string" && parsed.name.length > 0) {
        packages.push({ name: parsed.name, dir: path.posix.dirname(normalized) });
      }
    } catch {
      continue;
    }
  }

  return packages;
}

async function packageJsonWorkspaceGlobs(root: string): Promise<string[]> {
  try {
    const parsed = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as {
      workspaces?: unknown;
    };

    if (Array.isArray(parsed.workspaces)) {
      return parsed.workspaces.filter((entry): entry is string => typeof entry === "string");
    }

    if (
      typeof parsed.workspaces === "object" &&
      parsed.workspaces !== null &&
      Array.isArray((parsed.workspaces as { packages?: unknown }).packages)
    ) {
      return ((parsed.workspaces as { packages: unknown[] }).packages).filter(
        (entry): entry is string => typeof entry === "string"
      );
    }

    return [];
  } catch {
    return [];
  }
}

async function pnpmWorkspaceGlobs(root: string): Promise<string[]> {
  let content: string;
  try {
    content = await readFile(path.join(root, "pnpm-workspace.yaml"), "utf8");
  } catch {
    return [];
  }

  const globs: string[] = [];
  let inPackagesBlock = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^packages:\s*$/.test(line)) {
      inPackagesBlock = true;
      continue;
    }

    if (inPackagesBlock) {
      const item = line.match(/^\s+-\s+["']?([^"'#\r\n]+?)["']?\s*$/);
      if (item) {
        globs.push(item[1]);
        continue;
      }

      if (line.trim().length > 0 && !/^\s/.test(line)) {
        inPackagesBlock = false;
      }
    }
  }

  return globs;
}
