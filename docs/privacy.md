# Privacy

[English](privacy.md) | [Türkçe](privacy.tr.md)

RepoLens is local-first by design.

## What RepoLens Reads

RepoLens reads local files selected by the config include/exclude rules. It skips common generated, dependency, build, coverage, vendor, and binary files.

## What RepoLens Writes

RepoLens writes Markdown documentation to the configured output directory. The default output directory is `.repolens/output`.

## External Services

The MVP does not call external AI APIs, hosted services, or databases. The default AI provider setting is disabled:

```json
{
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

## Private Repositories

RepoLens is intended to be safe to run on private repositories because analysis happens locally by default. Review generated Markdown before publishing it, because it may include file paths and dependency names from your repository.
