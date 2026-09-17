# FITTRACK — ALPER / CHATGPT DEVİR RAPORU — v0.12.0

11 Eylül 2026. Bu rapor, kaynak ZIP, imzalı APK ve ayrı telefon test listesi birlikte
devralınmalıdır. Önceki sohbet olmadan devam edilebilmesi için kararlar, kaynak kökeni,
yapılan iş ve açık kabuller aşağıdadır.

**İmzalı 0.12.0 beta APK ve standart Android kaynakları hazır.** Yeni antrenör mobil
arayüzü ve ortak tema revizyonu uygulandı. Yerel test ve temiz kaynaktan tekrar
üretim geçti. **0.12.0'ın fiziksel telefon, gerçek render ve canlı iki hesap kabulü
henüz yapılmadı; yol haritasındaki uzak CI kapısı da kapanmış değildir.**

## 1. Kullanıcının son kararı ve sürüm kimliği

Berk, “11.09 sorunsuz çalışıyor telefonda test ettim” diyerek 0.11.9'u kabul etti;
0.12.0'a geçişi, gönderdiği 9 Eylül antrenör UI referansına göre tema revizyonunu
ve gerekli Android araçlarının indirilmesini onayladı. 0.11.9 kabulünü yeniden
istemeyin. Bu kabul yeni 0.12.0'ın telefonda test edildiği anlamına gelmez.

Her sonraki sürümde **kurulabilir imzalı APK + tam kaynak ZIP + eksiksiz Alper/GPT
devir raporu + yapılacak test listesi** birlikte verilecek. Alper kendi GPT'sine
bu gerçek dosyaları aktaracak; yalnız dosya yolları veya kısa sohbet özeti yeterli
değildir. Alper'e otomatik e-posta/mesaj gönderilmedi.

| Alan | Değer |
|---|---|
| Başlangıç | Berk'in özgün 0.11.9 / versionCode 26 kaynak ZIP'i |
| Teslim | FitTrack Beta 0.12.0 / versionCode 27 |
| Paket | `com.fittracklabs.mobile` |
| Min / compile / target API | 24 / 36 / 36 |
| Yerel veri şeması | 14; değişmedi |
| WebView origin | `https://localhost`; korundu |
| Auth deep link | `com.fittracklabs.mobile://auth-callback`; korundu |
| Native kaynak | Yeni standart Gradle/Capacitor projesi; Java MainActivity |
| Beta imzası | Önceki orijinal sertifika; yeni anahtar üretilmedi |
| Build kimliği | `fittrack-0120-4732d2116ad2` |
| Git commit / PR | Yok; kullanıcı ZIP'inden yerel çalışma, bağlı Git deposu yok |
| Sunucu migration / deployment | Yok; bu sürüm için SQL uygulanmaz |
| Son 0.12.0 telefon kabulü | Bekliyor |

Öncelik sırası: bu sohbetin son kullanıcı kararı → bu güncel devir ve gerçek kaynak
kanıtları → özgün Rev6 yol haritası → UI ZIP'indeki metin kararları/tema standardı →
tarihsel devirler. Gönderilen `.md` uzantılı yol haritasının içeriği aslında DOCX'ti;
özgün dosya `docs/references/YOL_HARITASI_REV6_ORIJINAL.docx`, okunabilir metni aynı
dizindeki `YOL_HARITASI_REV6_METIN.txt` olarak korunur.

0.11.7 devir dosyası **rapor biçimi örneğidir**. Oradaki kapalı başlayan/içinde kayan
hareket açıklaması gibi eski davranışlar uygulanmaz. A ve “UI hazırlığı” raporları
önceki ara durumlardır; yeni sürüm yok/bekliyor ifadeleri o aşamaya aittir.

## 2. Tamamlanan ürün değişiklikleri

### Ortak temalar

Altı tema aynı kayıt anahtarlarıyla üye/antrenörde ortak kalır. Yeni ekranlar zemin,
yüzey ve vurgu tokenlarını kullanır. Başarı/uyarı/bilgi durumlarının renkleri tema
vurgusundan ayrılır; bütün kartlar vurgu rengine boyanmaz.

