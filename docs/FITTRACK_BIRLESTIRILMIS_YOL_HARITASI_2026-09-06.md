# FitTrack — Birleştirilmiş Ürün Yol Haritası

**6 Eylül 2026 • Revizyon 2 • Berk ve Alper için uygulama planı**

## Karar: üç büyük geliştirme teslimi

Amaç, Astra Max ile tek görevde mümkün olan en geniş, birbiriyle uyumlu işi tamamlatmak ve her küçük değişiklik için ayrı APK çıkarmamaktır. Yeni düzen: **0.12.0 güvenli temel ve antrenör paneli → 0.13.0 antrenman ve takip sistemi → 0.14.0 3D ve pilot hazırlığı → 0.16.0 kontrollü pilot → 0.17.0 çok salonlu beta → 1.0 ticari yayın.**

Her geliştirme paketi tek görev olarak verilir. Ajan içeride küçük, geri alınabilir değişikliklerle ilerler; kodu çalıştırır, ilgili testleri yapar, hataları düzeltir ve tek teslim hazırlar. Paketler arasında kullanıcı geri bildirimi alınır. Bir sonraki paketin de aynı görevde yapılması açıkça istenmedikçe kapsam kendiliğinden büyütülmez.

**Temel sınır:** Kod incelenmeden “bu kadar iş kesin sorunsuz yapılır” denemez. Bu plan, birleştirilebilecek en geniş makul başlangıç kapsamıdır. Paket büyüklüğü sürüm sayısıyla değil; veri modeli, yetkilendirme, geri dönüş imkânı ve test sonuçlarıyla yönetilir.

| Yeni teslim | Birleştirilen eski hedefler | Kullanıcının göreceği sonuç |
| --- | --- | --- |
| 0.12.0 | 0.11.4, 0.11.5, 0.11.6 | Güvenli program oluşturucu ve ayrı antrenör paneli |
| 0.13.0 | 0.12.0–0.12.2, 0.13.0–0.13.1, 0.14.0 | Doğru hareket alanları, takip ve güvenilir antrenman kaydı |
| 0.14.0 | 0.13.2, 0.14.1, 0.14.2 | İlk 3D katalog, veri kontrolü ve pilot güvenlik kapısı |
| 0.16.0 | 0.15.0, 0.15.1, 0.16.0 | Tek pilot sürümüyle iç test ve kontrollü salon kullanımı |
| 0.17.0 | 0.17.0 | Birden fazla salonda kapalı beta |
| 1.0 | 1.0 | Desteklenebilir ticari Android yayını |

**Başlangıç kabulü:** Kaynak yol haritasında Beta 0.11.3 / versionCode 20 yazıyor. Bu belge çalışmasında kod, APK, imza veya çalışan sunucu test edilmedi. İlk görev bunları doğrular. Eski numaralar yalnız yukarıdaki eşleme için geçerlidir; uygulama işleri bundan sonra yeni numaralarla takip edilir.

<!-- page -->

## Tek görevde çalışma sözleşmesi

**Paketin başlangıcı:** Kaynak kod, mevcut APK, veritabanı migration’ları ve yapılandırma birlikte envanterlenir. Mevcut özellikler “var ve doğrulandı / var ama hatalı / eksik / erişim nedeniyle doğrulanamadı” olarak ayrılır. Çalışan özellik tekrar yazılmaz; geniş kapsamlı framework veya mimari değişimi somut gerekçe olmadan yapılmaz.

**İç çalışma sırası:** Mevcut durumu kaydet → bağımlılıkları belirle → güvenlik/veri engellerini düzelt → özellikleri uygula → ilgili kontrolleri çalıştır → hataları düzelt → paketi birlikte doğrula → teslim et. Bu adımlar ayrı kullanıcı onayı veya ayrı sürüm değildir. Ara commit ve kontrol noktaları tek paketin parçasıdır.

**Test kapsamı:** Her küçük görsel değişiklikte tüm testler tekrarlanmaz. Değişen alan için ilgili testler, paket sonunda kritik uçtan uca akışlar çalıştırılır. Veri göçü, rol erişimi, offline kuyruk ve uygulama yükseltmesi etkileniyorsa bunların kontrolleri zorunludur. Başarılı derleme tek başına ürün kabulü sayılmaz.

**Rutin kararlar:** Dosya düzenleme, geri alınabilir düzeltme, test ve hata giderme ajan tarafından sürdürülür. Kullanıcıdan her adımda onay istenmez. Yalnız ürün davranışını önemli ölçüde değiştiren belirsizlik, eksik erişim/anahtar, onaysız maliyet veya canlı veriyi etkileyen geri döndürülemez işlem için somut soru sorulur. Diğer bağımsız işler tamamlanır.

### Paketin bölünmesini gerektiren durumlar

- Veri kaybı, yetkisiz erişim veya kritik görevin çalışmaması giderilemezse paket “tamamlandı” sayılmaz. Engel ve tamamlanan kapsam açıkça raporlanır.
- Aktif kullanıcılara etki eden acil güvenlik/veri kaybı düzeltmesi, büyük paket beklenmeden ayrı hotfix olarak çıkarılabilir. Bu bir istisnadır.
- Yeni veri modeli eski istemciyi veya bekleyen offline kayıtları güvenle desteklemiyorsa geçiş önce çözülür. Sırf teslimi büyütmek için uyumluluk testi atlanmaz.
- 3D animasyon üretimi/onayı gibi dış girdiler bekleniyorsa bağımsız kod işleri sürer; onaysız içerik tamamlanmış gibi gösterilmez. Deneysel görüntüleyici kapatılabilir.

