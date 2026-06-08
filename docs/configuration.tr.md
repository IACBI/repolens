# Yapılandırma / Configuration

İstediğiniz bölümü açarak bu sayfadan ayrılmadan dil değiştirebilirsiniz.

<details open>
<summary><strong>Türkçe</strong></summary>

RepoLens geçerli çalışma dizinindeki `.repolensrc.json` dosyasını okur. Eksik alanlar varsayılanlara döner.

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

- `include`: kaynak dosyalar için taranan dizinler.
- `exclude`: tarama sırasında atlanan dizinler.
- `outputDir`: üretilen Markdown dosyalarının yazıldığı yer.
- `maxFileSizeKb`: taranacak en büyük metin dosyası boyutu.
- `docs`: dokümantasyon sağlık analizinde kontrol edilen Markdown dosyaları.
- `ai.enabled`: gelecekteki provider kullanımını kontrol eder. Varsayılan `false`.
- `ai.provider`: provider adı. Varsayılan `none`.

MVP harici AI API çağırmaz.

</details>

<details>
<summary><strong>English</strong></summary>

RepoLens reads `.repolensrc.json` from the current working directory. Missing fields fall back to defaults.

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

- `include`: directories scanned for source files.
- `exclude`: directories skipped during scanning.
- `outputDir`: where generated Markdown files are written.
- `maxFileSizeKb`: largest text file size scanned.
- `docs`: Markdown files checked by documentation health analysis.
- `ai.enabled`: controls future provider usage. Defaults to `false`.
- `ai.provider`: provider name. Defaults to `none`.

The MVP does not call external AI APIs.

</details>
