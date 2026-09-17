# FitTrack v0.12.1 — telefon kabulü

14 Eylül 2026. Önce **aynı beta anahtarıyla imzalanmış** APK gerekir.
İmzasız çıktı bu listeye başlamak için yeterli değildir.

Alper/Berk 0.12.0 testlerinde K28'e kadar geldiklerini bildirdi. Dosyada bazı
satırlar hâlâ DENENMEDİ idi. Önceki sonuçlar 0.12.1 için otomatik GEÇTİ yapılmadı.
Aşağıdaki son sütun fiziksel cihaz sonucudur; yerel kanıt ayrı sütundadır.

Hazırlık: test hesabında JSON yedek al; hesap/tema/kayıt/yarım antrenman ve kuyruk
sayısını not et. 0.12.0'ı kaldırmadan güncelle. Başarısız güncellemede veri silme.

| No | Telefon işlemi | Beklenen | Yapılan yerel kontrol | Telefon sonucu |
|---|---|---|---|---|
| K01 | Mevcut 0.12.0 üzerine AYNI anahtarla imzalanmış 0.12.1 APK’yı kur | Güncelleme kabul edilir; sürüm 0.12.1 / kod 28, hesap ve kayıtlar korunur. | Paket kimliği kontrol edildi; imzalı fiziksel güncelleme bekler. | DENENMEDİ |
| K02 | İlk açılışta çevrimiçi ve yeniden açılışta uçak modu dene | Yeni arayüz açılır; eski cache yüzünden 0.11.9'da kalmaz veya sürekli yeniden yüklenmez | Native cache regresyonu geçti. | DENENMEDİ |
| K03 | Önceki hesap, tema, program, geçmiş ve yarım oturumu kontrol et | Doğru hesabın verileri korunur; bekleyen kuyruk kaybolmaz | Şema/hesap/yarım oturum regresyonları geçti. | DENENMEDİ |
| K04 | Uygulamayı kapat/aç; arka plana alıp geri dön | Oturum ve kaydedilmiş set değerleri korunur; çift kayıt oluşmaz | VM oturum ve tek kayıt testleri geçti. | DENENMEDİ |
| K05 | Çok günlük programda Ana Sayfa / Antrenmanlar / İncele içinden Başla | Seans seçimi açılır, seçili gün yoktur; 2. veya 3. gün doğru hareketlerle başlar. | VM + gerçek Chrome seans seçimi geçti. | DENENMEDİ |
| K06 | Nasıl yapılır? metninin üstünde başta/ortada/sonda yukarı-aşağı kaydır | Tek ana içerik kilo/tekrar kartına kadar kayar; açıklama içinde takılma olmaz | Önceki üye UI regresyonları geçti; yatay Chrome kontrolü yapıldı. | DENENMEDİ |
| K07 | Açıklamayı ve varsa antrenör notunu aç/kapat; yeni sete geç | Açıklama yeni sette açık başlar; not da ana içerikle kayar; tamamla düğmesi sabittir | Üye UI regresyonları geçti. | DENENMEDİ |
| K08 | Kilo tek başına, tekrar tek başına, ikisi boş, ikisi dolu; geçmiş düzenleme | Ağırlıklı sette yarım giriş engellenir; vücut ağırlığında tekrar tek başına geçerlidir. | Yeni negatif/pozitif VM testleri; Chrome hata mesajı geçti. | DENENMEDİ |
| K09 | Dikey/yatay, açık klavye, büyük sistem yazısı, profil sihirbazı | Arka ana sayfa görünmez; tek kaydırmayla alanlar ve tamamla/Devam et erişilir. | 390×844, 320×568, 844×390, 740×360 ve 390×430 viewport kontrolleri geçti. | DENENMEDİ |
| K10 | Android geri/kenar jesti → iptal uyarısı → Hayır | Tek geri olayı işler; değer, kaydırma ve sayaç korunarak doğrudan antrenmana döner | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K11 | Programı incele → hareket anlatımı → ekran geri ve Android geri | Aynı programın doğru gününe/incelemesine döner; yanlış sayfa açılmaz | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K12 | Dinlenme/+30 sn/geç, duraklat/devam, yarım bitir, tam bitir | Zamanlayıcı ve snapshot korunur; geçmişe doğru türde tek kayıt yazılır | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K13 | Antrenörle Bugün / Üyeler / Programlar / Mesajlar / Ayarlar | Beş sekme ve aktif işaret doğru; Ayarlarda tekrarlanan Salon menüsü yoktur. | Chrome 5 sekme ve settings aktif sekmesi geçti. | DENENMEDİ |
| K14 | Bugün özetini gerçek verilerle karşılaştır | Üye/bugünkü kayıt/programsız sayıları doğru; en fazla üç öncelikli üye ve açık neden görünür | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K15 | Tüm öncelikleri gör, Üyeler araması, Tümü/Öncelikli/Programsız | Önceki arama yeni listeyi gizlemez; Türkçe isimler aranır; doğru üyeler görünür | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K16 | Üye kartında baş harfleri, durum, program bilgisi ve iki eylemi kullan | Uzun metin taşmaz; eylem doğru üyeyi açar; programsız üyede atama formuna gider | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K17 | Programlar araması ve Tümü/Yayında/Taslak; arşiv/şablonları aç | Programlar gerçek durumlarıyla ayrılır; arşiv ve hazır şablonlar kaybolmaz | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K18 | Program satırındaki ok ve üç nokta; uzun ad ve küçük ekran | Düğmeler ayrı; doğru detay/menü açılır, dokunma alanları çakışmaz. | Chrome düğme aralığı ve 44 px menü ölçüldü. | DENENMEDİ |
| K19 | Yayındaki program → Üyeye ata → üye seç; formu incelemeden geri dön | Yalnız program önseçilir, kendiliğinden atama oluşmaz; son form onayı gerekir | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K20 | Test üyesine formdan atamayı onayla; tekrar aynı üyeyi seçmeyi dene | Tek atama oluşur; zaten atanmış üye yeniden atanamaz; üye hesabında doğru program görülür | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K21 | Program Stüdyosunda seanslar, hafta günü önerileri ve hareketler | Seanslar bağımsız; önerilen hafta günleri tüm program için kaydolur; hedefler/notlar korunur. | Altı temada gün düzenleyici; VM taslak koruma kontrolleri geçti. | DENENMEDİ |
| K22 | Değişmiş taslakla geri/sekme değiştir; çıkışı iptal et, sonra taslağı geri yükle | Taslak sessizce silinmez; önceki undo/geçici seçim/Uygula/Vazgeç davranışı korunur | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K23 | Mesajlar: isim/mesaj metni ara, Okunmamış filtresi, Yeni mesaj | Doğru konuşma açılır; sayı ve liste gerçek mesajlara uyar; yeni konuşmada doğru üye seçilir | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K24 | Sohbet taslağı yaz; üye bilgisine gir; X ile çık | Sohbete dön düğmesi yok; X çalışır; gönderilmemiş metin kaybolmaz. | Altı temada gerçek DOM taslak + X kapanışı geçti. | DENENMEDİ |
| K25 | Altı temayı üye/antrenör ana sayfa, liste, stüdyo, mesaj, antrenmanda dene | Zemin/yüzeyler tutarlı, metin ve seçili sekme okunaklı; Redline belirgin kırmızıdır | Altı tema antrenör ana sayfa/liste/düzenleyici/sohbet; üye UI regresyonları geçti. | DENENMEDİ |
| K26 | Bildirimsiz/üyesiz/programsız/arama sonucu olmayan ekranları aç | Açık boş durum görülür; örnek kişi/sayı/fotoğraf veya sahte çevrimiçi durum gösterilmez | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K27 | JSON yedeğini dışa aktar ve Android paylaşım menüsünden kaydet | Filesystem + Share dosyayı açar; yeni FileProvider paylaşımı engellemez | İlgili mevcut VM/DOM regresyonları geçti; fiziksel görev bekler. | DENENMEDİ |
| K28 | Aynı hesabın yedeğini yükle; farklı hesap/salon ve bozuk JSON dene | Aynı bağlam geri yüklenir; yabancı/bozuk yedek reddedilir, veri/rol/oturum değişmez. | Yeni hesap/salon reddi ve state atomiklik testleri geçti. | DENENMEDİ |
| K29 | İzin reddi/izni, bildirim tap, çift tap ve hesap değişimi sonrası eski bildirim | İzin reddi çökmez; doğru kişi bir kez açılır; eski hesap/salon bildirimi sohbet açmaz. | Native köprü kontrollü testleri; gerçek izin/bildirim denenmedi. | DENENMEDİ |
| K30 | Gerçek Auth dönüşü, bozuk/süresi dolmuş/tekrarlanan callback | Doğru uygulamaya döner; geçersiz adres/eksik kod oturum veya şifre yenileme açmaz. | Auth callback kontrollü negatif/dedup testleri; gerçek e-posta dönüşü denenmedi. | DENENMEDİ |
| K31 | Normal e-posta/şifre girişi, yanlış şifre ve iki test hesabı arasında geçiş | Normal girişte kod e-postası istenmez; yanlış şifre reddedilir; eski üye/mesaj/tema verisi diğer hesaba sızmaz | Yerel hesap ayrımı ve Auth regresyonları geçti; canlı giriş bekler. | DENENMEDİ |
| K32 | Test adresiyle kayıt ve açıkça Şifremi unuttum akışı | Kayıtta iki şifre eşleşir; adres kodla doğrulanır; kurtarma kodu/iki yeni şifre çalışır; gerçek posta teslimi kontrol edilir | Auth API taklitli testler geçti; SMTP teslimi denenmedi. | DENENMEDİ |
| K33 | Offline antrenman tamamla, yeniden bağlan, ikinci cihazdan bak | Kuyruk doğru hesap/salona gönderilir, kayıt bir kez oluşur; silinen kayıt yeniden belirmez | Kuyruk/snapshot regresyonları geçti; iki fiziksel cihaz denenmedi. | DENENMEDİ |
| K34 | Bir hesaptaki bekleyen işlemler varken hesap/salon değiştir | İşlemler yeni hesabın/salonun verisine karışmaz; geri dönünce doğru bağlamda işlenir | Hesap/salon izolasyonu regresyonları geçti. | DENENMEDİ |
| K35 | Antrenör-üye arasında iki gerçek test hesabıyla mesaj gönder/oku | Realtime, okunmamış sayı, okundu durumu ve doğru alıcı kontrolü çalışır | Sohbet/okundu kod testleri geçti; canlı realtime denenmedi. | DENENMEDİ |
| K36 | Yarım oturumun program atamasını test antrenöründen kaldır | Üye snapshot ile eski oturumu bitirebilir/iptal edebilir; sonra yeni programa başlayabilir | Snapshot ile kaldırılmış atama regresyonu geçti. | DENENMEDİ |
| K37 | İlerleme grafikleri/filtreler, rozetler, geçmiş düzenlemesi | Önceki grafikler korunur; yalnız gerçek tamamlanan kayıtlar rozete katkı sağlar; doğru hesabın geçmişi kullanılır | Önceki geçmiş/ilerleme regresyonları geçti. | DENENMEDİ |