| Tema | Zemin | Yüzey | Vurgu | Güçlü vurgu |
|---|---|---|---|---|
| Volt Discipline | `#050706` | `#0E1511` | `#69B482` | `#4F9A68` |
| Crimson Graphite | `#111214` | `#202225` | `#E56A7F` | `#A8253E` |
| Plum Night | `#160F15` | `#281923` | `#F0AEC2` | `#D889A4` |
| Sage Motion | `#F2F6F3` | `#FFFFFF` | `#18765C` | `#0D5F4A` |
| Redline Editorial | `#F4F0E8` | `#FFFDF8` | `#D9362B` | `#B92520` |
| Rosewood Strength | `#F7F1EE` | `#FFFAF7` | `#8E2F50` | `#76213F` |

Redline'ın eski turuncu geçişi kaldırıldı; kırmızı `#D9362B → #B92520`, yumuşak
seçili yüzey `#F8DDD8`, vurgu üzeri metin beyazdır. Tema seçicisindeki Crimson/Plum
yüzey örnekleri gerçek tokenlarla eşitlendi. Ekranların piksel/render kabulü yapılmadı.

### Antrenör ana sayfası ve Üyeler

- Antrenör/yönetici için dört alt menü: **Bugün / Üyeler / Programlar / Mesajlar**.
  Profil üst avatardan açılır. Üyenin mevcut Ana Sayfa/Antrenman/İlerleme/Profil
  menüsü korunur. Bu mobil düzen ayrı masaüstü web panelinin tamamlandığı anlamına gelmez.
- Bugün kısa özet: gerçek üye sayısı, bugünkü kayıt sayısı, programsız üyeler,
  program/üye kısayolları, en fazla üç öncelikli üye, küçük mesaj özeti ve son üç kayıt.
  Bugünkü sayı yarım kayıtları da kapsar; salona giriş veya tamamlanan seans diye sunulmaz.
- Öncelikli üyeler nedenleriyle gösterilir. Tüm öncelikleri gör aramayı temizleyip
  tam öncelikli listeyi açar. Gerçek antrenör listesinde kendisi/`isSelf` çıkarılır.
- Üyeler araması Türkçe büyük/küçük harf dönüşümünü kullanır. Filtreler **Tümü /
  Öncelikli / Programsız**. Referans notlarındaki “İlgilen” aynı kavramın eski adıdır;
  bu sürümde ana sayfa ile tutarlı “Öncelikli” seçildi.
- Kartta büyük baş harfli avatar, isim, durum, gerçek program özeti ve iki bağlamsal
  işlem vardır. Yeni fotoğraf yükleme veya örnek insan fotoğrafı eklenmedi.
- “Program ata” mevcut üye atama formunu açar; karta dokunmak atama yazmaz.

Öncelik kuralı yalnız bu cihazda görülen verilerle hesaplanır:

| Sinyal | Puan / gösterilen anlam |
|---|---|
| Bu antrenöre gelen okunmamış mesaj | +40 |
| Hiç ham program ataması yok | +30; programsız |
| Son görünür antrenman kaydından en az 7 gün geçmiş | +20; yeni kayıt görünmüyor |
| Hiç kayıt yok ve üyelikten en az 7 gün geçmiş | +20; henüz kayıt görünmüyor |

Puanlar toplanır; eşitlikte Türkçe isim sırası kullanılır. Yarım/tam kayıt aktivite
sayılır. Gelecek/eksik tarih gecikme üretmez. Atama var ama program henüz yüklenmediyse
üye programsız sayılmaz; “Program bilgisi bekleniyor” görünür. 7 gün ve puanlar
uygulama kararıdır, sunucuda tanımlı yoklama veya kesin iş kuralı değildir.

Referanstaki salona gelmeme, programı bitirme, yeni program isteği, Şimdi/Bugün/Bu hafta
iş zamanları için ayrı gerçek olay verisi mevcut değil. Bu olaylar ve örnek 6/5
sayaçları gerçekmiş gibi eklenmedi. Gelecekte gerçek veri sözleşmesiyle genişletilecek.

### Programlar, detay, atama ve Stüdyo

- Program listesi ad araması ve Tümü/Yayında/Taslak filtreleriyle yeniden düzenlendi.
  Gün/hareket/atanmış üye sayıları gerçek programdan gelir. Arşivler ve hazır
  şablonlar ayrı açılır bölümlerde korunur; taslak kurtarma ve silmeyi geri alma durur.
- Program detayında gün akordeonları, gerçek set/tekrar bilgisi ve Program/Üyeler
  sekmeleri vardır. Üyeden geri dönmek ilgili programın üye listesine döner.
