# FitTrack v0.12.2 — Alper'in ChatGPT'si için devir

Tarih: 17 Eylül 2026  
Taban: doğrulanmış `FitTrack-Beta-0.12.1-Source.zip`  
Sürüm: `0.12.2` / versionCode `29` / şema `14`

## Bu sürümün sınırı

Bu bir UI yenilemesi değil, 0.12.1 fiziksel telefon kabulünden çıkan iki açık için
hotfix'tir. Supabase, veri şeması, ürün akışı ve final UI kararları değiştirilmedi.
0.13.0 geliştirilirken bu kaynak yeni taban alınmalı; 0.12.1'e geri dönülmemeli.

## Uygulanan iki düzeltme

### 1. Profil taslağının dönüşte kaybolması

- Profil sihirbazının tamamlanmamış değerleri `input`, adım geçişi, `pagehide`,
  `visibilitychange` ve `orientationchange` anlarında yerel kurtarma kaydına yazılır.
- Kayıt hesap + salon kimliğiyle scope edilir; başka kullanıcıya/salona sızmaz.
- WebView yeniden kurulduğunda değerler ve aktif adım geri alınır.
- Kaydetme veya açık iptal taslağı temizler.
- Klavye açık yatay görünümde üst/progress alanı sıkıştırılır ve aktif alan görünür tutulur.

İlgili ana dosyalar: `app.js`, `styles.css`, `tests/hotfix-0122.cjs`.

### 2. JSON yedeğini cihazda konum seçerek kaydetme

- Ayarlar arayüzü artık iki ayrı eylem sunar: **Yedeği cihaza kaydet** ve
  **Yedeği paylaş**.
- Kaydetme, özel Capacitor Android eklentisi `FitTrackFileSaver` üzerinden
  `Intent.ACTION_CREATE_DOCUMENT` açar; Android klasör ve ad seçimini kullanıcıya bırakır.
- Paylaşma, mevcut Filesystem CACHE + Share hattını kullanmayı sürdürür.
- `READ/WRITE_EXTERNAL_STORAGE` veya `MANAGE_EXTERNAL_STORAGE` eklenmedi.

İlgili ana dosyalar:

- `android/app/src/main/java/com/fittracklabs/mobile/FitTrackFileSaverPlugin.java`
- `android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java`
- `app.js`

## Telefon kabulü

Kullanıcı, sorun olarak ayrıca yazmadığı 0.12.1 telefon testlerinin tamamının geçtiğini
bildirdi. K31-K34 ve K36 açıkça geçti. K35 yapılmadı; yalnız mesajlaşmanın görünümünde
sorun görülmedi. 0.12.2 için `docs/FITTRACK_v0.12.2_TELEFON_TESTLERI.md` içindeki T01 ve
T02 fiziksel telefonda yeniden denenmelidir.

## Sonraki geliştirme: v0.13.0 UI

- Onaylanmış temiz final görsel paketi tasarım kaynağıdır.
- Eski/iptal mockup'lar uygulanmamalıdır.
- Aktif antrenmanda büyük sabit GIF, açılır “Nasıl yapılır?”, tüm setlerin aynı ekranda
  kilo/tekrar alanları ve altta “Sıradaki hareket” bulunur; dinlenme sayacı yoktur.
- Antrenör ana sayfası günlük yeni program üretmeye zorlamaz. Gelmeyen üyeler baskıcı
  uyarı olarak sürekli gösterilmez; antrenör isterse filtreleyip iletişim kurar.
- Program atamasında süre zorunlu değildir; isteğe bağlı süre/ölçü bilgisi ayrı tasarlanır.
- Mevcut Redline Editorial, Plum Night ve Rosewood Strength korunur; yeni koyu kırmızı
  tema Crimson Graphite'ın yerini alır.
- UI geçişi riskine göre seri küçük sürümlere bölünebilir; tek dev paket zorunlu değildir.

## Değiştirilmemesi gereken sözleşmeler

- Çok günlük programda seansı kullanıcı seçer; otomatik öneri veya gün eşleştirmesi yoktur.
- Yarım antrenman doğru seans snapshot'ıyla devam eder.
- Aynı seansın aynı hafta tekrarı yalnız uyarılır, engellenmez.
- Yedek, bildirim ve kuyruk verileri hesap + salon kapsamında kalır.
- Kilo + tekrar ağırlıklı sette birlikte dolu veya birlikte boş olmalıdır.
- Şema 14 ve mevcut Supabase güvenlik sözleşmeleri korunur.

## Yerel doğrulama

- `npm test`: 20/20 grup
- Release Android build ve lint: başarılı
- Paket: `com.fittracklabs.mobile`
- Min/target SDK: `24 / 36`
- İmzalama: mevcut beta sertifikası; V1/V2/V3 doğrulanmalı
- Sertifika SHA-256: `38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce`
- Geniş depolama izni: yok

Anahtar, parola, APK ve yerel Android araç zinciri kaynak ZIP'ine konulmamalıdır.
