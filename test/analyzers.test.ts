import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config/defaults.js";
import { analyzeRepository, parseJavaScriptImports, parsePythonImports } from "../src/index.js";

const fixtures = path.join(process.cwd(), "test", "fixtures");

async function makeTempRepo(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "repolens-analyzers-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf8");
  }
  return root;
}

describe("analyzers", () => {
  it("detects JavaScript and TypeScript imports", () => {
    expect(
      parseJavaScriptImports(`
        import fs from "node:fs";
        import { add } from "./math";
        export { value } from "@scope/pkg/value";
        const mod = require("left-pad");
        await import("./dynamic");
      `)
    ).toEqual(["./dynamic", "./math", "@scope/pkg/value", "left-pad", "node:fs"]);
  });

  it("detects Python imports", () => {
    expect(
      parsePythonImports(`
        import os, requests as http
        from app.helpers import greet
        from .local import thing
      `)
    ).toEqual([".local", "app.helpers", "os", "requests"]);
  });

  it("detects package managers, package scripts, entry points, and modules", async () => {
    const analysis = await analyzeRepository(path.join(fixtures, "node-sample"), defaultConfig);

    expect(analysis.packageManagers).toContain("pnpm");
    expect(analysis.packageScripts.map((script) => script.name)).toEqual(["build", "dev", "test"]);
    expect(analysis.entryPoints.some((entry) => entry.path === "src/index.ts")).toBe(true);
    expect(analysis.modules.map((moduleInfo) => moduleInfo.path)).toContain("src/lib");
    expect(analysis.externalDependencies.map((dependency) => dependency.name)).toContain("fast-glob");
  });

  it("raises confidence for conventional module names even when they are small", async () => {
    const analysis = await analyzeRepository(path.join(fixtures, "node-sample"), defaultConfig);
    const configModule = analysis.modules.find((moduleInfo) => moduleInfo.path === "src/config");

    expect(configModule).toMatchObject({ confidence: "medium" });
  });

  it("detects Python repositories and imports", async () => {
    const analysis = await analyzeRepository(path.join(fixtures, "python-sample"), defaultConfig);

    expect(analysis.projectTypes).toContain("python");
    expect(analysis.packageManagers).toContain("pip");
    expect(analysis.externalDependencies.map((dependency) => dependency.name)).toEqual(
      expect.arrayContaining(["os", "requests"])
    );
  });

  it("resolves directory (index) imports to the imported module, not the parent", async () => {
    const root = await makeTempRepo({
      "src/index.ts": 'import { run } from "./ai";\nrun();\n',
      "src/ai/index.ts": "export function run(): void {}\n",
      "src/ai/provider.ts": "export const provider = true;\n"
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "src", to: "src/ai" })
    );
  });

  it("resolves Rust crate:: imports to internal modules", async () => {
    const root = await makeTempRepo({
      "Cargo.toml": '[package]\nname = "demo"\nversion = "0.1.0"\n',
      "src/main.rs": "use crate::scanner::scan_files;\n\nfn main() { scan_files(); }\n",
      "src/scanner/mod.rs": "pub fn scan_files() {}\n",
      "src/scanner/walk.rs": "pub fn walk() {}\n"
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "src", to: "src/scanner" })
    );
    expect(analysis.externalDependencies.map((dependency) => dependency.name)).not.toContain("crate");
  });

  it("treats Go imports under the go.mod module path as internal", async () => {
    const root = await makeTempRepo({
      "go.mod": "module example.com/demo\n\ngo 1.22\n",
      "main.go": [
        "package main",
        "",
        "import (",
        '\t"fmt"',
        '\t"example.com/demo/services/store"',
        '\t"github.com/pkg/errors"',
        ")",
        "",
        "func main() { fmt.Println(store.Name, errors.New(\"x\")) }",
        ""
      ].join("\n"),
      "services/store/store.go": 'package store\n\nconst Name = "store"\n'
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");
    const externalNames = analysis.externalDependencies.map((dependency) => dependency.name);

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "root", to: "services/store" })
    );
    expect(externalNames).toContain("github.com/pkg/errors");
    expect(externalNames.some((name) => name.startsWith("example.com/demo"))).toBe(false);
  });

  it("excludes the configured output directory from scanning and docs health", async () => {
    const root = await makeTempRepo({
      "README.md": "# Demo\n",
      "src/index.ts": "export const ok = true;\n",
      "docs/repolens/ARCHITECTURE.md": "# Architecture\n\nSee [missing](does/not/exist.ts).\n"
    });

    const analysis = await analyzeRepository(root, { ...defaultConfig, outputDir: "docs/repolens" });

    expect(analysis.documentationFiles.map((doc) => doc.path)).not.toContain("docs/repolens/ARCHITECTURE.md");
    expect(analysis.files.map((file) => file.path)).not.toContain("docs/repolens/ARCHITECTURE.md");
    expect(
      analysis.docsHealth.issues.some((issue) => issue.message.includes("docs/repolens/ARCHITECTURE.md"))
    ).toBe(false);
  });

  it("falls back to the generic project type when nothing else matches", async () => {
    const root = await makeTempRepo({ "notes.md": "# Notes\n" });

    const analysis = await analyzeRepository(root, defaultConfig);

    expect(analysis.projectTypes).toEqual(["generic"]);
  });

  it("treats pnpm workspace packages as internal dependencies", async () => {
    const root = await makeTempRepo({
      "pnpm-workspace.yaml": 'packages:\n  - "packages/*"\n',
      "package.json": '{ "name": "demo-monorepo", "private": true }\n',
      "packages/utils/package.json": '{ "name": "@demo/utils", "version": "1.0.0" }\n',
      "packages/utils/src/index.ts": "export const util = true;\n",
      "packages/app/package.json": '{ "name": "@demo/app", "version": "1.0.0" }\n',
      "packages/app/src/index.ts": 'import { util } from "@demo/utils";\nimport fg from "fast-glob";\nconsole.log(util, fg);\n'
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");
    const externalNames = analysis.externalDependencies.map((dependency) => dependency.name);

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "packages/app", to: "packages/utils" })
    );
    expect(externalNames).toContain("fast-glob");
    expect(externalNames).not.toContain("@demo/utils");
  });

  it("treats npm/yarn workspaces declared in package.json as internal dependencies", async () => {
    const root = await makeTempRepo({
      "package.json": '{ "name": "demo-monorepo", "private": true, "workspaces": ["apps/*"] }\n',
      "apps/web/package.json": '{ "name": "@acme/web" }\n',
      "apps/web/index.ts": 'import { api } from "@acme/api";\nconsole.log(api);\n',
      "apps/api/package.json": '{ "name": "@acme/api" }\n',
      "apps/api/index.ts": "export const api = true;\n"
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "apps/web", to: "apps/api" })
    );
    expect(analysis.externalDependencies.map((dependency) => dependency.name)).not.toContain("@acme/api");
  });

  it("resolves tsconfig path aliases to internal modules", async () => {
    const root = await makeTempRepo({
      "tsconfig.json": [
        "{",
        "  // JSONC comments and trailing commas should not break parsing",
        '  "compilerOptions": {',
        '    "baseUrl": ".",',
        '    "paths": {',
        '      "#core/*": ["src/core/*"],',
        "    },",
        "  },",
        "}",
        ""
      ].join("\n"),
      "src/index.ts": 'import { thing } from "#core/thing";\nconsole.log(thing);\n',
      "src/core/thing.ts": "export const thing = true;\n"
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const internalEdges = analysis.dependencyEdges.filter((edge) => edge.kind === "internal");

    expect(internalEdges).toContainEqual(
      expect.objectContaining({ from: "src", to: "src/core" })
    );
    expect(analysis.externalDependencies.map((dependency) => dependency.name)).not.toContain("#core");
  });

  it("respects .gitignore entries during scanning and docs health", async () => {
    const root = await makeTempRepo({
      ".gitignore": "secret.ts\nprivate/\ndrafts\n",
      "README.md": "# Demo\n",
      "src/index.ts": "export const ok = true;\n",
      "src/secret.ts": "export const secret = true;\n",
      "src/private/hidden.ts": "export const hidden = true;\n",
      "docs/drafts/wip.md": "# WIP\n\nSee [missing](nope/missing.ts).\n"
    });

    const analysis = await analyzeRepository(root, defaultConfig);
    const filePaths = analysis.files.map((file) => file.path);

    expect(filePaths).toContain("src/index.ts");
    expect(filePaths).not.toContain("src/secret.ts");
    expect(filePaths).not.toContain("src/private/hidden.ts");
    expect(analysis.documentationFiles.map((doc) => doc.path)).not.toContain("docs/drafts/wip.md");
  });
});
