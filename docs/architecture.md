# Architecture / Mimari

Switch language on this page by opening the section you want.

<details open>
<summary><strong>English</strong></summary>

RepoLens separates scanning, analysis, and Markdown generation.

## Main Areas

- `src/cli.ts`: Commander-based CLI wiring.
- `src/config`: default config and config loading.
- `src/scanner`: file discovery and filtering.
- `src/analyzers`: language-specific parsing and repository analysis.
- `src/docs`: documentation health checks and Markdown generation.
- `src/graph`: graph utility functions.
- `src/ai`: optional provider abstraction, disabled by default.
- `src/types`: shared TypeScript types.
- `src/utils`: path and file helpers.

## Data Flow

1. The CLI loads configuration.
2. The scanner discovers eligible local text files.
3. The analyzer detects project type, scripts, entry points, modules, and dependencies.
4. Documentation health checks inspect configured Markdown files.
5. Generators write deterministic Markdown output.

</details>

<details>
<summary><strong>Türkçe</strong></summary>

RepoLens tarama, analiz ve Markdown üretimini ayrı tutar.

## Ana Alanlar

- `src/cli.ts`: Commander tabanlı CLI bağlantısı.
- `src/config`: varsayılan yapılandırma ve config yükleme.
- `src/scanner`: dosya keşfi ve filtreleme.
- `src/analyzers`: dile özel ayrıştırma ve depo analizi.
- `src/docs`: dokümantasyon sağlık kontrolleri ve Markdown üretimi.
- `src/graph`: grafik yardımcı fonksiyonları.
- `src/ai`: varsayılan olarak kapalı opsiyonel provider soyutlaması.
- `src/types`: ortak TypeScript tipleri.
- `src/utils`: path ve dosya yardımcıları.

## Veri Akışı

1. CLI yapılandırmayı yükler.
2. Scanner uygun yerel metin dosyalarını keşfeder.
3. Analyzer proje türünü, scriptleri, giriş noktalarını, modülleri ve bağımlılıkları algılar.
4. Dokümantasyon sağlık kontrolleri yapılandırılmış Markdown dosyalarını inceler.
5. Generatorlar deterministik Markdown çıktısı yazar.

</details>
