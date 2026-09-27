# FitTrack v0.12.0 — Berk / Alper telefon kabul testleri

11 Eylül 2026. Hedef: Samsung S23 / Android 16; mümkünse ikinci bir Android ve
ikinci test hesabı. APK: `FitTrack-Android-v0.12.0-beta.apk`, versionCode 27.
**Bu listedeki gerçek cihaz senaryoları geliştirici ortamında yapılmadı.**
Berk 0.11.9'u telefonda sorunsuz buldu; o kabul 0.12.0 için tekrar kullanılamaz.

Yerel sonuç: 18/18 test grubu; resmi APK v2/v3 imzası, kaynak eşleşmesi,
paket/origin/izin/ikon-splash ve hizalama kontrolleri geçti. Bunlar aşağıdaki
fiziksel kurulum, render, klavye, bildirim ve sunucu testlerinin yerine geçmez.

## Hazırlık

0.11.9 hâlâ kurulu iken mevcut JSON yedekleme/paylaşma işleviyle bir yedek al.
Açık hesabı, seçili temayı, geçmiş kayıt sayısını, atanmış programları ve varsa
bekleyen işlemleri not et. Veri korumayı sınamak için bir test antrenmanını kilo ve
tekrar girerek yarım bırakabilirsin. Mevcut uygulamayı kaldırmadan APK'yı güncelle.

Antrenör için yalnız test verileriyle üç durum hazırla: programsız üye, programı
olan üye, okunmamış mesajı olan üye. Mümkünse uzun isimli program/üye ve uzun hareket
anlatımı kullan. Gerçek üyelere sırf testi tamamlamak için program atama/mesaj gönderme.

Her satıra **GEÇTİ / KALDI / DENENMEDİ** yaz. Temel öncelik önce K01–K12,
ardından antrenör akışları K13–K24, son olarak çoklu hesap/sunucu testleridir.

## Güncelleme ve kritik üye davranışları

| No | Yapılacak işlem | Beklenen sonuç | Sonuç |
|---|---|---|---|
| K01 | Mevcut 0.11.9 üzerine 0.12.0 APK'yı kur | Güncelleme kabul edilir, sürüm 0.12.0 görünür; kaldırma/veri temizleme gerekmez | DENENMEDİ |
| K02 | İlk açılışta çevrimiçi ve yeniden açılışta uçak modu dene | Yeni arayüz açılır; eski cache yüzünden 0.11.9'da kalmaz veya sürekli yeniden yüklenmez | DENENMEDİ |
| K03 | Önceki hesap, tema, program, geçmiş ve yarım oturumu kontrol et | Doğru hesabın verileri korunur; bekleyen kuyruk kaybolmaz | DENENMEDİ |
| K04 | Uygulamayı kapat/aç; arka plana alıp geri dön | Oturum ve kaydedilmiş set değerleri korunur; çift kayıt oluşmaz | DENENMEDİ |
| K05 | Üye ana sayfasında Başla/Devam/İncele/Tüm antrenmanların kullan | Doğru atama ve gün açılır; ek atamalar erişilebilir kalır | DENENMEDİ |
| K06 | Nasıl yapılır? metninin üstünde başta/ortada/sonda yukarı-aşağı kaydır | Tek ana içerik kilo/tekrar kartına kadar kayar; açıklama içinde takılma olmaz | DENENMEDİ |
| K07 | Açıklamayı ve varsa antrenör notunu aç/kapat; yeni sete geç | Açıklama yeni sette açık başlar; not da ana içerikle kayar; tamamla düğmesi sabittir | DENENMEDİ |
| K08 | Kilo/tekrar gir, artır/azalt, önceki değerleri kullan, seti düzelt | Geçersiz giriş engellenir; Seti güncelle mevcut seti günceller; çift set üretilmez | DENENMEDİ |
| K09 | Klavye açıkken küçük ekran/yatay yön/büyük yazı boyutunu dene | Giriş ve tamamla düğmesi erişilebilir; kesilme veya sistem çubuğu altında kalma yoktur | DENENMEDİ |
| K10 | Android geri/kenar jesti → iptal uyarısı → Hayır | Tek geri olayı işler; değer, kaydırma ve sayaç korunarak doğrudan antrenmana döner | DENENMEDİ |
| K11 | Programı incele → hareket anlatımı → ekran geri ve Android geri | Aynı programın doğru gününe/incelemesine döner; yanlış sayfa açılmaz | DENENMEDİ |
| K12 | Dinlenme/+30 sn/geç, duraklat/devam, yarım bitir, tam bitir | Zamanlayıcı ve snapshot korunur; geçmişe doğru türde tek kayıt yazılır | DENENMEDİ |

