# FitTrack Güncel Ürün ve Teknik Yol Haritası

**0.12.1 sonrası Revizyon 9**  
**Tarih:** 17 Eylül 2026  
**Başlangıç tabanı:** Beta 0.12.1 / versionCode 28 / yerel şema 14  
**Ürün sahipleri:** Berk ve Alper

## Yönetici özeti

FitTrack'in sonraki büyük işi UI yenilemesidir; ancak bütün ekranları tek riskli teslimde değiştirmeyeceğiz. Tasarım sistemi ve ekran geçişi 0.13.0 ile 0.16.0 arasındaki dört özellik sürümünde tamamlanacak. 0.12.2 yalnız acil bir 0.12.1 hata yaması gerekirse kullanılacak; aksi hâlde sıradaki özellik sürümü 0.13.0 olacaktır.

UI tamamlandıktan sonra push ve takip, program sürümleme, superset, senkronizasyon güvenliği ve ticari pilot altyapısı sırasıyla geliştirilecek. Web paneli, iOS, çok salon ve turnike silinmedi; mobil ücretli pilot sonrasındaki aşamalara taşındı.

## Sürüm özeti

| Sürüm | Ana teslim | Aşama |
|---|---|---|
| 0.12.1 | Mevcut doğrulanmış taban | Tamamlandı |
| 0.13.0 | Tasarım sistemi, dört tema ve giriş akışları | UI 1/4 |
| 0.14.0 | Hareket ölçüm modeli ve antrenman ekranları | UI 2/4 |
| 0.15.0 | Üye deneyiminin tamamlanması | UI 3/4 |
| 0.16.0 | Antrenör deneyimi ve Program Stüdyosu | UI 4/4 |
| 0.17.0 | Push, haftalık check-in ve takip raporu | Pilot öncesi |
| 0.18.0 | Program sürümleme ve hazırlama kolaylıkları | Pilot öncesi |
| 0.19.0 | Superset ve zorlamayan antrenman planlama | Pilot öncesi |
| 0.20.0 | Senkronizasyon ve çevrimdışı kayıt güvenliği | Pilot öncesi |
| 0.21.0 | Paketler, erişim hakları ve ücretli pilot kapısı | Pilot başlangıcı |
| 0.22.0 | Salon sahibi web paneli | Pilot sonrası |
| 0.23.0 | Koşullu QR check-in ve grup dersi | Pilot talebine bağlı |
| 0.24.0 | iOS mühendislik betası ve TestFlight | 1.0 öncesi |
| 0.25.0 | Çok salonlu kapalı beta | 1.0 öncesi |
| 0.26.0 | Turnike sağlayıcısı ile donanım pilotu | Ayrı entegrasyon |
| 1.0 | Kontrollü ticari yayın | Yayın kapısı |

## 0.12.1 mevcut taban

0.12.1, versionCode 28 ve yerel şema 14 yeni planın tek başlangıç noktasıdır. 0.11.9 veya eski kaynaklar yeni koda karıştırılmayacaktır. Kaynak incelemesinde 19 test grubu, üretim bağımlılık denetimi ve web-Android kaynak eşleşmesi geçmiş; fiziksel telefon kabulü yine ayrı tutulmuştur.

Korunacak çekirdek davranışlar:

- Kullanıcı yapmak istediği seansı kendisi seçer; uygulama önermez.
- Bir üyeye birden fazla aktif program atanabilir.
- Yarım antrenman doğru seans ve setten devam eder.
- Taslak kurtarma, snapshot, geçmiş düzenleme ve silme çalışır.
- Antrenörün beş sekmeli mobil navigasyonu ve rol ayrımı korunur.
- Yedek, bildirim ve Auth callback hesap ve salon sınırlarını aşmaz.

## Sürüm numaralandırma ve geliştirme kuralı

