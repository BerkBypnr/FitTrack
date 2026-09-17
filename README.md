# FitTrack Beta 0.12.2 — telefon kabulü hotfix'i

Sürüm **0.12.2 / versionCode 29**, paket `com.fittracklabs.mobile`, min API 24 /
target API 36, veri şeması 14. Doğrulanmış 0.12.1 kaynakları üzerine 17 Eylül 2026
telefon kabulündeki iki açık uygulanmıştır: profil sihirbazında dönüş/yükseklik değişiminde
taslak koruması ve paylaşmadan ayrı, Android dosya seçicisiyle gerçek cihaz kaydı.

**Güncel devir:** `docs/FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.2.md`.
**Yeni telefon kabulü:** `docs/FITTRACK_v0.12.2_TELEFON_TESTLERI.md`.
0.12.1'in kullanıcı tarafından belirtilmeyen telefon maddeleri geçti kabul edilmiştir;
K35 denenmedi olarak kalır. 0.12.2 yalnız iki hotfix için yeniden kabul bekler.

Bu sürüm yeni UI paketini içermez. UI geçişi, kabul edilen final görseller üzerinden
ayrı **v0.13.0** geliştirme hattıdır. Yol haritasındaki gelecekteki özellikler veya
ayrı antrenör web paneli/MFA bu hotfix ile tamamlandı sayılmaz.

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
FITTRACK_APK=/path/FitTrack-Android-v0.12.2-beta-signed.apk python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-Beta-0.12.2-Source.zip
```

Paketleyici anahtar/derleme dosyalarını dışlar, seçili sır örüntülerinde durur,
ZIP CRC'sini kontrol eder ve `gradlew` çalıştırma iznini korur.
`.github/workflows/verify.yml` temiz CI taslağıdır; uzakta çalıştırıldığı iddia edilmez.
Yerel VM/DOM/PostgreSQL ve APK incelemesi, gerçek cihaz/render/SMTP kabulünün yerine geçmez.