## Ek kabul senaryoları

- **S01:** Çekiş, İtiş ve Bacak sırasını takvimden bağımsız seç. Hiçbirini önceden seçili görme.
- **S02:** Tamamlanmış aynı seansı aynı hafta seç. Önce Vazgeç, sonra tekrar seçip onayla.
  Vazgeç yeni kayıt oluşturmaz; onay tek yeni antrenman açar.
- **S03:** Bacak seansında yarım bırak, uygulamayı kapat/aç. Bacak ve değerler korunur.
- **S04:** Aynı gün iki seans tamamla. Haftalık antrenman sayısı iki artar; eski gün kimliği
  olmayan kayıtlarda uydurma son tamamlanma tarihi gösterilmez.
- **S05:** Antrenör ana sayfasında büyük Üyeler/Programlar düğmelerinin kalktığını,
  kartların tema ve durum renklerini kontrol et.
- **S06:** Değişmiş program taslağından Ayarlar'a geç. Çıkışı iptal et; sonra taslak saklayarak çık.
  Geri dönünce değişiklikler bulunabilsin.
- **S07:** Uzun adlar, büyük sistem yazısı ve altı temada menü/düğme okunaklılığını kontrol et.
- **S08:** Profil klavyesi açıkken ekranı döndür; yazdıkların kaybolmasın.
- **S09:** Aynı hesabın farklı salonu ve farklı hesabın aynı salonu için yedek reddini ayrı ayrı dene.

K29–K36 iki gerçek test hesabı/cihaz, Android izinleri veya canlı servis gerektiren
kısımlar içerir. Yerel maket servis sonucu canlı kabul yerine kullanılmaz.
Gerçek üyelere test mesajı/ataması gönderme. Sorun halinde test numarası, cihaz,
Android sürümü, tema ve en kısa tekrar adımlarını bildir.
