# RepoLens

[English](README.md) | [Turkish](README.tr.md)

RepoLens is a local-first CLI that turns repositories into living documentation.

It analyzes a codebase on your machine and generates practical Markdown documentation for architecture, modules, onboarding, dependency maps, and documentation health. By default it uses deterministic local analysis and does not require external AI APIs.

## Why RepoLens Exists

Software documentation often goes stale because it is separated from the code it describes. RepoLens helps developers quickly understand an unfamiliar repository and gives maintainers a repeatable way to refresh documentation from the current source tree.

## Who It Is For

- Developers onboarding to an unfamiliar project
- Maintainers who want lightweight architecture and module docs
- Teams that need local-first tooling for private repositories
- Open-source projects that want generated docs without a hosted service

## Key Features

- Local repository scanning with configurable include/exclude rules
- Project type detection for Node/JavaScript/TypeScript, Python, Go, Rust, and generic repositories
- Package manager, entry point, module, and package script detection
- Markdown output with Mermaid diagrams
- Documentation freshness checks for stale file references and package scripts
- Optional provider abstraction for future AI integrations, disabled by default

## Quick Start From Source

RepoLens is not published to npm yet. Use it from source:

```bash
pnpm install
pnpm build
pnpm test
pnpm dev -- summary
```

Create a config file:

```bash
pnpm dev -- init
```

Generate documentation:

```bash
pnpm dev -- scan
```

## CLI Usage

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

When built, the package exposes the `repolens` binary at `./dist/cli.js`.

## Generated Documentation

`scan` writes five Markdown files:

- `ARCHITECTURE.md`
- `MODULES.md`
- `ONBOARDING.md`
- `DEPENDENCY_MAP.md`
- `DOCS_HEALTH.md`

The generated docs use cautious language, cite evidence files, and include Mermaid diagrams where useful.

## Configuration

`repolens init` creates `.repolensrc.json`:

```json
{
  "include": ["src", "apps", "packages", "services", "lib", "components", "pages", "app"],
  "exclude": ["node_modules", ".git", "dist", "build", "coverage", ".next", "vendor"],
  "outputDir": ".repolens/output",
  "maxFileSizeKb": 300,
  "docs": ["README.md", "docs/**/*.md"],
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

## Privacy and Local-First Model

RepoLens reads files from the local repository and writes Markdown output locally. The MVP does not send source code to external services and does not call AI providers by default.

The provider abstraction exists for future opt-in integrations:

- `NullProvider` is the default fallback.
- `LocalHeuristicProvider` is deterministic and local.
- Future network providers must be explicitly enabled by configuration.

## Supported Project Types

- Node.js, TypeScript, and JavaScript
- Python
- Go
- Rust
- Generic repositories

Detection is static and lightweight. It is designed to be useful, not a full compiler or language server.

## Limitations

- Import parsing is lightweight and may miss complex dynamic behavior.
- Go and Rust dependency detection is basic in the MVP.
- Generated summaries infer responsibility from file structure, names, and imports; they do not understand private business context.
- No web dashboard, cloud sync, hosted service, npm publication, or external AI integration is included.

## Documentation

- [Getting started](docs/getting-started.md)
- [CLI reference](docs/cli.md)
- [Configuration](docs/configuration.md)
- [Generated docs](docs/generated-docs.md)
- [Architecture](docs/architecture.md)
- [Privacy](docs/privacy.md)
- [Roadmap](docs/roadmap.md)
- [FAQ](docs/faq.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes local-first, deterministic, and covered by tests.

## License

MIT. See [LICENSE](LICENSE).

## Author

𝓐.𝓒.𝓑
