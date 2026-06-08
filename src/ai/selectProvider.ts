import type { RepoLensConfig } from "../types/index.js";
import type { LlmProvider } from "./LlmProvider.js";
import { LocalHeuristicProvider } from "./LocalHeuristicProvider.js";
import { NullProvider } from "./NullProvider.js";

export function selectLlmProvider(config: RepoLensConfig): LlmProvider {
  if (!config.ai.enabled || config.ai.provider === "none") {
    return new NullProvider();
  }

  if (config.ai.provider === "local-heuristic") {
    return new LocalHeuristicProvider();
  }

  return new NullProvider();
}