### Her paketin teslim dosyaları

Kaynak kod veya erişilebilir commit, kurulabilir APK; dağıtım gerekiyorsa AAB; migration ve geri dönüş notu; değişiklik özeti; test sonuçları ve kanıtları; bilinen sorunlar; cihazda denenmesi gereken kısa kabul listesi. Her kontrol “geçti / kaldı / çalıştırılamadı” şeklinde yazılır. Ajanın erişemediği fiziksel cihaz veya üretim sistemi için başarı iddiası kurulmaz.

**Yayın kuralı:** Aynı uygulama kimliği, logo ve uygun imza zinciri korunur; versionCode mevcut gerçek değerden artırılır. Hazır teslim ile canlıya yayın ayrı işlemlerdir. Mevcut yetkilendirme kapsamında olmayan canlı yayın ayrıca ele alınır.

<!-- page -->

## 0.12.0 — Güvenli temel ve antrenör paneli

**Hedef:** Antrenör giriş yaptıktan sonra kendi yönetim panelinde üyeyi bulabilsin, programı hızlı hazırlayıp güvenle atayabilsin. Eski 0.11.4–0.11.6 işleri tek geliştirme görevi ve tek normal APK tesliminde birleşir.

### Aynı görevde tamamlanacak kapsam

- **Oluşturucu güvenliği:** Geçici hareket seçimi; Uygula/Vazgeç; X, geri ve dışarı dokunmada seçimin iptali; doğru güne ekleme; taslak kurtarma; kaydetmeden çıkış; gün/hareket/set silmede onay ve geri alma. Son program ataması kaldırıldığında üyenin genel notu korunur.
- **Hızlı programlama:** Gün/program kopyalama, başka programdan gün alma, toplu set/tekrar/kilo/dinlenme düzenleme, favoriler ve ekipman filtresi. Sürükle-bırak için erişilebilir taşıma düğmeleri; boş, yükleniyor, hata ve kaydedildi durumları.
- **Sürüm ve atama:** Yayınlanmış program yeni sürümle güncellenir. Üyelere şimdi/sonraki antrenman/taşıma yok seçenekleri açıkça uygulanır. “Şimdi”, başlamış antrenmanın snapshot’ını değiştirmez; henüz başlamamış kullanım içindir.
- **Antrenör paneli:** Yönetim özeti, Üyeler, Programlar, temel Takip, Mesajlar ve yetkili Ayarlar. Üye detayı, arama, program oluşturma/atama, davet ve arşiv. Telefon ve bilgisayar yerleşimleri aynı yetki modelini kullanır. Takipte henüz üretilmeyen yeni metrikler gösterilmez.
- **Hesap ve rol:** Süreli/iptal edilebilir davet, antrenöre üye atama ve devir, erişimi kesme, doğrulama/şifre sıfırlama e-postaları ve özel SMTP. Antrenör/yönetici için MFA ve temel denetim kaydı. Salon üyeliği ile antrenör ataması sunucuda kontrol edilir.
- **İlk güvenlik ve süreklilik:** RLS/Storage/Realtime/RPC erişim incelemesi; istemci ve Git geçmişinde gerçek sır taraması; kullanıcı/salon bazlı yerel veri ayrımı; mevcut offline akışın regresyon kontrolü; imza ve logo envanteri. Mevcut kritik sorunlar yeni ekranlardan önce düzeltilir.

### Tek teslimin kabul şartları

Seç–iptal, sil–geri al ve taslak kurtarma senaryoları geçer. Üç günlük örnek program oluşturulur, kopyalanır, uyarlanır ve doğru üyeye atanır. Program güncellemesi başlamış antrenmanı ve geçmişi değiştirmez. Antrenör telefon ve bilgisayarda üyeyi bulup atama yapabilir; üye kendi antrenman ekranına açılır.

Üye panel adresini/API’sini deneyerek yetki kazanamaz. İki salon, aynı salonda iki antrenör ve erişimi kaldırılmış hesap senaryolarında yetkisiz veri dönmez. Aynı imzayla yükseltmede geçmiş, taslak ve aktif antrenman korunur. Açık kritik veri/erişim hatası ve temel akışı durduran hata yoktur.

**Paket sınırı:** Ölçüm profili ve superset motoru 0.13.0’da birlikte ele alınır. İlk pakette gereksiz veri göçü yapılmaz. Güvenlik incelemesi daha temel bir model düzeltmesi gerektirirse bu zorunlu bağımlılık önce çözülür.

<!-- page -->

## 0.13.0 — Antrenman, takip ve senkronizasyon

**Hedef:** Antrenörün yazdığı planın, üyenin yaptığı antrenmanın ve takip ekranının aynı veriyi tutarlı kullanması. Ölçüm modeli, çalışma akışı ve kayıt güvenilirliği tek pakette tamamlanır.

