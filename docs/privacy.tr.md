# Gizlilik / Privacy

<p align="center">
  <a href="#türkçe">Türkçe</a> | <a href="#english">English</a>
</p>

---

## Türkçe

RepoLens tasarım gereği local-first çalışır.

Yapılandırmadaki include/exclude kurallarıyla seçilen yerel dosyaları okur ve yaygın generated, dependency, build, coverage, vendor ve binary dosyaları atlar.

Markdown dokümantasyonu yapılandırılmış çıktı dizinine yazar. Varsayılan çıktı dizini `.repolens/output` şeklindedir.

MVP harici AI API, barındırılan servis veya veritabanı çağırmaz. Varsayılan AI provider ayarı kapalıdır:

```json
{
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

Üretilen Markdown dosyalarını yayınlamadan önce inceleyin; dosya yolları ve bağımlılık adları içerebilir.

---

## English

RepoLens is local-first by design.

It reads local files selected by the config include/exclude rules and skips common generated, dependency, build, coverage, vendor, and binary files.

It writes Markdown documentation to the configured output directory. The default output directory is `.repolens/output`.

The MVP does not call external AI APIs, hosted services, or databases. The default AI provider setting is disabled:

```json
{
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

Review generated Markdown before publishing it, because it may include file paths and dependency names from your repository.
