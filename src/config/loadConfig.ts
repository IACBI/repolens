import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AiConfig, AiProviderName, RepoLensConfig } from "../types/index.js";
import { defaultConfig } from "./defaults.js";

const CONFIG_FILE_NAME = ".repolensrc.json";

type ParsedRepoLensConfig = Omit<Partial<RepoLensConfig>, "ai"> & {
  ai?: Partial<AiConfig>;
};

export async function loadConfig(root = process.cwd()): Promise<RepoLensConfig> {
  const configPath = path.join(root, CONFIG_FILE_NAME);
  if (!(await exists(configPath))) {
    return { ...defaultConfig };
  }

  const raw = await readFile(configPath, "utf8");
  const parsed = parseConfig(raw, configPath);

  return {
    ...defaultConfig,
    ...parsed,
    include: parsed.include ?? defaultConfig.include,
    exclude: parsed.exclude ?? defaultConfig.exclude,
    docs: parsed.docs ?? defaultConfig.docs,
    outputDir: parsed.outputDir ?? defaultConfig.outputDir,
    maxFileSizeKb: parsed.maxFileSizeKb ?? defaultConfig.maxFileSizeKb,
    ai: mergeAiConfig(parsed.ai)
  };
}

export async function writeDefaultConfig(root = process.cwd()): Promise<{ path: string; created: boolean }> {
  const configPath = path.join(root, CONFIG_FILE_NAME);
  if (await exists(configPath)) {
    return { path: configPath, created: false };
  }

  await writeFile(configPath, `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf8");
  return { path: configPath, created: true };
}

function parseConfig(raw: string, configPath: string): ParsedRepoLensConfig {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse ${configPath}: ${(error as Error).message}`);
  }

  if (!isRecord(value)) {
    throw new Error(`${configPath} must contain a JSON object.`);
  }

  return {
    include: readStringArray(value, "include", configPath),
    exclude: readStringArray(value, "exclude", configPath),
    docs: readStringArray(value, "docs", configPath),
    outputDir: readOptionalString(value, "outputDir", configPath),
    maxFileSizeKb: readOptionalNumber(value, "maxFileSizeKb", configPath),
    ai: readOptionalAiConfig(value, configPath)
  };
}

function readStringArray(
  value: Record<string, unknown>,
  key: keyof RepoLensConfig,
  configPath: string
): string[] | undefined {
  if (value[key] === undefined) {
    return undefined;
  }

  if (!Array.isArray(value[key]) || !value[key].every((item) => typeof item === "string")) {
    throw new Error(`${configPath}.${String(key)} must be an array of strings.`);
  }

  return value[key];
}

function readOptionalString(
  value: Record<string, unknown>,
  key: keyof RepoLensConfig,
  configPath: string
): string | undefined {
  if (value[key] === undefined) {
    return undefined;
  }

  if (typeof value[key] !== "string" || value[key].length === 0) {
    throw new Error(`${configPath}.${String(key)} must be a non-empty string.`);
  }

  return value[key];
}

function readOptionalNumber(
  value: Record<string, unknown>,
  key: keyof RepoLensConfig,
  configPath: string
): number | undefined {
  if (value[key] === undefined) {
    return undefined;
  }

  if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] <= 0) {
    throw new Error(`${configPath}.${String(key)} must be a positive number.`);
  }

  return value[key];
}

function readOptionalAiConfig(value: Record<string, unknown>, configPath: string): Partial<AiConfig> | undefined {
  if (value.ai === undefined) {
    return undefined;
  }

  if (!isRecord(value.ai)) {
    throw new Error(`${configPath}.ai must be a JSON object.`);
  }

  return {
    enabled: readOptionalBoolean(value.ai, "enabled", configPath),
    provider: readOptionalProviderName(value.ai, "provider", configPath)
  };
}

function readOptionalBoolean(value: Record<string, unknown>, key: keyof AiConfig, configPath: string): boolean | undefined {
  if (value[key] === undefined) {
    return undefined;
  }

  if (typeof value[key] !== "boolean") {
    throw new Error(`${configPath}.ai.${String(key)} must be a boolean.`);
  }

  return value[key];
}

function readOptionalProviderName(
  value: Record<string, unknown>,
  key: keyof AiConfig,
  configPath: string
): AiProviderName | undefined {
  if (value[key] === undefined) {
    return undefined;
  }

  if (value[key] !== "none" && value[key] !== "local-heuristic") {
    throw new Error(`${configPath}.ai.${String(key)} must be "none" or "local-heuristic".`);
  }

  return value[key];
}

function mergeAiConfig(aiConfig: Partial<AiConfig> | undefined): AiConfig {
  return {
    enabled: aiConfig?.enabled ?? defaultConfig.ai.enabled,
    provider: aiConfig?.provider ?? defaultConfig.ai.provider
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
