import { access } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { scanFiles } from "../scanner/scanner.js";
import type {
  DependencyEdge,
  DocumentationFile,
  EntryPoint,
  ExternalDependency,
  ModuleInfo,
  PackageScript,
  ProjectType,
  RepoLensConfig,
  RepositoryAnalysis,
  ScannedFile
} from "../types/index.js";
import { analyzeDocsHealth, loadDocumentationFiles } from "../docs/docsHealth.js";
import { summarizeLanguages } from "./generic.js";
import { parseGoImports, parseGoModulePath } from "./go.js";
import { packageNameFromSpecifier, parseJavaScriptImports } from "./javascript.js";
import { parsePythonImports, pythonImportRoot } from "./python.js";
import { parseRustUses } from "./rust.js";
import { loadTsconfigAliases, resolveAliasCandidates, type TsPathAlias } from "./tsconfigPaths.js";
import { detectWorkspacePackages, type WorkspacePackage } from "./workspace.js";
import { normalizeRelativePath, pathSegments, trimExtension } from "../utils/path.js";

const MODULE_ROOTS = new Set(["src", "apps", "packages", "services", "lib", "components", "pages", "app"]);
const BOUNDARY_ROOTS = new Set(["apps", "packages", "services"]);

interface DependencyContext {
  goModulePath?: string;
  workspacePackages: WorkspacePackage[];
  tsAliases: TsPathAlias[];
}

export async function analyzeRepository(root: string, config: RepoLensConfig): Promise<RepositoryAnalysis> {
  const absoluteRoot = path.resolve(root);
  const scanConfig = excludeOutputDir(absoluteRoot, config);
  const files = await scanFiles(absoluteRoot, scanConfig);
  const documentationFiles = await loadDocumentationFiles(absoluteRoot, scanConfig);
  const packageScripts = getPackageScripts(files);
  const modules = detectModules(files);
  const [workspacePackages, tsAliases] = await Promise.all([
    detectWorkspacePackages(absoluteRoot),
    loadTsconfigAliases(absoluteRoot)
  ]);
  const { edges, externalDependencies } = analyzeDependencies(files, modules, {
    goModulePath: detectGoModulePath(files),
    workspacePackages,
    tsAliases
  });
  attachDependenciesToModules(modules, edges, externalDependencies);

  const docsHealth = await analyzeDocsHealth(absoluteRoot, documentationFiles, packageScripts);

  return {
    root: absoluteRoot,
    config,
    files,
    documentationFiles,
    projectTypes: await detectProjectTypes(absoluteRoot, files),
    languages: summarizeLanguages(files),
    packageManagers: await detectPackageManagers(absoluteRoot),
    packageScripts,
    entryPoints: await detectEntryPoints(absoluteRoot, files, packageScripts),
    modules,
    dependencyEdges: edges,
    externalDependencies,
    docsHealth
  };
}

function excludeOutputDir(root: string, config: RepoLensConfig): RepoLensConfig {
  const relativeOutputDir = path.isAbsolute(config.outputDir)
    ? path.relative(root, config.outputDir)
    : config.outputDir;
  const normalized = normalizeRelativePath(relativeOutputDir).replace(/\/$/, "");

  if (!normalized || normalized === "." || normalized.startsWith("..") || config.exclude.includes(normalized)) {
    return config;
  }

  return { ...config, exclude: [...config.exclude, normalized] };
}

