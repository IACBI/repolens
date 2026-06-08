import type { RepositoryAnalysis } from "../../types/index.js";
import { bulletList, heading, markdownTable } from "../markdown.js";

export function generateDocsHealthDoc(analysis: RepositoryAnalysis): string {
  const issueRows = analysis.docsHealth.issues.map((issue) => [
    issue.severity,
    issue.type,
    issue.message,
    issue.evidence.join("<br>") || "No direct evidence"
  ]);

  return [
    heading(1, "Documentation Health"),
    "",
    "This report checks Markdown documentation against repository files and detected package scripts.",
    "",
    heading(2, "Existing Documentation Files"),
    "",
    bulletList(analysis.docsHealth.documentationFiles),
    "",
    heading(2, "Broken File or Directory References"),
    "",
    issueRows.filter((row) => row[1] === "broken-reference").length > 0
      ? markdownTable(["Severity", "Type", "Message", "Evidence"], issueRows.filter((row) => row[1] === "broken-reference"))
      : bulletList([], "No broken file or directory references were detected."),
    "",
    heading(2, "Commands Mentioned But Not Detected"),
    "",
    issueRows.filter((row) => row[1] === "missing-command").length > 0
      ? markdownTable(["Severity", "Type", "Message", "Evidence"], issueRows.filter((row) => row[1] === "missing-command"))
      : bulletList([], "No missing package scripts were detected."),
    "",
    heading(2, "Missing Recommended Docs"),
    "",
    bulletList(analysis.docsHealth.missingRecommendedDocs),
    "",
    heading(2, "Suggested Documentation Fixes"),
    "",
    bulletList(suggestFixes(analysis))
  ].join("\n");
}

function suggestFixes(analysis: RepositoryAnalysis): string[] {
  if (analysis.docsHealth.issues.length === 0) {
    return ["Keep generated documentation refreshed after meaningful source changes."];
  }

  return analysis.docsHealth.issues.map((issue) => issue.message);
}