- Yayındaki programın “Üyeye ata” düğmesi aranabilir üye seçicisini açar. Zaten
  atanmış üyeler devre dışıdır. Üye seçimi mevcut formda programı önseçer; **asıl
  atama yalnız formdaki onayla** yapılır. Yayında olmayan program atanamaz.
- Karttaki atama kısayolunun da doğru programa dönmesi sağlandı. Akış kapandığında
  eski program dönüş durumu temizlenir; daha sonra ana sayfadan açılan üye yanlış
  programa dönmez. Bu hataya davranış testi eklendi.
- Stüdyo dört mevcut adımı korur: **Bilgiler / Günler / Hareketler / Kontrol**.
  Yüzey, boşluk, başlık ve adım göstergeleri yeni stile uyarlandı. Taslak koruma,
  günler, geçici hareket seçimi/Uygula/Vazgeç, undo, kopya, şablon, arşiv ve yayın
  işlevlerinin veri sözleşmesi değiştirilmedi. Değişmiş taslakla menüden çıkış korunur.

Bu sürüm toplu atama, haftalık dönem planlama veya yeni değişmez program sürümleri
altyapısı eklemez. Mevcut `rootId/revision` alanları tam 0.12.5 sürüm taşıma sistemi
olarak anlatılmamalıdır. Gelecek web panelinin yeni sunucu yetkileri eklenmedi.

### Mesajlar

Gelen kutusu üye adı **ve konuşma metni** araması, Tümü/Okunmamış filtreleri,
yeni konuşma için üye seçimi ve alt menüyle yenilendi. Üye adı araması Türkçedir.
Sohbette üye bilgisi açılır alanı gerçek programlar/son kayıt/öncelik bilgisini
verir. Açıp kapatmak gönderilmemiş mesaj metnini silmez. Mesaj gönderme, okundu,
kuyruk ve gerçek cloud altyapısı mevcut uygulamadan devam eder. Dosya eki, sustur,
çevrimiçi varlığı veya sahte son görülme eklenmedi.

## 3. Korunan üye ve veri davranışları

`member-ui.css`, `cloud.js`, mevcut `assets/`, `vendor/` ve `supabase/` içindeki
**31 dosya** özgün 0.11.9 ile SHA-256 karşılaştırmasında birebir korundu. Kanıt:
`test-results/preserved-0119-files.json`. `app.js` ve ortak `styles.css` değiştiği
için ortak gezinme/tema etkileri ayrıca yerel regresyonlardan geçti.

- Nasıl yapılır? **açık başlar ve ana içerikle kayar**. İç kaydırıcı/yükseklik
  kısıtı geri eklenmedi. Kilo/tekrar kartı ana içerikte en sonda, yalnız tamamla /
  güncelle düğmesi sabittir. Antrenör notu da aynı ana kaydırıcıdadır.
- İptal → Hayır doğrudan oturuma dönüş; değer/kaydırma/timer korunması; program
  incelemesinden doğru hareket anlatımına ve geri dönüş önceki kararıyla kalır.
- Yarım oturum/snapshot, kaldırılmış atamayla oturumu bitirme veya iptal, tekil
  geçmiş kayıtları, offline kuyruk ve hesap/salon ayrımı yeniden yazılmadı.
- İlerleme grafik ve filtreleri, 7 rozetin mevcut geçmişten hesabı korunur.
  Geçmişin 200 kayıt sınırı ve silme/düzeltmenin rozetleri etkilemesi sürer;
  sunucuda ömür boyu kalıcı rozet sicili eklenmedi.
- Yeni GIF kataloğu/3D üretimi yok. Mevcut görseller arasında durağan olanlar vardır.

Depolama sözleşmesi:

| Kayıt | Durum |
|---|---|
| `fittrack-beta-010-state` | Genel yerel durum anahtarı korunur |
| `fittrack-beta-010-user-<userId>` | Hesap kaydı korunur |
| Hesap anahtarının `-gym-<gymId>` uzantısı | Salon bazlı durum korunur |
| `fittrack-beta-010-queue-…` | Mevcut kullanıcı/salon scoped kuyruk korunur |
| device-id / active-gym / last-invite anahtarları | `cloud.js` aynıdır; kapsam ve kimlik kuralları korunur |
| Auth yerel oturumu | Aynı origin; token veya storage anahtarı taşınmadı |
| Yerel şema / yedek formatı | Şema 14 ve mevcut JSON yedek sözleşmesi korunur |

