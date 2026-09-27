# FitTrack 0.14.4 — telefon geri bildirimleri

Android sürüm kodu: **36**. Aynı uygulama kimliği ve mevcut beta imzası kullanılır. 0.14.3 üzerine güncelleme olarak kurulabilir; uygulamayı kaldırmak gerekmez.

## Yapılan değişiklikler

- Seans seçimi: büyük üst boşluk ve dar başlık kaldırıldı; seans ve son tamamlanma bilgileri aynı satırda. Seçim yapılmadan alt düğme gri.
- Aktif antrenman: başlık güvenli üst alana göre aşağı alındı; yatay ekranda alt düğme ve setlerin kaydırılması düzeltildi.
- Antrenman kontrolü: beş kompakt satır, çizgi ikonları ve sağ oklar. Önceki sete dönüş, tamamlanan seti silmeden çalışır.
- Hareket detayı: kas/ekipman etiketleri, tam genişlikte numaralı açıklamalar ve ikonlu antrenör notu.
- İlk üye kaydı: ad soyad, yaş, cinsiyet, boy, kilo, hedef ve isteğe bağlı hedef kilo tek formda. Taslak yeniden açılışta korunur; geçersiz değerler kaydedilmez.
- E-posta kodu ekranının istenmeyen uzun alt açıklaması kaldırıldı.
- Programlarım kartları 0.14.2 düzenine döndürüldü.
- Ölçümler: bel, boyun, kol ve kalça için ayrı ikonlar; son kayıt tarihi; düzenleme ikonu.
- 0.14.3'ün tema renklerini değiştiren ek kuralları kaldırıldı. Tema tanımları 0.14.2 ile aynı; iptal düğmeleri de seçilen temanın ana düğme rengini kullanır.
- Antrenman pencereleri: iptal/silmede çöp kutusu, erken bitirmede uyarı, tekrar başlatmada onay ikonu ve tutarlı düğmeler.
- Duraklatma, yarım antrenman özeti ve yarım kayıt kurtarma düzenleri yenilendi. Duraklatmada süre ve tahmini kalori gösterilir. Kalori, süre ve kilodan 3,5 MET ile hesaplanan kaba bir tahmindir; sensör ölçümü değildir.

Mevcut hareket GIF'leri ve posterleri kullanılır. Referanslardaki farklı sporcu fotoğrafları için yeni görsel üretilmedi; yerleşim düzeltmeleri uygulandı.

## Doğrulama

- 9 hedefli Chromium kontrol grubu geçti; 320/360/390 piksel dikey ve 740 piksel yatay ekranlar kontrol edildi.
- Dört tema, profil taslağının yeniden yüklenmesi, kayıt doğrulaması, setin korunması, duraklatma/devam, yarım kayıt ve kurtarma kontrol edildi.
- APK içindeki 32 web dosyası kaynak çıktısıyla birebir karşılaştırıldı.
- APK imzası doğrulandı. Native DEX dosyaları 0.14.3 ile aynıdır; web arayüzü mevcut APK kabuğunda güncellendi. Bu teslim yeni bir Gradle derlemesi değildir.
- İzole Android emülatöründe 0.14.3 / kod 35 üzerine `install -r` başarılı; 0.14.4 / kod 36 açıldı.
- Fiziksel Samsung cihazı, gerçek e-posta gönderimi ve canlı hesap akışları bu teslimde test edilmedi.

## Berk ile kısa telefon kontrolü

Uygulamayı kaldırmadan APK'yı kurun. Seans seçimi, aktif antrenmanın üst boşluğu, beş satırlı kontrol menüsü ve ölçüm ikonlarını kendi telefonunuzda kontrol edin. İlk kayıt formunu ayrı bir test hesabında deneyin. Mevcut hesapla bir set kaydedip duraklatın; yeniden açıp devam edin ve yarım kayıt sonucunu kontrol edin.

Kaynak kodundaki `tests/browser-0144.cjs` bu sürümün hedefli arayüz testidir. Eski sürüm testleri tarihsel beklentiler içerir. `npm ci` sonrasında `npm run build:web` ve `npm run sync:android` kullanılabilir. İmza anahtarı/parolası pakete konmamıştır; mevcut güvenli imzalama ayarları kullanılmalıdır.
