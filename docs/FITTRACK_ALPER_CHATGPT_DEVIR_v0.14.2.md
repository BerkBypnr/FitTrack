# FitTrack 0.14.2 — Alper’in ChatGPT’sine devir

## Tek otorite

Bu kaynak ve `BETA_0.14.2_NOTLARI.md` günceldir. Kimlik: **0.14.2 / versionCode 34 / şema 15 / com.fittracklabs.mobile**. Taban 0.14.1’dir. Eski UI taslaklarını veya 0.12.x kaynaklarını koda geri karıştırma.

## Bağlayıcı ürün kararları

- Kullanıcı hangi seansı yapacağını kendisi seçer; gün veya seans önerilmez.
- Aktif antrenman sırası: sabit büyük GIF → tek açılır “Nasıl yapılır?” → bütün setler → sabit sonraki hareket düğmesi.
- Antrenörün belirlediği set kadar satır aynı ekranda görünür. Set başına sayfa, dinlenme sayacı ve otomatik ilerleme yoktur.
- Antrenör notu ayrı aktif kart değildir; varsa açıklama alanının içindedir.
- Önceki harekete üstten dönülür. Eksik setler kullanıcı onayı olmadan tamamlandı sayılmaz.
- Program/geçmiş ekranlarında fotoğraf; aktif antrenman ve hareket detayında GIF kullanılır.
- Profil yedi adımdır. Ad/soyad alt alta; cinsiyet ayrı sayfa; yaş/boy tek wheel; kilo/hedef kilo cetvel + manuel giriş; hedef ayrı sayfa.
- Dört tema ve seçili tema korunur. FT monogram ile dumbbell açılışı değişmez.

## 0.14.2 uygulaması

- `openSessionPicker`: kompakt radyo satırları, program özeti, son tamamlanma; numara ve tavsiye metni yok.
- `renderWorkout`: ayrı coach details kaldırıldı; not `inline-coach-note` olarak ana açıklama içinde.
- `renderSummary`: tam/yarım kayıt farklı; partial’da kapak yok ve tam sayılmadığı açıklanır; ortak düzenleme düğmesi vardır.
- `renderPaused`: görsel bağlamlı duraklatma ekranı; dinlenme akışı değildir.
- `updateWorkoutViewport`: klavye kapanışında profil ana kaydırıcısını başlangıca alır.
- Sürüm/cache/Gradle kimliği 0.14.2/34; şema değişmedi.

## Kanıt ve sınırlar

24 yerel test grubu geçti. APK incelemesi kaynak eşleşmesi, resmi V2 imza doğrulaması, CRC, hizalama, paket, SDK, izin, origin, native DEX, ikon ve splash sözleşmesini doğruladı. Üretim npm audit 0 açık.

Bu ortamda gerçek Chromium ve fiziksel telefon/IME testi çalıştırılmadı. Telefon kabul dosyasını otomatik testle kapanmış sayma. Canlı Supabase, müşteri verisi ve GitHub değiştirilmedi. İmza anahtarı/parolayı kaynak, günlük veya ZIP’e koyma.

## Sonraki sürümler

0.15 kalan üye deneyimi; 0.16 antrenör/stüdyo akışları. QR/paket/giriş hakkı daha sonra; duvar QR yaklaşımı geçerli, antrenöre QR okutma eklenmeyecek. Turnike pilot sonrasında konuşulacak.
