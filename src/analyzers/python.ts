export function parsePythonImports(content: string): string[] {
  const imports = new Set<string>();

  for (const match of content.matchAll(/^\s*import\s+(.+)$/gm)) {
    const importedNames = match[1]
      .split(",")
      .map((item) => item.trim().split(/\s+as\s+/i)[0])
      .filter(Boolean);

    for (const importedName of importedNames) {
      imports.add(importedName);
    }
  }

  for (const match of content.matchAll(/^\s*from\s+([.\w]+)\s+import\s+/gm)) {
    if (match[1]) {
      imports.add(match[1]);
    }
  }

  return [...imports].sort();
}

export function pythonImportRoot(importName: string): string {
  return importName.replace(/^\.+/, "").split(".")[0] ?? importName;
}
