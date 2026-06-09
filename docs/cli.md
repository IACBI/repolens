# CLI Reference / CLI Referansı

<p align="center">
  <a href="#english">English</a> | <a href="#türkçe">Türkçe</a>
</p>

---

## English

RepoLens exposes four commands:

- `init`: creates `.repolensrc.json` if it does not exist.
- `summary`: prints scanned files, languages, package managers, entry points, modules, and docs-health count.
- `scan`: writes generated Markdown documentation.
- `check-docs`: checks existing docs for stale file references and missing package scripts.

## Usage

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

After `pnpm build`, the compiled CLI entry point is `dist/cli.js`. The package bin is configured as `repolens`.

---

## Türkçe

RepoLens dört komut sağlar:

- `init`: yoksa `.repolensrc.json` oluşturur.
- `summary`: taranan dosyaları, dilleri, paket yöneticilerini, giriş noktalarını, modülleri ve docs-health sayısını yazdırır.
- `scan`: üretilen Markdown dokümantasyonu yazar.
- `check-docs`: mevcut dokümanlarda eski dosya referanslarını ve eksik package scriptlerini kontrol eder.

## Kullanım

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

`pnpm build` sonrasında derlenmiş CLI giriş noktası `dist/cli.js` dosyasıdır. Paket bin alanı `repolens` olarak yapılandırılmıştır.
