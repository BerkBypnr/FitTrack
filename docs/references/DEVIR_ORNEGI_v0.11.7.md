# FITTRACK — ALPER CHATGPT DEVİR RAPORU — v0.11.7

Tarih: 9 Eylül 2026. Bu rapor, kaynak ZIP ve APK ile birlikte devralınmalıdır.
Konuşma geçmişi olmadan devam edebilmek için mevcut kararlar ve sınırlar aşağıdadır.

## 1. Sürüm ve doğrulanmış taban

| Alan | Değer |
|---|---|
| Önceki sürüm | FitTrack Beta 0.11.6 tema paketi |
| Önceki versionCode | 23 |
| Yeni sürüm | FitTrack Beta 0.11.7 |
| Yeni versionCode | 24 |
| Yerel veri şeması | 14 — değişmedi |
| Android paket adı | com.fittracklabs.mobile |
| Minimum / hedef API | 24 / 36 |
| Auth dönüşü | com.fittracklabs.mobile://auth-callback |
| Native kaynak biçimi | Orijinal APK'dan türetilmiş Smali + Android kaynakları |

Bu çalışma **Berk'in 0.11.6 tema paketi tabanı** üzerinden yapıldı. Alper'in önceki
Android/Capacitor rekonstrüksiyonu kullanıcı tarafından iptal edilmişti ve kullanılmadı.
Kaynak ZIP'inde APK'yı yeniden üreten betikler, manifest, Smali, Android kaynakları,
web kaynakları, sabit bağımlılıklar, SQL ve testler bulunur. **Bu paket özgün bir
Gradle/Java/Kotlin projesi değildir.** Bunu tam Capacitor kaynak rekonstrüksiyonu diye
tanıtmayın. Native kod Smali'den yeniden derlenir; eski APK'nın hazır DEX dosyaları
kopyalanmaz. Projenin kökeni `docs/NATIVE_PROVENANCE.json` içinde kayıtlıdır.

## 2. Amaç ve kullanıcının bağlayıcı kararları

- Bu sürüm üye ana sayfasını ve aktif antrenmanı yeniler.
- İlerleme sayfası kullanıcının son düzeltmesi uyarınca mevcut haliyle kalır;
  yalnız **Başarıların** rozet bölümü eklenir. Önceki 4 hafta/aylık özet tasarım
  fikirleri bu sürümün kapsamı değildir. Mevcut filtreler ve grafikler korunur.
- Aktif antrenmanda program adı, sayaç, ilerleme çubuğu, büyük hareket görseli,
  ayrı hedef tekrar/set türü, açılır açıklamalar ve altta erişilebilir set kaydı vardır.
- Hareket ve set sıra bilgileri küçük olmayacak: bu sürümde 20 px ve kalın.
- Görsel üstünde ön/yan/döndür veya oynat düğmesi yoktur. Mevcut GIF otomatik
  oynar; 3D yapılıp yapılmayacağı kesinleşmedi, bu sürüm 3D eklemez.
- Mevcut altı tema ve görsel kimlik korunur; tasarım örneklerindeki renkler temsilidir.
- Antrenör arayüzü **sonraki güncellemenin konusudur**. Bu sürümde tasarlanmadı.

## 3. Yapılan değişiklikler

### Üye ana sayfası

`renderHome`, üye için yeni ana sayfayı açar; antrenör/yönetici rolü önceki
`renderLegacyHome` gövdesini kullanır. Antrenör fonksiyonları değiştirilmedi.

- Saat ve profil adına göre karşılama; gerçek programdan büyük antrenman kartı.
- Devam eden oturum varsa ilk sıradadır. Yoksa seçili atama, ardından bugüne
  uygun atama veya ilk atama öne çıkar. Ana sayfayı açmak program seçimini değiştirmez.
- Gerçek tamamlanan/toplam set, yüzde ve aktif oturumun geçen süresi gösterilir.
  Aktif oturum yoksa yapay süre yazılmaz; hareket sayısı gösterilir.
