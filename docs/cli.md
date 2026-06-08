# CLI Reference

[English](cli.md) | [Türkçe](cli.tr.md)

RepoLens exposes four commands.

## `init`

Creates `.repolensrc.json` in the current working directory if it does not already exist.

```bash
pnpm dev -- init
```

## `summary`

Scans the current repository and prints a concise terminal summary:

- files scanned
- detected languages
- detected package managers
- entry points
- top-level modules
- documentation health issue count

```bash
pnpm dev -- summary
```

## `scan`

Scans the current repository and writes generated Markdown documentation.

```bash
pnpm dev -- scan
```

Use a custom output directory:

```bash
pnpm dev -- scan --out docs/repolens
```

## `check-docs`

Checks existing Markdown documentation for stale references and package scripts that are documented but not present.

```bash
pnpm dev -- check-docs
```

## Built Binary

After `pnpm build`, the compiled CLI entry point is `dist/cli.js`. The package bin is configured as `repolens`.