### Aynı görevde tamamlanacak kapsam

- **Hareket alanları:** Ağırlık+tekrar, vücut ağırlığı+tekrar, süre, mesafe+süre. Hedef/gerçekleşen değer ayrımı, birimler, tekrar aralığı; isteğe bağlı RPE veya RIR. Yardımlı/ek ağırlıklı hareketler yanlış anlam üretmeden modellenir. Farmer Carry gibi pilotta kullanılan ek tür gerekiyorsa uygun yük+mesafe profili eklenir; yanlış profile zorlanmaz.
- **Program ve takvim:** Düz set/superset, gün/hafta kopyalama, başlangıç/bitiş, hafta planı, dinlenme, erteleme ve üye özelinde uyarlama. Şablon, yayın sürümü ve başlamış antrenman ayrı korunur.
- **Üye deneyimi:** Önceki değerleri kullanma, hızlı set kaydı, otomatik dinlenme, superset geçişi, antrenmana devam, temel hareket geçmişi ve seans özeti. İzinli alternatif ve atlama nedeni; isteğe bağlı zorlanma notu. Sağlık teşhisi veya otomatik tedavi önerisi kapsam dışıdır.
- **Devamlılık:** Planlandı/tamamlandı/kısmi/kaçırıldı; hiç başlamayan, programı biten ve 7/14/30 gündür kaydı olmayan üyeler. İzin, erteleme, salon saat dilimi ve geç gelen offline kayıt dikkate alınır. Son senkronizasyon, etiketin nedeni, ulaşıldı durumu ve takip tarihi görünür.
- **Panelin tamamlanması:** Üye zaman çizelgesinde program/antrenman/takip/mesaj bağlamı; program yazarken son performans; not görünürlüğü ve devir geçmişi. Önceki paketin ekranları yeni verilerle tamamlanır.
- **Offline, iki cihaz ve bildirim:** Görünür kuyruk, güvenli yeniden deneme, çift kayıt engeli ve çakışma çözümü. Ağ kesilmesi, kapanma/kilitlenme/yeniden başlatma ve hesap değişimi. Mesaj/program push’ı, token yenileme/iptal, tercih/sessiz saat ve yetkili deep link; uygulama içi okunmamış durum korunur.

### İç kontrol noktaları — ayrı sürüm değildir

Önce eski veri envanteri ve göç provası; ardından oluşturucu–üye–geçmiş bütünlüğü; sonra takip/push ve iki cihaz senaryoları. Bu sıra tek görevin içinde yürür. Yeni motor gerekiyorsa kontrollü özellik anahtarıyla açılır; güvenlik kontrolleri hiçbir anahtarla devre dışı bırakılmaz.

### Tek teslimin kabul şartları

Bench Press, Pull-up, Plank ve Koşu doğru alanları gösterir. Eski geçmişin değerleri/birimleri ve aktif oturum korunur. Superset oluşturucudan geçmişe aynı sırayla çalışır. Offline tamamlanan seans yeniden bağlanınca tek kez kaydolur; iki cihaz düzenlemesi sessizce veri ezmez. İzin/erteleme ve geç senkron yanlış “kaçırıldı” etiketi üretmez. Push gelmese bile mesaj/program uygulamada bulunabilir. Yeni veri yüzeylerinin erişim testleri geçer.

<!-- page -->

## 0.14.0 — Hareket içeriği, 3D ve pilot hazırlığı

**Hedef:** Çekirdek antrenman akışına animasyonlu hareket incelemesini eklemek ve gerçek kullanıcıdan önce veri/güvenlik hazırlığını bitirmek. İçerik, veri kontrolü ve son denetim tek teslimde toplanır.

### Aynı görevde tamamlanacak kapsam

- **Hareket anlatımı:** Pilot programlarında kullanılan hareketlerin tamamında Türkçe açıklama ve lisansı belli video/poster. Başlangıç planlama aralığı 30–50 hareket; gerçek katalog daha küçükse sayı doldurulmaz. İçerik form doğruluğu antrenörce onaylanır.
- **İlk 3D katalog:** Önce tek hareketle cihaz ve üretim denemesi; başarılıysa aynı görevde beş onaylı animasyona genişleme. Döndürme, yakınlaşma, oynat/durdur, yavaşlatma, ön/yan/arka görünüş ve kamera sıfırlama. Ayrı 3D sürümü çıkarmak zorunlu değildir.
- **Veri kontrolü:** Program/geçmiş/ölçümleri okunabilir CSV/JSON olarak dışa aktarma; hesap silme talebi ve durum takibi; ilişkili özel medya, oturum, cihaz tokenı ve üyelik yaşam döngüsü. Uygulama dışından da kullanılabilen talep kanalı; saklama ve yedek temizliği politikası.
- **Son güvenlik denetimi:** Tüm rol ve nesne erişimleri; RLS, Storage, Realtime, RPC/view ve sunucu fonksiyonları; dosya yükleme; mobil/web yüzeyi; oturum iptali/MFA; sır ve bağımlılık taraması. Önceki paketlerde başlayan güvenlik burada uçtan uca doğrulanır.
- **İşletim hazırlığı:** Veritabanı ve medya yedeği, ayrı ortamda geri yükleme provası; hata/ANR/sync kuyruk izleme; olay sorumlusu ve müdahale/geri dönüş planı. Veri envanteri, gizlilik metinleri ve geçerli mağaza beyanları hazırlanır; hukuki/yayın gereklilikleri gerçek kullanım öncesi güncel kaynakla doğrulanır.

