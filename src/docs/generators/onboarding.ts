import type { RepositoryAnalysis } from "../../types/index.js";
import { bulletList, formatEvidence, heading } from "../markdown.js";

export function generateOnboardingDoc(analysis: RepositoryAnalysis): string {
  const firstFiles = firstFilesToRead(analysis);
  const scriptCommands = analysis.packageScripts.map((script) => `${script.name}: \`${script.command}\``);

  return [
    heading(1, "Onboarding Guide"),
    "",
    "This guide is generated from detected manifests, scripts, entry points, and repository structure.",
    "",
    heading(2, "Install Dependencies"),
    "",
    bulletList(installCommands(analysis)),
    "",
    heading(2, "Run the Project"),
    "",
    bulletList(runCommands(analysis)),
    "",
    heading(2, "Run Tests"),
    "",
    bulletList(testCommands(analysis)),
    "",
    heading(2, "First 5 Files to Read"),
    "",
    bulletList(firstFiles),
    "",
    heading(2, "Suggested First Contribution Areas"),
    "",
    bulletList(firstContributionAreas(analysis)),
    "",
    heading(2, "Common Commands"),
    "",
    bulletList(scriptCommands),
    "",
    heading(2, "Evidence"),
    "",
    formatEvidence(firstFiles)
  ].join("\n");
}

function installCommands(analysis: RepositoryAnalysis): string[] {
  const managers = analysis.packageManagers;
  const commands: string[] = [];
  if (managers.includes("pnpm")) commands.push("`pnpm install`");
  else if (managers.includes("yarn")) commands.push("`yarn install`");
  else if (managers.includes("npm")) commands.push("`npm install`");
  if (managers.includes("pip")) commands.push("`pip install -r requirements.txt`");
  if (managers.includes("poetry/pyproject.toml")) commands.push("`poetry install` or the pyproject-compatible workflow used by this repository");
  if (managers.includes("go modules")) commands.push("`go mod download`");
  if (managers.includes("cargo")) commands.push("`cargo fetch`");
  return commands;
}

function runCommands(analysis: RepositoryAnalysis): string[] {
  const runLike = analysis.packageScripts.filter((script) => /^(dev|start|serve)$/i.test(script.name));
  if (runLike.length > 0) {
    return runLike.map((script) => commandForScript(analysis, script.name));
  }

  return analysis.entryPoints
    .filter((entry) => entry.kind === "file")
    .map((entry) => `Inspect or run the detected entry point if appropriate: \`${entry.path}\``);
}

function testCommands(analysis: RepositoryAnalysis): string[] {
  const commands = [];
  if (analysis.packageScripts.some((script) => script.name === "test")) commands.push(commandForScript(analysis, "test"));
  if (analysis.files.some((file) => file.path.includes("pytest") || file.path.endsWith("_test.py"))) commands.push("`pytest`");
  if (analysis.projectTypes.includes("go")) commands.push("`go test ./...`");
  if (analysis.projectTypes.includes("rust")) commands.push("`cargo test`");
  return commands;
}

function firstFilesToRead(analysis: RepositoryAnalysis): string[] {
  const candidates = [
    "README.md",
    "package.json",
    ...analysis.entryPoints.map((entry) => entry.path),
    ...analysis.modules.flatMap((moduleInfo) => moduleInfo.importantFiles)
  ];

  return [...new Set(candidates)].filter((candidate) => analysis.files.some((file) => file.path === candidate)).slice(0, 5);
}

function firstContributionAreas(analysis: RepositoryAnalysis): string[] {
  const areas = [];
  if (analysis.docsHealth.issues.length > 0) {
    areas.push("Review and fix documentation health warnings.");
  }
  const lowConfidence = analysis.modules.filter((moduleInfo) => moduleInfo.confidence === "low").slice(0, 3);
  areas.push(...lowConfidence.map((moduleInfo) => `Add or improve documentation around \`${moduleInfo.path}\`.`));
  if (areas.length === 0) {
    areas.push("Add focused tests around the most frequently changed or highest-dependency modules.");
  }
  return areas;
}

function commandForScript(analysis: RepositoryAnalysis, scriptName: string): string {
  if (analysis.packageManagers.includes("pnpm")) return `\`pnpm ${scriptName}\``;
  if (analysis.packageManagers.includes("yarn")) return `\`yarn ${scriptName}\``;
  return `\`npm run ${scriptName}\``;
}