- Başla/devam et ve programı incele kısayolları mevcut eylemleri kullanır.
- Birden fazla atamada Tüm antrenmanların düğmesi mevcut Antrenmanlarım'a gider.
  Diğer atamalar kaldırılmadı veya gizli yeni bir program seçimine dönüştürülmedi.
- Ataması kaldırılmış yarım oturumda snapshot üzerinden devam/iptal yolu korunur.
  Böylece önceki sürümlerde giderilen yeni antrenmana başlayamama hatası geri gelmez.
- Haftalık devamlılık gerçek tamamlanmış günlere dayanır. Takvim günü tanımlıysa
  farklı günlerin sayısı hedef olur; plansız programda uydurma bir haftalık hedef yoktur.
- Antrenör kartı mevcut sohbet, okunmamış mesaj ve not altyapısını kullanır.
- Hiç ataması olmayan hesapta uygun boş durum vardır.

### Aktif antrenman

`renderWorkout` yeni yerleşimi üretir; tamamlama, dinlenme, taşıma, geçmiş,
snapshot ve senkronizasyon işlevleri mevcut altyapıyla çalışır.

- Üstte program ve gerekiyorsa gün adı; toplam süre; gerçek set ilerlemesi.
- Hareket X / Y ve Set X / Y bilgileri ayrı, büyük ve belirgin.
- Geniş görsel alanı mevcut hareket varlığını gösterir. Yeni GIF seti üretilmedi.
  Bazı mevcut kaynaklar durağan görseldir; bunlara animasyon eklendiği iddia edilmez.
- Hareket adı, hedef tekrar ve set türü birbirinden ayrıldı. Hedef ağırlık varsa görünür.
- Nasıl yapılır? kapalı başlar. Adım sayısı ve uzun açıklamalar desteklenir;
  uzun içerik kendi alanında kayar. Antrenör notu ayrı açılır alanda korunur.
- Ana içerik kaydırılabilir; ağırlık/gerçekleşen tekrar ve Seti tamamla alt alandadır.
  `visualViewport` yüksekliği izlenir. Çok kısa klavye alanında giriş kartı kendi
  içinde kayabilir; tamamlama düğmesi onun dışında ayrı satırdadır.
- Kayıt isteğe bağlı kalır. Ağırlık/tekrar artırma-azaltma düğmeleri, önceki
  antrenmanın değerlerini kullanma ve önceki seti menüden düzenleme korunur.
- Geçersiz giriş seti tamamlamaz. Daha önce tamamlanan sette Seti güncelle yazılır;
  tekrar tamamlanmış kayıt üretilmez. Vücut ağırlığı hareketinde kilo alanı gösterilmez.
- Ekrandaki hedefler arasında dinlenme metni yoktur. Set sonrasında mevcut gerçek
  dinlenme ekranı, zamanlayıcı, +30 saniye ve dinlenmeyi geç davranışları korunur.

### Başarıların

`renderProgress` gövdesinin sonuna `renderAchievements()` eklendi. Mevcut süre
filtreleri (7 gün / 4 hafta / 6 ay), grafikler, hareket seçimi ve geçmiş gövdesi aynı.

| Rozet | Eşik |
|---|---|
| İlk adım | 1 tamamlanmış antrenman |
| İlk 10 antrenman | 10 tamamlanmış antrenman |
| 25 antrenman | 25 tamamlanmış antrenman |
| 50 antrenman | 50 tamamlanmış antrenman |
| 100 antrenman | 100 tamamlanmış antrenman |
| 4 hafta devamlılık | Ardışık 4 haftada, her hafta en az 1 tam antrenman |
| 8 hafta devamlılık | Ardışık 8 haftada, her hafta en az 1 tam antrenman |

Rozete dokununca kuralı, mevcut sayısı ve kazanılma durumu açılır. Tüm rozetler
düğmesi yedisini gösterir. İlerleme ekranında kısa bir önizleme bulunur.

Teknik karar: ödüller etkin hesabın **saklanan geçmişinden** hesaplanır. Yeni sunucu
tablosu veya ayrı kalıcı rozet kaydı yoktur. Yarım/iptal/demo/boş/geleceğe tarihli
kayıtlar ve yinelenen syncId/id sayılmaz. Aynı haftadaki çoklu antrenmanlar tek aktif
haftadır. Haftalar pazartesi başlar, yıl geçişi desteklenir. En uzun kayıtlı seri
kullanılır: daha sonra ara vermek tek başına rozeti kaldırmaz.

