# Üretilen Dokümanlar / Generated Docs

<p align="center">
  <a href="#türkçe">Türkçe</a> | <a href="#english">English</a>
</p>

---

## Türkçe

`scan` beş Markdown dosyası yazar:

- `ARCHITECTURE.md`: proje türü, teknolojiler, klasör yapısı, giriş noktaları, runtime ipuçları, Mermaid modül diyagramı, riskler, bilinmeyenler ve kanıtlar.
- `MODULES.md`: algılanan modüller, olası sorumluluk, önemli dosyalar, bağımlılıklar, güven seviyesi ve kanıtlar.
- `ONBOARDING.md`: bağımlılık kurulum ipuçları, çalıştırma komutları, test komutları, okunacak ilk dosyalar, ilk katkı alanları ve yaygın scriptler.
- `DEPENDENCY_MAP.md`: iç bağımlılık kenarları, dış paket kullanımı, Mermaid diyagramları ve olası coupling noktaları.
- `DOCS_HEALTH.md`: bulunan dokümantasyon dosyaları, kırık referanslar, mevcut olmayan dokümante scriptler, eksik önerilen dokümanlar ve düzeltme önerileri.

Üretilen dokümanlar statik kaynak kanıtına dayanır. RepoLens temkinli dil kullanır ve kanıt dosyalarını listeler; çünkü kodda görünmeyen iş niyetini bilemez.

---

## English

`scan` writes five Markdown files:

- `ARCHITECTURE.md`: project type, technologies, folder structure, entry points, runtime clues, Mermaid module diagram, risks, unknowns, and evidence.
- `MODULES.md`: detected modules with likely responsibility, important files, dependencies, confidence, and evidence.
- `ONBOARDING.md`: dependency installation hints, run commands, test commands, first files to read, first contribution areas, and common scripts.
- `DEPENDENCY_MAP.md`: internal dependency edges, external package usage, Mermaid diagrams, and possible coupling hotspots.
- `DOCS_HEALTH.md`: documentation files found, broken references, documented scripts that do not exist, missing recommended docs, and suggested fixes.

Generated docs are based on static source evidence. RepoLens uses cautious language and lists evidence files because it cannot know business intent that is not visible in code.
