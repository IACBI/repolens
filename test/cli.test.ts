import { access, mkdtemp, readdir, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../src/cli.js";

describe("cli", () => {
  it("supports init, summary, check-docs, and scan", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-cli-"));
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { dev: "tsx src/index.ts", test: "vitest run" } }),
      "utf8"
    );
    await writeFile(path.join(root, "README.md"), "# CLI Fixture\n\nRun `pnpm dev`.\n", "utf8");
    await writeFile(path.join(root, "src", "index.ts"), "export const ok = true;\n", "utf8");

    const output: string[] = [];
    const io = { cwd: root, stdout: (message: string) => output.push(message) };

    await runCli(["init"], io);
    await access(path.join(root, ".repolensrc.json"));

    await runCli(["summary"], io);
    expect(output.join("\n")).toContain("Files scanned");

    await runCli(["check-docs"], io);
    expect(output.join("\n")).toContain("RepoLens Documentation Health");

    await runCli(["scan"], io);
    const generated = await readdir(path.join(root, ".repolens", "output"));
    expect(generated.sort()).toEqual([
      "ARCHITECTURE.md",
      "DEPENDENCY_MAP.md",
      "DOCS_HEALTH.md",
      "MODULES.md",
      "ONBOARDING.md"
    ]);

    await runCli(["scan", "--out", "docs/repolens"], io);
    await access(path.join(root, "docs", "repolens", "ARCHITECTURE.md"));
  });

  it("supports check-docs --strict and --json", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-cli-strict-"));
    await writeFile(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    await writeFile(path.join(root, "README.md"), "# Fixture\n\nSee [missing](does/not/exist.ts).\n", "utf8");

    const output: string[] = [];
    const io = { cwd: root, stdout: (message: string) => output.push(message) };

    await expect(runCli(["check-docs", "--strict"], io)).rejects.toThrow(/warning/);

    await runCli(["check-docs", "--json"], io);
    const report = JSON.parse(output.at(-1) ?? "{}") as { issues: Array<{ type: string }> };
    expect(report.issues.some((issue) => issue.type === "broken-reference")).toBe(true);

    const cleanRoot = await mkdtemp(path.join(os.tmpdir(), "repolens-cli-clean-"));
    await writeFile(path.join(cleanRoot, "README.md"), "# Clean fixture\n", "utf8");
    await writeFile(path.join(cleanRoot, "LICENSE"), "MIT\n", "utf8");
    await writeFile(path.join(cleanRoot, "CONTRIBUTING.md"), "# Contributing\n", "utf8");
    await expect(
      runCli(["check-docs", "--strict"], { cwd: cleanRoot, stdout: () => {} })
    ).resolves.toBeUndefined();
  });

  it("routes help output through the provided io and does not throw", async () => {
    const output: string[] = [];
    await runCli(["--help"], { stdout: (message) => output.push(message) });

    expect(output.join("\n")).toContain("Usage: repolens");
  });

  it("rejects unknown commands and reports them via io.stderr", async () => {
    const errors: string[] = [];
    await expect(
      runCli(["definitely-not-a-command"], { stderr: (message) => errors.push(message) })
    ).rejects.toThrow();

    expect(errors.join("\n")).toContain("unknown command");
  });
});
