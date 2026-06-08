import type { GeneratedDocs, RepositoryAnalysis } from "../../types/index.js";
import { generateArchitectureDoc } from "./architecture.js";
import { generateDependencyMapDoc } from "./dependencyMap.js";
import { generateDocsHealthDoc } from "./docsHealth.js";
import { generateModulesDoc } from "./modules.js";
import { generateOnboardingDoc } from "./onboarding.js";

export function generateDocs(analysis: RepositoryAnalysis): GeneratedDocs {
  return {
    architecture: generateArchitectureDoc(analysis),
    modules: generateModulesDoc(analysis),
    onboarding: generateOnboardingDoc(analysis),
    dependencyMap: generateDependencyMapDoc(analysis),
    docsHealth: generateDocsHealthDoc(analysis)
  };
}
