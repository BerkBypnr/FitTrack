# FitTrack 0.13.1 — kısa telefon kabulü

0.13.0 testlerinde U01–U10 ve U14 geçti. U11–U13 henüz doğrulanmadı. 0.13.1 kurulduğunda aşağıdaki yeni/değişen alanları ve kalan üç testi kontrol et.

| Kod | Nasıl test edeceksin? | Geçme ölçütü |
|---|---|---|
| H01 | 0.13.1'i mevcut 0.13.0 kurulumunun üstüne yükle. | Tek uygulama kalır; hesap, salon, geçmiş, programlar ve tema seçimi korunur; sürüm 0.13.1 görünür. |
| H02 | Açılış, giriş/kayıt, ana üst çubuk ve Android uygulama ikonuna bak. | Her yerde kırmızı-beyaz üç parçalı yeni FT logosu görünür; eski tek parça kırmızı logo görünmez. |
| H03 | Profil düzenlemeyi aç ve ilk iki adımda ileri-geri git. | Ad-soyad birinci, cinsiyet ikinci ekrandadır; yazılan ad geri dönünce kaybolmaz. |
| H04 | Yaş ve boy adımlarını aç, değerleri kaydır ve ileri-geri git. | Her ekranda tek kaydırma seçicisi vardır; altta ikinci değer kutusu yoktur; seçilen değer korunur. |
| H05 | Ayarlar → Görünüm ve tema ekranını aç. | Kızıl Güç, Mürdüm Gece, Fildişi Enerji ve Bordo Asalet görünür; dört paletin renkleri değişmemiştir. |
| U11 | Gizlilik ve veriler → Yedeği cihaza kaydet. Klasör/dosya seç; sonra Yedeği paylaşı dene. | Kaydet Android dosya seçicisini, Paylaş paylaşım menüsünü açar; JSON gerçekten seçilen klasörde bulunur. |
| U12 | Antrenör hesabında beş alt sekmeyi, sonra üye hesabının menüsünü gez. | Antrenör ve üye menüleri rolüne uygun ve ekrana sığar. |
| U13 | İstediğin seansı başlat, yarım bırak ve geri dön. | Doğru seans kaldığı yerden açılır; program ve kayıtlar karışmaz. |

H01, H02 veya U11 kalırsa yeni özellik geliştirmesine geçmeden düzelt. Diğer sorunlarda ekran görüntüsü, telefon yönü, rol ve seçili temayı not et.

