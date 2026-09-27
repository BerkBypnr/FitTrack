# FitTrack 0.14.1 — final UI uyumu ve okunabilirlik

Taban 0.14.0; sürüm 0.14.1 / versionCode 33 / yerel şema 15.
Paket com.fittracklabs.mobile. Mevcut beta imzası.

Telefon görüntülerindeki sorun açık tema değil, final pakete uymayan yerleşim
ve küçük metinlerdi. Bu yama paletleri veya kullanıcının seçimini değiştirmez.

- Aktif antrenman: hareket adı/kas/ekipman GIF'in üstünde. Büyük GIF sabit;
  altında açılır açıklama, varsa antrenör notu ve ortak başlıklı set tablosu.
  Antrenörün bütün setleri aynı sayfada. Üç satır 390×844 görünümde birlikte
  görünür; küçük ekranlarda ve çok sette alt bölüm kaydırılır.
- Değerler 21 px, yardımcı metinler 14 px, açıklamalar 16 px, ana eylemler
  18 px. Set kontrollerinin dokunma alanı en az 44 px.
- Dinlenme sayacı/otomatik geçiş yok. Toplam süre saati korunur. Tamamlanmamış
  setler onaysız geçilmez ve kendiliğinden tamamlanmış sayılmaz.
- Önceki değerler açılır bölümde. Boş/geçersiz eski değer için Uygula sunulmaz.
- Geçmiş düzenleme: kompakt başlık, açık fotoğraflı hareket kartları, ortak
  kolon başlıkları ve bütün değişiklikler için tek kaydetme.
- Özet: kayıtlı süre, hareket, tamamlanan set, hacim. Hacim yalnız ağırlık ×
  tekrar verisinden hesaplanır; veri yoksa “—”. Özetten düzenleyip geri dönülür.
- Profil/Auth yardımcı metinleri büyüdü. Ad/soyad alt alta; cinsiyet ayrı.
  Klavye sonrası cetvelin görünür kalması düzeltmesi korunur.

Onaylı FT logo/dumbbell açılışı, dört tema, altı ölçüm profili ve kayıt modeli
korundu. Canlı Supabase, Auth, yedek ve mesajlaşma altyapısı değiştirilmedi.
Kalan üye ekranları 0.15, antrenör ekranları 0.16 kapsamındadır.

23/23 yerel test grubu; 30/30 gerçek Chromium kontrolü. Bunlar fiziksel Android
ve IME testi değildir. Telefon test listesi teslim paketindedir.

APK, doğrulanmış 0.14.0 üzerine yeni web dosyaları ve sürüm metadatası
yerleştirilerek üretildi; native DEX aynı. Temiz Gradle derlemesi değildir.
V2/V3 ve aynı beta sertifikası doğrulandı. Anahtar/parola teslimlere eklenmedi.
