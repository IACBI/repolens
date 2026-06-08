import type { Confidence } from "../types/index.js";

export interface LlmProviderInput {
  prompt: string;
  evidence: string[];
  context?: Record<string, string | number | boolean | string[]>;
}

export interface LlmProviderResult {
  text: string;
  confidence: Confidence;
  provider: string;
}

export interface LlmProvider {
  readonly name: string;
  readonly usesExternalApi: boolean;
  complete(input: LlmProviderInput): Promise<LlmProviderResult | undefined>;
}