- 0.13.0, 0.14.0 gibi sürümler özellik paketidir.
- 0.13.1, 0.13.2 gibi sürümler yalnız doğrulanmış hata düzeltmeleri içindir.
- versionCode her Android tesliminde artar; ilerideki kodlar bugünden sabitlenmez.
- Şema numarası yalnız gerçek yerel veri değişikliği olduğunda artar.
- Yüksek riskli pakette veri sözleşmesi, UI ve fiziksel kabul ayrı geliştirme adımlarıdır.
- Bir aşamanın testi kapanmadan bağımlı aşamaya geçilmez.

## UI yenileme planı

UI yenilemesi dört özellik sürümünde tamamlanacaktır. Bu bölünme tasarımın tutarlılığını bozmak için değil, veri modeli ile ekranların birbirini tekrar yazmasını önlemek içindir.

### 0.13.0 Tasarım sistemi ve giriş akışları

**Risk:** Orta. Yeni görsel dili önce ortak bileşenlere yerleştirir. İş kurallarını değiştirmeden auth, profil kurulumu, navigasyon ve temel durum ekranlarını yeni tasarıma taşır.

**Kapsam**

- Yeni Koyu Kırmızı ana tema oluşturulur ve Crimson Graphite temasının yerini alır.
- Redline Editorial, Plum Night ve Rosewood Strength korunur. Uygulamada toplam dört tema bulunur.
- Kaldırılan temayı kullanan hesaplar veri kaybetmeden Yeni Koyu Kırmızı temaya taşınır.
- Renk, tipografi, boşluk, köşe, gölge, ikon, buton, kart, form ve modal tasarım tokenları tek merkezde tanımlanır.
- Açılış, giriş, kayıt, e-posta doğrulama, şifre sıfırlama ve profil kurulum ekranları yenilenir.
- Cinsiyet kartları, kaydırmalı boy seçimi ve cetvelli kilo girişi uygulanır; değerler elle de yazılabilir.
- Üye ve antrenör navigasyon kabukları, yükleniyor, boş, hata, çevrimdışı ve yetki reddi durumları ortak bileşenlerle kurulur.

**Kabul ölçütleri**

- 0.12.1 üzerine güncellemede hesap, tema, program, geçmiş ve yarım antrenman korunur.
- Dört temada kontrast, büyük yazı, klavye, Android geri hareketi ve dar ekran testleri geçer.
- Normal giriş e-posta ve şifreyle kalır; kayıt doğrulaması ve kullanıcı tarafından başlatılan şifre kurtarma kodla çalışır.
- Bu sürümde antrenman veri modeli veya yeni ürün özelliği değiştirilmez.

### 0.14.0 Hareket ölçüm modeli ve antrenman ekranları

**Risk:** Yüksek. Yeni aktif antrenman tasarımını yalnız kilo ve tekrar varsayımına bağlamadan kurar. Veri sözleşmesi önce tamamlanır, ekranlar ardından aynı sürümün ayrı kabul adımında açılır.

**Kapsam**

- Tekrar ve yük, vücut ağırlığı tekrarı, süre, mesafe ve süre, yük ve mesafe ile yalnız tamamlandı ölçüm profilleri tanımlanır.
- Eski requiresWeight ve requiresReps kayıtları eklemeli göçle yeni profile eşlenir; belirsiz kayıtlar inceleme listesine alınır.
- Aktif antrenmanda ve hareket detayında GIF; program oluşturma, program inceleme ve geçmiş düzenlemede sabit hareket fotoğrafı kullanılır.
- Geçmiş antrenman düzenleme ekranında bütün hareketler kartlar hâlinde alt alta görünür; kilo ve tekrarlar doğrudan düzenlenir ve tek işlemle kaydedilir.
- Önceki antrenmanın değerlerini gösterme ve tek sete veya tüm setlere uygulama mevcut işlevi denetlenip eksikleri tamamlanır.
- Antrenman bitiminde yalnız eğlenceli ve motive edici özet gösterilir. Zorluk, ağrı veya medikal soru eklenmez.
- Kullanıcı antrenmana başlarken yapmak istediği seansı kendisi seçer; uygulama seans önermez veya haftanın gününe bağlamaz.

**Kabul ölçütleri**

