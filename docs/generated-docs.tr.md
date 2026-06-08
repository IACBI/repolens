# Üretilen Dokümanlar

[English](generated-docs.md) | [Türkçe](generated-docs.tr.md)

`scan` beş Markdown dosyası yazar.

## `ARCHITECTURE.md`

Proje türü, teknolojiler, klasör yapısı, giriş noktaları, runtime ipuçları, Mermaid modül diyagramı, riskler, bilinmeyenler ve kanıtları özetler.

## `MODULES.md`

Algılanan modülleri olası sorumluluk, önemli dosyalar, iç bağımlılıklar, dış bağımlılıklar, güven seviyesi ve kanıtlarla listeler.

## `ONBOARDING.md`

Bağımlılık kurulum ipuçları, çalıştırma komutları, test komutları, okunacak ilk dosyalar, ilk katkı alanları ve yaygın package scriptlerini sağlar.

## `DEPENDENCY_MAP.md`

İç bağımlılık kenarlarını, dış paket kullanımını, Mermaid bağımlılık diyagramlarını ve olası coupling noktalarını gösterir.

## `DOCS_HEALTH.md`

Bulunan dokümantasyon dosyalarını, kırık dosya veya dizin referanslarını, mevcut olmayan dokümante package scriptlerini, eksik önerilen dokümanları ve düzeltme önerilerini raporlar.

## Doğruluk Modeli

Üretilen dokümanlar statik kaynak kanıtına dayanır. RepoLens temkinli dil kullanır ve kanıt dosyalarını listeler; çünkü kodda görünmeyen iş niyetini bilemez.
