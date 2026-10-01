# FitTrack 0.15.0 — üye ana sayfası

Android sürümü **0.15.0 / versionCode 37**, yerel veri şeması **15**. Paket kimliği,
mevcut dört tema, beta imza zinciri ve 0.14.4 antrenman akışları korunur.

## Bu sürümün kapsamı

- Üye ana sayfası onaylı final tasarım diline uyarlandı.
- Üye adı, salon adı, profil ve antrenör mesajı tek kompakt başlıkta toplandı.
- Atanan bütün programlar eşit öncelikli, yatay kaydırılabilir kartlarda gösterilir.
- Uygulama program önermez; kullanıcı her karttaki **Antrenman seç** düğmesiyle karar verir.
- Devam eden program yalnız **Devam et** etiketiyle ayırt edilir; daha büyük veya önerilen kart yapılmaz.
- **Tümünü gör** mevcut Programlarım ekranını açar.
- Haftalık tamamlanan günler, antrenman sayısı ve toplam süre gerçek geçmişten hesaplanır.
- Antrenör kartı ve mesaj düğmesi ana sayfada erişilebilir kalır.
- Ataması sonradan kaldırılan yarım antrenmanın devam/iptal kurtarma yolu korunur.
- Üyesiz/programsız ve çoklu program durumları için boş ve taşma durumları eklendi.

## Özellikle değiştirilmeyenler

- Aktif antrenman, set girişi ve hareket geçişleri
- Program/seans seçme penceresi
- Programlarım, hareket kütüphanesi, ilerleme ve profil ekranları
- Antrenör ekranları
- Supabase şeması ve RLS
- Tema paletleri

Bu ekranlar yol haritasındaki sonraki küçük sürümlerde ele alınacaktır.

## Otomatik doğrulama

- Eski regresyon grupları yeni sürüm kimliğine taşındı.
- `member-ui-0117` ana sayfa değişikliklerine göre güncellendi.
- `member-home-0150` çoklu program, eşit kart, gezinme, dokunmatik yatay kaydırma,
  tema tokenları ve üye/antrenör ayrımı sözleşmesini denetler.
- `npm test`, `npm audit --omit=dev` ve kaynak kopya eşleşmesi teslimden önce çalıştırılır.

Fiziksel telefonda yatay kart kaydırma, dört tema, küçük ekran, uzun program adı,
antrenör mesajı ve mevcut 0.14.4 üzerine güncelleme ayrıca kabul edilmelidir.
