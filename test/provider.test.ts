import { describe, expect, it } from "vitest";
import { LocalHeuristicProvider, NullProvider, defaultConfig, selectLlmProvider } from "../src/index.js";

describe("provider selection", () => {
  it("uses NullProvider by default", async () => {
    const provider = selectLlmProvider(defaultConfig);

    expect(provider).toBeInstanceOf(NullProvider);
    expect(provider.usesExternalApi).toBe(false);
    await expect(provider.complete({ prompt: "Summarize", evidence: ["src/index.ts"] })).resolves.toBeUndefined();
  });

  it("keeps provider none as NullProvider even when ai is enabled", () => {
    const provider = selectLlmProvider({
      ...defaultConfig,
      ai: {
        enabled: true,
        provider: "none"
      }
    });

    expect(provider).toBeInstanceOf(NullProvider);
    expect(provider.usesExternalApi).toBe(false);
  });

  it("selects the local heuristic provider only when explicitly configured", async () => {
    const provider = selectLlmProvider({
      ...defaultConfig,
      ai: {
        enabled: true,
        provider: "local-heuristic"
      }
    });

    await expect(provider.complete({ prompt: "Summarize module.", evidence: ["src/config/loadConfig.ts"] })).resolves.toEqual({
      text: "Summarize module. Evidence: src/config/loadConfig.ts.",
      confidence: "medium",
      provider: "local-heuristic"
    });
    expect(provider).toBeInstanceOf(LocalHeuristicProvider);
    expect(provider.usesExternalApi).toBe(false);
  });
});
