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
});
