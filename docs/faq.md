# FAQ / SSS

Switch language on this page by opening the section you want.

<details open>
<summary><strong>English</strong></summary>

## Is RepoLens published to npm?

No. Use it from source for now.

## Does RepoLens use AI?

Not by default. The MVP includes a provider abstraction, but `ai.enabled` is false and `provider` is `none` by default.

## Does RepoLens upload my code?

No. The current implementation performs local static analysis and writes local Markdown output.

## Can RepoLens analyze private repositories?

Yes, that is one of the design goals. Review generated docs before publishing them.

## Are generated docs guaranteed to be correct?

No. RepoLens infers structure from files, names, scripts, imports, and documentation references. It uses evidence sections so readers can verify conclusions.

## Which package managers are detected?

The MVP detects npm, pnpm, yarn, pip requirements, pyproject-based Python projects, Go modules, and Cargo.

</details>

<details>
<summary><strong>Türkçe</strong></summary>

## RepoLens npm üzerinde yayınlandı mı?

Hayır. Şimdilik kaynaktan kullanın.

## RepoLens AI kullanıyor mu?

Varsayılan olarak hayır. MVP provider soyutlaması içerir, ancak varsayılan `ai.enabled` false ve `provider` none değerindedir.

## RepoLens kodumu yükler mi?

Hayır. Mevcut uygulama yerel statik analiz yapar ve yerel Markdown çıktı yazar.

## RepoLens özel depoları analiz edebilir mi?

Evet, bu temel tasarım hedeflerinden biridir. Üretilen dokümanları yayınlamadan önce inceleyin.

## Üretilen dokümanların doğruluğu garanti mi?

Hayır. RepoLens dosyalardan, isimlerden, scriptlerden, importlardan ve dokümantasyon referanslarından çıkarım yapar. Okuyucuların sonuçları doğrulayabilmesi için kanıt bölümleri kullanır.

## Hangi paket yöneticileri algılanır?

MVP npm, pnpm, yarn, pip requirements, pyproject tabanlı Python projeleri, Go modules ve Cargo algılar.

</details>
