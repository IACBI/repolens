import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config/defaults.js";
import { analyzeRepository, parseJavaScriptImports, parsePythonImports } from "../src/index.js";

const fixtures = path.join(process.cwd(), "test", "fixtures");

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
});
