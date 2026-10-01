# FitTrack Delta — 0.15.0 → 0.15.1

## Yapılanlar
Kullanıcının 1 Ekim telefon videosunda beş programlı ana sayfa, yatay kart şeridi yerine bütün sayfayı yana kaydırıyordu. Koyu kırmızı tema ana sayfada pembe görünüyordu. Bu iki regresyon giderildi; ilerleme/ölçüm gibi yeni ekran kapsamı açılmadı.

## Kök neden ve değiştirilen ana dosyalar
- `member-ui.css`: `.member-home` varsayılan grid min-content genişliği nedeniyle 392 px viewportta 1422 px genişliyordu. `minmax(0,1fr)`, çocuklarda `min-width:0`, carousel genişlik sınırı ve kartlarda snap-stop eklendi. Body overflow'u gizleyip içeriği kırpmakla yetinilmedi.
- `design-system.css`: dark-red için `--mint` pembe iken CTA gradienti başka kırmızıydı. Vurgu/primary tokenları #e52332 oldu; yumuşak arka plan aynı rengin saydam hâli. Plum Night, Redline Editorial, Rosewood Strength renkleri korunur.
- Kimlik/cache dosyaları 0.15.1; Android versionCode 38; şema 15. Eski testlerin yalnız sürüm beklentileri güncellendi.
- `tests/browser-0151.cjs`: gerçek Chromium regresyon testi. Eski CSS kurallarını geçici uygulayarak taşmayı yeniden üretir, sonra yeni düzeni ve gerçek CDP dokunma kaydırmasını doğrular.

## Test/Build
- 26/26 otomatik test grubu PASS.
- Gerçek Chromium 154 ile 22/22 kontrol PASS: dört tema × 320/360/392/740 px; kart kaydırma; dokunma hareketi; tek kırmızı; boş/tek program; büyük yazı; çok seanslı programı açma.
- Web build PASS. Ayrı TypeScript typecheck yok (vanilla JS).
- APK: 0.15.0'ın doğrulanmış native derlemesine kontrollü web-only güncelleme. Yeni Gradle buildi çalıştırılmadı. Native DEX ve web dışındaki içerik aynı, manifestte yalnız versionName/versionCode değişti.
- 32 web varlığı kanonik kaynakla byte-byte eşleşir; V1/V2/V3 ve 16 KB zipalign PASS. Eski beta sertifikası korunur.
- Üretim bağımlılıkları önceki 0.15.0 ile aynı; o sürümde audit 0 idi. Bu düzeltmede yeni dependency eklenmedi.
- Fiziksel Samsung testi NOT_RUN. Tarayıcı görselleri yerel temsili veridir; gerçek üye hesabı/telefon kanıtı değildir.

## Başarısız denemeler
- Playwright otomatik browser indirmesi bozuk/boş arşiv döndürdü. Google'ın resmi Chrome for Testing 154 paketiyle gerçek tarayıcı testi çalıştırıldı.
- İlk gezinme testi tek seanslı örnekten seçim ekranı bekliyordu; uygulamanın mevcut tek seans akışı geri sayımdır. Fixture iki seanslı yapıldı. Testte eski CSS sınıfı yerine gerçek seçim action'ı kullanıldı. Uygulama akışı bu nedenle değiştirilmedi.

## Git / kaynak teslimi
- Baz: `feat/0150` commit `73e02c09930f1cbf7bc06a29248131777303c37a`.
- Yerel dal: `fix/0151-home-overflow`; GitHub'a push, main merge veya tag yapılmadı.
- Tam kaynak ZIP ve `FitTrack-v0.15.1-hotfix.patch` aynı düzeltmeyi taşır. Yama kanonik kod/doküman/test içindir; üretilmiş www/Android web kopyaları yama dışında bırakıldı. Yama yalnız temiz 73e02c0 bazında kontrol edilerek uygulanmalı; sonra build:web ve sync/build yapılmalı.
- Ana kaynak klasörüne ZIP'i körlemesine kopyalama. Keystore ve parola teslimde yoktur.

## Bilinen sorunlar / Sonraki işler
Önce telefonda beş kartı kaydır, sayfanın sabit kaldığını, haftalık günlerin sığdığını ve kırmızıyı onayla. Başarılıysa 0.15.1 ile sürüm kapanışı yap; hatalı 0.15.0'ı stabil sayma. Sonraki ilerleme/ölçüm UI kapsamı ayrıca tasarımlarla eşleştirilecek. Önceki CI etiketleri ve legacy release helper sürüm varsayımları bakım listesinde kalır.
