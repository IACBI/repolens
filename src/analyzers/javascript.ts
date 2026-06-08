const JS_IMPORT_PATTERNS = [
  /\bimport\s+(?:type\s+)?(?:[^"'()]+?\s+from\s*)?["']([^"']+)["']/g,
  /\bexport\s+(?:type\s+)?[^"']*?\s+from\s+["']([^"']+)["']/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
];

export function parseJavaScriptImports(content: string): string[] {
  const imports = new Set<string>();

  for (const pattern of JS_IMPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]) {
        imports.add(match[1]);
      }
    }
  }

  return [...imports].sort();
}

export function packageNameFromSpecifier(specifier: string): string {
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return name ? `${scope}/${name}` : specifier;
  }

  return specifier.split("/")[0] ?? specifier;
}
