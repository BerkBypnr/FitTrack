> TARİHSEL ARA ÇALIŞMA. Güncel durum: `FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md`.

# FitTrack 0.12.0 A teknik devir

11 Eylül 2026. Berk ve Alper için geliştirme kontrol noktası.

**A teknik hazırlığı tamamlandı; Kapı 0 telefon kabulü açık.** Uygulama hâlâ
**0.11.9 / versionCode 26 / şema 14**. Bu teslim antrenör paneli veya yeni APK
değildir. Mevcut davranışlar envanterlendi, 25 yeni hazırlık kontrolü eklendi ve
16 test grubu geçti. 0.12.0 B native taşıması ayrı görev olarak başlatılmalıdır.

## 1 Kaynak kimliği ve kapsam

| Alan | Doğrulanan durum |
| --- | --- |
| Kaynak ZIP | Özgün 0.11.9, 6.207 girdi; SHA-256 devirle aynı |
| APK | Özgün 0.11.9; SHA-256 devirle aynı |
| Paket | `com.fittracklabs.mobile` |
| API | En düşük 24, hedef 36 |
| Auth dönüşü | `com.fittracklabs.mobile://auth-callback` |
| Ürün web dosyaları | 22 dosya APK ile byte-byte aynı; değişmedi |
| Native kaynak | 6.053 Android dosyası özgün kaynakla aynı |
| Supabase kaynakları | 16 dosya aynı; canlı sunucu işlemi yok |
| Bağımlılıklar | `package.json` ve `package-lock.json` aynı |
| Git / CI | Bu çalışma ZIP'ten açıldı; Git checkout, commit, push veya uzak CI koşusu yok |
| Yeni APK / migration | Yok / yok |

Özgün ZIP SHA-256:
`7bf6883635206fcd18a40f970a60280055a725159fffbbe646fafd71969745a4`

Özgün APK SHA-256:
`4035b4f07308f85831d2e6b02db7f104d0d46a949c8f45da09940d8fd9f46e23`

Beta sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Yüklenen `FITTRACK_GUNCEL_YOL_HARITASI_2026.md` düz Markdown değil, DOCX
biçiminde bir dosyadır. İçeriği Revizyon 6 olarak okundu; orijinali değiştirilmedi.
Bu planda 3D iptal, GIF altyapısı 0.13.1, panel başlangıcı 0.12.1'dir.
Turnike/aidat/POS ayrı entegrasyon hattıdır; bu adıma alınmadı.

## 2 Gerçek proje yapısı

Web katmanı düz JavaScript, HTML ve CSS'tir. Bu kaynakta React, TypeScript veya
Vite uygulaması yoktur; eski sohbet özetindeki bu varsayım kullanılmamalıdır.
`app.js` üye ve mevcut mobil antrenör ekranlarını, veri normalizasyonunu, taslağı,
antrenmanı ve platform çağrılarını içerir. `cloud.js` Auth, bootstrap, Realtime,
senkron kuyruk ve uzak veri işlemlerini yönetir. İkisi `FitTrackBridge`,
`FitTrackCloud` ve `fittrack:state-saved` olayı üzerinden haberleşir.

`index.html` sırasıyla vendored Supabase 2.112.2 betiğini, `config.js`,
`cloud.js` ve `app.js` dosyalarını yükler. Npm bağımlılıkları yalnız test içindir:
`@electric-sql/pglite` 0.5.8 ve `linkedom` 0.18.13. Yeni framework kurulmadı.

Android katmanı özgün 0.11.3 APK kökenli Smali/XML/görsellerdir. Orijinal Gradle,
Java/Kotlin geliştirme ağacı değildir. `MainActivity.java` kaynak etiketi Smali
içinde bulunsa da Java kaynak dosyasının varlığı anlamına gelmez. İptal edilmiş
validation projesi kullanılmadı. Önceki tasarım paylaşım ZIP'i kaynak yerine geçmez.

## 3 Native bağlantı envanteri

