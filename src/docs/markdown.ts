export function heading(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`;
}

export function bulletList(items: string[], emptyText = "None detected."): string {
  if (items.length === 0) {
    return `- ${emptyText}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function markdownTable(headers: string[], rows: string[][]): string {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}

export function codeBlock(language: string, content: string): string {
  return `\`\`\`${language}\n${content.trimEnd()}\n\`\`\``;
}

export function formatEvidence(evidence: string[]): string {
  return bulletList(sortedUnique(evidence), "No direct file evidence available.");
}

export function safeMermaidId(value: string): string {
  return `n_${value.replace(/[^A-Za-z0-9_]/g, "_")}`;
}

export function sortedUnique(items: string[]): string[] {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b));
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
