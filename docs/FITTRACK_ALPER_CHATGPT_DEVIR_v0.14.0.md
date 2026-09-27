# FitTrack 0.14.0 — Alper'in ChatGPT'sine teknik devir

## Okuma sırası ve otorite

Bu belge mevcut kodun durumunu anlatır. Önce bu belgeyi, sonra `UI_0140_OLCUM_SOZLESMESI.md`, `FITTRACK_v0.14.0_TELEFON_TESTLERI.md` ve `references/YOL_HARITASI_REV9_ORIJINAL.md` dosyalarını oku. Önceki devirler tarihsel kayıttır. Kodun varlığı telefon kabulünün tamamlandığı anlamına gelmez.

## Taban

- Doğrudan FitTrack 0.13.1 üstüne geliştirildi; 0.12.1 veya eski UI taslaklarına geri dönülmedi.
- Uygulama 0.14.0; Android versionCode 32; yerel JSON şeması 15. Paket com.fittracklabs.mobile, origin https://localhost, min API24, target API36.
- SQL migration yok. Canlı Supabase, gerçek hesaplar, programlar, GitHub push/PR/merge değiştirilmedi.
- Kaynak React/Vite değil; mevcut vanilla JS/CSS + Capacitor projesidir.

## Son kullanıcı talebi

Ad ve soyad aynı ekranda alt alta olacak. Cinsiyet ayrı adımda kalacak. Mevcut/hedef kilo girişine dokununca açılan klavye cetveli gizlemeyecek; klavye kapanıp input odakta kalsa da cetvel geri gelmeme sorunu olmayacak.

Kök neden `design-system.css` içindeki `html.fittrack-keyboard-open .weight-ruler` ve `:has(input:focus)` üzerinden `display:none` verilmesiydi. İki gizleme kuralı kaldırıldı. Görünüm yüksekliği `visualViewport` ve genişlik başına tutulan en yüksek viewport üzerinden güncellenir. Veri girişi sırasında form tekrar çizilmez. Şema14 profil taslakları ve 6→7 adım geçişi korunur.

## Bağlayıcı antrenman kararları

1. GIF büyük ve üstte sabit; altı bağımsız kayar. “Nasıl yapılır?” kapalı açılır ve maddeli açıklama gösterir.
2. Antrenör kaç set tanımladıysa o kadar satır aynı sayfada bulunur. Set tiklenince sayfa/set otomatik değişmez, otomatik değer kopyalanmaz.
3. Dinlenme ekranı ve dinlenme sayacı yok. Üstteki saat toplam süre içindir. Eski dinlenme alanları sadece göç/geri okuma amacıyla tutulur.
4. Altta Sıradaki hareket; son harekette Antrenmanı bitir. Üstte önceki hareket. İşaretlenmemiş setler için açık devam onayı gerekir; tamamlandı işareti uydurulmaz.
5. Ağırlık+tekrar gibi ikili profillerde iki alan birlikte doldurulur veya ikisi boş bırakılır. Pozitif/geçerli sayı kontrolü vardır. Ölçüm girişi opsiyonel; tamamlama ayrı kullanıcı kararıdır.
6. Önceki değerler tek veya tüm setlere yalnız açık eylemle uygulanır. Toplu üzerine yazma onaylıdır; tikler değişmez.
7. Geçmiş düzenlemede tüm kayıtlı hareketler açık, sabit fotoğraflı kartlar; tek Save; başarısız validasyonda asıl kayıt atomik olarak değişmez. Kaydetmeden geri çıkış korunur.
8. Program oluşturma/inceleme, listeler ve geçmişte fotoğraf. GIF yalnız aktif antrenman ve hareket detayında. Posterler kendi GIF'inin ilk karesidir; başka hareketin görseli kullanılmaz.
9. Seansı kullanıcı seçer; öneri, gün eşlemesi veya otomatik seçim yok. Aynı haftada tekrar uyarısı kalır, yasak değildir.
10. Özet motive edici; ağrı, medikal kontrol, RPE veya yeni zorunlu soru yok.

## Dosyalar ve uygulama ayrıntıları

- `app.js`: altı ölçüm profili, eklemeli normalizasyon, aktif antrenman, önceki değerler, geçmiş editörü, taslak doğrulama, profil viewport.
- `workout-ui.css`: antrenman/geçmiş/özetin yeni düzeni. Dört mevcut paletin token'larını kullanır.
- `design-system.css`: ad-soyad tek sütun, cetvel görünürlüğü düzeltmesi.
- `assets/posters/*.png`: altı GIF'in sabit kareleri. `exerciseImg` varsayılan olarak poster seçer; animasyon ancak açık `true` parametresiyle açılır.
- `index.html`, `scripts/stage_web.cjs`, `sw.js`: yeni CSS ve posterlerin dağıtımı/önbelleği.
- `normalizeMeasurement`: eski booleanları eşler; ağırlık var/tekrar yok gibi belirsiz kombinasyonları review işaretler. Hareket adına bakarak Plank gibi tahmin yapılmaz. Geçmiş değerleri değiştirilmez.
- Antrenör Programlar bölümünde varsa ölçüm inceleme listesi açılır. Belirsiz profil açık seçilmeden yeni yayın engellenir; taslak olarak saklanabilir.
- `cloud.js` taşıma katmanı değişmedi; yeni alanlar JSON payload içinde korunur. PGlite ve VM roundtrip testleri eklendi.
- `close-sheet` açık düğmeleri artık kapanır; yalnız backdrop tıklaması ile panel içindeki normal tıklamaları ayıran koruma sürer.

