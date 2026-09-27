# FitTrack Current State

Güncelleme: 27 Eylül 2026

## Güncel sürüm

- Uygulama: **0.14.4**
- Android `versionCode`: **36**
- Yerel veri şeması: **15**
- Paket kimliği: `com.fittracklabs.mobile`
- GitHub `main`, tek güncel kaynak kod hattıdır.

## Mimari

- Vanilla JavaScript/CSS web arayüzü, Capacitor Android kabuğu.
- Ana çalışma dosyaları: `app.js`, `cloud.js`, `styles.css`, `member-ui.css`, `design-system.css`, `workout-ui.css`, `reference-ui.css`.
- Supabase yapısı `supabase/` ve bulut istemci akışları `cloud.js` altında.
- Android native köprü `android/app/src/main/` altında; dosya dışa aktarma eklentisi korunmalıdır.

## Kesinleşmiş ürün kararları

- Dört mevcut tema korunur; ekran bazlı sabit kırmızı/pembe geçersiz kılmaları eklenmez.
- İlk üye profili tek formda alınır.
- Aktif antrenman kayıtları, duraklatma/devam, yarım kayıt ve kurtarma akışları korunur.
- Seans seçimi kompakt satırlıdır; seçim yapılmadan başlat düğmesi pasiftir.
- Hareket GIF/poster varlıkları korunur; referans UI yerleşimi mevcut içeriklere uygulanır.
- Programlarım kartlarının 0.14.2 düzeni korunur.
- Bel, boyun, kol ve kalça ölçümleri ayrı ikonlarla gösterilir.

## Build ve teslim

- `package.json` Node `>=22` ister.
- 0.14.4 APK mevcut beta sertifikasıyla imzalandı; sertifika veya parola repoya konmaz.
- 0.14.4, 0.14.3 APK kabuğunun doğrulanmış web-only repack işlemidir; native DEX korunmuştur.
- Son doğrulama: 9 hedefli Chromium grubu geçti; izole Android emülatöründe 0.14.3 üzerine kurulum ve açılış başarılı.
- Temiz GitHub çalışma ağacında Node 22 ve JDK 21 ile standart imzasız Android release buildi geçti.
- Fiziksel Samsung, gerçek SMTP/e-posta ve canlı müşteri hesabı doğrulaması yapılmadı.

## Çalışma kuralları

- Başlamadan önce `tokenkuralları.md` ve son Delta Devir okunur.
- Eski devir/test/ZIP dosyaları yalnız görev gerektirirse açılır.
- Graft yerel cache'dir; `graft/` commitlenmez.
- Değişiklikten sonra ilgili test, build, APK ve smoke sonucu ayrı raporlanır.
