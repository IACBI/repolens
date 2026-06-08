# Architecture

[English](architecture.md) | [Türkçe](architecture.tr.md)

RepoLens is organized around three separate concerns:

- scanning files
- analyzing repository structure and dependencies
- generating Markdown output

## Main Source Areas

- `src/cli.ts`: Commander-based CLI wiring.
- `src/config`: default config and config loading.
- `src/scanner`: file discovery and filtering.
- `src/analyzers`: language-specific parsing and repository analysis.
- `src/docs`: documentation health checks and Markdown generation.
- `src/graph`: graph utility functions.
- `src/ai`: optional provider abstraction, disabled by default.
- `src/types`: shared TypeScript types.
- `src/utils`: path and file helpers.

## Data Flow

1. The CLI loads configuration.
2. The scanner discovers eligible local text files.
3. The analyzer detects project type, scripts, entry points, modules, and dependencies.
4. Documentation health checks inspect configured Markdown files.
5. Generators write deterministic Markdown output.

## Design Constraints

- No external API calls by default.
- No database.
- No web dashboard.
- Keep scanning, analysis, and Markdown generation separate.
- Prefer deterministic output so tests and generated docs remain stable.
