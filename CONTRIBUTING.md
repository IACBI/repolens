# Contributing to RepoLens

[English](CONTRIBUTING.md) | [Türkçe](CONTRIBUTING.tr.md)

Thank you for considering a contribution. RepoLens is a local-first developer tool, so changes should preserve privacy, determinism, and practical usefulness.

## Development Setup

```bash
pnpm install
pnpm build
pnpm test
```

Use the development CLI while iterating:

```bash
pnpm dev -- summary
pnpm dev -- scan
pnpm dev -- check-docs
```

## Contribution Guidelines

- Keep the MVP local-first and avoid external services by default.
- Keep `ai.enabled` false and `provider: "none"` as the default behavior.
- Provider integrations must be explicit opt-in and covered by provider-selection tests.
- Prefer deterministic output so generated Markdown and snapshot tests stay stable.
- Add or update tests when changing scanner, analyzer, docs-health, CLI, provider, or Markdown behavior.
- Keep generated documentation cautious: cite evidence and mark uncertainty instead of guessing business intent.
- Avoid unrelated refactors in feature or bug-fix changes.

## Pull Requests

Before opening a pull request, run:

```bash
pnpm typecheck
pnpm build
pnpm test
```

If you change generated Markdown behavior, run RepoLens against this repository and review the generated output.

## Scope

Do not add dashboards, cloud sync, authentication, embeddings, vector databases, or network AI calls without a separate design discussion.