## Antrenör UI ve altı tema

| No | Yapılacak işlem | Beklenen sonuç | Sonuç |
|---|---|---|---|
| K13 | Antrenörle Bugün / Üyeler / Programlar / Mesajlar sekmelerini sırayla aç | Dört menü doğru ekranı ve aktif işareti gösterir; profil üst avatardan açılır | DENENMEDİ |
| K14 | Bugün özetini gerçek verilerle karşılaştır | Üye/bugünkü kayıt/programsız sayıları doğru; en fazla üç öncelikli üye ve açık neden görünür | DENENMEDİ |
| K15 | Tüm öncelikleri gör, Üyeler araması, Tümü/Öncelikli/Programsız | Önceki arama yeni listeyi gizlemez; Türkçe isimler aranır; doğru üyeler görünür | DENENMEDİ |
| K16 | Üye kartında baş harfleri, durum, program bilgisi ve iki eylemi kullan | Uzun metin taşmaz; eylem doğru üyeyi açar; programsız üyede atama formuna gider | DENENMEDİ |
| K17 | Programlar araması ve Tümü/Yayında/Taslak; arşiv/şablonları aç | Programlar gerçek durumlarıyla ayrılır; arşiv ve hazır şablonlar kaybolmaz | DENENMEDİ |
| K18 | Program detayında günleri aç/kapat; Üyeler sekmesinden üyeye gir ve geri dön | Gün/hareket/set bilgisi doğru; geri aynı programın üye listesine döner | DENENMEDİ |
| K19 | Yayındaki program → Üyeye ata → üye seç; formu incelemeden geri dön | Yalnız program önseçilir, kendiliğinden atama oluşmaz; son form onayı gerekir | DENENMEDİ |
| K20 | Test üyesine formdan atamayı onayla; tekrar aynı üyeyi seçmeyi dene | Tek atama oluşur; zaten atanmış üye yeniden atanamaz; üye hesabında doğru program görülür | DENENMEDİ |
| K21 | Program Stüdyosu: Bilgiler/Günler/Hareketler/Kontrol adımlarını kullan | Gün seçimi, hareket sırası/set/hedef/not korunur; kontrol ekranı doğru özetler | DENENMEDİ |
| K22 | Değişmiş taslakla geri/sekme değiştir; çıkışı iptal et, sonra taslağı geri yükle | Taslak sessizce silinmez; önceki undo/geçici seçim/Uygula/Vazgeç davranışı korunur | DENENMEDİ |
| K23 | Mesajlar: isim/mesaj metni ara, Okunmamış filtresi, Yeni mesaj | Doğru konuşma açılır; sayı ve liste gerçek mesajlara uyar; yeni konuşmada doğru üye seçilir | DENENMEDİ |
| K24 | Sohbete gönderilmemiş metin yaz; üye bilgisine gir/çık ve klavyeyi kullan | Yazılan metin korunur; gerçek program/son kayıt bilgisi görünür; gönderme alanı erişilebilir | DENENMEDİ |
| K25 | Altı temayı üye/antrenör ana sayfa, liste, stüdyo, mesaj, antrenmanda dene | Zemin/yüzeyler tutarlı, metin ve seçili sekme okunaklı; Redline belirgin kırmızıdır | DENENMEDİ |
| K26 | Bildirimsiz/üyesiz/programsız/arama sonucu olmayan ekranları aç | Açık boş durum görülür; örnek kişi/sayı/fotoğraf veya sahte çevrimiçi durum gösterilmez | DENENMEDİ |

Temalar: Volt Discipline, Crimson Graphite, Plum Night, Sage Motion, Redline
Editorial, Rosewood Strength. Referans ZIP'teki görseller tasarım örneğidir;
0.12.0'ın gerçek ekran görüntüleri değildir. Kabulte özellikle alt menü yüksekliği,
üst sistem çubuğu, açık temada sistem ikonları, uzun adlar ve büyük yazıyı kontrol et.

