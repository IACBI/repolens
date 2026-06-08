# RepoLens'e Katkı

[English](CONTRIBUTING.md) | [Türkçe](CONTRIBUTING.tr.md)

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

## Katkı Kuralları

- MVP'yi local-first tutun ve varsayılan olarak harici servislerden kaçının.
- Varsayılan davranışta `ai.enabled` false ve `provider: "none"` kalmalıdır.
- Provider entegrasyonları açık opt-in olmalı ve provider-selection testleriyle kapsanmalıdır.
- Üretilen Markdown ve snapshot testleri stabil kalsın diye deterministik çıktı tercih edin.
- Scanner, analyzer, docs-health, CLI, provider veya Markdown davranışı değişirse test ekleyin veya güncelleyin.
- Üretilen dokümantasyonda temkinli dil kullanın; iş niyetini tahmin etmek yerine kanıtları gösterin.
- Özellik veya hata düzeltmelerinde alakasız refactorlardan kaçının.

## Pull Requestler

Pull request açmadan önce çalıştırın:

```bash
pnpm typecheck
pnpm build
pnpm test
```

Üretilen Markdown davranışını değiştirdiyseniz RepoLens'i bu depo üzerinde çalıştırın ve çıktıyı inceleyin.

## Kapsam

Ayrı bir tasarım tartışması olmadan panel, cloud sync, authentication, embedding, vector database veya ağ kullanan AI çağrıları eklemeyin.
