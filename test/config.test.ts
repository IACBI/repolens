import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig, loadConfig, writeDefaultConfig } from "../src/index.js";

describe("config loading", () => {
  it("returns default config when no config file exists", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-config-"));

    await expect(loadConfig(root)).resolves.toEqual(defaultConfig);
  });

  it("writes and preserves the default config", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-init-"));

    const result = await writeDefaultConfig(root);
    const raw = await readFile(result.path, "utf8");

    expect(result.created).toBe(true);
    expect(JSON.parse(raw)).toEqual(defaultConfig);
    await expect(writeDefaultConfig(root)).resolves.toMatchObject({ created: false });
  });

  it("merges user config with defaults", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-merge-"));
    await writeFile(
      path.join(root, ".repolensrc.json"),
      JSON.stringify({ outputDir: "docs/repolens", maxFileSizeKb: 100, include: ["source"] }),
      "utf8"
    );

    await expect(loadConfig(root)).resolves.toMatchObject({
      ...defaultConfig,
      include: ["source"],
      outputDir: "docs/repolens",
      maxFileSizeKb: 100,
      ai: defaultConfig.ai
    });
  });

  it("merges partial ai config with safe defaults", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "repolens-ai-config-"));
    await writeFile(path.join(root, ".repolensrc.json"), JSON.stringify({ ai: { enabled: true } }), "utf8");

    await expect(loadConfig(root)).resolves.toMatchObject({
      ...defaultConfig,
      ai: {
        enabled: true,
        provider: "none"
      }
    });
  });
});
