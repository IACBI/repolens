import type { RepositoryAnalysis } from "../../types/index.js";
import { bulletList, codeBlock, formatEvidence, heading, safeMermaidId, sortedUnique } from "../markdown.js";

export function generateArchitectureDoc(analysis: RepositoryAnalysis): string {
  const moduleDiagram = generateModuleDiagram(analysis);
  const evidence = [
    ...analysis.entryPoints.slice(0, 5).map((entry) => entry.path),
    ...analysis.modules.flatMap((moduleInfo) => moduleInfo.evidence).slice(0, 8)
  ];

  return [
    heading(1, "Architecture Overview"),
    "",
    "This document is generated from repository structure and static source-file evidence. Inferred responsibilities are intentionally cautious.",
    "",
    heading(2, "Project Type"),
    "",
    bulletList(sortedUnique(analysis.projectTypes)),
    "",
    heading(2, "Main Technologies"),
    "",
    bulletList([
      ...analysis.languages.map((item) => `${item.language}: ${item.files} file(s)`),
      ...sortedUnique(analysis.packageManagers).map((manager) => `Package manager: ${manager}`)
    ]),
    "",
    heading(2, "High-Level Folder Structure"),
    "",
    bulletList(analysis.modules.map((moduleInfo) => `${moduleInfo.path} - ${moduleInfo.likelyResponsibility}`)),
    "",
    heading(2, "Main Entry Points"),
    "",
    bulletList(
      analysis.entryPoints.map((entry) =>
        entry.detail ? `${entry.label} (${entry.path}): \`${entry.detail}\`` : `${entry.label}: ${entry.path}`
      )
    ),
    "",
    heading(2, "Runtime and Deployment Clues"),
    "",
    bulletList(runtimeClues(analysis)),
    "",
    heading(2, "Module Diagram"),
    "",
    codeBlock("mermaid", moduleDiagram),
    "",
    heading(2, "Risks or Unknowns"),
    "",
    bulletList(risksAndUnknowns(analysis)),
    "",
    heading(2, "Evidence"),
    "",
    formatEvidence(evidence)
  ].join("\n");
}

function generateModuleDiagram(analysis: RepositoryAnalysis): string {
  const modulePaths = new Set(analysis.modules.map((moduleInfo) => moduleInfo.path));
  const lines = [
    "flowchart TD",
    "  repo[\"Repository\"]",
    "  classDef high fill:#e8f5e9,stroke:#2e7d32,color:#111;",
    "  classDef medium fill:#fff8e1,stroke:#f9a825,color:#111;",
    "  classDef low fill:#ffebee,stroke:#c62828,color:#111;"
  ];

  for (const moduleInfo of analysis.modules) {
    const nodeId = moduleNodeId(moduleInfo.path);
    lines.push(`  ${nodeId}["${moduleInfo.path}<br/>${moduleInfo.confidence} confidence"]`);
    lines.push(`  repo --> ${nodeId}`);
    lines.push(`  class ${nodeId} ${moduleInfo.confidence};`);
  }

  for (const edge of analysis.dependencyEdges.filter((item) => item.kind === "internal")) {
    if (modulePaths.has(edge.from) && modulePaths.has(edge.to)) {
      lines.push(`  ${moduleNodeId(edge.from)} --> ${moduleNodeId(edge.to)}`);
    }
  }

  return lines.join("\n");
}

function moduleNodeId(modulePath: string): string {
  return safeMermaidId(`module_${modulePath}`);
}

function runtimeClues(analysis: RepositoryAnalysis): string[] {
  const clues: string[] = [];
  if (analysis.packageScripts.length > 0) {
    clues.push(...analysis.packageScripts.map((script) => `package.json script \`${script.name}\`: \`${script.command}\``));
  }
  if (analysis.files.some((file) => file.path === "Dockerfile")) {
    clues.push("Dockerfile is present.");
  }
  if (analysis.files.some((file) => file.path === "go.mod")) {
    clues.push("go.mod is present.");
  }
  if (analysis.files.some((file) => file.path === "Cargo.toml")) {
    clues.push("Cargo.toml is present.");
  }
  return clues;
}

function risksAndUnknowns(analysis: RepositoryAnalysis): string[] {
  const risks: string[] = [];
  if (analysis.modules.some((moduleInfo) => moduleInfo.confidence === "low")) {
    risks.push("Some module responsibilities are low-confidence because there are few clear entry files.");
  }
  if (analysis.docsHealth.issues.length > 0) {
    risks.push("Documentation health checks found warnings that should be reviewed.");
  }
  if (analysis.entryPoints.length === 0) {
    risks.push("No standard entry point was detected.");
  }
  return risks;
}