### Tek teslimin kabul şartları

Beş 3D hareketin kaynak dosyası, lisansı ve form onayı kayıtlıdır; desteklenen cihazlarda animasyon/kamera kontrolleri ve video/poster geri dönüşü çalışır. 3D yükleme hatası set kaydını, sayacı veya antrenman geçmişini bozmaz. Hesap dışa aktarma/silme ve eski yetkilerle yeniden erişim testleri geçer. Veritabanı ve medya ayrı test ortamına geri yüklenebilir. Açık kritik/yüksek güvenlik bulgusu ve temel akışı ciddi bozan hata yoktur.

**İçerik engeli:** Beş hareketin lisansı, üretimi veya antrenör onayı tamamlanamazsa durum eksik olarak raporlanır. Görüntüleyici kapalıyken video/poster ile çekirdek pilot yapılabilir; beş hareketlik 3D teslimi tamamlandı denmez. Ek hizmet/varlık satın alımı bütçe onayı olmadan yapılmaz.

**Zamanlama:** İçerik seçimi, lisans araştırması ve model hazırlığı 0.12.0 sırasında başlayabilir. Uygulamaya bağlı tek hareket denemesi 0.13.0 veri sözleşmesi oturduğunda yapılır. Böylece 3D üretimi son paketin başlangıcına kadar beklemez.

<!-- page -->

## Antrenör ve üye için ayrı arayüz

**Açılış ve görünüm:** Antrenör doğrudan yönetim özetine; üye bugünkü antrenmanına açılır. Ortak uygulama, marka ve bileşenler korunur; görevler ve gezinme ayrılır. Ayrı APK/veritabanı gerekmez. Her iki rolü olan kişi “Yönetim / Antrenmanım” geçişini görür; bu geçiş yeni yetki vermez.

Antrenörün bilgisayar ekranında sol menü, geniş üye listesi, arama/filtre ve program düzenleme alanı; telefonda kısa özet, okunabilir listeler ve kolay erişilen işlemler kullanılır. Üye tarafında büyük Başla/Devam et, hedef, önceki değer ve set kaydı öne çıkar. Logo değişmez.

| Panel ekranı | Ana bilgi ve işlem |
| --- | --- |
| Özet | Atama bekleyen, başlamayan ve takip zamanı gelen üyeler |
| Üyeler | Arama, davet, atanmış antrenör, son kayıt/senkron, arşiv |
| Üye detayı | Program, antrenman, ilerleme, takip ve mesaj sekmeleri |
| Programlar | Taslak, şablon, kopyalama, yayın sürümü ve atama |
| Takip | Kaçırılan planın nedeni, izin/erteleme, iletişim ve sonraki tarih |
| Mesajlar | Yetkili konuşmalar ve okunmamış durum |
| Ayarlar | Kişisel tercihler; yetkiliyse salon/ekip/atama yönetimi |

### Rol ve veri sınırı

**Üye:** Kendi planı, kaydı ve izinli sohbeti. Başka üye veya özel antrenör notuna erişemez.

**Antrenör:** Atandığı üyeler ve izin verilmiş ortak şablonlar. Aynı salonda çalışmak bütün üyelerin özel verisini otomatik açmaz.

**Salon yöneticisi:** Kendi salonunun ekip, davet, atama ve operasyon bilgileri. Hassas üye notları/özel mesajlar için ayrıca tanımlanmış gerekçe ve izin gerekir.

**FitTrack işletim yöneticisi:** Servis, salon ve destek işlemleri. Varsayılan ham üye verisi erişimi verilmez; istisnai destek erişimi gerekçeli, süreli ve kayıtlı olur. Antrenör paneli için Supabase Studio hesabı veya service-role anahtarı dağıtılmaz.

**Erişim devri:** Eski antrenörün erişimi kaldırılır, işlem geçmişi korunur. Salondan ayrılma, üye arşivleme ve hesap silme farklı işlemlerdir. Çoklu salon varsa salon seçimi ve yerel önbellek salon bazında ayrılır. Gizli notlar sadece ekranda saklanmaz; yetkisiz API yanıtında da bulunmaz.

**Tasarım kabulü:** Üyeyi bul → program hazırla/ata → kaydı gör → takip oluştur zinciri telefon ve bilgisayarda tamamlanır. Boş liste, hata, kaydetme, büyük yazı, klavye ve TalkBack durumları kontrol edilir.

<!-- page -->

## Kod ve veri koruma sözleşmesi

**Mevcut ürün korunur:** Çoklu program atama, taslak/yayın, özel hareket, önceki değerler, dinlenme, geçmiş düzenleme ve mesajlaşma kaynak belgede mevcut olarak geçiyor. İlk envanterde doğrulanırlar. Çalışan bir özelliği kaldıran ya da davranışını değiştiren karar ayrıca gerekçelendirilir.

### Güvenli veri geçişi