## Veri güvenliği / dağıtım sınırı

Yerel şema15 göçü eklemelidir. Eski yarım antrenmanın programSnapshot, dayId, exerciseIndex, setIndex, syncId ve mevcut logları korunur. Eski rest.next kaydı varsa bir kez uygun konuma geçilip yeni ekranda devam edilir. Mevcut SQL/RLS değişmez.

ÖNEMLİ: Yeni ölçüm türleri kullanılmadan önce test/pilot grubundaki antrenör ve üyelerin tüm cihazları 0.14'e güncellenmelidir. Eski 0.13 istemcilerinin ileri şemayı güvenle düzenlemesi sağlanmış değildir; sunucu taraflı minimum sürüm kapısı eklenmedi. Eski uygulamayı yeni veriyle çalıştırmak güvenli rollback değildir. Yedek ve koordineli yükseltme gerekir.

Eski programların ağırlık hedeflerinde bağımsız birim metadatası bulunmaması önceki modelden kalan sınırlamadır; bu sürümün açık kg/lb dönüşüm testleri antrenman/geçmiş değerlerini kapsar. Farklı birim kullanan antrenör→üye hedefi, geniş pilot öncesi ayrı kabul edilmelidir. Süre daima saniye; mesafe daima metre. Yeni karışık metrikler tonnaj gibi yorumlanmaz.

## Doğrulama kanıtı

- `npm test`: 23/23 grup. `tests/workout-0140.cjs`: altı profil roundtrip, eski ölçüm göçü, 12 set, doğrulama, manuel geçiş, bitirme tekilliği, önceki değer/birim dönüşümü, hacim, geçmiş atomikliği, snapshot ve poster testleri.
- `tests/database-0114.cjs`: gerçek PostgreSQL/PGlite testlerine şema15 JSON kayıt/snapshot/program alanları eklendi. Mevcut RLS senaryoları devam eder; canlı veri kullanılmaz.
- `tests/browser-0140.cjs`: 18 gerçek Chromium kontrolü. Dört tema, 320×568, klavye benzetimi 390×430, yatay 740×360; bütün dış ağ istekleri engelli sentetik veri.
- Yerel browser motoru Chromium 138 (`@sparticuz/chromium` 138.0.2) kullanıldı; alternatif standart Playwright/Chrome yolu env ile verilebilir. Browser bağımlılığı uygulamanın üretim paketi değildir.
- Fiziksel Android/IME, gerçek Auth/SMTP, push ve ticari pilot kabulü yapılmadı.
- Üretim npm bağımlılıkları taraması: 0 bilinen açık; tüm güvenliğin kanıtı değildir.

## APK üretim yöntemi ve sınırları

Bu ortamda tam Android SDK/Gradle cache yok. Doğrulanmış 0.13.1 APK `apktool --no-src` ile açıldı; DEX, logo, native ayarlar ve bootstrap aynı kaldı. Yalnız kanonik web dosyaları ve sürüm metadatası değişti. Kontrollü web repack, temiz Gradle derlemesi değildir.

`scripts/repack_web_apk.py` bu işlemi tekrarlar; dışarıdan base APK, apktool/apksigner jar ve mevcut FITTRACK_* imza değişkenleri gerekir. `scripts/zipalign_apk.py` baytları yeniden sıkıştırmadan stored ZIP girdilerini hizalar. `tests/apk_inspect.py` kaynak31/31, izin/origin, ikon, değişmeyen DEX, sürüm ve imzayı karşılaştırır. V2 ve V3 doğrulandı. Google Play üretim anahtarı değil, önceki beta anahtarı kullanılır. Anahtarı/parolayı kaynak, log veya GitHub'a koyma.

Normal geliştirici makinesinde tam Gradle kaynağı hazırdır: `npm ci --ignore-scripts`, `npm test`, `python3 scripts/build_android.py --sign`. Temiz Gradle üretimi ve bu APK'nın bayt eşitliği iddia edilmez; telefon kabulü ikisinde de ayrıca gerekir.

## Sonraki iş

Önce telefon listesindeki A01–A08 ve B01–B03 sonuçlarını al. Bloker varsa 0.14.x hata yaması yap; 0.15 özelliğini yama sürümüne sıkıştırma. Kabulden sonra 0.15 üye deneyimi, ardından 0.16 tam antrenör/Program Stüdyosu. 0.17 push/check-in, 0.18 hazırlama/sürümleme, 0.19 superset/esnek planlama, 0.20 sync güvenliği, 0.21 ticari pilot, 0.22 salon sahibi web paneli yerinde duruyor. Gelecek QR, paket/erişim ve pilot sonrası turnike kararları iptal değildir; 0.14'e yapılmış gibi yazma.
