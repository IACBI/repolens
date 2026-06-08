# CLI Referansı

[English](cli.md) | [Türkçe](cli.tr.md)

RepoLens dört komut sağlar.

## `init`

Geçerli çalışma dizininde yoksa `.repolensrc.json` oluşturur.

```bash
pnpm dev -- init
```

## `summary`

Geçerli depoyu tarar ve kısa bir terminal özeti yazdırır:

- taranan dosya sayısı
- algılanan diller
- algılanan paket yöneticileri
- giriş noktaları
- üst seviye modüller
- dokümantasyon sağlık sorunu sayısı

```bash
pnpm dev -- summary
```

## `scan`

Geçerli depoyu tarar ve Markdown dokümantasyon yazar.

```bash
pnpm dev -- scan
```

Özel çıktı dizini kullanın:

```bash
pnpm dev -- scan --out docs/repolens
```

## `check-docs`

Mevcut Markdown dokümantasyonunda eski referansları ve dokümante edildiği halde mevcut olmayan package scriptlerini kontrol eder.

```bash
pnpm dev -- check-docs
```

## Derlenmiş Binary

`pnpm build` sonrasında derlenmiş CLI giriş noktası `dist/cli.js` dosyasıdır. Paket bin alanı `repolens` olarak yapılandırılmıştır.
