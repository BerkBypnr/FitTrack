# FitTrack Beta 0.15.0 — üye ana sayfası

Sürüm **0.15.0 / versionCode 37**, doğrudan taban 0.14.4, veri şeması 15.

Önce `BETA_0.15.0_NOTLARI.md` dosyasını okuyun. Bu sürüm yalnız üye ana
sayfasını final UI kararına taşır; aktif antrenman, program seçimi ve antrenör
ekranları 0.14.4 davranışını korur. Aşağıdaki 0.14.2 açıklaması tarihsel kayıttır.

---

# FitTrack Beta 0.14.2 — telefon geri bildirimi UI düzeltmesi

Sürüm **0.14.2 / versionCode 34**, paket `com.fittracklabs.mobile`, min API 24 /
target API 36, yerel veri şeması 15. Doğrudan taban 0.14.1'dir. Önceki profil,
logo, tema, Auth ve Android dosya seçicisi düzeltmeleri korunur.

**Önce oku:** `docs/FITTRACK_ALPER_CHATGPT_DEVIR_v0.14.2.md`.
**Telefon kabulü:** `docs/FITTRACK_v0.14.2_TELEFON_TESTLERI.md`.
**Ölçüm sözleşmesi:** `docs/UI_0140_OLCUM_SOZLESMESI.md`.

Bu sürüm 0.14.0 yerleşimini onaylı temiz UI paketine uyarlar ve yazıları büyütür.
Aktif sette ortak başlıklı tablo, geçmişte kompakt fotoğraflı kartlar ve özette
kayıtlı verilerden hızlı istatistikler vardır. BETA_0.14.2_NOTLARI.md değişiklikleri açıklar.

Bu ikinci UI aşaması altı ölçüm profilini, üstte sabit GIF ve aynı ekranda bütün
setleri, manuel hareket geçişini, önceki değer uygulamasını, fotoğraflı tek-kaydet
geçmiş düzenlemesini ve sade özeti içerir. Dinlenme sayacı yoktur.
Ad-soyad alt alta; kilo/hedef kilo cetvelinin klavye sonrası kaybolması düzeltildi.
Tüm final UI paketi bitmiş değildir: üye ekranları 0.15, antrenör iş akışları 0.16.
GitHub'a push/PR/merge ve canlı Supabase değişikliği yapılmamıştır.

Fiziksel Android kabulü açık: özellikle önceki T01 (profil dönüş/klavye), T02 (cihaza
yedek kaydı) ve daha önce denenemeyen K35, otomatik test geçti diye kapanmaz.
`docs/` altındaki eski sürüm belgeleri tarihsel kayıttır; bu README ve v0.14.2 devri günceldir.
Yeni ölçümlü pilot hesapların bütün cihazları ve antrenörü 0.14'e güncellenmelidir;
eski uygulamalar ileri şemayı güvenle düzenleyemez. Sunucu minimum sürüm kapısı yoktur.

## Kaynak düzeni

- Kökteki JS/HTML/CSS, `assets/` ve `vendor/`: uygulamanın asıl web kaynakları.
- `android/`: Java MainActivity, Gradle wrapper ve gerçek Capacitor Android projesi.
- `www/`: `stage_web.cjs` ile yeniden oluşturulan geçici web çıktısı; ZIP'e girmez.
- `android/app/src/main/assets/public/`: `cap sync android` çıktısı; doğrudan düzenlemeyin.
- `legacy/android-0.11.9/`: eski APK'dan türetilmiş Smali/XML köken arşivi. Yeni build bunu kullanmaz.
- `supabase/`: mevcut SQL, migration, şablon ve Edge Function kaynakları; bu sürümde değişmedi.
- `docs/references/`: özgün yol haritası, 9 Eylül UI ZIP'i ve tarihsel devirler.
- `tests/`, `test-results/`: çalıştırılabilir kontroller ve son yerel kanıtlar.

İptal edilmiş Alper validation ağacı kullanılmadı. Bu proje React/Vite değildir.
A/“UI hazırlığı” belgeleri tarihsel ara sonuçlardır; güncel durum yukarıdaki devirde.

## Kurulum ve üretim

Node 22+ (testte 24), JDK 21, Python 3.10+, Android SDK gerekir.
SDK'da `platforms;android-36`, `build-tools;35.0.0`, `build-tools;36.0.0` kurulu ve
lisanslar kabul edilmiş olmalı. `JAVA_HOME` ve `ANDROID_HOME` ortam değişkenlerini
kendi kurulumunuza göre tanımlayın. Gradle 8.14.3 wrapper arşivi SHA-256 ile sabitlidir;
AGP 8.13.0, npm sürümleri ve kilit dosyası kaynakta bulunur. İlk kurulum internet ister.

```sh
npm ci --ignore-scripts
npm test
python3 scripts/build_android.py
# Mevcut beta imza anahtarı ve dört özel ortam değişkeni hazırsa:
python3 scripts/build_android.py --sign
```

`--output /path` çıktı klasörünü, `--gradle /path/to/gradle` isteğe bağlı Gradle
çalıştırıcısını seçer. `--offline` yalnız hazır Gradle bağımlılıklarıyla çalışır;
boş bir makineyi internetsiz hazırlamaz. Eski Apktool betiğinin `--tools` seçeneği yoktur.
Betik web staging → Capacitor sync → temiz Gradle release → isteğe bağlı imza üretir.
Varsayılan çıktı `out/`; unsigned APK kullanıcıya kurulacak beta yerine geçmez.

İmza girdileri: `FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`,
`FITTRACK_KEY_PASSWORD`. Değerlerini kaynak veya rapora koymayın. Orijinal anahtar
Berk'in özel paylaşımındadır; yeni anahtarla güncelleme zincirini değiştirmeyin.
Betik imzadan sonra resmi apksigner ile doğrular ve beklenen sertifikayı denetler.

```sh
python3 -m pip install -r tests/requirements-apk.txt
FITTRACK_APK=/path/FitTrack-Android-v0.14.2-beta-signed.apk python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-Beta-0.14.2-Source.zip
```

Paketleyici anahtar/derleme dosyalarını dışlar, seçili sır örüntülerinde durur,
ZIP CRC'sini kontrol eder ve `gradlew` çalıştırma iznini korur.
`.github/workflows/verify.yml` temiz CI taslağıdır; uzakta çalıştırıldığı iddia edilmez.
Yerel VM/DOM/PostgreSQL ve APK incelemesi, gerçek cihaz/render/SMTP kabulünün yerine geçmez.

## Bu teslimin üretimi ve tarayıcı testi

Tam Gradle cache/SDK bulunmadığından teslim edilen beta APK, doğrulanmış 0.14.1
APK'nın web kaynakları değiştirilerek üretildi. DEX, ikon, izinler ve native ayarlar
aynıdır. Bu bir temiz Gradle build değildir. `scripts/repack_web_apk.py` denetimli
alternatif üretim yoludur; native değişiklik için kullanılmaz. APK/source ve aynı
sertifika denetimleri `test-results/apk-inspection.json` dosyasındadır.

```sh
# Playwright ve Chromium kurulu bir test ortamında:
node tests/browser-0142.cjs
# Hazır Chromium paketi kullanıldığında opsiyonel değişken:
# FITTRACK_CHROMIUM_PACKAGE=/absolute/path/to/@sparticuz/chromium
```

Tarayıcı testi yalnız sentetik yerel veri kullanır, dış ağ erişimini engeller.
0.14.2 ortamında Chromium bulunmadığı için tarayıcı testi çalıştırılmadı; fiziksel telefon kabulü açıktır.
