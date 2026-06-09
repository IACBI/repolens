# Başlangıç / Getting Started

<p align="center">
  <a href="#türkçe">Türkçe</a> | <a href="#english">English</a>
</p>

---

## Türkçe

RepoLens bugün kaynaktan çalışır. Node.js 20 veya üzeri gerekir; paket yöneticisi olarak `pnpm` kullanılır.

## Kurulum

```bash
pnpm install
pnpm build
pnpm test
```

## İlk Çalıştırma

```bash
pnpm dev -- summary
pnpm dev -- init
pnpm dev -- scan
pnpm dev -- check-docs
```

Varsayılan olarak üretilen dokümantasyon `.repolens/output` dizinine yazılır.

RepoLens varsayılan olarak yerel statik analiz yapar. Veritabanı, barındırılan servis veya harici AI API gerektirmez.

---

## English

RepoLens runs from source today. It requires Node.js 20 or newer and the `pnpm` package manager.

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

## First Run

```bash
pnpm dev -- summary
pnpm dev -- init
pnpm dev -- scan
pnpm dev -- check-docs
```

By default, generated documentation is written to `.repolens/output`.

RepoLens performs local static analysis by default. It does not require a database, hosted service, or external AI API.