- Önce şema, hareket kataloğu, mevcut program/geçmiş ve bekleyen kuyruk biçimi çıkarılır. Testte sentetik veya uygun biçimde anonimleştirilmiş veri kullanılır.
- Göç önce eklemeli ve geri uyumlu kurulur: yeni alan/tablolar, sürüm bilgisi ve gerektiğinde eski istemci için çeviri. Eski alanlar hemen silinmez. Aynı yazıyı iki modele aktarmak gerekiyorsa tutarlılık ve yeniden deneme test edilir.
- requiresWeight/requiresReps tek başına profil belirlemez. Hareket bazlı doğrulanmış eşleme kullanılır; belirsiz özel hareket inceleme listesine alınır. Plank’ı otomatik tekrar hareketi yapmak veya eski değerin birimini sessizce değiştirmek yasaktır.
- Göç öncesi/sonrası kimlikler, kayıt sayıları, değerler, birimler, ilişkiler ve snapshot’lar karşılaştırılır. Eşleme dışı kayıtlar kaybolmaz; eski güvenli gösterim veya açık inceleme durumu korunur.
- Eski APK, aktif oturum ve sonradan gelen offline işlemlerle uyumluluk doğrulanır. Desteklenemeyen eski istemci için veri kuyruğunu kaybetmeyen kontrollü güncelleme yolu gerekir.
- Geri dönüş yalnız “eski APK’yı yükle” değildir. Yeni sürümün yazdığı veriler korunarak uygulama geri dönüşü veya ileri düzeltme planlanır. Veritabanı yedeğini körlemesine geri yükleyip yeni kayıtları silmek kabul edilmez.

### Kalıcı veri kuralları

Yayınlanmış program değişmez; yeni sürüm oluşur. Başlamış antrenman gerekli program/ölçüm snapshot’ını taşır. Hedef ile gerçekleşen değer ayrı tutulur; boş değer sıfır değildir. Ölçüm birimi saklanır. Özel hareketin profili açık seçilir.

Her mutasyon benzersiz işlem kimliği taşır; sunucuda uygun benzersizlik/işlem kontrolüyle aynı işlem ikinci kez yazılmaz. İki cihaz çakışması sessiz son-yazan-kazan davranışına bırakılmaz; seçilen çözüm görünürdür. Kullanıcı ve salon değişiminde kuyruk/önbellek karışmaz. Çıkış sırasında gönderilmemiş kayıt varsa kayıp riski açıkça gösterilir; kayıtlar başka hesaba aktarılmaz.

### Uygulama kimliği ve teslim güvenliği

Package ID, logo ve imza sertifikası doğrulanır. Mevcut kurulum üzerine güncelleme gerçek APK ile denenir; imza uyumsuzluğu varsa kaldırıp kurma normal güncelleme diye sunulmaz. İmzalama anahtarı kayıpsa bu somut engeldir. Anahtar/parola kaynak ZIP’e veya sohbete yazılmaz; uygun gizli yapılandırma kullanılır.

**Karar:** Bu kontroller geçen paketi büyütmek uygundur. Bu kontrolleri atlamak, daha güçlü düşünme ayarıyla telafi edilemez.

<!-- page -->

## Siber güvenlik — her teslimin parçası

Bu bölüm savunma ve doğrulama planıdır; uygulamada açık bulunduğu veya güvenliğin kanıtlandığı anlamına gelmez. Kontroller yetkili test ortamında yapılır. Kaynak belgelerdeki teknik dayanaklar son sayfadadır.

**0.12.0 — Erişim temeli:** Salon üyeliği, aktiflik, antrenör ataması ve işlem türü sunucuda doğrulanır. İstemcinin gönderdiği role/gym_id veya değiştirebildiği metadata yetki kaynağı olmaz. RLS, GRANT ve INSERT/UPDATE sahiplik denetimi birlikte incelenir. Menü gizlemek yeterli sayılmaz. Git, APK ve web bundle’da secret/service-role/SMTP sırrı aranır; gerçek sızıntı varsa anahtar yenilenir. Publishable/anon anahtar tek başına gizli sır olarak değerlendirilmez.

**0.12.0 — Hesap güvenliği:** Süreli/iptal edilebilir davet, güvenli parola sıfırlama, uygun hız sınırı, ayrıcalıklı hesaplarda MFA ve denetim kaydı. Üyelik/atama iptali eski oturumla da test edilir. Geliştirme, test ve üretim ayrılır; ekip hesaplarında en az yetki uygulanır.

**0.13.0 — Yeni veri ve cihaz:** Yeni tablo, RPC/view, fonksiyon, kanal ve dosya erişimleri rol matrisiyle test edilir. Oturum anahtarları platform korumalı depoda; hassas offline veri uygun korumayla tutulur. Kullanıcı/salon ayrımı, çıkış temizliği ve işletim sistemi yedekleri incelenir. HTTPS, izinli deep link/WebView hedefleri, güvenli çıktı gösterimi ve girdiler kontrol edilir. Cookie tabanlı panel varsa CSRF/cookie ayarları ayrıca ele alınır.

**0.13.0 — Mesaj ve bildirim:** Gönderici/alıcı yetkisi sunucuda kontrol edilir. Push ve hata loglarında hassas sağlık/mesaj içeriği taşınmaz. Token yenileme ve hesap değişiminde iptal doğrulanır. Sunucunun push kabulü, cihaz teslimi ve kullanıcının açması farklı olaylardır; teslim garantisi varsayılmaz.