Geçmiş silinir veya tam kayıt yarıma çevrilirse rozet yeniden hesaplanır. Bu karar,
geçersiz kayıtla alınmış ödülün kalmasını önler. Mevcut 200 geçmiş kaydı sınırı
değişmedi; çok eski bir seri budanırsa haftalık rozet etkilenebilir. Dolayısıyla bu
sistem henüz sunucuda tutulan ömür boyu kazanım sicili değildir.

## 4. Önemli dosyalar

| Dosya | Değişiklik ve gerekçe |
|---|---|
| app.js | Üye ana sayfa yardımcıları, rozet hesabı/sayfaları, aktif antrenman yerleşimi, erişilebilir giriş etiketleri ve viewport/sayaç güncellemesi |
| member-ui.css | Yeni dosya; sadece mevcut tema değişkenleriyle yeni üye düzeni. Sabit başlık/alt alan ve kayan orta içerik |
| index.html | Yeni stil dosyasını styles.css sonrasında yükleme; 0.11.7 önbellek sürümü |
| sw.js | 0.11.7 önbellek adı ve member-ui.css önbelleğe alma |
| config.js, manifest.webmanifest | Uygulama sürüm metadata'sı 0.11.7; Auth/tema ayarları korunur |
| package.json, package-lock.json | Sürüm 0.11.7; bağımlılık sürümleri değişmedi |
| android/apktool.yml | versionName 0.11.7, versionCode 24, çıktı adı |
| scripts/build_android.py | Yeni CSS'i APK'ya ekleme; yeni APK dosya adı |
| scripts/test.cjs | Yeni member-ui-0117 grubunu varsayılan test kapısına ekleme |
| tests/member-ui-0117.cjs | 30 yeni VM/DOM/CSS kontrolü |
| tests/ui-preview-0117.cjs | Canlı servis kullanmayan, tema/boyut/senaryo seçilebilen yerel önizleme |
| tests/apk_inspect.py | Güncel sürüm/kod ve yeni CSS'in APK/kaynak eşleşmesi |
| Mevcut regresyon testleri | Güncel sürüm/cache beklentileri; işlevsel kontroller kaldırılmadı |
| tests/runtime-0110.cjs | VM Node sayacına unref(); yeni ana sayfa sayacı test sürecini açık tutmasın |
| README.md, tests/README.md | Güncel üretim/test talimatları ve açık test sınırları |
| BETA_0.11.7_NOTLARI.md | Kullanıcı değişiklikleri, rozet kuralları, kapsam |
| docs/NATIVE_PROVENANCE.json | Mevcut kaynak kökeni korunarak 0.11.7 sürüm/hash bilgileri |

`styles.css`, `cloud.js`, altı paletin tanımları, görseller, vendor, Supabase ve
native Smali/kaynaklarda değişiklik yapılmadı. Karşılaştırmada 6.084 dosya birebir
korundu. Eski `renderHome` gövdesi yeni adla aynıdır; 10 Trainer adlı fonksiyon
birebir aynı kontrol edildi. İlerleme gövdesindeki tek fark rozet ekleme çağrısıdır.

İlk düzenlemede yeni ana sayfanın `member-hero` ve `member-status` adları eski
antrenör sınıflarıyla çakışıyordu. Teslimden önce yeni `member-home-hero` ve
`member-home-status` adlarına ayrıldı. Yeni CSS seçicilerinin mevcut antrenör ana
sayfası/üye listesi/üye detayını etkilemediğini denetleyen test eklendi.

## 5. Test sonuçları

Önce değişmemiş 0.11.6 tabanındaki 13 grup çalıştırıldı; tamamı geçti. Son 0.11.7
kaynakta varsayılan test kapısının **14/14 grubu** ve yeni üye grubunun **30/30
kontrolü** geçti. Sonuçlar kaynak ZIP'indeki `test-results/` dizinindedir.

