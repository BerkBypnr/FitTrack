# FitTrack 0.13.0 — kısa telefon kabulü

Durum: Bu listedeki fiziksel kontroller henüz bizim tarafımızdan yapılmadı.
Tarayıcı testleri fiziksel klavye, Android dosya seçicisi veya gerçek e-posta testi sayılmaz.

Önce mevcut uygulamadan JSON yedeği al/paylaş. 0.13.0 APK'yı mevcut beta uygulamasının
üstüne kur; uygulamayı/verilerini silme. Kurulum hatası olursa kaldırmadan hatayı ilet.

| Kod | Nasıl test edeceksin? | Geçme ölçütü |
|---|---|---|
| U01 | Eski beta üstüne 0.13.0 kur. Hesabını ve birkaç eski antrenmanını aç. | Tek uygulama kalır; hesap/salon, kayıtlar ve programlar korunur; sürüm 0.13.0 görünür. |
| U02 | Ayarlar → Görünüm ve tema. Dört temayı sırayla seç; uygulamayı kapatıp aç. | Koyu Kırmızı, Plum Night, Redline Editorial, Rosewood Strength var; seçim korunur; açık zeminde yazılar okunur. |
| U03 | Bekleyen senkronizasyon yokken çıkış yap. | FT/dumbbell karşılama açılır; kadın görseli yok; Giriş yap ve Hesap oluştur çalışır. Eski kayıtlar silinmez. |
| U04 | Girişte e-posta ve şifre yaz. Göz düğmesine iki kez bas. Yanlış şifreyle dene, sonra doğrusuyla giriş yap. | Göster/gizle değeri bozmaz; yanlış şifre anlaşılır hata verir; doğru şifre giriş yapar; kendiliğinden e-posta kodu gönderilmez. |
| U05 | Test e-postasıyla kayıt ekranını dene: farklı şifre tekrarı, sonra doğru eşleşme. | Hatalı eşleşmeyle hesap oluşturulmaz; doğru onaylı kayıt doğrulamaya gider; ad/e-posta hata sonrası kaybolmaz. |
| U06 | Kayıt/kurtarma e-postasındaki kodu tek alana yapıştır; hatalı kod dene. | Baştaki sıfır korunur; hata tekrar girişe izin verir; yeniden gönderim geri sayımı görünür; 60 sn dolmadan yinelenmez. |
| U07 | Girişte e-posta boşken Şifremi unuttum'a bas. E-postanı açılan forma yazıp gönder. Kodu doğrula ve yeni şifre belirle. | Önce form açılır; yalnız Gönder sonrası istek çıkar. Kod doğrulanmadan şifre değiştirilemez. Yeni şifreyle giriş olur. |
| U08 | Profilde cinsiyet kartı seç, yaş/boy tekerleğini kaydır; ardından değeri elle yaz. | Kart seçimi görünür; kaydırma ve elle yazma aynı bilgiyi düzenler; Geri/Devam yazılanı korur. |
| U09 | Mevcut kiloya 78,5 yaz. kg→lb→kg yap. Hedef kilo adımını atla; Güçlenmek seçip tamamla. | Virgüllü giriş çalışır; birim dönüşümü mantıklıdır; hedef kilo zorunlu değildir; tekrar açınca seçimler korunur. |
| U10 / eski T01 | Profilin ad veya boy alanını değiştir, KAYDETME. Klavye açıkken telefonu yataya ve tekrar dikeye döndür. Sonra uygulamayı arka plana al/geri aç. | Yazdıkların ve adım korunur. Devam düğmesine kaydırarak erişilir; alan klavyenin altında kalmaz. |
| U11 / eski T02 | Gizlilik ve veriler → Yedeği cihaza kaydet. Dosya adı/klasör seç. Dosyalar uygulamasından JSON'u bul. Sonra ayrı Yedeği paylaş düğmesini dene. | Kaydet gerçek Android dosya seçicisini; Paylaş paylaşım menüsünü açar. Kaydetmeyi iptal etmek başarı mesajı göstermez. |
| U12 | Antrenör hesabında Ana sayfa/Üyeler/Programlar/Mesajlar/Ayarlar menülerini gez. Üye hesabında kendi menüsünü kontrol et. | Beş antrenör sekmesi ve üye sekmeleri ayrı kalır; tuşlar ekran altında kesilmez; rol yetkisi değişmez. |
| U13 | Mevcut programdan istediğin seansı seçip kısa bir antrenman başlat; yarım bırak ve dön. | 0.12.2 işleyişi korunur, yanlış seans başlamaz. Büyük GIF + bütün setler şeklindeki YENİ aktif ekran 0.14'tedir; bu sürümde bekleme. |
| U14 | İnterneti kapatıp aç; mevcut çevrimdışı ekranları kontrol et. | Bağlantı durumu anlaşılır; yerel veriler kaybolmaz; yeniden bağlanınca mevcut eşitleme davranışı sürer. |

Sonuçları `U01 geçti`, `U10 kaldı: ...` biçiminde iletebilirsin. Hata için telefon modeli,
Android sürümü, rol/tema, son dokunduğun düğme ve mümkünse ekran videosu ekle.

K35: Önceki listede denenemeyen özel mesajlaşma maddesi için orijinal K35 yönergesini
kullan; yalnız “mesajlaşma iyi görünüyor” bu senaryonun geçtiği anlamına gelmez.

Geçiş kararı: U01, U04, U10 veya U11 veri/erişim hatası verirse 0.14 geliştirmesinden
önce gider. Kozmetik bulguları da kaydet; kritik veri hatalarıyla aynı önceliğe koyma.
