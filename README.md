# FitTrack Beta 0.11.4 — Android/Capacitor kaynak projesi

Bu paket, FitTrack Beta 0.11.4 web uygulamasını, Android projesini, Supabase migration/RLS değişikliklerini ve hareket GIF üretim kaynaklarını içerir.

## Sabit sürüm bilgileri

- Uygulama sürümü: `0.11.4`
- Android `versionCode`: `21`
- Paket kimliği: `com.fittracklabs.mobile`
- `minSdk`: `24`
- `targetSdk` / `compileSdk`: `36`
- Web kaynağı: `www/`

## Gereksinimler

- Node.js 22 veya daha yeni
- pnpm 11.19.0
- JDK 21
- Android SDK Platform 36 ve Build Tools 36.0.0

## Temiz makinede derleme

```powershell
pnpm install --frozen-lockfile
pnpm cap:sync
Set-Location android
.\gradlew.bat assembleRelease
```

Gradle çıktısı imzasız release APK’dır. Kurulabilir dağıtım APK’sı üretmek için yetkili FitTrack imzalama anahtarıyla `zipalign` ve `apksigner` çalıştırılmalıdır. Bu doğrulama teslimatında kullanılan sertifikanın SHA-256 değeri `38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE` olmalıdır. İmzalama anahtarı, parola veya başka bir gizli bilgi bu kaynak paketinde bulunmaz.

Yerel Android SDK konumu gerektiğinde `android/local.properties` içinde `sdk.dir=...` olarak tanımlanır; bu makineye özel dosya pakete dahil edilmez.

## Doğrulama

```powershell
pnpm test
```

Doğrulama betiği web kaynak bütünlüğünü, sürüm eşleşmesini, Android yapılandırmasını, Capacitor eklentilerini, orijinal FitTrack ikon/splash kaynaklarını, 36 hareket GIF’ini, Program Builder güvenlik işaretlerini, yönetici ekranlarını ve 0.11.4 RLS migration içeriğini denetler.

## Dizinler

- `www/`: Beta 0.11.4 web uygulaması ve Supabase SQL migration dosyaları
- `android/`: yeniden oluşturulan Android/Gradle projesi
- `scripts/`: yapı/bütünlük doğrulaması ve hareket GIF üretim aracı
- `source-assets/exercise-sprites/`: özgün hareket GIF’lerinin yeniden üretilebilir kaynak kareleri
- `checksums/`: teslim edilen 0.11.4 web kaynaklarının SHA-256 listesi

0.11.4 migration dosyası salon hareket kütüphanesini ve program atama notundan ayrı genel üye takip notunu ekler. Bu migration dağıtım öncesi Supabase SQL Editor veya migration hattında uygulanmalıdır.