| Grup | Sonuç / yöntem |
|---|---|
| fixes-01031, fixes-01032, fixes-0110, fixes-0111, fixes-0112, fixes-0113, regression-0102, runtime-0110 | 8 grubun tamamı geçti; taşınabilir statik/VM regresyonları |
| review/review | 50 VM senaryosu geçti |
| hotfix-0114 | 19 hotfix/DOM senaryosu geçti |
| auth-0116 | 30 Auth senaryosu geçti; istemci test çiftleri |
| database-0114 | 26 PGlite PostgreSQL kontrolü geçti; sentetik şema/roller |
| themes-0116 | Altı tema/palet/kontrast ve koruma kontrolleri geçti |
| member-ui-0117 | 30 yeni rozet, ana sayfa, set akışı, DOM ve CSS kontrolü geçti |
| APK imzası | Android apksig ile v1 ve v2 doğrulandı |
| APK yapısı | Paket/sürüm/API, ZIP CRC, 10 DEX bütünlüğü ve hizalama geçti |
| APK / web kaynakları | 22 dosya birebir; yalnız iki orijinal Cordova köprü dosyası ayrıca APK'da |
| Önceki APK / native kaynaklar | 192 görsel ve 190 XML karşılaştırıldı; fark yok; izinler aynı |
| Temiz kaynak ZIP'inden derleme | Geçti; ikinci imzasız APK ilk derlemeyle aynı SHA-256 |
| Kaynak paketleme | 6.173 dosya; arşiv CRC ve anahtar/derleme dosyası/seçili sır örüntüsü taraması geçti |

Geliştirme sırasında düzeltilen test sorunları: sürüm yükseltmesiyle eski sürüm
beklentileri güncellendi; VM'deki Node sayacı açık kalan süreç sorunu giderildi;
boş hesap testinin atamalı başlangıç verisi düzeltildi. Antrenör stil çakışması
teslimden önce giderildi. Son varsayılan kapıda başarısız test yoktur.

### Çalıştırılamayanlar

- Gerçek Chromium/Playwright render: indirme girişimleri ağ/502 hatalarıyla
  tamamlanamadı. Yönetilen tarayıcıda yerel önizleme erişimi otomatik güvenlik
  denetimince reddedildi; başka bir yoldan dolaşılmadı.
- Bu nedenle ekran taşması, klavyeyle düğmenin gerçek konumu, GIF render ve tema
  görüntüsü görsel olarak doğrulanmış değildir. DOM/CSS testi fiziksel render değildir.
- Samsung S23 / Android 16, APK üstüne kurulum, fiziksel geri, uygulama arka planı,
  gerçek bildirim/izin, iki cihaz ve gerçek offline senkronizasyon yapılmadı.
- Canlı SMTP, kayıt doğrulaması ve Supabase yönetim paneli testi yapılmadı.
- Temiz npm ci ve uzaktaki GitHub CI çalışması doğrulanmadı; kilitli bağımlılıkların
  aynı sürümleriyle yerel test çalıştı. Tarihsel Playwright dosyaları varsayılan kapıya
  dahil değildir ve bu sürümde geçtiği iddia edilmez.

## 6. Android üretimi ve güncelleme

Java 17+, Python 3.10+, Node 22+ (testte 24) kullanılır. Android SDK/Gradle gerekmez.
Apktool 2.12.1, apksig 2.3.0 ve ECJ 3.42.0 sabitlenmiştir; araçların hashleri betiklerdedir.

```sh
npm ci --ignore-scripts
npm test
python3 scripts/build_android.py
# Özel imza ortam değişkenlerini güvenli şekilde tanımladıktan sonra:
python3 scripts/build_android.py --sign
```

Araç önbelleği için `--tools /path`, çıktı için `--output /path` kullanılabilir.
İmza betiği `FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`,
`FITTRACK_KEY_PASSWORD` ortam değişkenlerini okur. Anahtar/parola kaynak paketinde,
APK'da veya bu raporda yoktur. Anahtarı Berk'ten mevcut özel paylaşım yoluyla alın;
yeni anahtar oluşturup sessizce kullanmayın.