- Her ölçüm profili için program oluşturma, antrenman kaydı, geçmiş düzenleme ve önceki değer senaryosu geçer.
- Yarım oturum, aynı seans ve aynı setten güvenli biçimde devam eder.
- Aynı seansı aynı hafta tekrar başlatma yalnız uyarı verir; kullanıcı isterse devam eder.
- Göç öncesi ve sonrası kayıt sayıları, hareket kimlikleri, birimler ve snapshot ilişkileri karşılaştırılır.

### 0.15.0 Üye deneyiminin tamamlanması

**Risk:** Orta. Üyenin günlük kullandığı bütün ana akışları yeni görsel dilde tamamlar. Bu sürüm sonunda üye tarafında eski ve yeni UI karışımı kalmaz.

**Kapsam**

- Üye ana sayfasında haftalık antrenman tablosu, hızlı istatistikler, atanan programlar ve anlaşılır başlangıç işlemi yer alır.
- Programlarım, program ayrıntısı, seans seçimi ve antrenman özeti yeni kart sistemine taşınır.
- Egzersiz kütüphanesi alfabetik liste, arama, kas ve ekipman filtresiyle yenilenir; detayda GIF ve Türkçe açıklama gösterilir.
- İlerleme ekranı mevcut 7 gün, 4 hafta ve 6 ay verilerini korur. Bel, boyun, kol ve kalça ölçüleri eklenir; ilerleme fotoğrafı eklenmez.
- Mesajlaşma, profil ve ortak ayarlar yeni UI ile tamamlanır.
- Uzun metin, küçük ekran, boş veri, düşük bağlantı, yükleme, hata ve erişim reddi ekranları aynı tasarım diliyle tamamlanır.

**Kabul ölçütleri**

- Üye girişten antrenman tamamlamaya kadar eski UI ekranına düşmeden ilerler.
- Yazılar yaşlı kullanıcıların okuyabileceği boyutta kalır; metin büyütmede buton ve tablo taşması olmaz.
- GIF yüklenmese bile fotoğraf, açıklama ve set kaydı çalışır.
- Fotoğraf yükleme veya sağlık verisi alanı bulunmaz.

### 0.16.0 Antrenör deneyimi ve Program Stüdyosu

**Risk:** Orta. 0.12.1'de bulunan beş sekmeli antrenör işlevlerini yeni A+ ana sayfa ve elit görsel dil ile yeniden düzenler. Mevcut işlevler sıfırdan yazılmış sayılmaz; korunarak iyileştirilir.

**Kapsam**

- Antrenör ana sayfasında toplam üye, bugünkü kayıtlar ve programı olmayan, uzun süredir kayıt girmeyen veya okunmamış mesajı bulunan üyelere kısa yollar yer alır.
- Ana sayfada üye isimleri ve mesaj metinleri yığılmaz; ayrıntılar Üyeler ve Mesajlar ekranlarında açılır.
- Üyeler, üye ayrıntısı, programlar, program ayrıntısı, Program Stüdyosu, mesajlar ve ortak ayarlar yeni UI ile tamamlanır.
- Program oluştururken hareketlerde sabit fotoğraf kullanılır; GIF yalnız aktif antrenman ve hareket detayında oynar.
- Taslak kurtarma, silme ve geri alma, hareket arama, filtre, program atama ve sınırsız çoklu program davranışı korunur.
- Antrenör her harekete bir ile üç onaylı alternatif bağlayabilir. Üye yalnız tanımlanmış alternatiflerden seçim yapabilir.
- Aktif, Takip Et ve Başlamadı durumları salon girişine değil antrenman kayıtlarına dayanır.

**Kabul ölçütleri**

- Test antrenörü üye bulma, program hazırlama, yayımlama, atama, geçmiş inceleme ve mesaj gönderme görevlerini yardım almadan tamamlar.
- Taslak program yanlışlıkla kaybolmaz; yayımlanmamış program üyeye atanamaz.
- Yetkisiz antrenör başka antrenörün veya salonun üyelerine erişemez.
- 0.13 ile 0.16 arasındaki bütün ekranlar tek görsel regresyon paketinde doğrulanır. UI yenilemesi bu sürümle tamamlanır.

