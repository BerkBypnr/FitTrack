# FitTrack — Alper ChatGPT devir raporu — v0.11.9

10 Eylül 2026. **İmzalı kaydırma hotfix'i tamamlandı; gerçek telefon kabul testi bekler.**
Bu raporu, kaynak ZIP'i ve APK'yı birlikte devralın. Önceki sürümün kapsamlı geçmişi
kaynak paketindeki docs/TARIHSEL_DEVIR_0.11.8.md içindedir.

## Sürüm ve amaç

| Alan | Değer |
|---|---|
| Önceki sürüm | 0.11.8 / versionCode 25 |
| Yeni sürüm | 0.11.9 / versionCode 26 |
| Paket adı | com.fittracklabs.mobile |
| Yerel şema | 14 — değişmedi |
| Minimum / hedef API | 24 / 36 |
| Auth deep link | com.fittracklabs.mobile://auth-callback |
| İmza | Orijinal beta anahtarı; önceki APK ile aynı sertifika |

Kullanıcı 0.11.8'de aktif antrenmanın açık Nasıl yapılır? bölümünün üzerinden
parmağını kaydırdığında ana içeriğin aşağı gitmediğini bildirdi. Bu sürüm yalnız bu
kaydırma sorununu ve gerekli sürüm/teslim metadata'sını düzeltir.

## Sorunun nedeni ve yapılan bütün değişiklikler

member-ui.css içindeki .workout-instruction-scroll, max-height:min(38dvh,270px),
overflow-y:auto ve overscroll-behavior-y:contain ile ayrı bir kaydırma alanıydı.
Son kural kaydırmanın bu alandan ana kaydırıcıya geçmesini engelliyordu. Önceki DOM
testleri açıklamanın açık ve kilo kartının içerikte olduğunu kontrol ediyordu;
gerçek dokunmatik kaydırma zincirini çalıştırmadıkları için bu sorunu yakalayamadılar.

1. Açıklamadaki max-height, overflow-y:auto ve overscroll-behavior-y:contain kaldırıldı.
   Metin doğal yüksekliğinde açılır. Tek kullanıcı kaydırıcısı member-player-scroll
   olur; parmak açıklamanın üzerindeyken de ana içerik kayabilir.
2. Dış .workout-instructions kutusundaki overflow:hidden da kaldırıldı. Yuvarlatılmış
   kenar, sınır çizgisi, renk ve boşluklar korundu; ayrı bir içerik kaydırıcısı kalmadı.
3. app.js içinde açıklama ve aynı stili kullanan antrenör notundaki tabindex=0
   kaldırıldı; bağımsız kaydırıcı olmadıkları için fazladan klavye durakları gerekmiyor.
   role=region ve aria-label etiketleri korunur. Antrenör notu da ana içerikle kayar.
4. Uygulama, CSS yorum sürümü, önbellek, manifest, npm, Android ve APK denetim
   beklentileri 0.11.9 / 26 olarak eşitlendi. Sürüm testlerinin beklentisi yükseltildi.
5. Yeni README ve BETA_0.11.9_NOTLARI.md yazıldı; native provenance güncellendi.
   0.11.8 test kanıtları test-results/history-0118 altına taşındı. Eski devir raporu
   docs/TARIHSEL_DEVIR_0.11.8.md olarak kaynak içine alındı.

Nasıl yapılır? hâlâ varsayılan açık başlar; başlığa kısa dokunarak kapanıp açılabilir.
Kilo/tekrar kartı açıklamaların ardından ana içeriğin sonundadır. Yalnız Seti tamamla /
Seti güncelle düğmesi alt alanda sabittir. Uzun açıklama ayrı küçük bir pencereye
sığdırılmaz; gerekirse kullanıcı başlığı kapatıp kilo alanına daha çabuk ulaşabilir.

0.11.8'deki iptal uyarısında Hayır ile doğrudan antrenmana dönüş ve hareket
anlatımından program incelemesine geri dönüş korunur. Altı tema, logo/ikon/splash,
ana sayfa, ilerleme grafikleri/rozetler, antrenör UI ve veri işlevleri değiştirilmedi.

## Değiştirilen önemli dosyalar

| Dosya | Değişiklik |
|---|---|
| member-ui.css | İç kaydırma/yükseklik kısıtları ve dış kutunun overflow kuralı kaldırıldı |
| app.js | İki açıklama bölgesinin tabindex'i kaldırıldı; VERSION 0.11.9 |
| config.js, index.html, sw.js, manifest.webmanifest | Sürüm ve cache anahtarları 0.11.9 / fittrack-v0119 |
| package.json, package-lock.json | Sürüm 0.11.9; bağımlılıklar değişmedi |
| android/apktool.yml | versionName 0.11.9, versionCode 26, APK adı |
| scripts/build_android.py | Yeni çıktı adları; derleme yöntemi ve sabit araçlar aynı |
| tests/apk_inspect.py ve ilgili eski testler | Sürüm/cache beklentileri; işlevsel senaryolar aynı |
| README.md, tests/README.md, BETA_0.11.9_NOTLARI.md | Yeni kaydırma kararı, derleme ve test sınırları |
| docs/NATIVE_PROVENANCE.json | Güncel APK hashleri ve native kaynak kökeni |
| test-results/ | Güncel 15 test grubunun ve imzalı APK'nın kanıtları |

