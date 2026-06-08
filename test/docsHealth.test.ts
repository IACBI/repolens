import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config/defaults.js";
import { analyzeRepository } from "../src/index.js";

describe("docs health", () => {
  it("detects missing references and documented scripts that do not exist", async () => {
    const root = path.join(process.cwd(), "test", "fixtures", "stale-docs");
    const analysis = await analyzeRepository(root, defaultConfig);

    expect(analysis.docsHealth.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "broken-reference", message: expect.stringContaining("src/missing.ts") }),
        expect.objectContaining({ type: "broken-reference", message: expect.stringContaining("src/ghost/") }),
        expect.objectContaining({ type: "missing-command", message: expect.stringContaining("\"missing\"") })
      ])
    );
  });

  it("resolves docs links from the repository root and strips line suffixes", async () => {
    const root = path.join(process.cwd(), "test", "fixtures", "docs-edge");
    const analysis = await analyzeRepository(root, defaultConfig);
    const messages = analysis.docsHealth.issues.map((issue) => issue.message);

    expect(messages.some((message) => message.includes("docs/guide.md") && message.includes("src/index.ts"))).toBe(false);
    expect(messages.some((message) => message.includes("src/index.ts:1"))).toBe(false);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining("src/missing.ts"),
        expect.stringContaining("src/not-here.ts"),
        expect.stringContaining("\"missing\""),
        expect.stringContaining("\"start\"")
      ])
    );
    expect(messages.some((message) => message.includes("\"install\""))).toBe(false);
    expect(messages.some((message) => message.includes("\"test\""))).toBe(false);
  });
});
