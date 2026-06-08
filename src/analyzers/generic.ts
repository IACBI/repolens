import type { Language, LanguageSummary, ScannedFile } from "../types/index.js";

export function summarizeLanguages(files: ScannedFile[]): LanguageSummary[] {
  const counts = new Map<Language, number>();

  for (const file of files) {
    counts.set(file.language, (counts.get(file.language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([language, fileCount]) => ({ language, files: fileCount }))
    .sort((a, b) => b.files - a.files || a.language.localeCompare(b.language));
}
