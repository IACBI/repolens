# RepoLens

[English](README.md) | [Türkçe](README.tr.md)

RepoLens, depoları yaşayan dokümantasyona dönüştüren local-first bir CLI aracıdır.

Kod tabanını yerel makinenizde analiz eder ve mimari, modüller, onboarding, bağımlılık haritası ve dokümantasyon sağlığı için pratik Markdown çıktıları üretir. Varsayılan olarak deterministik yerel analiz kullanır ve harici AI API gerektirmez.

## Neden Var?

Yazılım dokümantasyonu çoğu zaman koddan koptuğu için eskir. RepoLens, geliştiricilerin tanımadıkları bir depoyu hızlıca anlamasına ve bakım yapanların dokümantasyonu mevcut kaynak ağacına göre düzenli şekilde yenilemesine yardımcı olur.

## Kimler İçin?

- Yeni bir projeye katılan geliştiriciler
- Hafif mimari ve modül dokümantasyonu isteyen bakımcılar
- Özel depolar için local-first araçlara ihtiyaç duyan ekipler
- Barındırılan servis kullanmadan dokümantasyon üretmek isteyen açık kaynak projeleri

## Temel Özellikler

- Yapılandırılabilir include/exclude kurallarıyla yerel depo taraması
- Node/JavaScript/TypeScript, Python, Go, Rust ve genel depo algılama
- Paket yöneticisi, giriş noktası, modül ve package script algılama
- Mermaid diyagramlı Markdown çıktılar
- Eski dosya referansları ve package scriptleri için dokümantasyon sağlık kontrolü
- Gelecekteki AI entegrasyonları için opsiyonel provider soyutlaması, varsayılan olarak kapalı

## Kaynaktan Hızlı Başlangıç

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

## CLI Kullanımı

```bash
pnpm dev -- init
pnpm dev -- summary
pnpm dev -- check-docs
pnpm dev -- scan
pnpm dev -- scan --out docs/repolens
```

Derlendiğinde paket `./dist/cli.js` üzerinden `repolens` binary girdisini sağlar.

## Üretilen Dokümantasyon

`scan` beş Markdown dosyası yazar:

- `ARCHITECTURE.md`
- `MODULES.md`
- `ONBOARDING.md`
- `DEPENDENCY_MAP.md`
- `DOCS_HEALTH.md`

Üretilen dokümanlar temkinli dil kullanır, kanıt dosyalarını listeler ve uygun yerlerde Mermaid diyagramları içerir.

## Yapılandırma

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

## Gizlilik ve Local-First Model

RepoLens dosyaları yerel depodan okur ve Markdown çıktıları yerel olarak yazar. MVP kaynak kodunu harici servislere göndermez ve varsayılan olarak AI provider çağırmaz.

Provider soyutlaması gelecekteki açık rızalı entegrasyonlar için vardır:

- `NullProvider` varsayılan fallback davranışıdır.
- `LocalHeuristicProvider` deterministik ve yereldir.
- Gelecekteki ağ kullanan providerlar yapılandırma ile açıkça etkinleştirilmelidir.

## Desteklenen Proje Türleri

- Node.js, TypeScript ve JavaScript
- Python
- Go
- Rust
- Genel depolar

Algılama statik ve hafiftir. Amaç faydalı olmak; tam derleyici veya language server davranışı sağlamak değildir.

## Sınırlamalar

- Import analizi hafiftir ve karmaşık dinamik davranışları kaçırabilir.
- Go ve Rust bağımlılık algılama MVP içinde temeldir.
- Üretilen özetler dosya yapısı, isimler ve importlardan çıkarım yapar; özel iş bağlamını bilemez.
- Web paneli, cloud sync, barındırılan servis, npm yayını veya harici AI entegrasyonu yoktur.

## Dokümantasyon

- [Başlangıç](docs/getting-started.tr.md)
- [CLI referansı](docs/cli.tr.md)
- [Yapılandırma](docs/configuration.tr.md)
- [Üretilen dokümanlar](docs/generated-docs.tr.md)
- [Mimari](docs/architecture.tr.md)
- [Gizlilik](docs/privacy.tr.md)
- [Yol haritası](docs/roadmap.tr.md)
- [SSS](docs/faq.tr.md)

## Katkı

Bkz. [CONTRIBUTING.tr.md](CONTRIBUTING.tr.md). Değişiklikleri local-first, deterministik ve testlerle desteklenmiş tutun.

## Lisans

MIT. Bkz. [LICENSE](LICENSE).

## Yazar

𝓐.𝓒.𝓑