Aynı paket/origin ve kaynak testleri, telefonun gerçek WebView veri dizininde
başarılı yükseltmenin yerine geçmez. K01–K03 kabulü bu nedenle özellikle gereklidir.

## 4. Standart native geçişi ve köken

Özgün 0.11.9'un `android/` dizini, orijinal 0.11.3 APK'dan türetilmiş Smali/XML
kaynağıydı. **Artık `android/` yeni gerçek Gradle/Capacitor projesidir.** Eski ağaç
`legacy/android-0.11.9/` olarak köken arşivinde durur ve build girdisi değildir.
İptal edilmiş Alper validation projesi kullanılmadı. Eski APK'nın hazır DEX'i
kopyalanmadı; yeni bağımlılıklar ve Java kaynağı derlendi.

| Native konu | Uygulama |
|---|---|
| MainActivity | `android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java` |
| Geri | AndroidX dispatcher → `FitTrackNativeBack()` → işlenmezse uygulamayı arka plana alma |
| Çift geri önlemi | Callback sürerken `backPending`; App eklentisinin varsayılan back işleyicisi config'te kapalı |
| Origin | Config'te açıkça `androidScheme:https`, `hostname:localhost` |
| Sistem/klavye payları | Capacitor SystemBars CSS inset değişkenleri; mevcut `env()` yedeği; `adjustResize` |
| Güvenlik ayarları | Release debuggable false, WebView debugging false, allowBackup false, cleartext false |
| Auth | Tek örnek MainActivity ve aynı özel URL dönüşü |
| Dosya paylaşımı | Mevcut `${applicationId}.fileprovider`, exported false, cache path |
| Bildirim sağlayıcısı | Yeni plugin kendi `.localnotifications.fileprovider` kaydını ekler; exported false |
| İzinler | Birleştirilmiş APK izin kümesi 0.11.9 ile aynı |
| İkon/splash | Özgün vector/drawable kaynakları birebir korundu; yeni kaynak kimlikleri farklı olabilir |

Eski native uygulamada cache-first Service Worker yeni web dosyaları yerine
önceki dosyaları açabilirdi. `native-bootstrap.js` native `onPageLoaded` ile
çalışır; böylece eski index/app önbellekten gelse de erişilir. Yalnız aynı origin'in
kök Service Worker kaydını ve `fittrack-` adlı statik cache'leri kaldırır; değişiklik
varsa tekrar yükler. **localStorage, IndexedDB, Auth, antrenman veya kullanıcı
dosyalarını temizlemez.** Hata olursa sonraki açılışta tekrar deneyebilir.
Yeni `app.js` native ortamda Service Worker kaydetmez; normal web sürümü kaydedebilir.
Bu cache değişimi ve ilk offline açılış fiziksel telefon listesinde ayrıca vardır.

Mevcut `nativePlugin()` ve dosya/bildirim/geri yardımcıları korunur; bu çalışma
ilerideki bütün platform adaptörleri veya secure-storage/Keychain tasarımını
bitirmiş sayılmaz. Yeni iOS projesi bu sürümde oluşturulmadı.

