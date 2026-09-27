# FitTrack — Alper ChatGPT devir raporu — v0.11.8

**10 Eylül 2026 — Son sürüm: kod, imzalı APK ve otomatik doğrulamalar tamamlandı.**
Bu rapor önceki aynı adlı “imza anahtarı bekleniyor” raporunun yerini alır.
Bu belgeyi APK ve kaynak ZIP ile birlikte devralın; konuşma geçmişi gerekmez.

## Sürüm ve kaynak tabanı

| Alan | Değer |
|---|---|
| Önceki sürüm | 0.11.7 / versionCode 24 |
| Yeni sürüm | 0.11.8 / versionCode 25 |
| Android paket adı | com.fittracklabs.mobile |
| Yerel veri şeması | 14 — değişmedi |
| Minimum / hedef API | 24 / 36 |
| Auth deep link | com.fittracklabs.mobile://auth-callback |
| İmza | Önceki orijinal beta ile aynı sertifika; v1/v2 doğrulandı |

Taban Berk'in orijinal kaynak ve APK zinciridir. Alper'in yeniden oluşturduğu
validation projesi kullanıcı tarafından iptal edilmiştir; bu sürüme alınmadı.
0.11.7 kaynak ZIP ve APK, kayıtlı teslimatlardan geri alınarak hashleri doğrulandı.
Hazırlık sırasında özel anahtar çalışma alanında yoktu. Berk orijinal
`fittrack-beta-0102.jks` ve kullanım bilgisini yeniden sağladı; sertifika önceki
APK ile eşleştirildi ve yeni APK aynı anahtarla imzalandı. Yeni anahtar üretilmedi.

**Kaynağın niteliği:** native katman orijinal 0.11.3 APK'sından Apktool ile elde
edilmiş 5.536 Smali dosyası, manifest, XML ve görsellerdir. Özgün Gradle/Java/Kotlin
projesi değildir. ZIP, bu katmanı ve güncel web kaynaklarını APK'ya yeniden derleyen
betikleri içerir. Gelecekte özgün Android proje temeli kurulması hâlâ ayrı iştir.

## Amaç ve yapılan bütün değişiklikler

Bu sürüm aktif antrenman ve atanmış program incelemesinde bildirilen dört sorunu çözer.
Ana sayfa, ilerleme grafikleri, Başarıların rozetleri ve antrenör tasarımı yeniden yapılmadı.

### 1. Geri uyarısında Hayır doğrudan antrenmana döner

Videodaki hata kodda doğrulandı: `confirmCancel()` içindeki Vazgeç düğmesi
`workout-menu` eylemini çağırarak Antrenman kontrolü panelini açıyordu.
Düğme artık **Hayır, iptal etme** metnini ve `dismiss-workout-cancel` eylemini kullanır;
handler yalnız `closeSheet()` çağırır. Alttaki ekran yeniden çizilmez. Böylece
kilo/tekrar giriş düğümleri, mevcut kayıtlar, kaydırma konumu ve sayaçlar korunur.
Dinlenme veya duraklatma ekranında reddetmek de mevcut durumu korur; otomatik olarak
sıradaki sete geçmez veya duraklamayı kaldırmaz. Üç nokta menüsünden açılan iptal
uyarısını reddetmek de doğrudan alttaki antrenmana döner.

Aktif antrenmanın sol üst geri düğmesi `close-flow` yerine aynı `confirm-cancel`
akışını kullanır. Android geri köprüsü aynı kalır. Onay penceresindeyken tekrar geri
uyarıyı kapatır. **Evet, iptal et** mevcut oturumu iptal edip geçmişe eklememe
mantığını korur. Menüdeki Daha sonra devam et, oturumu koruyarak ana ekrana döner.

### 2. Program incelemesindeki hareket satırları çalışır

Önceki `article` satırları yalnız ok gösteriyordu; tıklama işlemi yoktu.
Satırlar `type="button"`, erişilebilir ad ve `assigned-exercise-detail` eylemi taşıyan
`.assigned-exercise-item` düğmelerine dönüştürüldü. Görsel, ad ve ok aynı hedefe gider.
Ok dolgusu kaldırıldı; oynatma izlenimi veren dolu üçgen yerine çizgili ok görünür.
Tema renkleri veya listenin genel yerleşimi değiştirilmedi.