| Sınır | Mevcut çağrı veya mekanizma | Taşıma kabulü |
| --- | --- | --- |
| Sistem geri hareketi | Özel `MainActivity`, `OnBackPressedDispatcher`, `evaluateJavascript`, `FitTrackNativeBack` | Antrenmanda iptal diyaloğu; Hayır aynı alanları korur; kökte mevcut arka plana alma davranışı |
| App eklentisi | `backButton`, `appStateChange`, `exitApp` | Bir geri hareketi iki kez işlenmez; aktiflikte hatırlatıcı kontrolü |
| Auth bağlantısı | `App.addListener('appUrlOpen')`, `getLaunchUrl()` | Uygulama açıkken ve kapalıyken doğru kayıt/kurtarma dönüşü |
| JSON yedeği | `Filesystem.writeFile`, `CACHE`, `utf8`; ardından `Share.share` | URI ile gerçek paylaşım, hata durumunda sahte başarı yok |
| Dosya sağlayıcısı | `com.fittracklabs.mobile.fileprovider`, `fittrack_shared_cache` | Yalnız cache yolu; sağlayıcı dışa açık değil; URI izni korunur |
| Hatırlatma | `LocalNotifications` izin, kesin alarm, iptal, planlama, bekleyenler | 7101–7107 kimlikleri, gün/saat ve izin reddi; yeniden başlatma |
| Mesaj bildirimi | Gelen mesajdan yerel bildirim; `localNotificationActionPerformed` | Doğru sohbet; okunmuş/tekrar bildirim davranışı |
| Bağlantı ve yaşam döngüsü | Tarayıcı `online`, `offline`, `visibilitychange`, `pageshow` | Ağ dönüşünde doğrulama ve kuyruk; arka plan/ön plan |
| Klavye ve güvenli alan | WebView, CSS ve DOM; ayrı Keyboard eklentisi yok | Gerçek klavyeyle kilo/tekrar ve sabit tamamlama erişimi |

Kayıtlı npm eklenti adları: `@capacitor/app`, `@capacitor/filesystem`,
`@capacitor/local-notifications`, `@capacitor/share`. Özgün native bağımlılıkların
sürüm kilidi bu pakette bulunmuyor; sürümler tahmin edilmedi.

Önemli ayrım: özel native geri yolu kökte `moveTaskToBack(true)` kullanırken,
JavaScript App geri dinleyicisinin son çare yolu `exitApp()` çağırır. B adımında
ikisinin bir hareketi iki defa işlemesi veya farklı kök davranışı üretmesi önlenmelidir.
Mevcut mesaj bildirimi uzaktan push altyapısı değildir; uygulama çalışırken alınan
mesajdan yerel bildirim üretir. Push planı 0.14.2'de kalır.

## 4 Saklama ve oturum sözleşmesi

Kaynak incelemesinden çıkarılan Android origin **`https://localhost`**:
`androidScheme=https`, hostname ayarı yok ve Smali `CapConfig` varsayılanı
`localhost`. Bu adres cihazda ölçülmedi. `webDir` ayarı `www`, APK içindeki
gerçek web kökü `assets/public`. WebView DOM storage açıktır.

| Kayıt | Mevcut anahtar / kapsam |
| --- | --- |
| Son açık durum | `fittrack-beta-010-state` |
| Kullanıcı durumu | `fittrack-beta-010-user-{userId}` |
| Salon durumu | `fittrack-beta-010-user-{userId}-gym-{gymId}` |
| Eski veri sahipliği | `fittrack-beta-010-legacy-claimed-by` |
| Program taslağı | `fittrack-beta-0114-editor-{userId veya local}-{gymId veya none}` |
| Oturum | `fittrack-beta-010-auth` |
| Senkron kuyruk | `fittrack-beta-010-queue-{userId}`; her öğede ayrıca salon, kullanıcı ve revision |
| Snapshot sürümü | `fittrack-beta-010-snapshot-version-{userId}-{gymId}` |
| Cihaz kimliği | `fittrack-beta-010-device-id-{userId}` |
| Aktif salon | `fittrack-beta-010-active-gym-{userId}` |
| Son davet | `fittrack-beta-010-last-invite-{userId}-{gymId}` |
| Silme onayı | `fittrack-deletion-acks:{userId}:{gymId}` |
| Statik web cache | `fittrack-v0119`; service worker yalnız aynı origin GET isteklerine müdahale eder |
| Native tercihler | `CapWebViewSettings`: `serverBasePath`, `lastBinaryVersionCode`, `lastBinaryVersionName` |

Sekiz eski durum anahtarı da destekleniyor: `fittrack-beta-09-state` ile
`fittrack-beta-04-state` arası ve `fittrack-v4-state`, `fittrack-v3-state`.
Şema numarası veya sürüm artırıldığı için bu anahtarlar yeniden adlandırılmamalıdır.

Aktif antrenman `programSnapshot`, `syncId`, loglar, gün/set/hareket konumu,
dinlenme ve duraklama bilgisi taşır. `closedWorkoutIds` kapanmış antrenmanın geri
gelmesini; `deletedHistoryIds` silinen geçmişin tekrar görünmesini engelleyen
mevcut kayıtlar arasındadır. Tarihçe sınırı 200; üye içi antrenör geçmişi 100 ve
yerel mesaj listesi 500 sınırı korunmuştur. Bunlar yeni kapasite taahhüdü değildir.

