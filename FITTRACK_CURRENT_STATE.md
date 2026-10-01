# FitTrack Current State

Güncelleme: 1 Ekim 2026 — 0.15 final ana sayfa

## Güncel sürüm

- Uygulama: **0.15**
- Android `versionCode`: **38**
- Yerel veri şeması: **15**
- Paket kimliği: `com.fittracklabs.mobile`
- Ana geliştirme hattı GitHub `main`dir. Bu teslim, `feat/0150` / `73e02c09930f1cbf7bc06a29248131777303c37a` üzerine paketteki 0.15.1 hotfix yamasıdır. Yerel çalışma dalı `fix/0151-home-overflow`; GitHub'a push/merge yapılmadı. Kontrol anında `main` hâlâ `d253213` / 0.14.4 idi.

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
- Üye ana sayfasında atanan programlar eşit öncelikli yatay kartlardır; uygulama antrenman önermez veya otomatik seçmez. Başlatma mevcut seans seçimine gider.
- 0.15.1: Yatay kaydırma yalnız program şeridindedir; sayfa genişliği ekrana bağlıdır. Koyu kırmızı temanın ana vurgu ve CTA rengi tek kırmızı (#e52332); diğer üç tema korunur.

## Build ve teslim

- `package.json` Node `>=22` ister.
- 0.15.0, Berk'in Windows bilgisayarında JDK 21 ile standart Gradle/Capacitor release buildidir; eski APK üzerine web repack yapılmadı. Kullanıcının build günlüğü ve yüklediği APK ayrı kanıtlardır.
- 0.15.1 bu doğrulanmış 0.15.0 native buildine kontrollü web güncellemesidir; yeni Gradle derlemesi değildir. Yalnız web varlıkları ve manifest sürüm alanları değişti; native DEX ve diğer içerik korundu.
- Burada imzalama ve doğrulama yapıldı. V1/V2/V3 geçerli; mevcut beta sertifikası korunur. Gizli anahtar/parola kaynak veya teslim paketine konmaz.
- Kaynak commit üzerinde 26/26 otomatik test grubu geçti; üretim bağımlılığı audit sonucu 0 açık. Bunlar gerçek tarayıcı/telefon testleri değildir.
- 0.15.1 APK/kaynak: 32 kanonik web dosyası byte-byte eşleşir. Resmi imza ve 16 KB zipalign kontrolü başarılı.
- 0.15.0 telefon videosu sayfa taşmasını kanıtladı; bu sürüm kabul edilmedi. 0.15.1 gerçek Chromium'da 22 kontrol (dört tema, 320/360/392/740 px, dokunma hareketi, boş/tek program, büyük metin, çoklu seans) geçti. Fiziksel Samsung güncelleme/dokunma testi yine bekliyor. Gerçek e-posta/push ve canlı hesap testleri yapılmadı.
- Kanonik kaynaklar proje kökündedir. `www/` ve Android web kopyaları `npm run build:web` ve Capacitor sync/build ile üretilir; doğrudan düzenlenmez.

## Çalışma kuralları

- Başlamadan önce `tokenkuralları.md` ve son Delta Devir okunur.
- Eski devir/test/ZIP dosyaları yalnız görev gerektirirse açılır.
- Graft yerel cache'dir; `graft/` commitlenmez.
- Değişiklikten sonra ilgili test, build, APK ve smoke sonucu ayrı raporlanır.

## En son kullanıcı kararı
Sürüm adı 0.15, Android kod 38. Haftalık durum yeşil/sarı; üç istatistik ve son kayıt satırı. Son devir: docs/handoffs/FITTRACK_0.15_FINAL_DEVIR.md. Önceki 0.15.1 adlandırması bu teslimle geçersizdir.
