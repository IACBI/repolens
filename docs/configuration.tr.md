# Yapılandırma

[English](configuration.md) | [Türkçe](configuration.tr.md)

RepoLens geçerli çalışma dizinindeki `.repolensrc.json` dosyasını okur. Eksik alanlar varsayılanlara döner.

## Varsayılan Yapılandırma

```json
{
  "include": ["src", "apps", "packages", "services", "lib", "components", "pages", "app"],
  "exclude": ["node_modules", ".git", "dist", "build", "coverage", ".next", "vendor"],
  "outputDir": ".repolens/output",
  "maxFileSizeKb": 300,
  "docs": ["README.md", "docs/**/*.md"],
  "ai": {
    "enabled": false,
    "provider": "none"
  }
}
```

## Alanlar

- `include`: RepoLens'in kaynak dosyalar için taradığı dizinler.
- `exclude`: RepoLens'in atladığı dizinler.
- `outputDir`: üretilen Markdown dosyalarının yazıldığı yer.
- `maxFileSizeKb`: taranacak en büyük metin dosyası boyutu.
- `docs`: dokümantasyon sağlık analizinde kontrol edilen Markdown dosyaları.
- `ai.enabled`: gelecekteki provider kullanımını kontrol eder. Varsayılan `false`.
- `ai.provider`: provider adı. Varsayılan `none`.

## AI Provider Ayarı

MVP harici AI API çağırmaz. Varsayılan olarak `NullProvider` seçilir. `LocalHeuristicProvider`, gelecek genişletmeler ve testler için deterministik yerel provider olarak vardır.
