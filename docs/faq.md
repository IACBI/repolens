# FAQ

[English](faq.md) | [Türkçe](faq.tr.md)

## Is RepoLens published to npm?

No. Use it from source for now.

## Does RepoLens use AI?

Not by default. The MVP includes a provider abstraction, but `ai.enabled` is false and `provider` is `none` by default.

## Does RepoLens upload my code?

No. The current implementation performs local static analysis and writes local Markdown output.

## Can RepoLens analyze private repositories?

Yes, that is one of the design goals. Review generated docs before publishing them.

## Are generated docs guaranteed to be correct?

No. RepoLens infers structure from files, names, scripts, imports, and documentation references. It uses evidence sections so readers can verify conclusions.

## Which package managers are detected?

The MVP detects npm, pnpm, yarn, pip requirements, pyproject-based Python projects, Go modules, and Cargo.
