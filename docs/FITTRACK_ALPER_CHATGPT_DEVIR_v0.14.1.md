# FitTrack 0.14.1 — Alper'in ChatGPT'sine devir

## Otorite ve taban

Bu belge, BETA_0.14.1_NOTLARI.md ve FITTRACK_v0.14.1_TELEFON_TESTLERI.md güncel.
Önceki devirler tarihsel. references/YOL_HARITASI_REV9_ORIJINAL.md ve
UI_0140_OLCUM_SOZLESMESI.md korunur. Taban teslim edilmiş 0.14.0; eski sürüme dönme.
Kimlik 0.14.1 / versionCode 33 / şema 15 / com.fittracklabs.mobile.
Canlı Supabase/SQL, müşteri verisi, GitHub push/PR/merge değişmedi.

## Son kullanıcı kararı

Açık tema bilinçli seçilmişti; sorun yerleşim ve küçük yazılardı.
Referans FitTrack-Final-UI-Temiz-Paket-v1.zip: 06_Aktif_Antrenman_FINAL,
08_Antrenman_Inceleme_Duzenleme_Kutuphane_FINAL'in düzenleme ekranı ve
01_Acilis_Uye_Ana_Sayfasi_Antrenman_Ozeti_FINAL'in özet ekranı.
Eski açılış kadınına geri dönme; son onaylı FT logo/dumbbell açılışı kalır.
Mevcut GIF tüm hareketi göstermek için object-fit:contain ile gösterilir.

## Uygulama

- app.js: metricTableHeading ortak kolon başlığı üretir. Her input'un hareket,
  set ve birim içeren aria-label'ı var. Altı ölçüm profilinin alanları korunur.
- renderWorkout: ad/kas/ekipman, sabit büyük GIF, kayan açıklama ve set tablosu,
  sabit sonraki hareket. Bütün setler bir sayfada; set başına sayfa/timer yok.
- completeSet sadece satır ve sayaçları değiştirir; GIF, odak, klavye yeniden
  oluşturulmaz. Devam ederken görünmeyen mevcut sete kaydırma korunur.
- previousWorkoutSet boş/geçersiz ölçümleri dışlar. Önceki değerler kapalı
  bölümde; uygulama açık eylem ister. Sayısal alanı olmayan profile sunulmaz.
- renderHistoryEditor kompakt başlık ve açık fotoğraflı kartlar kullanır.
  Tek/atomik kaydetme, çift alan doğrulaması, set ekle/sil, çıkış koruması aynı.
- renderSummary aynı syncId'li state.history kaydını okur. Hacim yalnız
  load_reps × tamamlanmış setler; değer yoksa “—”. ui.historyReturn özete
  dönüşü yönetir. Kaydedilmiş düzenleme statlara yansır, iptal yansımaz.
- workout-ui.css: ortak kolon grid'i; 44 px dokunma alanı, 21 px değer,
  14 px yardımcı metin. Dar/yatay/klavye görünümünde alt alan kaydırılır.
- design-system.css: profil/Auth yardımcı metinleri büyüdü. Paletler aynı.
- Sürüm/cache dosyaları ve Android web kopyaları yenilendi. Sürüme sabitlenen
  test beklentileri güncellendi; iş kuralı testleri kaldırılmadı.

## Doğrulama ve üretim

npm test: 23 grup. tests/browser-0141.cjs: 30 gerçek Chromium kontrolü.
Sentetik yerel veri ve engellenmiş dış ağ kullanılır. Ekranlar gerçek uygulama
render'larıdır; fiziksel telefon kanıtı değildir. Klavye viewport simülasyonu.
Telefon/IME, SMTP, push ve temiz Gradle derlemesi bu ortamda yapılmadı.

Standart Gradle projesi ve scripts/build_android.py korunur. Teslim APK,
scripts/repack_web_apk.py ile doğrulanmış 0.14.0'dan üretilir: native DEX,
origin, izinler, logo/splash aynı, web dosyaları ve sürüm metadatası yeni.
APKTool 2.11.1 resmi sürüm, uber-apk-signer 1.3.0 içindeki Android apksigner
kullanıldı. Script com.android.apksigner.ApkSignerTool sınıfını doğrudan
çağırır. Araç hash'leri build-result.json'da. V2/V3 doğrulandı; V1 geçti deme.
Anahtar/parolayı kaynağa, günlüğe, ZIP'e veya GitHub'a koyma.

Tarayıcı testi: FITTRACK_CHROMIUM_PACKAGE=/paket/yolu node tests/browser-0141.cjs
veya FITTRACK_CHROME=/chrome/yolu node tests/browser-0141.cjs.
tests/apk_inspect.py önceki APK ile kimlik/DEX/izin/kaynak/imzayı karşılaştırır.

## Sıradaki adım

0.14.1 cihaz/görsel kabulü; sonra 0.15 üye ekranları, 0.16 antrenör iş akışları.
29 ekranın tamamı uygulanmış değil. Önceki fiziksel kabul maddelerini otomatik
testle kapatma. Yeni ölçüm kullanan pilotun tüm cihazları 0.14+ olmalı.
