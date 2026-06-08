export function parseGoImports(content: string): string[] {
  const imports = new Set<string>();

  for (const block of content.matchAll(/import\s*\(([\s\S]*?)\)/g)) {
    for (const match of block[1].matchAll(/"([^"]+)"/g)) {
      imports.add(match[1]);
    }
  }

  for (const match of content.matchAll(/^\s*import\s+"([^"]+)"/gm)) {
    imports.add(match[1]);
  }

  return [...imports].sort();
}
