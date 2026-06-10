# RepoLens

<p align="center">
  <strong>A local-first CLI that turns repositories into living documentation.</strong>
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#türkçe">Türkçe</a>
</p>

---

## English

RepoLens analyzes a codebase on your machine and generates practical Markdown documentation for architecture, modules, onboarding, dependency maps, and documentation health. By default it uses deterministic local analysis and does not require external AI APIs.

### Why RepoLens Exists

Software documentation often goes stale because it is separated from the code it describes. RepoLens helps developers quickly understand an unfamiliar repository and gives maintainers a repeatable way to refresh documentation from the current source tree.

### Who It Is For

- Developers onboarding to an unfamiliar project
- Maintainers who want lightweight architecture and module docs
- Teams that need local-first tooling for private repositories
- Open-source projects that want generated docs without a hosted service

### Key Features

- Local repository scanning with configurable include/exclude rules and `.gitignore` support
- Project type detection for Node/JavaScript/TypeScript, Python, Go, Rust, and generic repositories
- Package manager, entry point, module, and package script detection
- Monorepo awareness: pnpm/npm/yarn workspace packages are treated as internal dependencies
- `tsconfig.json` path alias resolution (`compilerOptions.paths`) for import mapping
- Go module path (`go.mod`) awareness for internal vs. external import classification
- Markdown output with Mermaid diagrams
- Documentation freshness checks for stale file references and package scripts, with `--strict` and `--json` for CI
- Optional provider abstraction for future AI integrations, disabled by default

### Quick Start From Source

RepoLens is not published to npm yet. Use it from source:

```bash
pnpm install
pnpm build
pnpm test
pnpm dev -- summary
```

Create a config file:

```bash
pnpm dev -- init
```

Generate documentation:

```bash
pnpm dev -- scan
```

### CLI Usage

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- check-docs --strict
pnpm dev -- check-docs --json
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

`check-docs --strict` exits with a non-zero code when warnings are found, which makes it usable as a CI gate. `check-docs --json` prints the report as JSON.

When built, the package exposes the `repolens` binary at `./dist/cli.js`.

### Generated Documentation

`scan` writes five Markdown files:

- `ARCHITECTURE.md`
- `MODULES.md`
- `ONBOARDING.md`
- `DEPENDENCY_MAP.md`
- `DOCS_HEALTH.md`

The generated docs use cautious language, cite evidence files, and include Mermaid diagrams where useful.

### Configuration

`repolens init` creates `.repolensrc.json`:

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

### Privacy and Local-First Model

RepoLens reads files from the local repository and writes Markdown output locally. The MVP does not send source code to external services and does not call AI providers by default.

### Supported Project Types

- Node.js, TypeScript, and JavaScript
- Python
- Go
- Rust
- Generic repositories

Detection is static and lightweight. It is designed to be useful, not a full compiler or language server.

### Limitations

- Import parsing is lightweight and may miss complex dynamic behavior.
- Only the repository-root `.gitignore` and `tsconfig.json` are read; nested ignore files, negation patterns, and `extends` chains are not followed.
- Generated summaries infer responsibility from file structure, names, and imports; they do not understand private business context.
- No web dashboard, cloud sync, hosted service, npm publication, or external AI integration is included.

### Documentation

- [Getting started](docs/getting-started.md)
- [CLI reference](docs/cli.md)
- [Configuration](docs/configuration.md)
- [Generated docs](docs/generated-docs.md)
- [Architecture](docs/architecture.md)
- [Privacy](docs/privacy.md)
- [Roadmap](docs/roadmap.md)
- [FAQ](docs/faq.md)

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes local-first, deterministic, and covered by tests.

### License

MIT. See [LICENSE](LICENSE).

### Author

𝓐.𝓒.𝓑

---

## Türkçe

RepoLens, kod tabanını yerel makinenizde analiz eder ve mimari, modüller, onboarding, bağımlılık haritası ve dokümantasyon sağlığı için pratik Markdown çıktıları üretir. Varsayılan olarak deterministik yerel analiz kullanır ve harici AI API gerektirmez.

### Neden Var?

Yazılım dokümantasyonu çoğu zaman koddan koptuğu için eskir. RepoLens, geliştiricilerin tanımadıkları bir depoyu hızlıca anlamasına ve bakım yapanların dokümantasyonu mevcut kaynak ağacına göre düzenli şekilde yenilemesine yardımcı olur.

