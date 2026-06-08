# Getting Started

[English](getting-started.md) | [Türkçe](getting-started.tr.md)

RepoLens runs from source today. It requires Node.js 20 or newer and pnpm.

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

## First Run

Print a repository summary:

```bash
pnpm dev -- summary
```

Create a config file:

```bash
pnpm dev -- init
```

Generate Markdown documentation:

```bash
pnpm dev -- scan
```

Check documentation freshness:

```bash
pnpm dev -- check-docs
```

## Output

By default, generated documentation is written under the configured output directory. The default output directory is `.repolens/output`.

## Notes

RepoLens performs local static analysis by default. It does not require a database, hosted service, or external AI API.