`openAssignedExerciseDetail(programId, dayIndex, exerciseIndex)`, hareketi kullanıcının
hâlen atanmış programındaki doğru günden çözer. Yalnız katalog kimliğine bakmaz:
aynı hareket farklı günlerde farklı açıklama taşıyabilir; programla gelen özel
hareket katalogda bulunmasa da açılır. `renderExerciseDetail(id, options)` aynı
büyük hareket görselini, ekipmanı, hedef bölgeleri ve Nasıl yapılır? anlatımını gösterir.
Açıklama yoksa kullanıcıya bunun henüz eklenmediği söylenir. Hareketi incelemek
antrenman başlatmaz; varsa mevcut oturumu veya seçili programı değiştirmez.

Geçici `ui.exerciseDetailReturn`, program/gün/hareket ve `.assigned-detail-scroll`
konumunu tutar. Hem ekrandaki geri hem `FitTrackNativeBack`, ortak
`closeExerciseDetail()` üzerinden önce program incelemesini geri getirir. Satır
odağı ve kaydırma konumu korunur. Sonraki geri ana ekrana/programlar sekmesine döner.
Kütüphaneden açılan detayın eski dönüşü korunur. Atama bu arada kaldırılmışsa kaldırılmış
program geri gösterilmez; akış güvenli şekilde kapanır. Geçici dönüş bilgisi hesap
değişimi, akış kapanışı ve antrenmana dönüşte temizlenir. Kalıcı veri alanı eklenmedi.

### 3. Kilo/tekrar kartı içerikte en altta

`renderWorkout()` içindeki `#entryCard`, `main.member-player-scroll` öğesinin son
çocuğudur: görsel, hedefler, açıklama ve varsa antrenör notundan sonra gelir.
Kart ekranı takip etmez; aşağı kaydırarak ulaşılır. `footer.member-player-dock`
yalnız Seti tamamla / Seti güncelle düğmesini taşır ve ekranda sabit kalır.
Eski iki satırlı sabit kart/düğme kısıtları kaldırıldı, alt düğme boşluğu ayarlandı.
Kilo/tekrar isteğe bağlıdır. Artır/azalt, önceki değerleri kullanma, doğrulama ve
geçmiş sete dönüp güncelleme işlevleri korunur.

### 4. Nasıl yapılır? varsayılan açık

`details.workout-instructions` üzerinde `open` bulunur. Her yeni set çiziminde açık
başlar; kullanıcı başlığa dokunarak kapatabilir. Uzun içerik için mevcut sınırlı,
kaydırılabilen açıklama alanı korunur. Antrenör notunun açılma varsayılanı değişmedi.

## Önemli dosyalar

| Dosya | Yapılan değişiklik |
|---|---|
| app.js | İptalden vazgeçme, üst geri onayı, hareket detayına giriş/dönüş, geçici UI temizliği, kart yerleşimi ve açık açıklama |
| styles.css | Program inceleme satırı düğme stili ve okun dolgusu |
| member-ui.css | Giriş kartı normal akışta; sabit alt alanda yalnız tamamla düğmesi |
| index.html, config.js, sw.js, manifest.webmanifest | Sürüm ve önbellek 0.11.8 |
| package.json, package-lock.json | Sürüm 0.11.8; bağımlılık sürümleri aynı |
| android/apktool.yml | versionName 0.11.8 / versionCode 25 |
| scripts/build_android.py | Çıktı adı ve doğrulanmış resmi Apktool dağıtım adresi/hash |
| tests/navigation-0118.cjs | 16 yeni gezinme regresyonu |
| tests/review/harness.cjs | Üretilmiş DOM düğümlerini gerçek tıklama hedefi olarak kullanabilme |
| tests/member-ui-0117.cjs | Açık açıklama, en son kaydırılan kart ve yalnız düğmeli sabit alt alan kontrolü |
| scripts/test.cjs | Yeni grup dahil toplam 15 test grubu |
| tests/apk_inspect.py ve mevcut regresyonlar | Güncel sürüm 0.11.8 / 25 beklentileri |
| README.md, tests/README.md, BETA_0.11.8_NOTLARI.md | Davranış, derleme, imza ve test kapsamı |
| docs/NATIVE_PROVENANCE.json | Kaynak kökeni, güncel APK hashleri ve doğrulanmış imza |
| test-results/ | Son test sonuçları; eski 0.11.7 kanıtları ayrı history-0117 dizininde |