Auth istemcisinde `persistSession`, `autoRefreshToken`, `detectSessionInUrl`
açıktır ve açıkça tanımlanmış storage key vardır. Özel güvenli native saklama
adaptörü yapılandırılmamış; mevcut oturum tarayıcı saklamasına dayanır. A adımı
bunu değiştirmez veya tüm kimlik güvenliğini tamamlanmış saymaz. B'de yalnız paket
ve imzayı korumak yetmez: WebView origin, profil/saklama alanı, tüm yukarıdaki
kayıtlar ve geçerli oturum gerçek yükseltmede doğrulanmalıdır. Güvenli saklamaya
geçiş gerekiyorsa mevcut token'ı kaybetmeyen ayrı, testli taşıma olarak ele alınır.
Oturum/parola değerleri rapora veya test verisine alınmadı.

## 5 Testler ve kanıtlar

| Kontrol | Sonuç | Sınır |
| --- | --- | --- |
| Kaynak hash ve fark denetimi | Geçti | Test sonuçları yeniden üretildi; ürün dosyaları değişmedi |
| Mevcut regresyonlar | 15/15 grup geçti | VM, DOM modeli, statik kaynak ve PGlite |
| Yeni taşıma tabanı | 25/25; toplam 16. grup | Sahte native servisler, bellek içi localStorage |
| APK incelemesi | V2 kriptografik imza/digest, beklenen sertifika, 22 web dosyası, DEX iç bütünlüğü, CRC ve hizalama geçti | Android paket yöneticisi/apksigner veya gerçek cihaz değildir; bu turda v1 yeniden doğrulanmadı |
| JKS kullanılabilirliği | Beklenen sertifika ve özel anahtarla rastgele mesaj imzalama/doğrulama geçti | APK imzalanmadı; hiçbir özel anahtar/parola çıktılanmadı |
| Paket sır taraması | Paketleyicideki seçili dosya/token/özel anahtar örüntüleri uygulanır | Tam güvenlik denetimi veya her sırrın bulunacağı garantisi değil |

Yeni kontroller hesap ve salon değiştirme, reload, taslak, eski veri sahipliği,
silme kayıtları, kuyruk revision'ı, Auth storage ayarları, native paylaşım,
kesin alarm reddi/planı, geri dinleyicisi, deep link kaydı ve manifest kapsamındadır.
Normalizasyonun boş alanlara varsayılan eklemesi ve kayıt zamanını ilerletmesi
mevcut davranıştır. Yeni testlerin ilk çalışmasındaki üç ham-eşitlik beklentisi
bu nedenle düzeltildi; uygulama kodu değiştirilmedi. Son koşuda başarısız test yok.
İlk geliştirme koşusu `test-results/preflight-0120/development-test-run-01.json`
içinde saklandı.

Güncel kanıtlar:

- `test-results/suites.json` ve grup logları.
- `test-results/migration-baseline-0120.json`.
- `test-results/preflight-0120/inventory.json`.
- `test-results/preflight-0120/apk/apk-inspection.json`.
- `test-results/preflight-0120/signing-key-check.json`.

Paketlenen ZIP'in boş klasörde temiz kurulumu ve tekrar test sonucu ayrıca
`FITTRACK_0120A_TESLIM_KANITI.json` dosyasında ZIP hashine bağlanır. Bu kontrol,
Android APK'yı yeniden derlemek anlamına gelmez.

Çalıştırılmayanlar: gerçek tarayıcı render/kaydırma, S23 kurulumu ve klavyesi,
iki fiziksel cihaz/çift offline, canlı Auth/SMTP/Realtime, uzak CI ve yeni APK
derlemesi. Mevcut tarihsel Playwright dosyaları güncel `npm test` kapısına dahil
değildir. Önceki tarayıcı erişim reddi başka yöntemle aşılmaya çalışılmadı.

Bağımlılık kurulumu `--ignore-scripts --offline` ile kilitli npm önbelleğinden
yapılabilir. Bu yeni bağımlılık sürümü veya güncel zafiyet veritabanı taraması
değildir. Canlı dependency/advisor taraması yapılmadı; güvenlik kabulü olarak
işaretlenmez. Node 24.19.0, Python 3.12.14 ve Java 17.0.20 yerelde doğrulandı.
`adb`, `gradle` PATH'te ve eski `.build-tools` önbelleği çalışma ağacında yok;
bu A testlerini engellemez. B başlamadan Android SDK/Gradle/Capacitor uyumlu
derleme araçlarına erişim sağlanıp sürümleri kilitlenmelidir.

## 6 Devam ve geri alma