**0.14.0 — Medya ve son denetim:** Özel medya için yükleme/görüntüleme izni, boyut/tür/kota, süreli erişim ve silme; onaylı 3D varlıklar için dosya/harici kaynak sınırı. Service-role veya security-definer kullanan yollar ayrıca incelenir. Mobil için OWASP MASVS/MASTG, panel için ASVS kontrol alanları kullanılır. Otomatik tarama nesne/rol erişim testinin yerine geçmez.

### Zorunlu erişim matrisi

Kimliği doğrulanmamış kişi, üye A/B, aynı salondaki atanmış/atanmamış antrenör, başka salon antrenörü, salon yöneticisi ve yetkisi kaldırılmış hesap; okuma/ekleme/güncelleme/silme, davet, dosya, kanal ve RPC işlemleriyle sınanır. Hem izinli işlem çalışmalı hem yasak işlem reddedilmelidir.

**İşletim:** Veritabanı yedeği medya nesnelerini otomatik kapsıyor kabul edilmez. Ayrı medya yedeği ve geri yükleme provası yapılır. Kabul edilebilir veri kaybı aralığı (RPO), geri dönüş süresi (RTO) ve sorumlu pilot öncesi belirlenir. Olay akışı: erişimi sınırla, kanıtı koru, gerekli anahtar/oturumu iptal et, düzelt/geri dön, ilgili bildirim gereğini değerlendir. Yayın sonrası bağımlılık, yetki, maliyet, hata ve geri yükleme kontrolleri sürer.

<!-- page -->

## 3D hareketler — üretimden uygulamaya

**Kullanıcı deneyimi:** Üye hareket detayında “3D İncele”yi açar; animasyonu oynatır, parmağıyla 360° döndürür, yakınlaşır ve farklı açılardan izler. Statik anatomi modeli hareketin nasıl yapıldığını gösteren animasyonun yerine geçmez.

### Üretim hattı ve araçlar

**İçerik:** Blender’da lisanslı/özgün insan modeli ve iskelet hazırlanır. Her egzersiz için ekipman, hareket yolu ve döngü animasyonu üretilir veya kullanım hakkı doğrulanmış animasyon uyarlanır. Optimize GLB çıktısı alınır. Yapay zekâ ile ham model/görsel üretimi, rig/animasyon ve form onayı gereğini kaldırmaz.

**Uygulama:** İlk görüntüleyici adayı model-viewer; mevcut uygulama ve Android WebView üzerinde denenir. Özel kas seçimi/renklendirme gerçekten gerekirse Three.js ve OrbitControls değerlendirilir. Sadece bu özellik için bütün uygulama oyun motoruna taşınmaz. Önceki anatomy deposu etkileşim referansıdır; kod/model lisansı ve animasyon kapsamı ayrıca doğrulanmadan ürüne alınmaz.

**İlk hareket:** 0.13.0 veri sözleşmesi sonrası bir hareket, bir rig, bir GLB ve çalışan kamera/oynatma ile teknik deneme. Üretim emeği ve mobil maliyet bu örnekten ölçülür. Başarılıysa 0.14.0 görevinde beşe genişletilir.

**İlk beş için öneri:** Squat, dumbbell bench press, lat pulldown, plank ve Romanian deadlift. Kesin seçim pilot programına göre yapılır. Antrenör başlangıç pozisyonu, eklem/ekipman teması, hareket yolu ve döngüyü onaylar.

### Her hareketin somut teslimi

Kaynak .blend, optimize .glb, animasyon adı/süresi, poster ve kısa video, Türkçe form ipuçları, model/ekipman/doku/animasyon lisansları, gerekli atıflar, onaylayan kişi/tarih ve içerik sürümü birlikte tutulur. Dosyalar olmadan yalnız çalışan görüntüleyici “3D hareket kataloğu tamamlandı” sayılmaz.

### Performans ve güvenli geri dönüş

3D yalnız istekle yüklenir; görünmeyen animasyon durur; ekran değişiminde kaynaklar serbest bırakılır. Sürüm/hash ile önbellek, kota ve gerektiğinde temizleme uygulanır. Bozuk dosya, ağ veya cihaz desteği sorunu varsa poster/video/metne dönülür; kayıt ve sayaç çalışır.

İlk denemede hedeflenecek, henüz ölçülmemiş bütçe: hareket başına yaklaşık 5 MB GLB; 10 Mbps / 100 ms ağ profilinde ilk açılış yaklaşık 5 saniye; seçilmiş desteklenen düşük/orta cihazda en az 30 FPS. Cihaz ve örnek varlık sonuçlarıyla kesinleştirilir; başarısızlıkta kalite/karmaşıklık düşürülür veya 3D kapalı tutulur.

**Kabul:** S23 ve desteklenen düşük/orta cihazda 20 hareket değişimi, arka plan, ağ kopması, önbellek boşluğu ve bozuk dosya denenir. Kamera, 0,5×/1× oynatma ve reset çalışır; antrenman kaydı bozulmaz. Lisanslı ve formu onaylı beş hareket ürün teslimidir. 150 model, kişisel avatar, AR/VR ve kamera ile form analizi bu pakette yoktur.