## Pilot öncesi ürün ve güvenilirlik

### 0.17.0 Push bildirimleri, haftalık check-in ve takip raporu

**Risk:** Yüksek. Uygulamanın kullanıcı tarafından tesadüfen açılmasına bağlı kalmadan program, mesaj ve takip döngüsünü çalıştırır.

**Kapsam**

- Yeni program, yeni mesaj ve haftalık check-in için gerçek cihaz push bildirimleri eklenir.
- Bildirim izinleri, token yenileme, çıkışta token ilişkisinin kaldırılması, konuşma susturma ve tercih ekranı tamamlanır.
- Haftalık check-in uyku, yorgunluk, motivasyon ve kısa notla sınırlı tutulur; ağrı, teşhis veya sağlık formuna dönüşmez.
- Antrenör son 7 ve 30 gündeki tamamlama oranını, hiç başlamayanları, yarım bırakanları ve uzun süredir kayıt girmeyenleri görür.
- Mesaj geçmişi sayfalama, kararlı sıralama, okunmamış sayısı ve tekrar mesaj engeliyle ölçeklenir.

**Kabul ölçütleri**

- Bildirim uygulama kapalıyken gerçek Android cihazda doğru hedefi açar ve hedef yetkisi yeniden kontrol edilir.
- Bildirim metni varsayılan olarak özel mesaj veya sağlık içeriği taşımaz.
- Check-in yanıtları başka salon veya yetkisiz antrenöre sızmaz.
- Antrenman kaydı olmayan durum salon devamsızlığı olarak adlandırılmaz.

### 0.18.0 Program sürümleme ve hazırlama kolaylıkları

**Risk:** Yüksek. Yayımlanmış programları ve geçmişi sessizce değiştirmeden antrenörün program hazırlama süresini azaltır.

**Kapsam**

- Taslak, şablon, yayımlanmış değişmez program sürümü ve üye ataması ayrılır.
- Program ve gün kopyalama, başka programdan gün alma, favoriler, son kullanılanlar ve önizlemeli toplu düzenleme eklenir.
- Üye yeni sürüme şimdi, sonraki antrenmanda veya hiç taşınmama seçenekleriyle geçirilebilir.
- Başlamış antrenman snapshot'ı ile tamamlanmış geçmiş değişmez.
- Onaylı alternatif hareketin kullanımı geçmişte asıl hareketten ayırt edilir.

**Kabul ölçütleri**

- Göç provasında program, atama, geçmiş, aktif oturum ve çevrimdışı taslak ilişkileri korunur.
- Kopyalanan program özgün programı değiştirmez.
- Yeniden denenen atama veya sürüm taşıma kopya kayıt üretmez.
- Belirsiz eşleme varsa otomatik taşıma durur ve kullanıcıya anlaşılır sonuç gösterilir.

### 0.19.0 Superset ve zorlamayan antrenman planlama

**Risk:** Yüksek. Gerçek programlamada gereken superset akışını ekler; takvim ise kullanıcıya seans dayatmadan plan ve hatırlatma sağlar.

**Kapsam**

- Normal set ve superset blokları, blok içi sıra, tur ve dinlenme kuralları tanımlanır.
- Uygulama kapanırsa tamamlanan set, tur ve aktif hareket geri yüklenir.
- Antrenman günleri ve hatırlatmalar planlanabilir; günler Çekiş, İtiş veya Bacak seansına zorunlu bağlanmaz.
- Kullanıcı planlanan günde de yapmak istediği seansı kendisi seçer.
- PT randevusu, seans kredisi, grup dersi ve ödeme bu takvime eklenmez.

**Kabul ölçütleri**

- Superset sırasında kapanma, geri dönme, düzenleme, iptal ve yarım oturum kurtarma testleri geçer.
- Eski programlar normal blok olarak aynı anlamla açılır.
- Saat dilimi ve çevrimdışı erteleme kopya plan üretmez.
- Uygulama hiçbir seansı otomatik önermez.

### 0.20.0 Senkronizasyon ve çevrimdışı kayıt güvenliği

