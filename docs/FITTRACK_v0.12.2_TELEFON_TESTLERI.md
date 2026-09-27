# FitTrack v0.12.2 — kısa telefon kabulü

17 Eylül 2026. 0.12.1 testlerinin kullanıcı tarafından ayrıca sorun bildirilmeyen
maddeleri geçti. Bu sürümde yalnız aşağıdaki iki düzeltmeyi yeniden dene. Uygulamayı
kaldırma ve verisini silme; 0.12.1'in üzerine güncelle.

## T01 — profil taslağı ve ekran dönüşü

1. Profil bilgileri ekranına gir.
2. Bir alana henüz kaydetmeyeceğin yeni bir değer yaz ve klavyeyi açık bırak.
3. Telefonu yataya, sonra tekrar dikeye döndür.
4. İstersen uygulamayı arka plana alıp geri getir.

Beklenen:

- Yazılan değer kaybolmaz.
- Aynı profil adımı açık kalır.
- Yatayda klavye alanı örtmez; odaktaki alan ve Devam/Kaydet eylemi erişilebilir olur.
- Başka hesap veya salona geçilirse eski taslak yeni bağlama taşınmaz.

## T02 — yedeği gerçekten cihaza kaydetme

1. Ayarlar > gizlilik/veri bölümüne gir.
2. **Yedeği cihaza kaydet** seçeneğine dokun.
3. Android dosya seçicisinde `Belgeler` gibi bir klasör seç, adı koruyup kaydet.
4. Dosyalar uygulamasından `.json` dosyasının bulunduğunu doğrula.
5. Ayrı **Yedeği paylaş** eylemine dokun ve paylaşım panelinin açıldığını doğrula.
6. Kaydettiğin JSON'u uygulamanın içe aktarma akışında seç.

Beklenen:

- Kaydet eylemi paylaşım paneli değil dosya/konum seçici açar.
- Paylaş eylemi yalnız paylaşım panelini açar.
- JSON geçerli ve aynı hesap + salon bağlamında yeniden içe alınabilir.
- Uygulama geniş depolama izni istemez.

## Kayıt durumu

- K31, K32, K33, K34 ve K36: kullanıcı tarafından geçti olarak bildirildi.
- K35: denenmedi; mesajlaşma görünümünde gözle görülür sorun bildirilmedi ama canlı iki
  hesap/realtime kabulü yapılmış sayılmaz.
- Diğer istenen 0.12.1 telefon testleri: kullanıcı tarafından geçti olarak bildirildi.