## Testler, geçenler ve başarısızlıklar

- Mevcut kilitli bağımlılık kurulumu yeniden kullanıldı; Node 24.19.0 ile npm test
  **15/15 grup geçti**. Üye/rozet grubu 30/30, gezinme grubu 16/16.
- Mevcut testler açık açıklama, kilo kartının ana içeriğin son çocuğu olması, sabit
  tamamla alanı, iptalden dönüş, program detayına dönüş, Auth test çiftleri, program
  güvenliği ve PGlite regresyonlarını içerir. CSS ayrıştırma kontrolü de geçti.
- Kaynaktan geçici temiz Android ağacına derleme ve orijinal JKS ile imzalama başarılı.
  Android apksig v1=true, v2=true; beklenen sertifika doğrulandı.
- APK incelemesi geçti: 0.11.9 / 26; 22 web dosyası kaynakla aynı. 192 native görsel,
  190 kaynak XML ve 10 DEX 0.11.8 ile aynı. İzinler, DEX bütünlüğü, ZIP CRC ve hizalama geçti.
- Nihai kaynak ZIP'indeki 22 web dosyası ayrıca teslim APK'sıyla byte-byte karşılaştırıldı.
  Kaynak paketleme anahtar dosyalarını, özel anahtar ve seçili sır örüntülerini reddeder.
- Son uygulama testlerinde veya derlemede başarısızlık yok. Bu, tüm telefon
  davranışlarının otomatik test edildiği anlamına gelmez.

**Çalıştırılmayanlar:** gerçek Samsung S23/Android 16 kurulumu ve dokunmatik kaydırma,
gerçek tarayıcı render ve ekran klavyesi. Önceki yerel tarayıcı erişim reddi başka
yoldan aşılmadı. Bu küçük CSS düzeltmesi için yeni dokunmatik test yazılmadı;
VM/DOM sonucu kaydırma zincirinin çalıştırıldığı şeklinde sunulmamalıdır. 0.11.9'da
yeni npm ci, ZIP'ten ikinci bağımsız derleme ve uzak GitHub CI çalıştırılmadı.
Canlı SMTP/Auth, gerçek iki cihaz ve offline uçtan uca testleri yapılmadı.

Güncel kanıtlar test-results/suites.json, member-ui-0117.json, navigation-0118.json,
apk-inspection.json ve android-build-sign-0119.log içindedir. Grup adındaki eski
sürüm sayısı o grubun ilk eklendiği sürümdür; testler güncel kaynakla çalıştırıldı.
history-0118 ve history-0117 altındaki sonuçlar önceki sürümlere aittir.

## Android, imza ve kaynak kökeni

Native kaynak, Berk'in orijinal 0.11.3 APK'sından elde edilmiş Smali/XML/görsellerdir;
özgün Gradle/Java/Kotlin projesi değildir. Alper'in iptal edilen validation projesi
bu zincire dahil edilmedi. 0.11.8 kaynak ZIP'i SHA-256 ile doğrulanıp ayrı çalışma
klasörüne açıldı. Native uygulama mantığı değiştirilmedi.

Araçlar Apktool 2.12.1, Android apksig 2.3.0 ve ECJ 3.42.0; sabit URL/hashler kaynakta
bulunur. Java 17+, Python 3.10+, testler için Node 22+ gerekir. İlk indirme internet
ister; bu sürümde doğrulanmış araç önbelleği kullanıldı.

```sh
npm ci --ignore-scripts
npm test
python3 scripts/build_android.py --sign
FITTRACK_APK=/path/FitTrack-Android-v0.11.9-beta.apk FITTRACK_PREVIOUS_APK=/path/FitTrack-Android-v0.11.8-beta.apk python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-Beta-0.11.9-Source.zip
```

İmza öncesinde FITTRACK_KEYSTORE, FITTRACK_KEY_ALIAS, FITTRACK_STORE_PASSWORD ve
FITTRACK_KEY_PASSWORD ortam değişkenleri özel şekilde tanımlanmalıdır. Kullanıcının
sağladığı orijinal fittrack-beta-0102.jks kullanıldı; yeni anahtar üretilmedi.
Anahtar/parola kaynak ZIP'e, APK'ya, Git'e veya bu rapora eklenmedi. ZIP'te gerçek
.env, service_role, node_modules, APK veya araç/derleme önbelleği bulunmaz.
Aynı paket ve sertifika, yükselen versionCode ile 0.11.8 üzerine güncelleme için
uygundur; fiziksel kurulum aşağıdaki listede bekler.

