import type { RepositoryAnalysis } from "../../types/index.js";
import { dependencyDegree } from "../../graph/dependencyGraph.js";
import { bulletList, codeBlock, formatEvidence, heading, markdownTable, safeMermaidId, sortedUnique } from "../markdown.js";

export function generateDependencyMapDoc(analysis: RepositoryAnalysis): string {
  const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");
  const hotspots = couplingHotspots(analysis);

  return [
    heading(1, "Dependency Map"),
    "",
    "This map is based on static import/use detection. It may miss dynamic imports or framework-specific dependency wiring.",
    "",
    heading(2, "Internal Dependency Graph"),
    "",
    internalEdges.length > 0
      ? markdownTable(
          ["From", "To", "Evidence"],
          internalEdges.map((edge) => [edge.from, edge.to, sortedUnique(edge.evidence).join("<br>")])
        )
      : bulletList([], "No internal module dependencies were detected."),
    "",
    heading(2, "Mermaid Graph"),
    "",
    codeBlock("mermaid", mermaidGraph(analysis)),
    "",
    heading(2, "External Package Summary"),
    "",
    analysis.externalDependencies.length > 0
      ? markdownTable(
          ["Package", "Used By", "Evidence"],
          analysis.externalDependencies.map((dependency) => [
            dependency.name,
            sortedUnique(dependency.usedBy).join(", "),
            sortedUnique(dependency.evidence).join("<br>")
          ])
        )
      : bulletList([], "No external package imports were detected."),
    "",
    heading(2, "Possible Coupling Hotspots"),
    "",
    bulletList(hotspots),
    "",
    heading(2, "Evidence"),
    "",
    formatEvidence(analysis.dependencyEdges.flatMap((edge) => edge.evidence))
  ].join("\n");
}

function mermaidGraph(analysis: RepositoryAnalysis): string {
  const modulePaths = new Set(analysis.modules.map((moduleInfo) => moduleInfo.path));
  const externalNodes = sortedUnique(analysis.dependencyEdges.filter((edge) => edge.kind === "external").map((edge) => edge.to));
  const lines = [
    "flowchart LR",
    "  classDef module fill:#e3f2fd,stroke:#1565c0,color:#111;",
    "  classDef external fill:#f3e5f5,stroke:#6a1b9a,color:#111,stroke-dasharray: 4 3;"
  ];

  if (analysis.modules.length === 0 && analysis.dependencyEdges.length === 0) {
    lines.push("  repo[\"Repository\"]");
    return lines.join("\n");
  }

  for (const moduleInfo of analysis.modules) {
    lines.push(`  ${moduleNodeId(moduleInfo.path)}["${moduleInfo.path}"]`);
    lines.push(`  class ${moduleNodeId(moduleInfo.path)} module;`);
  }

  for (const externalNode of externalNodes) {
    lines.push(`  ${externalNodeId(externalNode)}["${externalNode}"]`);
    lines.push(`  class ${externalNodeId(externalNode)} external;`);
  }

  for (const edge of analysis.dependencyEdges) {
    if (!modulePaths.has(edge.from)) {
      continue;
    }

    const from = moduleNodeId(edge.from);
    const to = edge.kind === "internal" ? moduleNodeId(edge.to) : externalNodeId(edge.to);
    const arrow = edge.kind === "internal" ? "-->" : "-.->";
    lines.push(`  ${from} ${arrow} ${to}`);
  }

  return lines.join("\n");
}

function couplingHotspots(analysis: RepositoryAnalysis): string[] {
  const degree = dependencyDegree(analysis.dependencyEdges.filter((item) => item.kind === "internal"));

  const hotspots = [...analysis.modules]
    .map((moduleInfo) => ({
      moduleInfo,
      incoming: degree.get(moduleInfo.path)?.incoming ?? 0,
      outgoing: degree.get(moduleInfo.path)?.outgoing ?? 0
    }))
    .filter((item) => item.incoming + item.outgoing > 1)
    .sort((a, b) => b.incoming + b.outgoing - (a.incoming + a.outgoing))
    .slice(0, 5)
    .map((item) => `${item.moduleInfo.path}: ${item.incoming} incoming, ${item.outgoing} outgoing internal dependency edge(s)`);

  return hotspots;
}

function moduleNodeId(modulePath: string): string {
  return safeMermaidId(`module_${modulePath}`);
}

function externalNodeId(packageName: string): string {
  return safeMermaidId(`external_${packageName}`);
}
