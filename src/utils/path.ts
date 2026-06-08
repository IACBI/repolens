import path from "node:path";

export function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}

export function normalizeRelativePath(value: string): string {
  return toPosixPath(value).replace(/^\.\//, "").replace(/\/+/g, "/");
}

export function relativePath(root: string, absolutePath: string): string {
  return normalizeRelativePath(path.relative(root, absolutePath));
}

export function trimExtension(value: string): string {
  return value.replace(/\.[^.]+$/, "");
}

export function pathSegments(value: string): string[] {
  return normalizeRelativePath(value).split("/").filter(Boolean);
}