**B için önerilen en küçük kapsam:** ayrı standart Gradle/Capacitor iskeletinde
aynı 22 web dosyasını çalıştır; paket kimliği, HTTPS localhost origin, dört eklenti,
özel geri köprüsü, deep link, izinler, ikon/splash ve cache dosya paylaşımını
taşı. Web UI, Supabase şeması, program modeli, temalar ve GIF kapsamını değiştirme.
Özgün Smali ağacını kaynak kökeni arşivi olarak koru; üstüne Gradle üretme.
Eski Smali'ye bağımlı statik testleri yeni kaynak/çıktıdaki karşılıklarına uyarlarken
VM veri testlerini ve 25 hazırlık sözleşmesini koru. Bağımlılıkları belirlemeden
geniş framework yükseltmesine veya tüm projeyi yeniden yazmaya başlama.

B kabulü: temiz kaynak derlemesi; orijinal anahtar, artan versionCode; 0.11.9
üzerine **uygulamayı kaldırmadan** güncelleme; hesap, salon, tema, geçmiş, kuyruk,
taslak ve aktif snapshot korunması; gerçek klavye, geri, paylaşım ve bildirim.
Özgün native npm sürümleri belirsiz olduğundan sürüm seçimi uyumluluk denemesinde
yapılacak. C adımı temiz uzak CI çalıştırmasıdır; mevcut workflow dosyasının
bulunması C'nin tamamlandığı anlamına gelmez. Eski workflow'da artefakt adı hâlâ
0.11.6 etiketi taşır; C'de güncel kimlikle düzeltilmelidir.

Antrenör paneli 0.12.1'de; ilk sunucu rol/MFA erişimi ve sonra panel kabuğu
şeklinde ayrı kabul edilir. Üye aynı hesabıyla antrenman yapmaya devam eder.
İmzalı yeni beta Kapı 0 kapanmadan yayımlanmaz.

Bu A teslimini geri almak için yalnız eklenen test/betik/belgeler geri alınır,
`scripts/test.cjs` eski 15 gruplu listeye döner. Ürün ve veritabanı geri alma
işlemi yoktur; hiçbir kullanıcı verisi silinmez. Özgün 0.11.9 ZIP ve APK korunur.

## 7 Berk için açık telefon kabulü

1. 0.11.9 eski sürüm üzerine kurulmuş olmalı; giriş, tema, programlar ve geçmiş durmalı.
2. Açık **Nasıl yapılır?** ve uzun antrenör notunun üzerinden kaydırınca kilo/tekrar
   alanına ulaşılmalı. Açıklama tek ana kaydırıcıda, varsayılan açık kalmalı.
3. Klavye ve büyük yazı ayarında kilo/tekrar girip set tamamlanabilmeli; yalnız
   tamamlama düğmesi sabit olmalı.
4. Geri → **Hayır**, antrenmanı ve girilmiş değerleri korumalı. Hareket detayından
   geri, aynı program incelemesine dönmeli.
5. Uygulamayı kapatıp açınca yarım antrenman korunmalı; telefon ayarlarındaki
   **veriyi sil** veya uygulamayı kaldır işlemi yapılmamalı.
6. Ayrı test hesaplarıyla normal şifreli giriş, kodlu kayıt doğrulaması ve yalnız
   kullanıcının başlattığı şifre kurtarma denenmeli. Canlı e-posta kabulü bekliyor.

Bu kontrollerin sonucu bu sohbette henüz bildirilmedi; geçti sayılmadı.

### Tekrar çalıştırma

Kaynak kökünde:

```sh
npm ci --ignore-scripts --offline
npm test
python3 scripts/preflight_0120.py --source-zip /path/original-0.11.9-Source.zip --apk /path/original-0.11.9.apk --output /path/new-inventory.json
FITTRACK_APK=/path/original-0.11.9.apk FITTRACK_AUDIT_OUTPUT=/path/apk-audit python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-0.12.0A-Hazirlik-Source.zip
```

`--offline` için npm önbelleği gerekir; yoksa izinli ağda aynı kilitle
`npm ci --ignore-scripts` kullanılır. APK denetimi için `tests/requirements-apk.txt`
bağımlılığı gerekir. Anahtar kontrolü isteğe bağlı olarak mevcut dört özel
`FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`,
`FITTRACK_KEY_PASSWORD` ortam değişkeniyle
`java scripts/VerifySigningKey0120.java` komutudur; değerleri komut satırına,
kaynak ZIP'e, rapora veya sohbete yazılmamalıdır. `KeyGen.lnk` çalıştırılmadı ve
geliştirme paketine eklenmedi.

### Teknik kaynaklar

Kaynak kodu ve 0.11.9 devir raporu mevcut uygulama için esas alındı.
Hostname ve şema ayarlarının anlamı [Capacitor yapılandırma belgesinde](https://capacitorjs.com/docs/config),
Auth storage ve oturum seçenekleri [Supabase istemci başlatma belgesinde](https://supabase.com/docs/reference/javascript/initializing)
kontrol edildi. Bu bağlantılar eski native bağımlılık sürümünü kanıtlamaz veya
mevcut kurulumda yeni SDK kullanıldığı anlamına gelmez.
