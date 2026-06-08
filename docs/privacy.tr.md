# Gizlilik

[English](privacy.md) | [Türkçe](privacy.tr.md)

RepoLens tasarım gereği local-first çalışır.

## RepoLens Ne Okur?

RepoLens, yapılandırmadaki include/exclude kurallarıyla seçilen yerel dosyaları okur. Yaygın generated, dependency, build, coverage, vendor ve binary dosyaları atlar.

## RepoLens Ne Yazar?

RepoLens Markdown dokümantasyonu yapılandırılmış çıktı dizinine yazar. Varsayılan çıktı dizini `.repolens/output` şeklindedir.

## Harici Servisler

MVP harici AI API, barındırılan servis veya veritabanı çağırmaz. Varsayılan AI provider ayarı kapalıdır:

```json
{
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

## Özel Depolar

Analiz varsayılan olarak yerelde gerçekleştiği için RepoLens özel depolarda çalıştırılmaya uygundur. Üretilen Markdown dosyalarını yayınlamadan önce inceleyin; dosya yolları ve bağımlılık adları içerebilir.
