import type { LlmProvider, LlmProviderInput, LlmProviderResult } from "./LlmProvider.js";

export class NullProvider implements LlmProvider {
  readonly name = "none";
  readonly usesExternalApi = false;

  async complete(_input: LlmProviderInput): Promise<LlmProviderResult | undefined> {
    return undefined;
  }
}
