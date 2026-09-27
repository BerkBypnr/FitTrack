# FitTrack Beta 0.12.0 — sürüm notları

Antrenör mobil ekranları 9 Eylül UI referansına göre revize edildi: Bugün/Üyeler/
Programlar/Mesajlar menüsü; kısa özet ve en fazla üç öncelikli üye; kartlı üye listesi;
program arama/filtre/detay ve onaylı tekli atama seçicisi; Stüdyo görünümü; mesaj
arama/okunmamış/üye bağlamı. Altı ortak tema korunur; Redline artık kırmızıdır.

Android kaynağı yeni standart Gradle/Capacitor projesidir. Eski Smali yalnız
legacy/ altında köken arşividir. Aynı paket ve sertifika, versionCode 27; şema14,
https://localhost ve veri anahtarları korunur. Native cache geçişi yalnız statik
Service Worker/cache kayıtlarını yeniler. Üye oyuncusunda tek ana kaydırıcı ve
önceki iptal/geri/snapshot davranışları korunur.

18/18 yerel test; temiz kurulumdan tekrar üretilen imzalı ve imzasız APK'larda
birebir hash eşitliği; resmi v2/v3 imza, kaynak ve hizalama doğrulaması başarılı.
Telefon/render/canlı iki hesap ve uzak CI kabulleri açık. Bu beta, tüm Rev6 web
paneli/MFA/sürümleme/toplu atama özelliklerinin tamamlandığı anlamına gelmez.

Tam kararlar ve devam: docs/FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md.
Telefon kabulü: docs/FITTRACK_v0.12.0_TELEFON_TESTLERI.md.
