import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config/defaults.js";
import { analyzeRepository, generateDocs } from "../src/index.js";

describe("markdown generation", () => {
  it("generates required markdown documents with evidence and Mermaid sections", async () => {
    const analysis = await analyzeRepository(path.join(process.cwd(), "test", "fixtures", "node-sample"), defaultConfig);
    const docs = generateDocs(analysis);

    expect(docs.architecture).toContain("# Architecture Overview");
    expect(docs.architecture).toContain("```mermaid");
    expect(docs.architecture).toContain("## Evidence");
    expect(docs.modules).toContain("# Modules");
    expect(docs.onboarding).toContain("# Onboarding Guide");
    expect(docs.dependencyMap).toContain("# Dependency Map");
    expect(docs.docsHealth).toContain("# Documentation Health");
  });

  it("generates deterministic markdown snapshots", async () => {
    const analysis = await analyzeRepository(path.join(process.cwd(), "test", "fixtures", "node-sample"), defaultConfig);
    const docs = generateDocs(analysis);

    expect(docs).toMatchSnapshot();
  });
});