<!-- page -->

## 0.16.0 pilot, 0.17.0 beta ve 1.0 yayın

**0.16.0 — Tek pilot sürümü:** Önce sentetik hesaplarla iç görev testleri, ardından mevcut yöntemin yanında kontrollü salon kullanımı. Önceki iç alfa ve paralel kullanım için ayrı ana sürümler çıkarılmaz. Gerekli hata düzeltmeleri 0.16.x olarak yapılabilir; her haftaya yeni sürüm zorunluluğu yoktur.

İç testte 3 antrenör ve 9 üye rolünü temsil eden senaryolar; davet → program atama → antrenman → takip zinciri, yetki reddi, offline, hesap değişimi ve imzalı yükseltme sınanır. Gerçek kişisel veriyle kullanımdan önce 0.14.0 güvenlik/veri kapıları geçmelidir.

Kontrollü pilot başlangıcı: 1 salon, 10–20 gönüllü üye ve uygun antrenörler; hedef 4 haftalık gözlem. Bu, modelin kod yazarak tamamlayabileceği süre değildir. Salonun mevcut yöntemi geri dönüş yolu olarak korunur. İlk günlerden itibaren hata ve kuyruk sorunları izlenir; haftalık kısa değerlendirmeyle engeller kapatılır.

**Pilot çıkışı:** Bilinen veri kaybı/çapraz erişim olayı ve tekrarlayan ciddi akış hatası yoktur; ana görevler yapılabiliyor; antrenör faydayı ve ücretli devam isteğini somut olarak anlatabiliyordur. Küçük örneklem bütün sistemin hatasızlığını kanıtlamaz. Dört hafta sonunda sorun varsa gözlem uzatılır veya ilgili düzeltme yapılır.

**0.17.0 — Çok salonlu kapalı beta:** 3–5 salon ve 50–150 üye başlangıç kapasite hedefi. Salon geçişi, atama/devir, izolasyon, destek süresi, medya trafiği ve aktif üye maliyeti ölçülür. Bu hedefler satış veya performans sonucu değildir. Ortak şablonlar ve ekip akışları yalnız gerçek ihtiyaç kadar genişletilir.

**1.0 — Kontrollü ticari Android yayını:** Güncel mağaza/test/ödeme şartları, hesap türü ve dağıtım modeline göre doğrulanır. Gizlilik/veri talepleri, destek sorumlusu, olay planı, imza sürekliliği ve yükseltme kanıtı tamamlanır. Ticari paket fiyatı görüşme ve maliyet verisiyle belirlenir; bu belge fiyat veya bitiş tarihi taahhüt etmez.

### Başarıyı neyle ölçeceğiz?

Ana metrik, antrenörün planlayıp üyenin uygulamada tamamladığı haftalık antrenman sayısıdır. Bunun yanında davetten ilk antrenmana dönüşüm, plan tamamlama, antrenörün program/takip süresi, destek talebi ve ücretli devam isteği ölçülür. Kayıt bulunmaması fiziksel salona gelmeme kanıtı değildir.

Koruma ölçüleri: veri kaybı/yinelenen kayıt, yetkisiz erişim, crash/ANR, sync kuyruk yaşı ve başarısız işlemler. Yüzdeler tarih, cihaz/ağ koşulu, pay/payda ve örneklemle raporlanır. Kaynak plandaki %99,8 crash-free ve %99,9 sync uzun vadeli işletim hedefleridir; küçük pilotta kanıtlandı diye yazılmaz.

**Görüşmeler şimdi başlayabilir:** Antrenöre “Programı nerede tekrar yazıyorsun, kimin takibini kaçırıyorsun, hangi iş için ödeme yaparsın?” soruları yöneltilir. Kodun bitmesi beklenmez.

<!-- page -->

## Ertelenen işler ve ekip paylaşımı

Birleştirme, gereksiz özellikleri yeniden kapsama almak anlamına gelmez. Ürünün odağı program atama, güvenilir antrenman kaydı, antrenör takibi ve anlaşılır hareket anlatımıdır. Rakiplerden görev akışı öğrenilir; geniş ürün katalogları ilk sürümün yapılacaklar listesine dönüştürülmez.

| Şimdilik ertelenen iş | Yeniden değerlendirme koşulu |
| --- | --- |
| EMOM, AMRAP, giant set, ileri dönemleme/deload | Pilot programı düz set/superset ile karşılanamıyorsa |
| Health Connect ve uyku/adım verisi | Verinin iyileştireceği antrenör kararı netleşirse |
| Canlı 1RM, plaka/ısınma hesaplayıcı, ileri grafik | Hızlı kayıt oturduktan sonra açık kullanıcı talebi |
| Toplu mesaj, gelişmiş segment, özel salon medyası | Gerçek takip/operasyon yükü gerektirirse |
| Üye adına antrenör kaydı | Açık talep; işlemi yapan kişi etiketi ve audit ile |
| Turnike, aidat, POS ve muhasebe | Ayrı iş modeli, cihaz/API erişimi ve maliyet çalışması |
| Beslenme, sosyal ağ, rozet yarışı, AI program yazarı | Ayrı talep doğrulaması ve antrenör kontrolü |
| 150 içerik şartı, tam atlas, avatar, AR/VR | Önce küçük katalogda fayda, üretim ve trafik kanıtı |

