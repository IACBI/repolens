export function parseRustUses(content: string): string[] {
  const imports = new Set<string>();

  for (const match of content.matchAll(/^\s*use\s+([^;]+);/gm)) {
    const value = match[1].trim();
    if (value) {
      imports.add(value);
    }
  }

  return [...imports].sort();
}