function getPackageScripts(files: ScannedFile[]): PackageScript[] {
  const packageJson = files.find((file) => file.path === "package.json");
  if (!packageJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(packageJson.content) as { scripts?: Record<string, unknown> };
    return Object.entries(parsed.scripts ?? {})
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([name, command]) => ({ name, command }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

async function detectProjectTypes(root: string, files: ScannedFile[]): Promise<ProjectType[]> {
  const filePaths = new Set(files.map((file) => file.path));
  const types = new Set<ProjectType>();
  const hasManifest = async (name: string): Promise<boolean> =>
    filePaths.has(name) || (await exists(path.join(root, name)));

  if ((await hasManifest("package.json")) || files.some((file) => file.language === "typescript" || file.language === "javascript")) {
    types.add("node");
  }

  if (
    (await hasManifest("requirements.txt")) ||
    (await hasManifest("pyproject.toml")) ||
    files.some((file) => file.language === "python")
  ) {
    types.add("python");
  }

  if ((await hasManifest("go.mod")) || files.some((file) => file.language === "go")) {
    types.add("go");
  }

  if ((await hasManifest("Cargo.toml")) || files.some((file) => file.language === "rust")) {
    types.add("rust");
  }

  if (types.size === 0) {
    types.add("generic");
  }

  return [...types];
}

async function detectPackageManagers(root: string): Promise<string[]> {
  const managers: string[] = [];
  const hasPackageJson = await exists(path.join(root, "package.json"));
  const hasPnpm = await exists(path.join(root, "pnpm-lock.yaml"));
  const hasYarn = await exists(path.join(root, "yarn.lock"));
  const hasNpm = await exists(path.join(root, "package-lock.json"));

  if (hasPnpm) managers.push("pnpm");
  if (hasYarn) managers.push("yarn");
  if (hasNpm || (hasPackageJson && !hasPnpm && !hasYarn)) managers.push("npm");
  if (await exists(path.join(root, "requirements.txt"))) managers.push("pip");
  if (await exists(path.join(root, "pyproject.toml"))) managers.push("poetry/pyproject.toml");
  if (await exists(path.join(root, "go.mod"))) managers.push("go modules");
  if (await exists(path.join(root, "Cargo.toml"))) managers.push("cargo");

  return managers;
}

async function detectEntryPoints(root: string, files: ScannedFile[], packageScripts: PackageScript[]): Promise<EntryPoint[]> {
  const entries: EntryPoint[] = packageScripts.map((script) => ({
    path: "package.json",
    kind: "script",
    label: `package script: ${script.name}`,
    detail: script.command
  }));

  const knownFiles = [
    "src/index.ts",
    "src/main.ts",
    "src/index.js",
    "src/main.js",
    "index.ts",
    "index.js",
    "main.go",
    "main.py",
    "app.py",
    "src/main.rs"
  ];

  const filePathSet = new Set(files.map((file) => file.path));
  for (const filePath of knownFiles) {
    if (filePathSet.has(filePath)) {
      entries.push({ path: filePath, kind: "file", label: knownEntryLabel(filePath) });
    }
  }

  const goCommands = await fg("cmd/*", { cwd: root, onlyDirectories: true, dot: false });
  for (const commandPath of goCommands.sort()) {
    entries.push({ path: normalizeRelativePath(commandPath), kind: "directory", label: "Go command directory" });
  }

  return dedupeEntries(entries);
}

function detectModules(files: ScannedFile[]): ModuleInfo[] {
  const moduleFiles = new Map<string, ScannedFile[]>();

  for (const file of files) {
    const modulePath = modulePathForFile(file.path);
    if (!modulePath) {
      continue;
    }

    const existing = moduleFiles.get(modulePath) ?? [];
    existing.push(file);
    moduleFiles.set(modulePath, existing);
  }

  return [...moduleFiles.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([modulePath, filesInModule]) => {
      const importantFiles = pickImportantFiles(filesInModule);
      const confidence = confidenceForModule(modulePath, filesInModule, importantFiles);

      return {
        name: moduleNameFromPath(modulePath),
        path: modulePath,
        likelyResponsibility: inferResponsibility(modulePath, filesInModule),
        importantFiles,
        internalDependencies: [],
        externalDependencies: [],
        confidence,
        evidence: importantFiles.length > 0 ? importantFiles : filesInModule.slice(0, 3).map((file) => file.path)
      };
    });
}

function analyzeDependencies(
  files: ScannedFile[],
  modules: ModuleInfo[],
  context: DependencyContext
): { edges: DependencyEdge[]; externalDependencies: ExternalDependency[] } {
  const edgeMap = new Map<string, DependencyEdge>();
  const externalMap = new Map<string, ExternalDependency>();

  for (const file of files) {
    const fromModule = moduleForPath(file.path, modules);
    if (!fromModule) {
      continue;
    }

    const imports = importsForFile(file);
    for (const specifier of imports) {
      const internalTarget = resolveInternalTarget(file.path, specifier, modules, context);
      if (internalTarget && internalTarget.path !== fromModule.path) {
        addEdge(edgeMap, fromModule.path, internalTarget.path, "internal", file.path);
        continue;
      }

      const externalName = externalNameForSpecifier(file.language, specifier, modules, context);
      if (externalName) {
        addEdge(edgeMap, fromModule.path, externalName, "external", file.path);
        addExternalDependency(externalMap, externalName, fromModule.path, file.path);
      }
    }
  }

  return {
    edges: [...edgeMap.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    externalDependencies: [...externalMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  };
}

function attachDependenciesToModules(
  modules: ModuleInfo[],
  edges: DependencyEdge[],
  externalDependencies: ExternalDependency[]
): void {
  for (const moduleInfo of modules) {
    moduleInfo.internalDependencies = edges
      .filter((edge) => edge.kind === "internal" && edge.from === moduleInfo.path)
      .map((edge) => edge.to)
      .sort();

    moduleInfo.externalDependencies = externalDependencies
      .filter((dependency) => dependency.usedBy.includes(moduleInfo.path))
      .map((dependency) => dependency.name)
      .sort();
  }
}

function modulePathForFile(filePath: string): string | undefined {
  const segments = pathSegments(filePath);
  const [first, second] = segments;
  if (segments.length === 1 && /\.(?:cjs|go|js|jsx|mjs|py|rs|ts|tsx)$/i.test(first ?? "")) {
    return "root";
  }

  if (!first || !MODULE_ROOTS.has(first)) {
    return undefined;
  }

  if (BOUNDARY_ROOTS.has(first) && second) {
    return `${first}/${second}`;
  }

  if (first === "src") {
    return second && segments.length > 2 ? `src/${second}` : "src";
  }

  return second && segments.length > 2 ? `${first}/${second}` : first;
}

function moduleForPath(filePath: string, modules: ModuleInfo[]): ModuleInfo | undefined {
  const normalized = normalizeRelativePath(filePath);
  const longestPrefixMatch = [...modules]
    .sort((a, b) => b.path.length - a.path.length)
    .find((moduleInfo) => normalized === moduleInfo.path || normalized.startsWith(`${moduleInfo.path}/`));
  if (longestPrefixMatch) {
    return longestPrefixMatch;
  }

  const detectedModulePath = modulePathForFile(normalized);
  return modules.find((moduleInfo) => moduleInfo.path === detectedModulePath);
}

function moduleNameFromPath(modulePath: string): string {
  const segments = pathSegments(modulePath);
  return segments.at(-1) ?? modulePath;
}

function pickImportantFiles(files: ScannedFile[]): string[] {
  return [...files]
    .sort((a, b) => importanceScore(b.path) - importanceScore(a.path) || a.path.localeCompare(b.path))
    .slice(0, 5)
    .map((file) => file.path);
}

function importanceScore(filePath: string): number {
  const baseName = path.posix.basename(filePath).toLowerCase();
  if (["package.json", "readme.md"].includes(baseName)) return 8;
  if (baseName.startsWith("index.")) return 7;
  if (baseName.startsWith("main.")) return 7;
  if (baseName.startsWith("app.")) return 6;
  if (baseName.endsWith(".test.ts") || baseName.endsWith(".spec.ts")) return 2;
  return 4;
}

function confidenceForModule(modulePath: string, files: ScannedFile[], importantFiles: string[]): "high" | "medium" | "low" {
  let score = 0;
  const moduleName = moduleNameFromPath(modulePath).toLowerCase();

  if (importantFiles.some((filePath) => /(^|\/)(index|main|app|README)\./i.test(filePath))) {
    score += 3;
  }

  if (hasConventionalResponsibilityName(moduleName)) {
    score += 2;
  }

  if (files.length >= 3) {
    score += 1;
  }

  if (files.length >= 6) {
    score += 1;
  }

  if (files.some((file) => /\.(test|spec)\.[tj]sx?$/i.test(file.path))) {
    score += 1;
  }

  if (modulePath === "root" && importantFiles.some((filePath) => /\.(config|rc)\.[cm]?[tj]s$/i.test(filePath))) {
    score += 1;
  }

  if (score >= 4) {
    return "high";
  }

  if (score >= 2) {
    return "medium";
  }

  return "low";
}

function hasConventionalResponsibilityName(name: string): boolean {
  return [
    "analyzers",
    "analysis",
    "api",
    "cli",
    "components",
    "config",
    "docs",
    "graph",
    "pages",
    "scanner",
    "services",
    "types",
    "utils"
  ].includes(name);
}

function inferResponsibility(modulePath: string, files: ScannedFile[]): string {
  const name = moduleNameFromPath(modulePath).toLowerCase();
  const languages = [...new Set(files.map((file) => file.language))].filter((language) => language !== "other");

  if (modulePath === "root") return "Likely project-level configuration, root entry files, or repository metadata.";
  if (name.includes("cli")) return "Likely command-line interface and command wiring.";
  if (name.includes("config")) return "Likely configuration loading and defaults.";
  if (name.includes("scanner")) return "Likely repository file discovery and filtering.";
  if (name.includes("analyzer") || name.includes("analysis")) return "Likely repository analysis logic.";
  if (name.includes("doc")) return "Likely documentation generation or documentation health checks.";
  if (name.includes("graph")) return "Likely dependency graph construction or rendering.";
  if (name.includes("component")) return "Likely reusable UI or presentation components.";
  if (name.includes("page")) return "Likely route or page-level code.";
  if (languages.length > 0) return `Likely ${languages.join(", ")} code grouped under ${modulePath}.`;
  return `Likely code or assets grouped under ${modulePath}.`;
}

function importsForFile(file: ScannedFile): string[] {
  if (file.language === "typescript" || file.language === "javascript") {
    return parseJavaScriptImports(file.content);
  }

  if (file.language === "python") {
    return parsePythonImports(file.content);
  }

  if (file.language === "go") {
    return parseGoImports(file.content);
  }

  if (file.language === "rust") {
    return parseRustUses(file.content);
  }

  return [];
}

function resolveInternalTarget(
  filePath: string,
  specifier: string,
  modules: ModuleInfo[],
  context: DependencyContext
): ModuleInfo | undefined {
  if (specifier.startsWith(".")) {
    const resolved = normalizeRelativePath(path.posix.normalize(`${path.posix.dirname(filePath)}/${specifier}`));
    return moduleForPath(resolved, modules) ?? moduleForPath(trimExtension(resolved), modules);
  }

  const aliasCandidates = resolveAliasCandidates(specifier, context.tsAliases);
  if (aliasCandidates) {
    for (const candidate of aliasCandidates) {
      const target = moduleForPath(candidate, modules) ?? moduleForPath(trimExtension(candidate), modules);
      if (target) {
        return target;
      }
    }
    return undefined;
  }

  if (specifier.startsWith("@/")) {
    return moduleForPath(`src/${specifier.slice(2)}`, modules);
  }

  if (specifier.startsWith("src/")) {
    return moduleForPath(specifier, modules);
  }

  if (specifier.startsWith("crate::")) {
    const targetName = specifier.slice("crate::".length).split("::")[0];
    return modules.find((moduleInfo) => moduleInfo.name === targetName) ?? moduleForPath(filePath, modules);
  }

  if (specifier.startsWith("self::") || specifier.startsWith("super::")) {
    return moduleForPath(filePath, modules);
  }

  const workspaceTarget = workspacePackageForSpecifier(specifier, context.workspacePackages);
  if (workspaceTarget) {
    return moduleForPath(workspaceTarget.dir, modules);
  }

  if (context.goModulePath && isGoModuleInternal(specifier, context.goModulePath)) {
    const internalPath = specifier.slice(context.goModulePath.length).replace(/^\//, "");
    return internalPath ? moduleForPath(internalPath, modules) : undefined;
  }

  const importRoot = specifier.split(/[./:]/)[0];
  return modules.find((moduleInfo) => moduleInfo.name === importRoot);
}

function externalNameForSpecifier(
  language: ScannedFile["language"],
  specifier: string,
  modules: ModuleInfo[],
  context: DependencyContext
): string | undefined {
  if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("src/")) {
    return undefined;
  }

  if (resolveAliasCandidates(specifier, context.tsAliases)) {
    return undefined;
  }

  if (language === "typescript" || language === "javascript") {
    if (workspacePackageForSpecifier(specifier, context.workspacePackages)) {
      return undefined;
    }

    return packageNameFromSpecifier(specifier);
  }

  if (language === "python") {
    const root = pythonImportRoot(specifier);
    return modules.some((moduleInfo) => moduleInfo.name === root) ? undefined : root;
  }

  if (language === "go") {
    if (context.goModulePath && isGoModuleInternal(specifier, context.goModulePath)) {
      return undefined;
    }

    return specifier.includes(".") ? specifier : undefined;
  }

  if (language === "rust") {
    if (specifier.startsWith("crate::") || specifier.startsWith("self::") || specifier.startsWith("super::")) {
      return undefined;
    }

    return specifier.split("::")[0];
  }

  return undefined;
}

function detectGoModulePath(files: ScannedFile[]): string | undefined {
  const goMod = files.find((file) => file.path === "go.mod");
  return goMod ? parseGoModulePath(goMod.content) : undefined;
}

function isGoModuleInternal(specifier: string, goModulePath: string): boolean {
  return specifier === goModulePath || specifier.startsWith(`${goModulePath}/`);
}

function workspacePackageForSpecifier(
  specifier: string,
  workspacePackages: WorkspacePackage[]
): WorkspacePackage | undefined {
  if (workspacePackages.length === 0) {
    return undefined;
  }

  const packageName = packageNameFromSpecifier(specifier);
  return workspacePackages.find((workspacePackage) => workspacePackage.name === packageName);
}

function addEdge(
  edges: Map<string, DependencyEdge>,
  from: string,
  to: string,
  kind: DependencyEdge["kind"],
  evidence: string
): void {
  const key = `${kind}:${from}->${to}`;
  const existing = edges.get(key);
  if (existing) {
    if (!existing.evidence.includes(evidence)) {
      existing.evidence.push(evidence);
    }
    return;
  }

  edges.set(key, { from, to, kind, evidence: [evidence] });
}

function addExternalDependency(
  dependencies: Map<string, ExternalDependency>,
  name: string,
  usedBy: string,
  evidence: string
): void {
  const existing = dependencies.get(name);
  if (existing) {
    if (!existing.usedBy.includes(usedBy)) existing.usedBy.push(usedBy);
    if (!existing.evidence.includes(evidence)) existing.evidence.push(evidence);
    return;
  }

  dependencies.set(name, { name, usedBy: [usedBy], evidence: [evidence] });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function knownEntryLabel(filePath: string): string {
  if (filePath.endsWith(".py")) return "Python application entry point";
  if (filePath.endsWith(".rs")) return "Rust application entry point";
  if (filePath.endsWith(".go")) return "Go application entry point";
  if (filePath.includes("index")) return "Node/JavaScript index entry point";
  if (filePath.includes("main")) return "Node/JavaScript main entry point";
  return "Application entry point";
}

function dedupeEntries(entries: EntryPoint[]): EntryPoint[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.kind}:${entry.label}:${entry.path}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
