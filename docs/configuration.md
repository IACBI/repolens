# Configuration

[English](configuration.md) | [Türkçe](configuration.tr.md)

RepoLens reads `.repolensrc.json` from the current working directory. Missing fields fall back to defaults.

## Default Config

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

## Fields

- `include`: directories RepoLens scans for source files.
- `exclude`: directories RepoLens skips.
- `outputDir`: where generated Markdown files are written.
- `maxFileSizeKb`: maximum text file size scanned.
- `docs`: Markdown files checked by documentation health analysis.
- `ai.enabled`: controls future provider usage. Defaults to `false`.
- `ai.provider`: provider name. The default is `none`.

## AI Provider Setting

The MVP does not call external AI APIs. `NullProvider` is selected by default. `LocalHeuristicProvider` is available as a deterministic local provider for future extension and tests.