## Derleme kararı ve nedeni

Önceki Maven Apktool bağlantısı 404 döndü. Aynı **2.12.1** sürümünün
[resmi GitHub dağıtımı](https://github.com/iBotPeaches/Apktool/releases/tag/v2.12.1)
kullanıldı. Hash, [resmi release API](https://api.github.com/repos/iBotPeaches/Apktool/releases/tags/v2.12.1)
digest alanıyla karşılaştırıldı ve sabitlendi; doğrulama kaldırılmadı.
Yeni dağıtım hash'i `66cf4524a4a45a7f56567d08b2c9b6ec237bcdd78cee69fd4a59c8a0243aeafa`.
Eski önbellek aracı geri alınamadı; yeni araçla üretilen 10 DEX önceki APK ile aynı.
Android apksig 2.3.0 ve Eclipse ECJ 3.42.0 sabit sürümleri korunur.

Java 17+, Python 3.10+ ve ilk araç indirmesi için internet gerekir. Testler Node 22+
ile çalışır; bu teslim Node 24.19.0 ile doğrulandı. Anahtar/parola değerlerini komut
satırına, kaynak dosyalarına veya rapora yazmadan dört ortam değişkenini tanımlayın:
`FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`, `FITTRACK_KEY_PASSWORD`.

```sh
npm ci --ignore-scripts
npm test
python3 scripts/build_android.py --sign
FITTRACK_APK=/path/FitTrack-Android-v0.11.8-beta.apk FITTRACK_PREVIOUS_APK=/path/FitTrack-Android-v0.11.7-beta.apk python3 tests/apk_inspect.py
python3 scripts/package_source.py --output /path/FitTrack-Beta-0.11.8-Source.zip
```

Derleme betiği web dosyalarını geçici native ağaca koyar; Smali/XML yeniden derlenir.
Native proje özgün Gradle yapısı olarak sunulmaz. Anahtar ayrı tutulmalıdır; kaynak
ZIP'inde JKS, parola, gerçek .env, service_role, node_modules, eski APK ve araç
önbelleği bulunmaz. Güvenli .env.example ve önceki migration'lar pakettedir.

## Çalıştırılan testler ve sonuçları

- Temiz `npm ci --ignore-scripts --no-audit --no-fund` başarılı; bağımlılık sürümleri değişmedi.
- Son `npm test`: **15/15 grup geçti**. Üye/rozet grubu **30/30**, gezinme grubu **16/16**.
- Yeni gezinme kontrolleri: Android geri köprüsü ve üst geri; uyarıda Hayır/Evet;
  üç nokta menüsünden iptalden vazgeçme; ikinci geriyle uyarıyı kapatma; alan/kaydırma
  düğümlerini koruma; dinlenme/duraklama; her günün doğru hareket tanımı; özel hareket;
  iki geri yolu; kütüphane dönüşü; kaldırılan atama; hesap değişimi; HTML kaçışı ve
  inceleme sırasında mevcut oturumun değişmemesi.
- Mevcut hotfix, oluşturucu, yarım antrenman, senkronizasyon, Auth test çiftleri,
  PGlite veritabanı, altı tema ve native statik kontroller test kapısına dahildir.
- Kaynaktan derleme ve orijinal anahtarla imza başarılı. Android apksig **v1=true,
  v2=true**. Sertifika 0.11.7 ile eşleşir.
- Bağımsız APK incelemesi geçti: 0.11.8 / 25; 22 web dosyası birebir kaynakla aynı;
  192 native görsel ve 190 XML korunmuş; 10 DEX bütünlüğü geçer ve önceki APK ile
  aynıdır. İzinler, ZIP CRC ve hizalama doğru. İmzalama anahtarı APK içinde yoktur.
- Kaynak ZIP temiz geçici dizine açılıp sabit önbellek araçlarıyla yeniden derlendi;
  imzasız APK hash'i imzalı sürümün girdisiyle aynı çıktı. Kanıt
  `test-results/source-rebuild-0118.json` ve `.log` dosyalarıdır. Son ZIP'e yalnız
  bu yeniden derleme kanıtları eklendi; uygulama/derleme kaynakları aynı kaldı.
- Güncel ana sonuçlar: `suites.json`, `member-ui-0117.json`, `navigation-0118.json`,
  `apk-inspection.json`, `android-build-sign-0118.log`. Güncelliğini yitiren ilk
  imzasız hazırlık raporu kaldırıldı; önceki 0.11.7 raporu history-0117 altındadır.

**Başarısız/çözülen:** hazırlıkta eski araç URL'si 404 ve eski hash beklentisi derlemeyi
engelledi. Resmi dağıtım/digest doğrulamasıyla çözüldü. Son uygulama test kapısında
başarısız test yok; bu, bütün gerçek cihaz davranışlarının doğrulandığı anlamına gelmez.

**Çalıştırılmayanlar ve nedenleri:** fiziksel Samsung S23/Android 16 ve üstüne kurulum
cihaz erişimi olmadığından; gerçek tarayıcı render, ekran klavyesi ve kaydırma düzeni
önceki yerel önizleme erişim reddi nedeniyle. Bu ret başka yoldan aşılmadı. Tarihsel
Playwright testleri güncel kabul kapısı değildir. Canlı SMTP/Auth, gerçek iki cihaz/
çevrimdışı senkronizasyon ve uzak GitHub CI bu UI düzeltmesi kapsamında çalıştırılmadı.
VM/Linkedom DOM testi native sistem jesti veya piksel render testi değildir.

## Supabase, Auth, migration ve RLS

Bu sürümde Supabase, veritabanı, Auth, RLS, migration veya Edge Function değişikliği
**yoktur**. Şema 14 kalır. Canlı sunucu verisi ve panel ayarlarına işlem yapılmadı.
Normal giriş **e-posta + şifre**, ilk kayıt **iki şifre eşleşmesi + e-posta koduyla
adres doğrulama** biçimindedir. Sonraki normal girişlerde kod istenmez. Önceki
parolasız giriş/üç e-posta şablonu talimatlarını yeniden uygulamayın.
Bu düzeltme için eski migration'ları tekrar çalıştırmayın.

## Tamamlanan kapsam, ertelenenler ve bilinen riskler

Tamamlanan iş bu dört antrenman/inceleme düzeltmesidir. Önceden tamamlanan ana sayfa,
ilerleme/rozet, program oluşturucu güvenliği ve yarım antrenman kurtarma işlerini
gelecek plana “sıfırdan yapılacak” diye tekrar eklemeyin; gerekirse regresyon/iyileştirme
olarak sınıflandırın. Yeni 3D, PT takvimi, tema veya rozet kuralları eklenmedi.

Mevcut altı tema aynıdır: Volt Discipline, Crimson Graphite, Plum Night,
Redline Editorial, Rosewood Strength, Sage Motion. Büyük hareket/set sayaçları korunur.
Rozetler kayıtlı geçmişten hesaplanır; sunucuda ayrı kalıcı ödül kaydı yoktur ve
mevcut 200 geçmiş kaydı sınırı sürer. Eski kayıtların silinmesi/düzeltilmesi rozetleri
etkileyebilir. Bu sürümde yeniden üretilen otomatik testlerde açık bir hata kalmadı;
gerçek ekran/klavye ve cihaz güncellemesi doğrulaması aşağıdaki listede bekler.

## Berk/Alper telefon kontrol listesi — Samsung S23 / Android 16

1. Mevcut orijinal beta uygulamasının üstüne yeni APK'yı kur. Sürüm 0.11.8 olsun;
   giriş, programlar, geçmiş ve seçili tema korunsun. Uygulamayı kaldırmak hedeflenmez.
2. Aktif antrenmanda kilo/tekrar yaz, biraz kaydır. Kenardan geri yap, ardından
   Hayır, iptal etme: doğrudan aynı antrenmana dönmeli; kontrol paneli açılmamalı,
   yazdığın değerler ve kaydırma yeri korunmalı. Üst sol geriyle de dene.
3. Üç nokta → Antrenmanı iptal et → Hayır: alttaki antrenman görünmeli. Dinlenirken
   ve duraklatılmışken de dene; süre/durum gereksiz değişmemeli.
4. Bir deneme oturumunda Evet, iptal et: oturum kapansın, geçmişe eklenmesin.
5. Ana sayfa veya Programlarım → İncele → bir hareketin görseli/adı/oku: doğru
   hareketin büyük görseli ve anlatımı açılsın. İkinci gün/özel hareket varsa onları da dene.
6. Hareket anlatımından üst geri ve Android geriyle dön: önce aynı program incelemesi
   ve kaydırdığın yer gelsin. Bir sonraki geri başlangıç sekmesine dönsün.
7. Aktif antrenmanda Nasıl yapılır? açık gelsin; kapanıp açılabilsin. Kilo/tekrar kartı
   açıklamaların en altında kaymalı; yalnız Seti tamamla düğmesi sabit kalmalı.
8. Uzun açıklama, büyük yazı ve klavyeyle kilo/tekrar girişi dene. Artır/azalt,
   önceki değerleri kullan, set tamamla, önceki seti güncelle ve devam et akışlarını kontrol et.
9. Altı temayı, ilerleme/rozetleri ve antrenör ekranını kısa kontrol et.

## Sonraki sürüm ve yeni bağlayıcı kararlar

Sonraki özellik güncellemesi **antrenör arayüzü** olacak; kapsam kullanıcıyla
netleştirilmelidir. Mevcut altı tema ve ilerleme grafikleri korunacak. Önce 0.11.8'in
telefon kabulü tamamlanmalı. Düzeltmeleri geri almamak için navigation-0118 ve
member-ui-0117 grupları korunmalıdır. Antrenman iptalinden vazgeçiş bir menüye
geçiş değildir; mevcut ekranı korumalıdır. Programdan açılan hareket anlatımı da
programa dönmelidir; kütüphaneye veya ana sayfaya doğrudan düşmemelidir.

## Teslim dosyaları ve SHA-256

- `FitTrack-Android-v0.11.8-beta.apk` — 15.746.910 bayt; kurulabilir imzalı APK.
- `FitTrack-Beta-0.11.8-Source.zip` — 6.181 dosya; 22.042.577 bayt; güncel web/native kaynak,
  migration, testler, sonuçlar ve derleme betikleri.
- `FITTRACK_ALPER_CHATGPT_DEVIR_v0.11.8.md` — bu nihai devir raporu.

İmzalı APK:
`d44da775e7a6fca6c5c104df7330695ffe422b001b6fe729d77138c8ffa57f4b`

Kaynak ZIP:
`85e3742f667bc0e2363e9140a7bfc98977b2b857ec617314f9fa277e1b99b77a`

İmzasız yeniden üretim girdisi:
`fb1dabe71a243a1bd0eaea0a30a2d471d6349fd62a91ab6d8870190a95312937`

Sertifika:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Taban 0.11.7 kaynak ZIP:
`9d8abe57093d5a34d7e11e06bfde0644480b69eea14c5921a47503a3ce1c4ff7`

Taban 0.11.7 APK:
`4f61f92b91241cdced94817b974d0d52b4e2bafe0bbe26f2611605b665ecac2c`

Berk, Alper'e bu üç dosyayı birlikte iletsin. Alper'in ChatGPT'si bu raporu okuyup
kaynağı doğrulayarak devam etsin. İmzalama anahtarı ve kullanım bilgisi bu üç dosyanın
parçası değildir; yalnız gerektiğinde ayrıca özel olarak aktarılmalıdır.
