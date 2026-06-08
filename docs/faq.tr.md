# SSS

[English](faq.md) | [Türkçe](faq.tr.md)

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
