# FitTrack 0.14.0 — telefon kabulü

Bu liste yeni APK içindir. Yerel otomatik testlerin geçmesi, aşağıdaki fiziksel kontrollerin geçtiği anlamına gelmez.

Önce mevcut uygulamada JSON yedeği al. 0.14.0 / versionCode 32 APK'yı uygulamayı kaldırmadan üstüne kur. Veri temizleme yapma. Kurulum başarısızsa eski uygulamayı silme; hata ekranını gönder.

## Önce bu 8 kontrolü yap

### A01 — Üstüne kurulum ve eski veriler

1. Güncellemeden önce seçili temayı, atanmış programları ve son iki geçmiş kaydını not et.
2. APK'yı üstüne kur ve aç. Ayarlarda sürüm 0.14.0 görünmeli.
3. Aynı hesap/salon, programlar, geçmiş ve tema korunmalı. Onaylı FT logo değişmemeli.

### A02 — Ad ve soyad

1. Ayarlardan profil bilgilerini düzenlemeye gir.
2. Ad üstte, soyad altta olmalı. İkisi aynı sayfada; cinsiyet sonraki sayfada olmalı.
3. İki alana yaz, klavye açıkken telefonu yatay/dikey çevir. Yazdıkların kalmalı.

### A03 — Mevcut kilo: bildirilen hata

1. Mevcut kilo adımına gel. Sayının altındaki cetveli gör.
2. Büyük kilo sayısına dokun. Sayısal klavye açılsın; örneğin 78,5 yaz.
3. Klavyeyi telefonun geri tuşuyla kapat. Sayı ve cetvel kaybolmamalı; cetvel gerektiğinde sayfayı kaydırınca erişilebilir olmalı.
4. Klavyeyi 3 kez aç/kapat. Sonra cetveli kaydır; sayı güncellenmeli.
5. Aynı işlemi yatay/dikey çevirerek yap. Ekranda ikinci boş panel veya kaybolan seçici olmamalı.

### A04 — Hedef kilo: aynı hata

1. Hedef kilo ekranında A03'ü tekrar et. Klavye kapanınca cetvel kullanılabilir kalmalı.
2. “Şimdilik atla” hâlâ çalışmalı; istemediğin hedef zorla atanmasın.
3. Yaş ve boy adımlarında tek tekerlek olduğunu kontrol et; ikinci değer alanı olmamalı.

### A05 — Yeni aktif antrenman

1. En az iki hareket ve hareket başına üç set içeren atanmış program aç.
2. Seanslar varsa istediğini kendin seç. Önceden seçili/önerilen seans olmamalı.
3. GIF üstte büyük görünmeli. Alt bölüm kayarken GIF yerinde kalmalı.
4. “Nasıl yapılır?” açılıp kapanmalı; açıklamalar maddeli olmalı.
5. Üç setin üçü aynı sayfada olmalı. Bir sete kilo/tekrar yazıp tiki işaretle: diğer sete/sayfaya kendiliğinden geçmemeli, dinlenme sayacı çıkmamalı.

### A06 — Kayıt doğruluğu ve hareketler arası dönüş

1. 1. sete 40 kg / 10 tekrar, 2. sete 42,5 kg / 8 tekrar yaz. Yalnız ilk iki tiki işaretle.
2. “Sıradaki hareket”e bas. Eksik üçüncü set için uyarı çıkmalı.
3. “Setlere dön” çalışmalı. Tekrar ilerle, bu kez “Eksik setlerle devam et” de.
4. Üstteki geri okundan önceki harekete dön. Değerler ve iki tamamlandı işareti aynen kalmalı; üçüncü set tamamlanmış sayılmamalı.
5. Bir satırda yalnız kilo veya yalnız tekrar bırakıp ilerlemeyi dene. “İkisini birlikte gir veya boş bırak” uyarısı olmalı. Geçerli hâle getirince devam edebilmeli.

### A07 — Kapat, aç, devam et

