import type { RepositoryAnalysis } from "../../types/index.js";
import { bulletList, formatEvidence, heading, markdownTable } from "../markdown.js";

export function generateModulesDoc(analysis: RepositoryAnalysis): string {
  const rows = analysis.modules.map((moduleInfo) => [
    moduleInfo.name,
    moduleInfo.path,
    moduleInfo.likelyResponsibility,
    moduleInfo.importantFiles.join("<br>") || "None detected",
    moduleInfo.internalDependencies.join(", ") || "None detected",
    moduleInfo.externalDependencies.join(", ") || "None detected",
    moduleInfo.confidence
  ]);

  return [
    heading(1, "Modules"),
    "",
    "This document summarizes top-level modules inferred from repository layout and static imports.",
    "",
    rows.length > 0
      ? markdownTable(
          [
            "Module",
            "Path",
            "Likely Responsibility",
            "Important Files",
            "Internal Dependencies",
            "External Dependencies",
            "Confidence"
          ],
          rows
        )
      : bulletList([], "No top-level modules were detected."),
    "",
    heading(2, "Evidence"),
    "",
    formatEvidence([...new Set(analysis.modules.flatMap((moduleInfo) => moduleInfo.evidence))])
  ].join("\n");
}
