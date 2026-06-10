# Changelog

All notable changes to RepoLens will be documented in this file.

## 0.2.0 - 2026-06-10

### Added

- Root `.gitignore` support: ignored paths are excluded from scanning and documentation health checks, with git-like any-depth matching for slash-less patterns (also applied to `exclude` config entries).
- Monorepo awareness: packages declared via `pnpm-workspace.yaml` or `package.json` `workspaces` are resolved as internal dependencies instead of external packages.
- `tsconfig.json` `compilerOptions.paths` alias resolution (JSONC-tolerant) for JavaScript/TypeScript import mapping.
- Go module path awareness: imports under the `go.mod` module path are classified as internal modules.
- `check-docs --strict` (non-zero exit on warnings, for CI) and `check-docs --json` (machine-readable report).
- Additional known entry points (`index.ts`, `src/index.js`, `src/main.js`, `main.go`) and entry labels for Go and `main.*` files.

### Fixed

- The configured output directory is now excluded from scanning and docs health, preventing generated docs from feeding back into the next analysis.
- Directory (index) imports such as `import x from "./ai"` now resolve to the imported module instead of its parent, restoring missing internal dependency edges.
- Rust `crate::` imports now resolve to the referenced internal module; `self::`/`super::` map to the importing module.
- `go.mod` and `go.sum` are now recognized as text files, so Go module detection and the "go.mod is present" architecture clue work.
- Empty binary-like files are no longer scanned (inverted size check in the scanner).
- `detectProjectTypes` can no longer return an empty list: manifests are also checked on disk and `generic` is the guaranteed fallback.
- CLI help/version output and Commander errors are routed through the injectable `io` streams; `--help` no longer terminates the process directly and unknown commands reject instead of exiting.
- Removed dead code paths (unused `dependencyDegree` is now used by the dependency map generator; dead `#` branch in docs reference cleanup removed).

## 0.1.0 - 2026-06-09

### Added

- Initial local-first CLI with `init`, `scan`, `summary`, and `check-docs`.
- Repository scanning, project type detection, package manager detection, entry point detection, module summaries, and lightweight dependency maps.
- Generated Markdown outputs for architecture, modules, onboarding, dependency maps, and documentation health.
- Documentation health checks for stale file references and missing documented package scripts.
- Optional provider abstraction with local/default-safe providers and no external API calls by default.
- Tests, GitHub Actions CI, community files, bilingual docs, and a basic example project.