1. İkinci harekette ikinci sete değer gir. Programın/seansın adını not et.
2. Antrenman menüsünden duraklat; ana ekrana dön. Uygulamayı arka plana al ve tekrar aç.
3. Doğru program, seans, hareket, girilen değer ve işaretler korunmalı.
4. Uygulamayı son uygulamalardan kapatıp yeniden açarak tekrar dene. Dinlenme ekranı gelmemeli.

### A08 — Geçmişi tek sayfada düzenle

1. En az iki hareketten birer set tamamlayıp antrenmanı bitir. Özet süre/set/hareket göstermeli; sağlık veya ağrı sorusu olmamalı.
2. Geçmiş kaydını düzenle. Kaydedilmiş hareketlerin tümü açık kartlarla alt alta olmalı; küçük görseller sabit olmalı.
3. Farklı iki harekette değer değiştir, tek düğmeyle kaydet. Yeniden açınca ikisi de değişmiş olmalı.
4. Değer değiştirip geri dön. “Düzenlemeye dön” seni aynı girdilere geri getirmeli; “Değişiklikleri bırak” asıl kaydı değiştirmemeli.
5. Yalnız kilo doldurup Kaydet'e bas. Uyarı çıkmalı; kayıt kısmen güncellenmemeli.

## Antrenörle birlikte: ölçüm ve eski değerler

### B01 — Altı ölçüm türü

İki rolün de 0.14 olması gerekir. Antrenör hesabında bir test programının hareket ayarlarından farklı ölçüm türleri seç. Programı yayımla ve test üyeye ata. Her hareket için bir set yeterli.

| Ölçüm türü | Giriş örneği | Üyede görünmesi gereken alanlar |
|---|---|---|
| Ağırlık + tekrar | 25 kg / 10 | Ağırlık, tekrar |
| Vücut ağırlığı tekrarı | 12 | Yalnız tekrar |
| Süre | 45 sn | Yalnız süre |
| Mesafe + süre | 400 m / 120 sn | Mesafe, süre |
| Ağırlık + mesafe | 20 kg / 30 m | Ağırlık, mesafe |
| Yalnız tamamlandı | Tik | Sayısal alan yok |

Setleri işaretle, bitir, geçmişi aç ve her değerin doğru birimle kaldığını kontrol et. Mesafe/süre, kilo×tekrar hacmine karıştırılmamalı. Uygulamayı yeniden açınca da değerler kalmalı. Tamamlandı işareti ile ölçüm girişi ayrıdır; boş ölçüme izin vardır.

### B02 — Önceki değerleri kullan

1. B01'deki programı yeniden başlat. Aynı hafta uyarısı verirse isteğinle devam et.
2. Önceki değerler yalnız gösterilmeli; kendiliğinden doldurulmamalı.
3. “Uygula” tek seti doldurmalı; tamamlandı tiki kendiliğinden işaretlenmemeli.
4. Bir sete farklı değer girip “Tüm setlere uygula”ya bas. Üzerine yazma onayı çıkmalı; Vazgeç değerlerini korumalı.
5. Onaylayınca önceki değerler uygulanmalı; tiklerin durumu değişmemeli.

### B03 — Yedek ve hesap izolasyonu

1. Ayarlar → Gizlilik ve veriler → “Yedeği cihaza kaydet” ile yeni ölçümlü JSON yedeği kaydet. Dosya konumunu seçme ekranı açılmalı; yalnız paylaşım menüsü çıkmamalı.
2. Test hesabında aynı yedeği geri yükle. Program/ölçüm türü ve değerler korunmalı.
3. Başka hesabın/salonun yedeği reddedilmeli; mevcut veriler değişmemeli. Gerçek üye verisini test için silme.

## Kapanmamış önceki kabul işleri

0.13.0 U11/U12/U13 ve daha önce denenemeyen K35, açıkça doğrulanmadıkça geçti sayılmaz. Önceki listeler docs içinde korunmuştur. Bu sürümde gerçek e-posta, push teslimi, turnike, ödeme veya ücretli pilot kabulü yapılmış değildir.

Sonuçları “A01 geçti, A03: ... adımında ... oldu” biçiminde gönder. Kilo cetveli sorunu devam ederse klavyeyi kapatma yöntemini, telefon modelini ve mümkünse kısa ekran kaydını da ekle.