Öncelik modeli gerçek yoklama değildir: okunmamış mesaj, hiç atama olmaması ve
cihazda görülen son antrenman kaydından en az 7 gün geçmesi kullanılır. Yarım kayıt
aktivite sayılır. Hiç kayıt yoksa üyelik tarihinden 7 gün hesabı yapılır; eksik/gelecek
tarih uydurma gecikme üretmez. “Program tamamlandı” veya “yeni program talebi” bu
sürümde ayrı bir sunucu olayı olarak eklenmedi.

## Native köprü, hesap ve gerçek senkronizasyon

| No | Yapılacak işlem | Beklenen sonuç | Sonuç |
|---|---|---|---|
| K27 | JSON yedeğini dışa aktar ve Android paylaşım menüsünden kaydet | Filesystem + Share dosyayı açar; yeni FileProvider paylaşımı engellemez | DENENMEDİ |
| K28 | Test hesabında mevcut yedeği geri yükle | Uyumluluk kontrolü çalışır; doğru hesaba yükler; canlı hesabın yerine başka oturum taşımaz | DENENMEDİ |
| K29 | Hatırlatıcı iznini reddet/izin ver; hatırlatıcı ve mesaj bildirimi dene | İzin reddi uygulamayı bozmaz; izinli bildirim doğru eyleme gider; iki kez açılmaz | DENENMEDİ |
| K30 | Gerekli Auth dönüşünü com.fittracklabs.mobile://auth-callback ile sınayın | Tek uygulama örneğine döner; yanlış/süresi dolmuş veri oturum açmaz | DENENMEDİ |
| K31 | Normal e-posta/şifre girişi, yanlış şifre ve iki test hesabı arasında geçiş | Normal girişte kod e-postası istenmez; yanlış şifre reddedilir; eski üye/mesaj/tema verisi diğer hesaba sızmaz | DENENMEDİ |
| K32 | Test adresiyle kayıt ve açıkça Şifremi unuttum akışı | Kayıtta iki şifre eşleşir; adres kodla doğrulanır; kurtarma kodu/iki yeni şifre çalışır; gerçek posta teslimi kontrol edilir | DENENMEDİ |
| K33 | Offline antrenman tamamla, yeniden bağlan, ikinci cihazdan bak | Kuyruk doğru hesap/salona gönderilir, kayıt bir kez oluşur; silinen kayıt yeniden belirmez | DENENMEDİ |
| K34 | Bir hesaptaki bekleyen işlemler varken hesap/salon değiştir | İşlemler yeni hesabın/salonun verisine karışmaz; geri dönünce doğru bağlamda işlenir | DENENMEDİ |
| K35 | Antrenör-üye arasında iki gerçek test hesabıyla mesaj gönder/oku | Realtime, okunmamış sayı, okundu durumu ve doğru alıcı kontrolü çalışır | DENENMEDİ |
| K36 | Yarım oturumun program atamasını test antrenöründen kaldır | Üye snapshot ile eski oturumu bitirebilir/iptal edebilir; sonra yeni programa başlayabilir | DENENMEDİ |
| K37 | İlerleme grafikleri/filtreler, rozetler, geçmiş düzenlemesi | Önceki grafikler korunur; yalnız gerçek tamamlanan kayıtlar rozete katkı sağlar; doğru hesabın geçmişi kullanılır | DENENMEDİ |

## Sonuç iletme şablonu

- Cihaz / Android sürümü / uygulama sürümü:
- Kurulum: 0.11.9 üzerine güncelleme mi, temiz test kurulumu mu?
- Hesap rolü / tema / sistem yazı boyutu / bağlantı:
- Test numarası ve sonuç:
- En kısa yeniden üretme adımları:
- Beklenen / görülen:
- Kayıt kaybı, çift işlem veya yanlış hesap verisi var mı?
- Ekran görüntüsü/video ve mümkünse kişisel içerikten arındırılmış log:

Kurulum veya veri koruma başarısızsa K01–K03'te durup sonucu paylaşın; uygulamayı
kaldırmayı veya verisini temizlemeyi çözüm olarak uygulamayın. Hata halinde aynı
sertifikayla daha yüksek versionCode'lu bir düzeltme APK'sı üretilmesi tercih edilir.
0.11.9'un versionCode 26'sı, 27 üzerine normal güncelleme olarak kurulamaz.
