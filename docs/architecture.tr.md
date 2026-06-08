# Mimari

[English](architecture.md) | [Türkçe](architecture.tr.md)

RepoLens üç ayrı sorumluluk etrafında düzenlenmiştir:

- dosya tarama
- depo yapısı ve bağımlılık analizi
- Markdown çıktı üretimi

## Ana Kaynak Alanları

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

## Tasarım Kısıtları

- Varsayılan olarak harici API çağrısı yoktur.
- Veritabanı yoktur.
- Web paneli yoktur.
- Tarama, analiz ve Markdown üretimi ayrı tutulur.
- Testlerin ve üretilen dokümanların stabil kalması için deterministik çıktı tercih edilir.