**Risk:** Yüksek. Pilot öncesinde çift kayıt, veri ezilmesi ve hesaplar arası kuyruk sızıntısı riskini azaltır. Teknik çatışma ekranını erkenden kullanıcıya yüklemez.

**Kapsam**

- Kalıcı işlem kimliği, tekrar deneme güvenliği, revision kontrolü ve hesap veya salon kapsamlı çevrimdışı kuyruk uygulanır.
- Aynı işlem tekrar gönderildiğinde yeni antrenman veya mesaj oluşmaz.
- Çatışmalar mümkün olduğunda sunucuda güvenli kurallarla çözülür. Kullanıcıya iki teknik kaydı karşılaştıran gelişmiş ekran eklenmez.
- Güvenle çözülemeyen iki kayıt da korunur ve basit bir bekleyen durum gösterilir; hiçbir kayıt sessizce silinmez.
- Yedeklerin, yerel cache'in ve bekleyen işlemlerin hesap ve salon izolasyonu doğrulanır.

**Kabul ölçütleri**

- İki fiziksel cihaz, ağ kesintisi, yeniden başlatma, hesap değişimi ve erişim iptali testleri yapılır.
- Sessiz veri kaybı, başka hesaba işlem gönderimi veya aynı antrenmanın çift sayılması olmaz.
- Gelişmiş çatışma karşılaştırma UI'sı gerçek kullanım kanıtı oluşana kadar ertelenir.
- Pilot sırasında kabul edilmemiş çoklu cihaz yazması gerekiyorsa teknik olarak kapatılır.

### 0.21.0 Ticari altyapı ve ücretli pilot kapısı

**Risk:** Yüksek. Gerçek salonu manuel veritabanı müdahalesine bağımlı bırakmadan ücretli pilotu başlatır. QR ve turnike pilot kapısının parçası değildir.

**Kapsam**

- FitTrack salon aboneliği için deneme süresi, paket, üye limiti ve özellik hakkı altyapısı kurulur. Uygulama içinde satın alma yapılmaz.
- Üyeye belirli tarihe kadar sınırsız giriş veya belirli sayıda giriş kredisi tanımlanabilir. Bu kayıt pilot salonun mevcut kartlı turnikesinin yerine geçmez.
- CSV üye aktarımında önizleme, kolon eşleme, yinelenen e-posta kontrolü ve hatalı satır raporu bulunur. İlk pilotta kontrollü destek işlemi olarak çalışabilir.
- Daveti yeniden gönderme, üyeyi başka antrenöre aktarma, erişimi kapatma, yanlış hesabı düzeltme ve senkronizasyon hatasını görme araçları tamamlanır.
- Davetten kayda, ilk antrenmana, haftalık kullanıma, tamamlama oranına, program hazırlama süresine, check-in yanıtına ve destek talebine ilişkin gizliliğe uygun pilot ölçümleri eklenir.
- RLS, gerçek SMTP, yedekten geri yükleme, hesap silme ve veri dışa aktarma, hata izleme ve erişim iptali pilot kapısında doğrulanır.

**Kabul ölçütleri**

- Pilot salon mevcut kartlı turnikesini kullanır. FitTrack QR ve fiziksel kapı açma kapalıdır.
- Kritik veya yüksek güvenlik açığı, veri kaybı ya da temel görev engeli açık kalmaz.
- Bir salon, en az iki antrenör ve gerçek üyelerle dört haftalık ölçüm planı hazırlanır.
- Pilot boyunca özellik eklemek yerine 0.21.x yamalarıyla doğrulanmış hatalar düzeltilir.

## Pilot sonrası yol