## Supabase, veritabanı, migration, RLS ve Auth

Bu sürümde bunların hiçbirine değişiklik yapılmadı; yerel şema 14 kalır.
Sunucuya veri/ayar yazılmadı. Migration'lar kaynakta korunur; bu UI hotfix'i için
eski migration'ları yeniden çalıştırmayın. Normal giriş e-posta + şifre, ilk kayıt
iki şifre eşleşmesi ve e-posta koduyla adres doğrulamadır. Her girişte kod istenmez.
Detaylı önceki kurulum kararları tarihsel 0.11.8 devir raporundadır.

## Telefon kontrolü — Berk/Alper, Samsung S23 / Android 16

1. APK'yı mevcut orijinal 0.11.8 üzerine kur; sürüm 0.11.9 olsun. Giriş/veri/tema korunsun.
2. Aktif antrenmanda açık Nasıl yapılır? metninin üzerine parmağını koyup yukarı ve
   aşağı kaydır. Kutunun başında, ortasında ve sonunda dene; ana içerik kilo/tekrar
   kartına kadar kaymalı. Kısa ve uzun açıklamayı kontrol et.
3. Başlığa kısa dokunarak kapat/aç. Yeni sette varsayılan açık olsun. Alt tamamla
   düğmesi kaydırırken sabit kalsın. Varsa uzun antrenör notunda da kaydırmayı dene.
4. Kilo/tekrar alanına ulaş, klavyeyi aç/kapat, değer gir ve seti tamamla. Büyük yazı
   ayarıyla erişimi kontrol et.
5. Kısa regresyon: geri → Hayır doğrudan antrenmana dönmeli; İncele → hareket → geri
   aynı program incelemesine dönmeli. Seçili temanın renkleri korunmalı.

## Kalan işler, riskler ve sonraki öncelik

Tamamlanan iş mevcut aktif antrenmandaki kaydırma hotfix'idir. Yeniden üretilmiş bir
otomatik test hatası yok; gerçek dokunmatik kaydırma/klavye ve cihaz güncellemesi
henüz doğrulanmadı. Uzun açıklama kilo kartını sayfada daha aşağı taşır; kullanıcı
başlığı kapatabilir. Sabit tamamla düğmesi bu uzunluktan bağımsızdır.

Sonraki özellik güncellemesi antrenör arayüzüdür; kullanıcı kapsamı ayrıca belirler.
Yeni 3D, PT takvimi, tema veya ilerleme tasarımı eklenmedi. Önceden tamamlananları
tekrar sıfırdan geliştirme olarak planlamayın. Mevcut rozetler geçmişten hesaplanır;
200 geçmiş kaydı sınırı ve geçmiş silme/düzeltmesinin rozet etkisi aynıdır.

**Yeni bağlayıcı karar:** Nasıl yapılır? ve antrenör açıklaması ana antrenman
kaydırıcısının parçasıdır. 0.11.8 raporundaki ayrı, yüksekliği sınırlı açıklama
kaydırıcısı kararı artık geçersizdir; o CSS kısıtlarını geri getirmeyin. Açıklama açık
başlar, kilo kartı içerikte en sonda, yalnız tamamla düğmesi sabit kalır.

## Teslimler ve SHA-256

- FitTrack-Android-v0.11.9-beta.apk — 15.746.926 bayt.
- FitTrack-Beta-0.11.9-Source.zip — 6.207 dosya; 22.072.621 bayt.
- FITTRACK_ALPER_CHATGPT_DEVIR_v0.11.9.md — bu rapor.

APK SHA-256:
`4035b4f07308f85831d2e6b02db7f104d0d46a949c8f45da09940d8fd9f46e23`

Kaynak ZIP SHA-256:
`7bf6883635206fcd18a40f970a60280055a725159fffbbe646fafd71969745a4`

İmzasız derleme SHA-256:
`5d93458602241d4d6246c3124a1af83227b59956dd9a7d27e089f00530b6b85d`

Sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Taban 0.11.8 APK:
`d44da775e7a6fca6c5c104df7330695ffe422b001b6fe729d77138c8ffa57f4b`

Taban 0.11.8 kaynak ZIP:
`85e3742f667bc0e2363e9140a7bfc98977b2b857ec617314f9fa277e1b99b77a`

Berk bu üç güncel dosyayı Alper'e birlikte iletsin. Alper önce bu raporu, gerektiğinde
kaynak içindeki tarihsel 0.11.8 raporunu okuyarak devam etsin. İmza anahtarı ve kullanım
bilgisi teslim paketlerinden ayrı, gerektiğinde özel olarak aktarılmalıdır.
