import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config/defaults.js";
import { scanFiles } from "../src/scanner/scanner.js";

describe("scanner", () => {
  it("ignores excluded directories, generated files, and oversized files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-scan-"));
    await mkdir(path.join(root, "src"), { recursive: true });
    await mkdir(path.join(root, "node_modules"), { recursive: true });
    await writeFile(path.join(root, "src", "index.ts"), "export const ok = true;\n", "utf8");
    await writeFile(path.join(root, "src", "client.generated.ts"), "export const generated = true;\n", "utf8");
    await writeFile(path.join(root, "src", "large.ts"), "x".repeat(2048), "utf8");
    await writeFile(path.join(root, "node_modules", "skip.js"), "module.exports = true;\n", "utf8");

    const files = await scanFiles(root, { ...defaultConfig, maxFileSizeKb: 1 });

    expect(files.map((file) => file.path)).toEqual(["src/index.ts"]);
  });
});