| Sürüm | Teslim | Kapsam |
|---|---|---|
| 0.22.0 | Salon sahibi web paneli | Mobil pilot sonrasında tarayıcıdan salon özeti, üyeler, programlar, ekip, davet, erişim ve CSV aktarımı. İlk roller salon sahibi ve antrenördür. Ayrı masaüstü uygulaması yoktur. |
| 0.23.0 | Koşullu QR check-in ve grup dersi | Talep varsa duvar QR'ı üye ana sayfasındaki hızlı işlemden okutulur; alt menüye QR sekmesi eklenmez. Sabit QR kapı açmaz ve güvenlik önlemi olmadan kredi düşürmez. Grup dersi ve kontenjan pilot talebiyle açılır. |
| 0.24.0 | iOS mühendislik betası ve TestFlight | Android pilotundan sonra ve ticari 1.0'dan önce iOS projesi, Keychain, linkler, offline kayıt, GIF, APNs ve fiziksel iPhone kabulü. |
| 0.25.0 | Çok salonlu kapalı beta | En az iki salonda veri izolasyonu, salon geçişi, rol iptali, kota, cache ve maliyet doğrulanır. Önceki RLS sözleşmesi gerçek ölçekte sınanır. |
| 0.26.0 | Turnike sağlayıcısı ile donanım pilotu | Müşteriyle turnike markası ve API belirlendikten sonra ayrı ücretli modül. Ağ kesintisi, tekrar geçiş, erişim iptali ve audit gerçek donanımda test edilir. POS ve ERP eklenmez. |
| 1.0 | Kontrollü ticari yayın | Android, web ve iOS; destek, gizlilik, yedek ve restore; mağaza, maliyet ve güvenlik kabulleri tamamlanır. |

## Hareket kataloğu ve medya hattı

Hareket içeriği uygulama sürümlerinden bağımsız paketlerle büyütülecek. İlk kalite hedefi 150 harekettir; 300 hareket zorunlu sürüm hedefi değildir. Kullanıcı ve antrenör talebi katalog genişlemesini belirler.

Her yayımlanan hareket için sabit kimlik, doğru ölçüm profili, Türkçe ad ve arama eş adları, kas ve ekipman bilgisi, sabit fotoğraf veya poster, GIF, Türkçe açıklama, kaynak ve kullanım hakkı ile insan incelemesi bulunmalıdır. Program oluşturma ve geçmiş ekranlarında fotoğraf; aktif antrenman ve hareket detayında GIF kullanılır.

İçerik 25 hareketlik paketler hâlinde yayımlanabilir. Pilotun kullandığı hareket seti yüzde 100 hazır olmadan pilot programı açılmaz; 150 hareketin tamamının bitmesi pilot için zorunlu değildir.

## Her sürümde güvenlik ve kalite kapısı

- RLS ve API negatif testleri başka salon, başka antrenör, erişimi iptal edilmiş hesap ve değiştirilmiş kimliklerle çalıştırılır.
- İstemciye service role veya sunucu sırrı konmaz; loglarda token, parola ve hassas mesaj maskelenir.
- Şema değişikliği test kopyasında eklemeli ve eski istemciyle uyumlu denenir.
- Android güncellemesi mevcut 0.12.1 üzerine kurulur; hesap, tema, geçmiş ve yarım oturum korunur.
- Otomatik test, gerçek Samsung S23 dokunma, klavye, bildirim ve ağ kesintisi kabulünün yerine geçmez.
- Her teslimde imzalı APK, tam kaynak, devir dosyası, test sonucu, çalıştırılmayan testler ve geri alma notu bulunur.

## Ürün karar defteri

### Aktif kapsam

| Konu | Karar |
|---|---|
| Temalar | Yeni Koyu Kırmızı, Redline Editorial, Plum Night ve Rosewood Strength |
| İlerleme | Vücut ölçüleri var; ilerleme fotoğrafı yok |
| Antrenman sonu | Eğlenceli ve motive edici özet; zorluk veya medikal soru yok |
| Bildirim ve takip | Push, haftalık check-in ve antrenman uyum raporu |
| Program | Sürümleme, kopyalama kolaylıkları, alternatif hareket ve superset |
| Paketler | Salon planı ile üye süre veya giriş kredisi; uygulama içi ödeme yok |
| İçerik | İlk kalite hedefi 150 hareket; 300 zorunlu hedef değil |

### Ertelenen veya koşullu kapsam

