# FitTrack 0.14.0 — antrenman deneyimi, UI 2/4

Taban: 0.13.1. Sürüm: 0.14.0 / versionCode 32. Yerel veri şeması: 15.
Paket: com.fittracklabs.mobile. Min Android API 24, hedef API 36.

## Bu sürümde

- Profilde ad ve soyad aynı adımda, alt alta. Cinsiyet ayrı adımda kalır.
- Mevcut kilo ve hedef kilo cetveli, klavye açılıp kapandıktan sonra kaybolmaz. Soruna neden olan odak/klavye CSS gizlemesi kaldırıldı.
- Aktif antrenmanda GIF üstte sabittir. Altında açılır/kapanır, maddeli “Nasıl yapılır?” ve antrenörün belirlediği bütün setler vardır.
- Setler açık kartlarda düzenlenir. Tamamlandı işareti kullanıcıya aittir; set işaretlenince otomatik sayfa değişmez. Dinlenme ekranı/sayacı yoktur. Üstteki saat toplam antrenman süresidir.
- Altta “Sıradaki hareket”, son harekette “Antrenmanı bitir”; üstte önceki harekete dönüş bulunur. Eksik setlerde onay sorulur, kendiliğinden tamamlandı sayılmaz.
- Altı ölçüm profili: ağırlık + tekrar, vücut ağırlığı tekrarı, süre, mesafe + süre, ağırlık + mesafe, yalnız tamamlandı.
- Önceki antrenmanın değerleri tek sete veya tüm setlere açık kullanıcı eylemiyle uygulanır. Toplu uygulama mevcut girdileri değiştirecekse onay istenir.
- Geçmiş düzenlemede hareketler açık kartlarla alt alta, sabit fotoğraflarla gösterilir. Tek kaydetme düğmesi ve kaydetmeden çıkış uyarısı vardır.
- Program oluşturma/inceleme ve listelerde sabit fotoğraf; GIF yalnız aktif antrenman ve hareket detayında. Altı yerel GIF için kendi ilk karelerinden poster üretildi; hareket eşleşmesi değişmedi.
- Bitirme özeti yalnız süre, set, hareket ve motive edici metindir. Sağlık/ağrı sorusu eklenmedi.

## Korunanlar

Onaylı FT logosu, dumbbell açılışı ve dört tema korunur. Yaş/boydaki ikinci gösterge geri gelmez. Seansı kullanıcı seçer; otomatik öneri veya haftanın gününe zorunlu eşleme yoktur. Aynı hafta aynı seans uyarısı ve doğru seanstan devam etme korunur. Hesap/salon izolasyonu, yedek kaydı, Auth ve mesajlaşma altyapısı değiştirilmedi.

## Doğrulama

- 23/23 yerel test grubu; yeni antrenman grubunda 16 kontrol.
- 18/18 gerçek Chromium kontrolü: dört tema, dar/yatay ekran, profil cetvelleri, setler, geçmiş ve ölçüm seçimi.
- PostgreSQL/PGlite üzerinde yeni JSON ölçümlerinin saklanması ve mevcut RLS kontrolleri geçti. Canlı Supabase'e veri/migration yazılmadı.
- İmzalı APK ile 31 kanonik web/varlık dosyası birebir eşleşir. V2/V3 imza, sertifika, ZIP CRC, sürüm ve hizalama doğrulandı.
- Üretim npm bağımlılık taraması: 0 bilinen güvenlik açığı.
- Tarayıcıdaki klavye testi küçülen görünüm alanı simülasyonudur; fiziksel Android IME testi değildir.

## Teslimin sınırları

Bu APK, doğrulanmış 0.13.1 APK'nın değişmeyen yerel DEX/ikon/ayarlarıyla kontrollü web güncellemesidir; temiz Gradle derlemesi iddia edilmez. Tam Gradle/Capacitor kaynakları ve yeniden paketleme betiği kaynak ZIP'indedir.

0.14 henüz fiziksel telefonda kabul edilmedi. Önce yedek al, mevcut uygulamayı kaldırmadan üstüne kur. Yeni ölçüm kullanan pilot hesapların tüm cihazları ve antrenörü 0.14'e güncellenmelidir; eski 0.13 istemcileri yeni ölçüm alanlarını güvenle düzenleyemez. Eski sürüme dönüş, yeni veriyi eski APK'ya açmak anlamına gelmemeli.

Üye ekranlarının kalan final tasarımları 0.15; tam antrenör/Program Stüdyosu tasarımı 0.16 kapsamındadır. Rev9'daki sonraki özellikler iptal edilmedi. Bu sürüm ücretli pilotun bütün koşullarını tamamlamaz.