Beklenen beta sertifikası SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Teslim APK'sı bu anahtarla imzalıdır. Paket adı aynı, versionCode 23'ten 24'e çıktı;
aynı sertifikalı 0.11.6'nın üzerine güncelleme koşulları sağlanır. Gerçek kurulum
telefonda denenmedi. Farklı sertifikalı Alper validation APK'sını bu zincirin parçası
sanmayın. Bu çalışmada mevcut uygulama kaldırılmadı ve kullanıcı verisi silinmedi.

## 7. Supabase / veritabanı / RLS / Auth

0.11.7 için **hiçbir sunucu, migration, RLS, Auth, Edge Function veya panel değişikliği
yoktur**. Yerel şema 14 olarak kalır. Bu sürüm yeni SQL uygulamayı gerektirmez.

Normal giriş e-posta + şifredir. İlk kayıtta şifre iki kere alınır; e-posta adresi
kodla doğrulanır. Sonraki girişlerde kod istenmez. Şifre kurtarma açıkça seçildiğinde
kod ve iki yeni şifre kullanılır. Bu akış 0.11.6'dan aynen devralındı. Eski 0.11.4
parolasız giriş/üç şablon belgesi geçerli ürün kararı değildir.

Proje: `eznxeqraejmwfpwcuxxc`. Koddaki publishable anahtar istemci içindir; bir yönetim
veya service_role anahtarı değildir. Önceki devir kayıtlarına göre
`20260907134446_fittrack_beta_0114_workout_and_sync_safety.sql` uygulanmıştır; mevcut
projeye tekrar uygulamayın. Yeni kurulumda `supabase/migrations/` esastır.
Bu sürümde canlı panel sorgulanmadığından mevcut OTP uzunluğu ayrıca doğrulanmadı.
Eski kurulum belgesindeki “kalan ayar” notu yeni bir tespit değildir.

## 8. Kalan riskler ve ertelenen işler

- Fiziksel telefon/görsel render doğrulaması bekliyor; özellikle büyük sistem yazı
  boyutu, yatay ekran ve klavye açıkken alt düğmenin görünürlüğü kontrol edilmeli.
- Rozetler mevcut kayıtlı geçmişe bağlıdır; 200 kayıt sınırı ve geçmiş düzeltmeleri
  ödülü etkileyebilir. Kalıcı, sunucuda tutulan kazanım modeli gelecekte ayrı karardır.
- Mevcut hareket medyası korundu; tüm hareketlere yeni GIF veya 3D hazırlanmadı.
- Native kaynak Smali'dir. Özgün Gradle/Kotlin yeniden kurma işi tamamlandı sayılmaz.
- Antrenör UI, randevu takvimi, yeni tema ve ilerleme grafiklerinin yeniden tasarımı
  bu sürümde yapılmadı. Antrenör UI sonraki güncellemenin önceliğidir.

## 9. Berk / Alper — Samsung S23 / Android 16 telefon listesi

1. Mevcut verili 0.11.6 üzerine APK'yı güncelle. Sürüm 0.11.7 olsun; giriş, tema,
   kayıtlar, logo, ikon ve açılış görünümü korunsun. Uygulamayı kaldırmak gerekmemeli.
2. Üye ana sayfasında boş hesap, tek program, çoklu program ve yarım oturum dene.
   Devam et doğru oturumu, İncele doğru programı, Tüm antrenmanların mevcut listeyi açsın.
3. Gerçek üyeye atanan bir programı yarıda bırak; antrenör atamayı kaldırsın.
   Üye eski oturumu bitirebilsin/iptal edebilsin; ardından yeni programa başlayabilsin.
4. Aktif antrenmanda uzun program adıyla sayaç, Hareket X / Y ve Set X / Y okunabilir
   olsun. GIF varsa kendi oynasın; açı/döndür/oynat kontrolü görünmesin.
5. Uzun Nasıl yapılır? açıklamasını aç/kapat ve kaydır. Alt set kaydı/tamamlama
   düğmesi erişilebilir kalsın. Antrenör notunu da açıp kontrol et.
