# Başlangıç

[English](getting-started.md) | [Türkçe](getting-started.tr.md)

RepoLens bugün kaynaktan çalışır. Node.js 20 veya üzeri gerekir; paket yöneticisi olarak `pnpm` kullanılır.

## Kurulum

```bash
pnpm install
pnpm build
pnpm test
```

## İlk Çalıştırma

Depo özeti yazdırın:

```bash
pnpm dev -- summary
```

Yapılandırma dosyası oluşturun:

```bash
pnpm dev -- init
```

Markdown dokümantasyon üretin:

```bash
pnpm dev -- scan
```

Dokümantasyon güncelliğini kontrol edin:

```bash
pnpm dev -- check-docs
```

## Çıktı

Varsayılan olarak üretilen dokümantasyon yapılandırılmış çıktı dizinine yazılır. Varsayılan çıktı dizini `.repolens/output` şeklindedir.

## Notlar

RepoLens varsayılan olarak yerel statik analiz yapar. Veritabanı, barındırılan servis veya harici AI API gerektirmez.
