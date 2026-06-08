import type { LlmProvider, LlmProviderInput, LlmProviderResult } from "./LlmProvider.js";

export class LocalHeuristicProvider implements LlmProvider {
  readonly name = "local-heuristic";
  readonly usesExternalApi = false;

  async complete(input: LlmProviderInput): Promise<LlmProviderResult> {
    const evidence = input.evidence.slice().sort((a, b) => a.localeCompare(b));
    const evidenceSummary = evidence.length > 0 ? ` Evidence: ${evidence.slice(0, 5).join(", ")}.` : "";

    return {
      text: `${input.prompt.trim()}${evidenceSummary}`.trim(),
      confidence: evidence.length > 0 ? "medium" : "low",
      provider: this.name
    };
  }
}
