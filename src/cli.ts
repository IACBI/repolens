#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { analyzeRepository } from "./analyzers/repository.js";
import { loadConfig, writeDefaultConfig } from "./config/loadConfig.js";
import { generateDocs } from "./docs/generators/index.js";
import { writeGeneratedDocs } from "./docs/writeDocs.js";
import type { RepositoryAnalysis } from "./types/index.js";
import { normalizeRelativePath } from "./utils/path.js";

export interface CliIo {
  cwd?: string;
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

export function createProgram(io: CliIo = {}): Command {
  const cwd = io.cwd ?? process.cwd();
  const stdout = io.stdout ?? ((message: string) => console.log(message));
  const stderr = io.stderr ?? ((message: string) => console.error(message));

  const program = new Command();
  program
    .name("repolens")
    .description("Analyze a repository and generate living documentation.")
    .version("0.2.0")
    .exitOverride()
    .configureOutput({
      writeOut: (text) => stdout(text.replace(/\n$/, "")),
      writeErr: (text) => stderr(text.replace(/\n$/, ""))
    });

  program
    .command("init")
    .description("Create a .repolensrc.json config file.")
    .action(async () => {
      const result = await writeDefaultConfig(cwd);
      stdout(result.created ? `Created ${path.relative(cwd, result.path)}` : `${path.relative(cwd, result.path)} already exists`);
    });

  program
    .command("scan")
    .description("Analyze the current repository and write generated documentation.")
    .option("--out <dir>", "Custom output directory")
    .action(async (options: { out?: string }) => {
      const config = await loadConfig(cwd);
      const outputDir = options.out ?? config.outputDir;
      const analysis = await analyzeRepository(cwd, { ...config, outputDir });
      const docs = generateDocs(analysis);
      const writtenFiles = await writeGeneratedDocs(cwd, outputDir, docs);
      stdout(formatScanResult(analysis, outputDir, writtenFiles, cwd));
    });

  program
    .command("summary")
    .description("Print a short repository summary.")
    .action(async () => {
      const config = await loadConfig(cwd);
      const analysis = await analyzeRepository(cwd, config);
      stdout(formatSummary(analysis));
    });

  program
    .command("check-docs")
    .description("Check whether existing documentation appears stale.")
    .option("--strict", "Fail with a non-zero exit code when warnings are found (for CI)")
    .option("--json", "Print the documentation health report as JSON")
    .action(async (options: { strict?: boolean; json?: boolean }) => {
      const config = await loadConfig(cwd);
      const analysis = await analyzeRepository(cwd, config);
      stdout(options.json ? JSON.stringify(analysis.docsHealth, null, 2) : formatDocsHealthSummary(analysis));

      if (options.strict) {
        const warningCount = analysis.docsHealth.issues.filter((issue) => issue.severity === "warning").length;
        if (warningCount > 0) {
          throw new Error(`Documentation health check failed: ${warningCount} warning(s) found.`);
        }
      }
    });

  return program;
}

export async function runCli(args: string[], io: CliIo = {}): Promise<void> {
  const stderr = io.stderr ?? ((message: string) => console.error(message));
  const program = createProgram(io);
  try {
    await program.parseAsync(args, { from: "user" });
  } catch (error) {
    const commanderError = error as { code?: string; exitCode?: number };
    if (typeof commanderError.code === "string" && commanderError.code.startsWith("commander.")) {
      if (commanderError.exitCode === 0) {
        return;
      }
      throw error;
    }

    stderr((error as Error).message);
    throw error;
  }
}

function formatSummary(analysis: RepositoryAnalysis): string {
  return [
    "RepoLens Summary",
    "",
    `Files scanned: ${analysis.files.length}`,
    "",
    "Languages:",
    formatBullets(analysis.languages.map((item) => `${item.language}: ${item.files}`)),
    "",
    "Package managers:",
    formatBullets(analysis.packageManagers),
    "",
    "Entry points:",
    formatBullets(
      analysis.entryPoints.map((entry) =>
        entry.detail ? `${entry.label} (${entry.path}) - ${entry.detail}` : `${entry.label} (${entry.path})`
      )
    ),
    "",
    "Top-level modules:",
    formatBullets(analysis.modules.map((moduleInfo) => `${moduleInfo.path} (${moduleInfo.confidence})`)),
    "",
    "Docs health:",
    `- ${analysis.docsHealth.issues.length} issue(s)`
  ].join("\n");
}

function formatDocsHealthSummary(analysis: RepositoryAnalysis): string {
  const lines = [
    "RepoLens Documentation Health",
    "",
    "Documentation files:",
    formatBullets(analysis.docsHealth.documentationFiles),
    "",
    `Issues: ${analysis.docsHealth.issues.length}`
  ];

  if (analysis.docsHealth.issues.length > 0) {
    lines.push("");
    lines.push(
      ...analysis.docsHealth.issues.map((issue) => `- [${issue.severity}] ${issue.message}`)
    );
  }

  return lines.join("\n");
}

function formatScanResult(analysis: RepositoryAnalysis, outputDir: string, writtenFiles: string[], cwd: string): string {
  const relativeOutputDir = normalizeRelativePath(path.relative(cwd, path.resolve(cwd, outputDir)) || ".");
  const generatedFiles = writtenFiles.map((filePath) => normalizeRelativePath(path.relative(cwd, filePath))).sort();

  return [
    "RepoLens scan complete",
    "",
    `Files scanned: ${analysis.files.length}`,
    `Output directory: ${relativeOutputDir}`,
    "",
    "Generated files:",
    formatBullets(generatedFiles)
  ].join("\n");
}

function formatBullets(items: string[], emptyText = "none detected"): string {
  if (items.length === 0) {
    return `- ${emptyText}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  runCli(process.argv.slice(2)).catch(() => {
    process.exitCode = 1;
  });
}
