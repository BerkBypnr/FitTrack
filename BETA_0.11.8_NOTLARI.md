# FitTrack Beta 0.11.8 — Antrenman ve inceleme düzeltmeleri

10 Eylül 2026. Taban: 0.11.7 / versionCode 24. Yeni sürüm: **0.11.8 / versionCode 25**.
Yerel şema 14; paket com.fittracklabs.mobile. Minimum API 24, hedef API 36.
APK orijinal beta anahtarıyla imzalandı; sertifika ve v1/v2 imzaları doğrulandı.

## Kullanıcıya yansıyan düzeltmeler

1. İptal uyarısındaki Vazgeç, yanlışlıkla antrenman menüsüne bağlıydı. Artık
   **Hayır, iptal etme** yalnız uyarıyı kapatır. Aynı ekran, kilo/tekrar girişleri ve
   kaydırma konumu kalır; kontrol menüsü açılmaz. Dinlenme süresi ve duraklama
   durumu değişmez. Sol üst geri düğmesi de aynı iptal onayını kullanır.
2. Antrenmanı/Programı incele ekranındaki hareket satırları artık düğmedir.
   Görsele, ada veya oka dokunmak o program günündeki hareketin büyük görselini ve
   Nasıl yapılır? anlatımını açar. Katalogda olmayan özel hareketler de desteklenir.
   Üst geri ve Android geri önce incelemeye, önceki kaydırma konumuna döner.
   Sonraki geri asıl sekmeye döner. Dolgulu üçgen görünümü yerine çizgili ok kullanılır.
3. Kilo/tekrar kartı kayan içeriğin sonunda, açıklamalar ve varsa antrenör notunun
   altındadır. Ekranı takip etmez. Yalnız **Seti tamamla / Seti güncelle** sabit kalır.
4. Nasıl yapılır? her yeni set ekranında açık başlar; başlığa dokunarak kapatılabilir.
   Uzun anlatım kaydırılabilir. Antrenör notunun önceki açılma davranışı değişmedi.

Altı tema, logo/ikon/splash, ana sayfa, ilerleme grafikleri/rozetler ve antrenör
arayüzü korunur. Ağırlık/tekrar isteğe bağlıdır; doğrulama, artır/azalt, önceki
antrenmanın değerlerini kullanma ve set güncelleme işlevleri sürer.

## Teknik değişiklikler

- app.js: dismiss-workout-cancel; assigned-exercise-detail; openAssignedExerciseDetail;
  ortak closeExerciseDetail. Geçici ui.exerciseDetailReturn program/gün/hareket ve
  kaydırma konumunu tutar. Hesap değişimi ve akış kapanışında temizlenir.
- styles.css: inceleme satırına düğme seçicisi ve sola hizalama; ok dolgusu kaldırıldı.
- member-ui.css: giriş kartı normal akışta, sabit alt bölümde yalnız tamamla düğmesi.
- Uygulama, önbellek, npm ve Android sürüm alanları 0.11.8 / 25 ile eşitlendi.
- tests/navigation-0118.cjs: 16 gezinme regresyonu. Harness gerçek DOM tıklama
  hedeflerini destekler. Mevcut member-ui-0117 testi açık açıklama/kart yerini denetler.
- scripts/build_android.py: önceki Maven Apktool adresi 404 verdiği için aynı 2.12.1
  sürümünün [resmi GitHub dağıtımı](https://github.com/iBotPeaches/Apktool/releases/tag/v2.12.1)
  kullanılır. SHA-256, [resmi release API](https://api.github.com/repos/iBotPeaches/Apktool/releases/tags/v2.12.1)
  digest alanıyla doğrulanıp sabitlendi:
  66cf4524a4a45a7f56567d08b2c9b6ec237bcdd78cee69fd4a59c8a0243aeafa.

## Doğrulama

- Temiz npm ci başarılı. Son npm test **15/15 grup**; üye grubu 30/30, yeni gezinme
  grubu 16/16. Son uygulama testlerinde başarısızlık yok.
- Orijinal JKS ile derleme/imzalama başarılı; Android apksig v1/v2 doğrulaması geçti.
- İmzalı APK 0.11.8/25; 22 web dosyası kaynakla aynı. 192 native görsel, 190 kaynak
  XML ve 10 DEX önceki 0.11.7 ile aynı. İzinler, DEX bütünlüğü, CRC ve hizalama geçti.
- Güncel kanıt test-results/apk-inspection.json; history-0117 önceki sürüme aittir.
  Güncelliğini yitiren imzasız hazırlık raporu kaldırıldı.
- Fiziksel telefon/üstüne kurulum, gerçek tarayıcı render, klavye/scroll ve sistem
  geri jesti çalıştırılmadı. VM/DOM testleri bunların yerine geçmez. Canlı SMTP,
  iki cihaz/offline ve uzak GitHub CI testi bu sürümde yapılmadı.

Sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

İmzalı APK SHA-256:
`d44da775e7a6fca6c5c104df7330695ffe422b001b6fe729d77138c8ffa57f4b`

Kullanıcı orijinal JKS'yi yeniden sağladı; yeni anahtar üretilmedi. Anahtar ve parola
kaynak ZIP'e veya raporlara eklenmedi. Paket adı ve imza 0.11.7 ile aynı, versionCode
25 önceki 24'ten yüksektir. Telefonda güncelleme ve davranış kontrolü devir MD'dedir.

Supabase/Auth/migration/RLS değişikliği yoktur. Antrenör arayüzü sonraki özellik
sürümünün konusudur. Native katman orijinal APK'dan alınmış Smali/XML/görseller ve
derleme betiğidir; özgün Gradle/Java/Kotlin projesi değildir.
