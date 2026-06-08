export type ProjectType = "node" | "python" | "go" | "rust" | "generic";

export type Language =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "markdown"
  | "json"
  | "toml"
  | "yaml"
  | "other";

export type Confidence = "high" | "medium" | "low";

export type AiProviderName = "none" | "local-heuristic";

export interface AiConfig {
  enabled: boolean;
  provider: AiProviderName;
}

export interface RepoLensConfig {
  include: string[];
  exclude: string[];
  outputDir: string;
  maxFileSizeKb: number;
  docs: string[];
  ai: AiConfig;
}

export interface ScannedFile {
  path: string;
  absolutePath: string;
  sizeKb: number;
  language: Language;
  content: string;
}

export interface DocumentationFile {
  path: string;
  absolutePath: string;
  content: string;
}

export interface LanguageSummary {
  language: Language;
  files: number;
}

export interface PackageScript {
  name: string;
  command: string;
}

export interface EntryPoint {
  path: string;
  kind: "script" | "file" | "directory";
  label: string;
  detail?: string;
}

export interface ModuleInfo {
  name: string;
  path: string;
  likelyResponsibility: string;
  importantFiles: string[];
  internalDependencies: string[];
  externalDependencies: string[];
  confidence: Confidence;
  evidence: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  kind: "internal" | "external";
  evidence: string[];
}

export interface ExternalDependency {
  name: string;
  usedBy: string[];
  evidence: string[];
}

export interface DocsHealthIssue {
  type:
    | "broken-reference"
    | "missing-command"
    | "missing-recommended-doc"
    | "missing-documentation";
  severity: "warning" | "info";
  message: string;
  evidence: string[];
}

export interface DocsHealthReport {
  documentationFiles: string[];
  issues: DocsHealthIssue[];
  missingRecommendedDocs: string[];
}

export interface RepositoryAnalysis {
  root: string;
  config: RepoLensConfig;
  files: ScannedFile[];
  documentationFiles: DocumentationFile[];
  projectTypes: ProjectType[];
  languages: LanguageSummary[];
  packageManagers: string[];
  packageScripts: PackageScript[];
  entryPoints: EntryPoint[];
  modules: ModuleInfo[];
  dependencyEdges: DependencyEdge[];
  externalDependencies: ExternalDependency[];
  docsHealth: DocsHealthReport;
}

export interface GeneratedDocs {
  architecture: string;
  modules: string;
  onboarding: string;
  dependencyMap: string;
  docsHealth: string;
}