Araç seçimi, [Capacitor 8 geçiş belgesindeki](https://capacitorjs.com/docs/updating/8-0)
Android SDK/Gradle gereklilikleriyle ve kurulu paket kaynaklarıyla doğrulandı.
Native Service Worker riski [Capacitor Android sorun giderme belgesinde](https://capacitorjs.com/docs/android/troubleshooting)
de açıklanır. Ortamda SSL doğrulaması kapatılmadı.

## 5. Kaynak haritası ve üretim talimatları

| Yol | Ne için kullanılmalı? |
|---|---|
| `app.js` | Ana durum, üye/antrenör ekranları, gezinme, program/taslak, sohbet/native yardımcıları |
| `styles.css` | Ortak altı tema, antrenör revizyonu ve safe-area tokenları |
| `member-ui.css` | Korunan üye/aktif antrenman düzeni |
| `cloud.js`, `config.js` | Mevcut cloud sözleşmesi ve istemci ayarları; config'te yalnız sürüm değişti |
| `capacitor.config.json` | Android kimlik/origin/back/SystemBars/bildirim ayarları |
| `android/` | Aktif native kaynak, wrapper ve Gradle dosyaları |
| `scripts/stage_web.cjs` | Kökteki 9 dosya + assets/vendor → geçici www |
| `scripts/build_android.py` | Stage → cap sync → clean release → isteğe bağlı imza/doğrulama |
| `scripts/package_source.py` | Temiz kaynak ZIP; sır/anahtar taraması, CRC, çalıştırma izni koruma |
| `scripts/toolchain.json` | Güncel araç sürümleri ve wrapper digest'i |
| `supabase/` | Korunan sunucu kaynakları; yeni deployment talimatı değildir |
| `tests/README.md` | 18 grubun yöntemi ve test sınırları |
| `test-results/clean-source-rebuild/` | Temiz çıkarılan kaynakla ikinci üretim kanıtı |
| `docs/NATIVE_PROVENANCE.json` | Güncel köken, kimlik, APK hashleri ve açık kabuller |
| `.github/workflows/verify.yml` | Node/JDK/Android, test, npm audit, paket/sır taraması ve unsigned APK CI taslağı |
| `legacy/` | Eski Smali/Apktool köken arşivi; güncel build buraya başvurmaz |
| `docs/references/` | UI referans ZIP'i, metin kararları, Rev6 ve önceki devirler |

Kökteki kaynaklar asıldır. `www/` ve `android/app/src/main/assets/public/` doğrudan
elle düzenlenmez; build bunları yeniden yazar. Kaynak React/Vite değildir.
`node_modules`, araç önbelleği, SDK/JDK, APK, JKS veya özel `.env` kaynak ZIP'e girmez.
`gradlew` çalıştırılabilir dosya izni arşivde korunur.

Sabit üretim araçları:

| Araç | Sürüm |
|---|---|
| Node | Yerel testte 24.19.0; package engines >=22 |
| Java | Temurin JDK 21.0.12.1+1; JDK major 21 |
| Gradle | 8.14.3; wrapper distribution SHA-256 doğrulamalı |
| Android Gradle Plugin | 8.13.0 |
| SDK / build-tools | Android 36; AGP derlemede 35.0.0, signer/zipalign 36.0.0 |
| Capacitor core/android/cli | 8.5.1 |
| App / Filesystem | 8.1.1 / 8.1.3 |
| Local Notifications / Share | 8.3.1 / 8.0.1 |
| PGlite / Linkedom | 0.5.8 / 0.18.13 |

Python 3.10+ gerekir. Android SDK'da `platforms;android-36`, `build-tools;35.0.0`,
`build-tools;36.0.0` ve kabul edilmiş SDK lisansları bulunmalı. `JAVA_HOME` JDK21'e,
`ANDROID_HOME` kendi SDK yoluna ayarlanır. İlk kurulum internet gerektirir.

```sh
npm ci --ignore-scripts
npm test
python3 scripts/build_android.py
# Dört özel imza ortam değişkeni hazırlandıktan sonra:
python3 scripts/build_android.py --sign

python3 -m pip install -r tests/requirements-apk.txt
FITTRACK_APK=/path/FitTrack-Android-v0.12.0-beta.apk python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-Beta-0.12.0-Source.zip
```

Betik seçenekleri `--output /path`, isteğe bağlı `--gradle /path/to/gradle`,
`--offline` ve `--sign`. `--offline` yalnız hazır bağımlılıklarla çalışır. Eski
Apktool `--tools` seçeneği artık yok. Varsayılan çıktı `out/`; unsigned APK beta
kurulum dosyası değildir. İmza betiği dört değişken ister:
`FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`,
`FITTRACK_KEY_PASSWORD`. Değerler bu raporda/kaynakta yoktur. Mevcut beta anahtarını
Berk'in özel paylaşımından alın; farklı anahtarla sessizce sürüm üretmeyin.

## 6. Yapılan doğrulamalar ve gerçek sınırları

| Kontrol | Sonuç |
|---|---|
| Güncel kaynakta npm test | **18/18 grup PASS** |
| Temiz çıkarılan arşivde npm ci | Kilit dosyasıyla offline **124 paket** yeniden kuruldu |
| Aynı temiz kaynakta npm test | **18/18 grup PASS** |
| Yeni Gradle temiz release | Başarılı; eski APK/DEX build girdisi değil |
| Temiz çıkarılan kaynakla ikinci Gradle release | Başarılı; aynı doğrulanmış SDK/Maven araç önbelleği kullanıldı |
| İki üretimin karşılaştırması | İmzasız ve imzalı APK'lar ayrı ayrı **birebir aynı SHA-256** |
| İki ağaçtaki build girdileri | **116 dosya aynı**; nihai kaynak paketinde de bu eşitlik denetlenir |
| Resmi apksigner | APK doğrulanır; **v2=true, v3=true**, tek imzalayan, beklenen beta sertifikası |
| v1 durumu | Min API24 için varsayılan doğrulama v1=false raporlar; v1 geçtiği iddia edilmez |
| APK/web kaynakları | **22/22 dosya birebir** |
| APK yapısı | Paket/sürüm/API, ZIP CRC, 1 DEX digest, source/bridge config ve native bootstrap eşleşmesi geçti |
| Önceki APK sözleşmesi | Paket/origin/izinler korunur, versionCode artar; ikon/splash kaynakları aynı |
| Hizalama | Resmi zipalign `-c -P 16 4` ve yerel APK incelemesi geçti |
| Kaynak güvenlik taraması | Anahtar dosyaları, seçili özel anahtar/service_role örüntüleri ve ZIP CRC kontrolü |
| Uzak GitHub CI | **Çalıştırılmadı**; dosyası verildi, bağlı uzak repo yok |
| Bağımlılık güvenlik veritabanı taraması | **Çalıştırılmadı**; kilit/integrity kontrolü açık zafiyet taraması değildir |
| Gerçek tarayıcı/render | **Engelli**: Chrome `socket() failed: Operation not permitted (1)` ile açılmadı |
| Telefon / emülatör | **Çalıştırılmadı** |
| Canlı SMTP/Auth/Realtime, iki hesap/cihaz ve gerçek offline-sync | **Çalıştırılmadı** |

18 grup; önceki sekiz regresyon dosyası, review 50, hotfix 19, Auth 30, PGlite 26,
tema, üye 30, gezinme 16, migration-baseline 25, trainer UI 10 ve yeni release 11
kontrolünü içerir. Grup adlarındaki eski sürümler testin ilk eklendiği sürümdür;
son kapıda güncel kaynak çalışır. VM/Linkedom gerçek renderer değildir. PGlite
PostgreSQL kullanır fakat Auth şeması/roller test için modellenir; Hosted Supabase,
gerçek SMTP veya canlı RLS entegrasyonu gibi sunulmaz.

Temiz tekrar üretim **aday kaynak arşivinden** yapıldı. Son kaynak ZIP'i belgelendirme
ve sonuç dosyalarını ekler; 116 build girdisi aynıdır. Boş uzak makineden bütün
bağımlılıkların tekrar indirilmesi denenmedi. Yerel ikinci derleme, uzak CI kapısı
ile eş tutulmamalıdır. İmzalı APK hash eşitliği `test-results/clean-source-rebuild/result.json`
içindedir; belge/arşiv kendi hashini içeri gömüp döngü oluşturmaz.

Geliştirme sırasında karşılaşılan ve giderilenler:

- Eski native testler Smali yollarını bekledi; yeni Java/Gradle/manifest karşılıklarıyla
  güncellendi. İlk başarısız kayıtlar `first-native-migration-run/` içinde korunur.
- Program kaynaklı üye dönüşü ve sonradan açılan üyenin eski dönüş yolunu taşıması
  düzeltildi; release grubunda gerçek gezinme senaryosu eklendi.
- Gradle ilk ağ denemesi JVM proxy ayarı nedeniyle başarısızdı; yetkili indirme
  sırasında ortamın proxy/CA ayarıyla ilk standart derleme tamamlandı.
- Sonraki araç beklemesi “network approval was cancelled before a decision was returned”
  bildirdi. Yeni ağ yoluyla zorlanmadı. Mevcut indirilmiş 715 artifact dosyasının
  cache SHA-1'leri denetlenip yerel Maven düzeninde sunuldu; final iki derleme `--offline`
  çalıştı. Bu ortam yardımcısı uygulama kaynağının veya normal build talimatının parçası değildir.
- Geçici build yardımcısında çift `--console` argümanı düzeltildi. Normal offline
  Gradle metadata çözümü de yerel Maven önbelleğiyle tamamlandı.
- Npm transitive uuid@7.0.3 kullanımı için deprecated uyarısı; Capacitor Filesystem
  kaynaklarında deprecated downloadFile/nullable Java tipi uyarıları vardır. Derlemeyi
  engellemediler; geniş bağımlılık yükseltmesi yapılmadı. Güvenlik taraması sonucu değildir.

Tarayıcı soket/ptrace izin engeli başka başlatma yöntemiyle aşılmadı. Yeni ekranların
klavye, büyük yazı, sistem çubukları, gerçek kaydırma ve renk görünümünün geçtiği
iddia edilmez. Referans tasarım PNG'leri yeni APK ekran görüntüsü değildir.

## 7. Supabase ve Auth devri

Bu çalışmada `cloud.js` ve bütün `supabase/` kaynakları değişmedi; canlı projeye
migration, RLS, Auth ayarı, e-posta, veri veya Edge Function yazılmadı.
Mevcut proje `eznxeqraejmwfpwcuxxc`; config'teki publishable anahtar istemci içindir,
yönetim/service_role anahtarı değildir. Bu UI/native güncellemesi için eski SQL'i
tekrar uygulamayın.

Normal giriş **e-posta + şifre**; ilk kayıtta iki şifre eşleşmesi ve e-posta koduyla
adres doğrulama; yalnız kullanıcı seçerse şifre kurtarma kodu ve iki yeni şifre.
Her girişte kod gönderilen eski model geri getirilmez. İlgili mevcut kurulum
belgesi `docs/KODLU_GIRIS_KURULUMU.md`; eski 0.11.4 parolasız/üç şablon notları tarihseldir.

Önceki devirlere göre `20260907134446_fittrack_beta_0114_workout_and_sync_safety.sql`
uygulanmıştı. Bu oturumda canlı panel sorgulanmadığı için yeniden teyit edildiği
iddia edilmez. Yeni kurulumda `supabase/migrations/` esastır. OTP uzunluğu, özel SMTP,
kayıt/kurtarma şablonlarının canlı hali ve gerçek posta teslimi ayrıca kontrol bekler.
`configure_auth_templates.py --apply` bu sürümde çalıştırılmadı.

Yeni antrenör UI mevcut rol/RLS davranışını kullanır. Ref6'nın yeni atanmış-üye
kapsamı, zorunlu TOTP MFA/AAL kontrolü, audit ve ayrı masaüstü yönetim paneli güvenlik
modeli bu sürümde uygulanmış sayılmaz. UI rol kontrolü tek başına sunucu yetkisi değildir.

## 8. Telefon kabulü, kalan işler ve yol haritası

Ayrı **`FITTRACK_v0.12.0_TELEFON_TESTLERI.md`**, K01–K37 numaralarıyla hazırlık,
beklenen sonuç ve raporlama şablonunu içerir. Önce mevcut 0.11.9 üzerine kurulum,
veri/oturum/yarım antrenman koruma, cache yenileme, tek ana kaydırıcı, klavye ve
Android geri kontrol edilir. Sonra antrenör dört menüsü, gerçek atama, taslak,
mesaj, altı tema; ardından paylaşım/bildirim/deep link ve iki hesap senkronizasyonu.

| Rev6 aşaması | Bu teslimden sonra durum |
|---|---|
| 0.12.0 A — taban/kaynak/test | Envanter ve yerel testler hazır; 0.11.9 kullanıcı telefon kabulü var |
| 0.12.0 B — standart native/yükseltme | Kaynak ve iki aynı APK üretimi hazır; 0.11.9 → 0.12.0 fiziksel veri koruma kabulü açık |
| 0.12.0 C — temiz uzak CI | Yerel temiz kurulum/build var; uzak CI, bağımlılık zafiyet taraması ve canlı platform kabulleri açık |
| 0.12.1 | Ayrı web yönetim paneli, masaüstü/dar ekran kabuğu, rol yetkileri ve MFA gelecekte |
| 0.12.2 | Mobil özet/üye UI bu istekte revize edildi; yeni web paneli ve gerçek öncelik olay sözleşmesi gelecekte |
| 0.12.3 | Mobil tekli atama formu korundu/yeni seçici eklendi; web ve kontrollü toplu atama gelecekte |
| 0.12.4 | Mevcut dört adımlı mobil Stüdyo giydirildi; web/favori/toplu hazırlama işleri gelecekte |
| 0.12.5 | Değişmez program sürümü, göç ve üye sürüm taşıma henüz yok |
| 0.12.6 | Mobil mesaj UI revize edildi; ayrı web paneli kabulü henüz yok |
| 0.12.7 | Yeni ekip/davet/erişim/audit yönetimi henüz yok |
| 0.12.8 | Birleşik güvenlik, restore, cihaz, web ve pilot kabulleri henüz yok |

Berk'in son isteği nedeniyle mevcut **mobil** antrenör UI'si bu sürüme alındı;
Rev6'nın bütün gelecek sunucu/web özellikleri 0.12.0'a taşınmış değildir. Henüz
görülmemiş kullanıcı tercihini tahmin ederek ilerleme grafiklerini, üye oyuncusunu,
program veri şemasını veya GIF kataloğunu baştan değiştirmeyin.

En yakın devam: telefon sonuçlarını almak ve varsa 0.12.0 düzeltmesini yapmak;
ardından mevcut kaynakla uzak CI/bağımlılık taramasını gerçek repoda kapatmak.
Tasarım kabulü sonrası Rev6 0.12.1'in yetki/MFA ve ayrı web kabuğu kapsamı açılır.

## 9. Geri alma ve hata halinde devam

Uygulama verisini temizlemek veya uygulamayı kaldırmak güncelleme çözümü değildir.
Özgün 0.11.9 APK/ZIP'i ve önceden alınmış yedekleri koruyun. 0.11.9'un kodu 26'dır;
0.12.0 kod 27 üzerine normal güncelleme olarak geri kurulamaz. Sorun varsa aynı
sertifikayla **daha yüksek versionCode'lu düzeltme** hazırlanır. Gerekirse 0.11.9
web davranışını geri alan bir düzeltme de aynı kimlik/veri sözleşmesiyle üretilir.

Şema veya sunucu migration'ı değişmediği için bu sürüme ait SQL rollback yoktur.
Eski Smali arşivi köken/karşılaştırma içindir; aktif build'i sessizce oraya döndürmeyin.
Hata raporunda sürüm/kod, cihaz/Android, rol, tema, bağlantı ve K test numarası yer alsın.
Gerçek veri içeren log veya yedekleri kamuya açık kaynak/devir paketine koymayın.

## 10. Teslimler ve doğrulama kimlikleri

| Dosya | Kullanım |
|---|---|
| `FitTrack-Android-v0.12.0-beta.apk` | Telefona güncelleme olarak kurulacak imzalı beta |
| `FitTrack-Beta-0.12.0-Source.zip` | Tam web/native/sunucu kaynakları, kilitler, betikler, testler, tarihçe ve tasarım referansı |
| `FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md` | Bu bağımsız devir; kaynak docs içinde de aynı metin vardır |
| `FITTRACK_v0.12.0_TELEFON_TESTLERI.md` | K01–K37 yapılacak cihaz/sunucu testleri ve sonuç şablonu |
| `FITTRACK_v0.12.0_TESLIM_KANITLARI.json` | Nihai dosyaların SHA-256/boyutları, derleme/test durumu ve açık kabuller |

İmzalı APK — **15.230.521 bayt**, SHA-256:
`4732d2116ad2a915c99004db92202a035f9d00a71d730b5ef809f63bbccbc3a8`

Beklenen sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Özgün 0.11.9 APK SHA-256:
`4035b4f07308f85831d2e6b02db7f104d0d46a949c8f45da09940d8fd9f46e23`

Özgün 0.11.9 kaynak ZIP SHA-256:
`7bf6883635206fcd18a40f970a60280055a725159fffbbe646fafd71969745a4`

Nihai kaynak/devir/test listesi hashleri ayrı TESLIM_KANITLARI JSON'undadır; kaynak
arşivi kendi hashini içermeye çalışmaz. İmza anahtarı ve parolası bu beş dosyanın
hiçbirine eklenmez. Anahtarın varlığını yeni GPT'nin otomatik devralacağını varsaymayın.

Alper'in GPT'sine başlangıç talimatı:

> FitTrack 0.12.0 / versionCode 27'yi bu kaynak ZIP ve devir raporundan devral.
> Berk 0.11.9'u telefonda kabul etti. 0.12.0 imzalı APK, 18/18 yerel test ve temiz
> kaynaktan birebir tekrar üretim hazır; 0.12.0 telefon/render ve uzak CI kabulü açık.
> Önce K01–K37 sonuçlarını değerlendir. Yeni android/ gerçek Gradle/Capacitor kaynağı,
> legacy/ eski Smali köken arşividir. Şema 14, paket/origin/sertifika, şifreli giriş,
> açık başlayan tek ana kaydırıcı, snapshot/taslak ve altı tema kararlarını koru.
> Gelecek web/MFA/toplu atama/program sürümleme işlerini tamamlandı sanma.
> Her kod sürümünde APK, tam kaynak, güncel devir ve test listesini birlikte teslim et.