| Konu | Zaman veya koşul |
|---|---|
| Salon sahibi web paneli | Mobil pilot sonrasında |
| Duvar QR check-in | Pilot sonrasında ve salon bazlı özellik bayrağıyla |
| Grup dersi ve kontenjan | Pilot talebiyle |
| iOS | Android pilotundan sonra, 1.0 öncesinde |
| Çok salon | Tek salon ücretli pilotundan sonra |
| Turnike | Müşteri ve turnike sağlayıcısı görüşmesinden sonra |
| Gelişmiş interval türleri | Superset kullanımı doğrulandıktan sonra |
| Mesaj eki ve canlı çevrimiçi durumu | Gerçek talep kanıtı oluşursa |

### Aktif plandan çıkarılan işler

| Konu | Karar |
|---|---|
| İlerleme fotoğrafları | Kapsamdan çıkarıldı |
| Sağlık ve hareket kısıtlama formu | Kapsamdan çıkarıldı |
| PT randevusu ve seans kredisi | Kapsamdan çıkarıldı |
| Salon logosu ve renkleriyle white-label | Tek FitTrack markası korunacak |
| Üyeden uygulama içi online ödeme | Kapsamdan çıkarıldı |
| Kurulabilir masaüstü uygulaması | Web paneli kullanılacak |
| Beslenme, AI koç, topluluk, giyilebilir cihaz ve 3D | Aktif plandan çıkarıldı |
| Tam POS, muhasebe ve ERP | FitTrack Coach kapsamı dışında |
| 300 hareket zorunluluğu | Kalite ve talep odaklı katalog büyümesi |
| Gelişmiş iki cihaz karşılaştırma ekranı | Arka plan güvenliği yapılacak; teknik UI ertelendi |

## Pilot başarı ölçütleri

Pilot kararları özellik sayısına göre değil aşağıdaki ölçümlere göre verilecektir:

- Davet alan üyeden kayıt olan ve ilk antrenmanını tamamlayanların oranı
- Haftalık aktif üye, 7 ve 30 günlük devam oranı
- Başlatılan ve tamamlanan antrenman oranı
- Antrenörün program hazırlama ve üyeye atama süresi
- Haftalık check-in yanıt oranı ve takip gerektiren üye sayısı
- Push teslim hatası, senkronizasyon hatası, kopya kayıt ve veri kaybı sayısı
- Destek talebi, görevi tamamlayamama ve antrenörün yardım ihtiyacı

## İlk geliştirici görevi

İlk görev 0.13.0 A adımıdır. 0.12.1 kaynak paketi tek taban olarak alınır; eski 0.11.9 kaynakları veya iptal edilmiş projeler karıştırılmaz. Önce mevcut testler, sürüm, paket, şema, imza ve güncelleme davranışı yeniden doğrulanır. Sonra ortak tasarım tokenları ile dört tema haritalanır ve giriş, kayıt, doğrulama, şifre kurtarma ve profil kurulum ekranları yeni bileşenlere taşınır.

İlk görevde hareket ölçüm modeli, yeni GIF kataloğu, push, QR, paket, superset veya program sürümleme geliştirilmez. Veritabanı gerekmiyorsa yerel şema 14 kalır. İlk özellik APK'sı 0.13.0 ve en az versionCode 29 olur; arada acil 0.12.2 yaması çıkarsa versionCode buna göre artırılır.

İlk teslim imzalı APK, tam kaynak ZIP'i, değişiklik listesi, test sonuçları, fiziksel telefonda yapılması gerekenler ve sonraki adım için devir belgesi içerir.

## Planın değiştirilme kuralı

Bir hata düzeltmesi planlanan özelliğin yerine geçmiş sayılmaz. Tamamlanmayan özellik bir sonraki sürüme sessizce kaydırılmaz; yol haritasında açıkça yeniden planlanır. Yeni fikir doğrudan geliştirmeye girmez. Önce mevcut hedefe etkisi, veri modeli, güvenlik, test yükü ve pilot değerine göre karar listesine eklenir.

Bu planın başarı ölçütü az sürüm numarası veya tek oturumda çok kod değildir. Kullanılabilir iş, korunmuş veri, gerçek cihaz kabulü ve tekrarlanabilir teslimdir.