6. Kilo/tekrar alanında klavyeyi aç; küçük ekran/büyük sistem yazısı ile düğmeyi dene.
   Değerleri artır/azalt; boş kayıt, geçersiz kayıt, önceki değerler ve set düzenlemeyi sınayın.
7. Normal/drop set, dinlenme, +30 sn, dinlenmeyi geç, hareket değiştir, duraklat/devam,
   geri düğmesi/kenardan geri ve iptal onayı akışlarını kontrol et.
8. İlerleme ekranının eski filtre ve grafiklerini kullan. Başarıların/Tüm rozetler/
   rozet ayrıntısı açılsın. Tam antrenman rozeti kazandırsın; yarım kayıt kazandırmasın.
9. Geçmiş düzeltme ve hesap değişimini dene: rozetler doğru hesaba ait kalsın.
   Normal şifreli girişte e-posta kodu istenmemeli.
10. Altı temada ana sayfa/aktif antrenman/rozet metinlerini kontrol et. Antrenör olarak
    üye listesi/detay/program oluşturucu/mesajların önceki görünümünü ve işlevini dene.
11. Uygulamayı arka plana alıp geri dön; sonra offline antrenman ve yeniden bağlantı
    ile gerçek senkronizasyonu kontrol et. Tekrarlı geçmiş kaydı oluşmasın.

## 10. Sonraki sürüm ve yeni özel kararlar

Önce bu telefon doğrulamasının sonuçlarını değerlendir. Sonraki güncellemede
antrenör UI üzerinde çalışılacak. Üye için tamamlanan yeni yerleşimi tekrar baştan
yapma; ilerleme sayfasını veya renk paletlerini kendiliğinden değiştirme. Kullanıcı
daha sade, farklı yaş gruplarının anlayabileceği menülere ayrılmış bir deneyim istiyor.

Yeni üye CSS'inde antrenörle ortak genel sınıf isimleri kullanma. Tema rengi için
yeni sabit HEX değerleri ekleme; mevcut değişkenleri kullan. Eski yol haritası ve
0.11.4 devir notları tarihsel olabilir; bu rapordaki güncel kararlar esas alınır.
Kod değişen her sürümde kurulabilir APK + eksiksiz kaynak ZIP + ALPER/BERK yönüne
uygun devir MD verilmeye devam edilmelidir. İmza anahtarı bu üç dosyaya eklenmez.

## 11. Teslim dosyaları ve SHA-256

Alper'in ChatGPT'sine aşağıdaki üç gerçek dosyayı birlikte iletin; yalnız yerel
bilgisayar yolu göndermek dosya aktarımı değildir. Kısa talimat: “Bu devir raporunu
ve kaynakları incele; sonraki güncellemede antrenör arayüzüyle devam edeceğiz.”

| Dosya | Amaç |
|---|---|
| FitTrack-Android-v0.11.7-beta.apk | Telefona kurulacak, mevcut beta anahtarıyla imzalı sürüm |
| FitTrack-Beta-0.11.7-Source.zip | Bu APK'yı yeniden üreten kaynaklar ve test sonuçları |
| FITTRACK_ALPER_CHATGPT_DEVIR_v0.11.7.md | Bu bağımsız devir raporu |

APK — 15.746.318 bayt:
`4f61f92b91241cdced94817b974d0d52b4e2bafe0bbe26f2611605b665ecac2c`

Kaynak ZIP — 22.025.911 bayt, 6.173 dosya:
`9d8abe57093d5a34d7e11e06bfde0644480b69eea14c5921a47503a3ce1c4ff7`

İki bağımsız derlemenin ortak imzasız APK SHA-256 değeri:
`e29b52e663c31be4ffcec5ec5f6e0fd08e61505390995a4fec0b770441418b02`

İkinci derleme, teslim kaynak ZIP'i temiz bir dizine çıkarılarak ve aynı hash ile
sabitlenmiş araçlarla yapıldı. İmza anahtarı veya dışarıdaki eski APK build girdisi
olarak kullanılmadı. Bu rapor kendi hashini veya içinde bulunduğu arşivin hashini
döngüye sokmamak için kaynak ZIP'ten ayrı teslim edilir; kaynakta sürüm notları vardır.
