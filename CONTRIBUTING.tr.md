# Katkı / Contributing

İstediğiniz bölümü açarak bu sayfadan ayrılmadan dil değiştirebilirsiniz.

<details open>
<summary><strong>Türkçe</strong></summary>

Katkı düşünceniz için teşekkürler. RepoLens local-first bir geliştirici aracıdır; değişiklikler gizliliği, determinizmi ve pratik faydayı korumalıdır.

## Geliştirme Kurulumu

```bash
pnpm install
pnpm build
pnpm test
```

Geliştirme sırasında CLI'yi şöyle kullanın:

```bash
pnpm dev -- summary
pnpm dev -- scan
pnpm dev -- check-docs
```

## Kurallar

- MVP'yi local-first tutun ve varsayılan olarak harici servislerden kaçının.
- Varsayılan davranışta `ai.enabled` false ve `provider: "none"` kalmalıdır.
- Provider entegrasyonları açık opt-in olmalı ve provider-selection testleriyle kapsanmalıdır.
- Üretilen Markdown ve snapshot testleri stabil kalsın diye deterministik çıktı tercih edin.
- Scanner, analyzer, docs-health, CLI, provider veya Markdown davranışı değişirse test ekleyin veya güncelleyin.
- Özellik veya hata düzeltmelerinde alakasız refactorlardan kaçının.

## Pull Requestler

Pull request açmadan önce çalıştırın:

```bash
pnpm typecheck
pnpm build
pnpm test
```

Üretilen Markdown davranışını değiştirdiyseniz RepoLens'i bu depo üzerinde çalıştırın ve çıktıyı inceleyin.

</details>

<details>
<summary><strong>English</strong></summary>

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

## Guidelines

- Keep the MVP local-first and avoid external services by default.
- Keep `ai.enabled` false and `provider: "none"` as the default behavior.
- Provider integrations must be explicit opt-in and covered by provider-selection tests.
- Prefer deterministic output so generated Markdown and snapshot tests stay stable.
- Add or update tests when changing scanner, analyzer, docs-health, CLI, provider, or Markdown behavior.
- Avoid unrelated refactors in feature or bug-fix changes.

## Pull Requests

Before opening a pull request, run:

```bash
pnpm typecheck
pnpm build
pnpm test
```

If you change generated Markdown behavior, run RepoLens against this repository and review the generated output.

</details>