### Kimler İçin?

- Yeni bir projeye katılan geliştiriciler
- Hafif mimari ve modül dokümantasyonu isteyen bakımcılar
- Özel depolar için local-first araçlara ihtiyaç duyan ekipler
- Barındırılan servis kullanmadan dokümantasyon üretmek isteyen açık kaynak projeleri

### Temel Özellikler

- Yapılandırılabilir include/exclude kuralları ve `.gitignore` desteğiyle yerel depo taraması
- Node/JavaScript/TypeScript, Python, Go, Rust ve genel depo algılama
- Paket yöneticisi, giriş noktası, modül ve package script algılama
- Monorepo farkındalığı: pnpm/npm/yarn workspace paketleri iç bağımlılık olarak işlenir
- Import eşlemesi için `tsconfig.json` path alias çözümlemesi (`compilerOptions.paths`)
- İç/dış import ayrımı için Go modül yolu (`go.mod`) farkındalığı
- Mermaid diyagramlı Markdown çıktılar
- Eski dosya referansları ve package scriptleri için dokümantasyon sağlık kontrolü; CI için `--strict` ve `--json`
- Gelecekteki AI entegrasyonları için opsiyonel provider soyutlaması, varsayılan olarak kapalı

### Kaynaktan Hızlı Başlangıç

RepoLens henüz npm üzerinde yayınlanmadı. Kaynaktan kullanın:

```bash
pnpm install
pnpm build
pnpm test
pnpm dev -- summary
```

Yapılandırma dosyası oluşturun:

```bash
pnpm dev -- init
```

Dokümantasyon üretin:

```bash
pnpm dev -- scan
```

### CLI Kullanımı

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- check-docs --strict
pnpm dev -- check-docs --json
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

`check-docs --strict`, uyarı bulunduğunda sıfır dışı çıkış koduyla sonlanır; bu sayede CI kapısı olarak kullanılabilir. `check-docs --json` raporu JSON olarak yazdırır.

Derlendiğinde paket `./dist/cli.js` üzerinden `repolens` binary girdisini sağlar.

### Üretilen Dokümantasyon

`scan` beş Markdown dosyası yazar:

- `ARCHITECTURE.md`
- `MODULES.md`
- `ONBOARDING.md`
- `DEPENDENCY_MAP.md`
- `DOCS_HEALTH.md`

Üretilen dokümanlar temkinli dil kullanır, kanıt dosyalarını listeler ve uygun yerlerde Mermaid diyagramları içerir.

### Yapılandırma

`repolens init`, `.repolensrc.json` dosyasını oluşturur:

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

### Gizlilik ve Local-First Model

RepoLens dosyaları yerel depodan okur ve Markdown çıktıları yerel olarak yazar. MVP kaynak kodunu harici servislere göndermez ve varsayılan olarak AI provider çağırmaz.

### Desteklenen Proje Türleri

- Node.js, TypeScript ve JavaScript
- Python
- Go
- Rust
- Genel depolar

Algılama statik ve hafiftir. Amaç faydalı olmak; tam derleyici veya language server davranışı sağlamak değildir.

### Sınırlamalar

- Import analizi hafiftir ve karmaşık dinamik davranışları kaçırabilir.
- Yalnızca depo kökündeki `.gitignore` ve `tsconfig.json` okunur; iç içe ignore dosyaları, olumsuzlama (`!`) desenleri ve `extends` zincirleri izlenmez.
- Üretilen özetler dosya yapısı, isimler ve importlardan çıkarım yapar; özel iş bağlamını bilemez.
- Web paneli, cloud sync, barındırılan servis, npm yayını veya harici AI entegrasyonu yoktur.

### Dokümantasyon

- [Başlangıç](docs/getting-started.md)
- [CLI referansı](docs/cli.md)
- [Yapılandırma](docs/configuration.md)
- [Üretilen dokümanlar](docs/generated-docs.md)
- [Mimari](docs/architecture.md)
- [Gizlilik](docs/privacy.md)
- [Yol haritası](docs/roadmap.md)
- [SSS](docs/faq.md)

### Katkı

Bkz. [CONTRIBUTING.md](CONTRIBUTING.md). Değişiklikleri local-first, deterministik ve testlerle desteklenmiş tutun.

### Lisans

MIT. Bkz. [LICENSE](LICENSE).

### Yazar

𝓐.𝓒.𝓑