### Önerilen sorumluluklar

**Astra / geliştirme ajanı:** Envanter, planlanan kod değişikliği, migration, erişim ve otomatik testler, çalıştırılabilen arayüz kontrolleri, derleme ve teslim raporu. Mevcut araç/erişimle yapılamayan işi açıkça belirtir. Rutin uygulama kararlarını kendi çözer.

**Alper:** Teknik eş gözden geçirme, ortam/dağıtım erişimlerinin düzenlenmesi ve kritik model/güvenlik kararlarının kontrolü için önerilen sorumlu. Görev dağılımı ekipçe uyarlanabilir; bu belge atanmış erişim varsaymaz.

**Berk:** Ürün kapsamı, S23’te kısa gerçek kullanım kabulü, mevcut APK üzerine güncelleme ve antrenör/salon görüşmeleri. Yüzlerce küçük kontrolü elle yürütmek yerine teslimin ana akışını ve kullanıcı deneyimini sınar.

**İçerik onaylayacak antrenör:** Hareket örnekleri, form ipuçları ve 3D animasyonların doğruluğu. Satın alma/hukuki değerlendirme gibi dış kararlar kendi yetkili sorumlularıyla yürütülür.


<!-- page -->

## İlk büyük görevin uygulama talimatı

Aşağıdaki metin, kaynak kod ve mevcut APK ile birlikte 0.12.0 görevine verilebilir. Bu belge kodlamayı başlatmış veya testleri gerçekleştirmiş değildir.

> FitTrack’in mevcut kaynak kodunu, APK’sını ve migration’larını incele. Bu yol haritasındaki yeni 0.12.0 paketinin tamamını tek görevde uygula: oluşturucu hata/veri kaybı düzeltmeleri, hızlı programlama, ayrı antrenör paneli, hesap/davet/rol ve güvenlik temeli. Önce mevcut özellikleri doğrula; çalışanları gereksiz yere yeniden yazma. Bulduğun kritik veri veya erişim sorunlarını bağımlı özelliklerden önce düzelt. Logo, uygulama kimliği, geçmiş, aktif antrenman ve güncelleme uyumluluğunu koru. Değişiklikleri içeride küçük, geri alınabilir adımlarla yap; rutin kararlar için durma. İlgili testleri çalıştır, hataları gider ve paketin bütününü doğrula. Kaynak/commit, APK, migration ve geri dönüş notları, test kanıtı, bilinen sorunlar ve kısa cihaz kabul listesiyle tek teslim hazırla. Çalıştıramadığın testi geçti gösterme. Mevcut yetkilendirmeyi aşan canlı yayın, geri döndürülemez işlem veya maliyet için önce somut sonucu ve gereğini açıkla. Eksik erişim ya da ürün davranışını değiştiren belirsizlik varsa yalnız gerekli soruyu sor; bağımsız işleri tamamla. 0.13.0 kapsamına kendiliğinden geçme.

### Her sonraki pakette kullanılacak tamamlanma ölçütü

Kapsam maddeleri teslim özetiyle eşleşir. İlgili testler ve uçtan uca senaryolar geçer; veri kaybı/yetkisiz erişim ve ciddi ana akış hatası yoktur. Geri dönüş yolu açıklanmıştır. Eski kurulumdan yükseltme ve veri uyumluluğu doğrulanmış veya çalıştırılamayan kısmı açıkça işaretlenmiştir. Özellik anahtarıyla kapalı kalan işler ve bekleyen insan/cihaz kontrolleri gizlenmez.

### Dayanaklar ve belgenin sınırı

Bu yeniden yazım, 18 Ağustos kaynak belgesi, 6 Eylül ayrıntılı revizyonu ve Berk’in büyük teslim paketleri talebine dayanır. Önceki rekabet araştırmasının fiyat/özellik iddiaları bu belgede güncellenmiş araştırma olarak tekrar sunulmaz. Yeni numaralandırma önceki mikro sürüm sırasının yerini alır. Aşağıdaki teknik kaynaklar önceki incelemenin dayanaklarıdır; uygulama sırasında güncel sürüm davranışı ayrıca doğrulanır.

- [Supabase — RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [üretim kontrol listesi](https://supabase.com/docs/guides/deployment/going-into-prod), [özel SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [yedekler](https://supabase.com/docs/guides/platform/backups).
- [OWASP — MASVS](https://masvs.org/) ve [ASVS](https://owasp.org/www-project-application-security-verification-standard/).
- [Android — uygulama imzalama](https://developer.android.com/studio/publish/app-signing).
- [model-viewer — animasyon](https://modelviewer.dev/examples/animation/) ve [Three.js — OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls).
- [Blender glTF içe/dışa aktarımı](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html); [anatomy etkileşim referansı](https://github.com/thebuggeddev/anatomy).
- [OpenAI — reasoning effort](https://developers.openai.com/api/docs/guides/reasoning#reasoning-effort): Max düşünme çabasını artırır; paketin güvenliği bu belgedeki uygulama ve doğrulama koşullarıyla değerlendirilir.
