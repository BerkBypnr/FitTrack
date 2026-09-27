# 0.14.3 sürüm notları

22 Eylül referanslarına göre profil kurulumu, program/seans seçimi, aktif antrenman, tam/yarım özetler, ölçümler, hesap ekranları ve hata durumları güncellendi. Yeni görsel katman `reference-ui.css` içindedir. Mevcut egzersiz GIFleri ve dört tema korunur.

Opsiyonel `bodyMeasurements` alanı mevcut JSON snapshot üzerinden eşitlenir. Veri şeması 15 kalır. Gerçek bulut/telefon kontrolü teslim paketindeki kontrol listesiyle yapılmalıdır.

`npm ci`, `npm test`, `npm run build:web` ile yerel kaynak doğrulanabilir. Tarayıcı senaryoları `tests/browser-0143.cjs` dosyasındadır. Node 24 VM JIT çökmesine karşı yalnız review paketi --jitless çalışır.

Teslim APK: önceki imzalı 0.14.2 APK üzerinde doğrulanmış web/sürüm güncellemesi; native DEX korunur. Sıfırdan Gradle derlemesi değildir. Ayrı test emülatöründe güncelleme kurulumu sınandı. İmza anahtarı ve parolası bu kaynak paketinde bulunmaz.
