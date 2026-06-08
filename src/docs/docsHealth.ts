import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { DocumentationFile, DocsHealthIssue, DocsHealthReport, PackageScript, RepoLensConfig } from "../types/index.js";
import { isProbablyBinary } from "../utils/file.js";
import { normalizeRelativePath } from "../utils/path.js";

const RECOMMENDED_DOCS = ["README.md", "LICENSE", "CONTRIBUTING.md"];
const PACKAGE_MANAGER_COMMANDS = new Set([
  "add",
  "audit",
  "ci",
  "create",
  "dlx",
  "exec",
  "init",
  "install",
  "link",
  "remove",
  "run",
  "uninstall",
  "why"
]);

export async function loadDocumentationFiles(root: string, config: RepoLensConfig): Promise<DocumentationFile[]> {
  const docs = await fg(config.docs, {
    cwd: root,
    onlyFiles: true,
    dot: false,
    unique: true,
    ignore: [...config.exclude, ...config.exclude.map((entry) => `${entry}/**`), ".repolens/**"]
  });

  const documentationFiles: DocumentationFile[] = [];
  for (const docPath of docs.sort()) {
    const normalized = normalizeRelativePath(docPath);
    const absolutePath = path.join(root, normalized);
    const fileStat = await stat(absolutePath);
    if (fileStat.size > config.maxFileSizeKb * 1024) {
      continue;
    }

    const buffer = await readFile(absolutePath);
    if (isProbablyBinary(buffer)) {
      continue;
    }

    documentationFiles.push({
      path: normalized,
      absolutePath,
      content: buffer.toString("utf8")
    });
  }

  return documentationFiles;
}

export async function analyzeDocsHealth(
  root: string,
  documentationFiles: DocumentationFile[],
  packageScripts: PackageScript[]
): Promise<DocsHealthReport> {
  const issues: DocsHealthIssue[] = [];
  const scriptNames = new Set(packageScripts.map((script) => script.name));

  for (const doc of documentationFiles) {
    issues.push(...(await findBrokenReferences(root, doc)));
    issues.push(...findMissingCommands(doc, scriptNames));
  }

  const missingRecommendedDocs = [];
  for (const docPath of RECOMMENDED_DOCS) {
    if (!(await exists(path.join(root, docPath)))) {
      missingRecommendedDocs.push(docPath);
      issues.push({
        type: "missing-recommended-doc",
        severity: "info",
        message: `Recommended documentation file is missing: ${docPath}`,
        evidence: [docPath]
      });
    }
  }

  if (documentationFiles.length === 0) {
    issues.push({
      type: "missing-documentation",
      severity: "warning",
      message: "No README or Markdown documentation files were found.",
      evidence: []
    });
  }

  return {
    documentationFiles: documentationFiles.map((doc) => doc.path),
    issues: dedupeIssues(issues),
    missingRecommendedDocs
  };
}

async function findBrokenReferences(root: string, doc: DocumentationFile): Promise<DocsHealthIssue[]> {
  const references = new Set<string>();
  for (const match of doc.content.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const reference = cleanReference(match[1]);
    if (shouldCheckReference(reference)) {
      references.add(reference);
    }
  }

  for (const match of doc.content.matchAll(/`([^`\n]+)`/g)) {
    const reference = cleanReference(match[1]);
    if (looksLikePathReference(reference) && shouldCheckReference(reference)) {
      references.add(reference);
    }
  }

  const issues: DocsHealthIssue[] = [];
  for (const reference of references) {
    if (!(await referenceExists(root, doc, reference))) {
      issues.push({
        type: "broken-reference",
        severity: "warning",
        message: `${doc.path} references missing path: ${reference}`,
        evidence: [doc.path]
      });
    }
  }

  return issues;
}

function findMissingCommands(doc: DocumentationFile, scriptNames: Set<string>): DocsHealthIssue[] {
  const issues: DocsHealthIssue[] = [];
  const commands = new Set<string>();
  const patterns = [
    /\b(?:npm|pnpm|yarn|bun)\s+run\s+([A-Za-z0-9:_-]+)/g,
    /\b(?:pnpm|yarn|bun)\s+(?!-)([A-Za-z0-9:_-]+)/g,
    /\bnpm\s+(test|start|build|dev)\b/g
  ];

  for (const pattern of patterns) {
    for (const match of doc.content.matchAll(pattern)) {
      const scriptName = match[1];
      if (scriptName && !PACKAGE_MANAGER_COMMANDS.has(scriptName)) {
        commands.add(scriptName);
      }
    }
  }

  for (const command of commands) {
    if (!scriptNames.has(command)) {
      issues.push({
        type: "missing-command",
        severity: "warning",
        message: `${doc.path} mentions package script "${command}", but package.json does not define it.`,
        evidence: [doc.path]
      });
    }
  }

  return issues;
}

function cleanReference(reference: string): string {
  return reference
    .trim()
    .replace(/^<|>$/g, "")
    .split("#")[0]
    .split("?")[0]
    .replace(/(?<!:)[:#]\d+(?::\d+)?$/, "")
    .replace(/[),.;]+$/g, "");
}

function shouldCheckReference(reference: string): boolean {
  if (!reference || reference.startsWith("#")) {
    return false;
  }

  if (/^[a-z]+:/i.test(reference)) {
    return false;
  }

  if (reference.includes("*") || reference.startsWith(".repolens/")) {
    return false;
  }

  return !reference.includes(" ");
}

function looksLikePathReference(reference: string): boolean {
  return (
    reference.startsWith("./") ||
    reference.startsWith("../") ||
    reference.includes("/") ||
    reference.includes("\\") ||
    reference.startsWith(".")
  );
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function dedupeIssues(issues: DocsHealthIssue[]): DocsHealthIssue[] {
  const seen = new Set<string>();
  return issues
    .filter((issue) => {
      const key = `${issue.type}:${issue.message}:${issue.evidence.join(",")}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        severityRank(a.severity) - severityRank(b.severity) ||
        a.type.localeCompare(b.type) ||
        a.message.localeCompare(b.message)
    );
}

async function referenceExists(root: string, doc: DocumentationFile, reference: string): Promise<boolean> {
  const candidates = [
    path.resolve(path.dirname(doc.absolutePath), reference),
    path.resolve(root, reference)
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return true;
    }
  }

  return false;
}

function severityRank(severity: DocsHealthIssue["severity"]): number {
  return severity === "warning" ? 0 : 1;
}
