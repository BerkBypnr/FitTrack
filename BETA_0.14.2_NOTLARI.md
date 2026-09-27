# FitTrack 0.14.2 — telefon geri bildirimi UI düzeltmesi

Taban: 0.14.1. Sürüm: **0.14.2 / versionCode 34 / yerel şema 15**.
Paket kimliği, Supabase şeması, izinler, dört tema, FT logo ve imza zinciri değişmedi.

## Değişenler

- Seans seçimi büyük numaralı kartlardan kompakt radyo satırlarına çevrildi. Uygulama seans önermez; seçimi kullanıcı yapar.
- Aktif antrenmanda büyük sabit GIF, tek açılır “Nasıl yapılır?” alanı, bütün setler ve sabit sonraki hareket düğmesi korunur.
- Ayrı antrenör notu kartı kaldırıldı. Not varsa “Nasıl yapılır?” bölümünün içinde görünür; setleri ilk ekranda aşağı itmez.
- Dinlenme sayacı ve set tamamlanınca otomatik ilerleme yoktur.
- Tam ve yarım antrenman özetleri ayrıldı. Tam kayıtta kapak, hızlı istatistikler, setler ve düzenleme; yarım kayıtta tamamlanan set uyarısı vardır.
- Duraklatma ekranı hareket bağlamını, geçen süreyi, devam ve daha sonra devam et eylemlerini birlikte gösterir.
- Profil yedi adım olarak kalır: ad/soyad alt alta, cinsiyet ayrı sayfa, yaş, boy, mevcut kilo, isteğe bağlı hedef kilo, hedef.
- Kilo/hedef kilo klavyesi kapandığında ekranın kaydırma konumu sıfırlanır; cetvel yeniden görünür.
- Yaş ve boyda ikinci manuel değer kartı yoktur. Tema adları Kızıl Güç, Mürdüm Gece, Fildişi Enerji ve Bordo Asalet olarak kalır.

## Kapsam dışı

Üye ana sayfasının bütünü, program listesi/kütüphane, ilerleme, mesajlaşma ve profil alt ekranları 0.15; antrenör ekranları 0.16 kapsamındadır. Canlı Supabase ve GitHub değiştirilmedi.

## Doğrulama

- 24/24 yerel test grubu geçti.
- Üretim bağımlılık denetiminde 0 bilinen açık.
- İmzalı APK: V2/V3 doğrulandı; paket/versionCode, kaynak eşleşmesi, ZIP CRC, hizalama ve sertifika geçti.
- 0.14.1 ile izinler, origin, native DEX, ikon ve splash birebir korundu.
- Fiziksel telefon/IME ve gerçek Chromium ekran testi bu ortamda çalıştırılmadı; telefon kabul listesi açıktır.

APK SHA-256 teslim raporunda ve `SHA256SUMS.json` içinde bulunur. İmza anahtarı ve parola teslim ZIP’ine dahil edilmez.
