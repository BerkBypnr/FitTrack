> TARİHSEL ARA ÇALIŞMA. Güncel durum: `FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md`.

# FITTRACK — ALPER / GPT DEVİR RAPORU — 0.12.0 UI HAZIRLIĞI

Tarih: 11 Eylül 2026. Berk'in bu sohbetindeki son talebine göre hazırlanmıştır.

**Bu, tamamlanmış 0.12.0 sürümü değildir. Yeni APK yoktur.** Ortak tema ve ilk
iki antrenör ekranının kaynak değişiklikleri ile testleri kaydedildi. Native
taşıma, diğer tasarım ekranları, tarayıcı kontrolü ve APK üretimi açıktır.
Alper veya GPT'si bu dosyadaki “tamamlandı” ve “bekliyor” ayrımını korumalıdır.

## 1. Doğrulanmış taban ve son kullanıcı kararı

| Konu | Durum |
| --- | --- |
| Son telefon kabulü | Berk: “11.09 sorunsuz çalışıyor telefonda test ettim” |
| Son çalışan APK | 0.11.9 / versionCode 26 |
| Hedef sürüm | 0.12.0; henüz sürüm etiketi/Android versionCode artırılmadı |
| Paket / şema | `com.fittracklabs.mobile` / yerel şema 14 |
| Android | min API 24, target API 36; önceki hedef test cihazı Samsung S23 / Android 16 |
| Güncel yerel test | 17/17 grup; yeni trainer-ui-0120 grubu 10/10 |
| Native taşıma / yeni APK | Yapılmadı / üretilmedi |
| Canlı veritabanı / hesap işlemi | Yapılmadı |

0.11.9 için kullanıcı telefon kabulü kaydedildi; önceki A raporunun “telefon
kabulü açık” ifadesi artık tarihsel durumdur. Kullanıcı her tekil senaryonun
sonucunu ayrıca paylaşmadı. Bu kabul, henüz oluşmamış 0.12.0 APK için geçerli değildir.

Berk'in bağlayıcı yeni isteği: **Her tamamlanmış sürümde imzalı APK, tam kaynak
ZIP, ayrıntılı Alper/GPT devir raporu ve yapılacak testler birlikte teslim edilir.**
Alper başka GPT'den devam edebilmelidir. Yapılmış test, yapılmamış test, engel,
geri alma, sürüm/sertifika ve kalan iş ayrımı her raporda bulunmalıdır.

Yeni UI referansı `FitTrack_Berke_Paylasim_Guncel_2026-09-09.zip`; 0.11.7 devir
dosyası rapor biçimi örneğidir. Örnekteki eski davranışlar, 0.11.9 düzeltmelerinin
yerine geçirilmez. Özellikle açıklamada ayrı iç kaydırıcı geri eklenmez.

## 2. Talimat ve dosya önceliği

1. Bu sohbetin en son kullanıcı kararları: 0.11.9 kabulü, 0.12.0'a geçiş, gönderilen
   UI'ye göre tema revizyonu ve dört parçalı sürüm teslimi.
2. Bu güncel devir; mevcut kaynak ve yeni test kanıtları.
3. `docs/references/YOL_HARITASI_REV6_ORIJINAL.docx` ve metin kopyası.
4. UI ZIP'indeki `KARAR_NOTLARI.md` ile `TEMA_STANDARDI.md`; bunlar eski görsel
   yazılarıyla çelişirse metin kararları esas alınır.
5. Tarihsel 0.11.9, 0.12.0 A ve örnek 0.11.7 devirleri.

Rev6, 0.12.0'ı A envanter / B standart native / C temiz CI olarak ayırıyordu;
ayrı antrenör web paneli 0.12.1 ve sonraki aşamalardaydı. Kullanıcı şimdi tema/UI
revizyonunu da istediği için mevcut mobil antrenör ekranlarının ilk revizyonu
ayrı çalışma kopyasında hazırlandı. Bu, 0.12.1–0.12.8 sunucu/panel özelliklerinin
tamamlandığı veya tümünün 0.12.0'a alındığı anlamına gelmez.

## 3. Bu çalışmada değişen davranışlar

### Ortak tema

- Altı tema ve kayıt anahtarları korunur; tema değişimi üye/antrenörde ortaktır.
- Redline: ana vurgu `#D9362B`, güçlü vurgu `#B92520`, birincil düğme geçişi aynı
  iki kırmızı, seçili yumuşak yüzey `#F8DDD8`, vurgu üstü metin beyaz.
- Redline'ın turuncu geçişi ve tema açıklamasındaki “turuncu” kaldırıldı.
- Crimson güçlü vurgu `#A8253E` olarak standarda uyarlandı; mevcut koyu düğme
  geçişi ve beyaz yazının kontrastı korundu.
- Tema seçicisindeki Crimson/Plum yüzey örnekleri gerçek yüzey tokenlarına
  (`#202225` / `#281923`) düzeltildi.
- Yeni kartların durum renkleri için ayrı success/warning/info tokenları eklendi.
  Kart zemini yüzey renginde; avatar yükleme eklenmedi, isim baş harfleri kullanılır.

### Antrenör ana sayfası

- `isCloudStaff()` kullanıcılarına ayrı `renderTrainerHome()` gösterilir.
- Kayıtlı üye sayısı, bugünkü antrenman kayıt sayısı ve programsız üye sayısı;
  programlar/üyeler kısayolları; en fazla üç öncelikli üye; küçük mesaj özeti;
  son üç antrenman kaydı gösterilir.
- “Tüm öncelikleri gör” arama metnini temizleyip tüm öncelikli üyeleri açar.
- Antrenörün kendisi ve `isSelf` satırları gerçek antrenör listesinden çıkarılır.
- Bugünkü kayıt sayısı yarım kayıtları da içerir; tamamlanan antrenman sayısı
  veya salona giriş sayısı diye sunulmaz. Gelecek tarihli kayıtlar sayılmaz.
- Veri yoksa açık boş durum gösterilir. Örnek fotoğraf, kişi veya sayı eklenmez.

### Öncelik hesabı — bu ara çalışmanın açık kuralı

`memberAttention()` yalnız mevcut üye atamaları, bu antrenöre gelen okunmamış
mesajlar ve cihazdaki antrenman geçmişini kullanır. Ham atama var ama program
henüz yüklenmemişse üye “programsız” sayılmaz; “Program bilgisi bekleniyor” yazılır.

| Sinyal | Puan / açıklama |
| --- | --- |
| Bu antrenöre gelen okunmamış mesaj | +40; okunmuş veya başka alıcıya giden mesaj sayılmaz |
| Hiç program ataması yok | +30; atama yapıldığı iddia edilmez |
| Son görünür kayıttan en az 7 gün geçmiş | +20; “yeni antrenman kaydı görünmüyor” |
| Hiç geçmiş yok, üyeliğin üzerinden en az 7 gün geçmiş | +20; “henüz antrenman kaydı görünmüyor” |

Puanlar toplanır, azalan sıralanır; eşitlikte Türkçe isim sırası kullanılır.
Yarım ve tam antrenmanlar aktivite sayılır. Yeni/eksik tarih tek başına gecikme
üretmez. 7 gün ve puanlar bu yerel hazırlığın uygulama kararıdır; sunucu politikası
veya kullanıcının önceden onayladığı sabit eşik olarak aktarılmamalıdır.
Bu kural otomatik mesaj, atama veya ceza üretmez. Çevrimdışı veri gecikebileceği
ekranda açıklanır. “Salona gelmedi”, “program bitti”, “yenisini istedi” iddiası yoktur.

### Üyeler

- Filtreler **Tümü / Öncelikli / Programsız**, Türkçe isim aramasıyla birleşir.
- Ayrı yüzeyli kart, büyük baş harf avatarı, isim, durum etiketi, program özeti,
  öncelik nedeni, detay oku ve iki eylem kullanılır.
- “Program ata”, mevcut üye detayındaki atama alanını açar; kendiliğinden atamaz.
- “Üyeyi aç” mevcut detay akışına; “Mesaj / Yanıtla” mevcut sohbet akışına gider.
- Çoklu program atamaya sınır eklenmedi. Bulut yetkilendirmesi değiştirilmedi.

## 4. Tamamlanmayan tasarım ve native işleri

| Referans / iş | Durum |
| --- | --- |
| 01 Ana Sayfa V3 | İlk kaynak uyarlaması hazır; görsel/telefon kabulü bekliyor |
| 02 Üyeler Kart V4 | İlk kaynak uyarlaması hazır; görsel/telefon kabulü bekliyor |
| 03 Programlar ve Atama | Mevcut işlevler korundu; referansa göre ekran revizyonu bekliyor |
| 04 Program Oluşturma | Mevcut stüdyo/taslak/geri al korundu; görsel revizyon bekliyor |
| 05 Mesajlar | Mevcut sohbet korundu; gelen kutusu arama/okunmamış filtre revizyonu bekliyor |
| Antrenöre özel alt gezinme / ayrı web paneli | Henüz uygulanmadı; mevcut alt gezinme sürüyor |
| 06–07 Temalar | Ortak token revizyonu hazır; altı temada gerçek render kontrolü bekliyor |
| 0.12.0 B | Standart Gradle/Capacitor kaynağına taşıma yapılmadı |
| 0.12.0 C | Temiz uzak CI koşusu yok; eski workflow mevcut |
| Sürüm kimlikleri / yeni cache | Henüz artırılmadı; mevcut 0.11.9 kimlikleri duruyor |
| İmzalı 0.12.0 APK | Yok; eski APK yeniymiş gibi verilmedi |

Referansın tümünü uygulanmış saymayın. Mesajlarda online/presence, dosya eki,
çoklu atama sihirbazı, program süresi/versiyonlama ve “yeni program istiyor” gibi
gerçek model gerektiren örnekler yalnız görselden üretilmemelidir.

## 5. Gerçek yapı ve korunacak sözleşmeler

Proje düz **JavaScript + HTML + CSS**. React/Vite/TypeScript projesi değildir.
Kanonik web kaynakları kökteki `app.js`, `styles.css`, `member-ui.css`, `cloud.js`,
`config.js`, `index.html`, `sw.js`, manifest ve varlıklardır. `android/` mevcut
APK kökenli Smali/XML ağacıdır; Gradle kaynağı değildir. İçindeki web varlıkları
tarihsel kopyadır; mevcut paketleyici kökteki web dosyalarını geçici ağaca taşır.

Bu ara çalışma `app.js`, `styles.css`, üç mevcut test/runner dosyası ve yeni
trainer testini değiştirir/ekler; belgeler ve referanslar ayrıca eklenmiştir.
`member-ui.css`, `cloud.js`, `config.js`, tüm Android dosyaları, Supabase kaynakları,
`package.json` ve kilit dosyası korunmuştur. Native geçiş için React'e yeniden
yazım gerekmez. İptal edilmiş validation projesinden parça alınmaz.

Korunması gerekenler:

- Normal giriş e-posta + şifre. İlk kayıtta iki şifre alanı ve e-posta koduyla
  doğrulama; yalnız açık kullanıcı isteğiyle şifre kurtarma kodu.
- Açıklama ve antrenör notu varsayılan açık, doğal yükseklikte tek
  `.member-player-scroll` içinde; kilo/tekrar son içerik; yalnız tamamla düğmesi sabit.
- Geri → Hayır aynı antrenman/DOM/giriş değerlerine döner. Hareket detayı → geri
  açıldığı program incelemesine döner. Snapshot, dinlenme, geçmiş ve rozetler korunur.
- Sınırsız sayıda mevcut program ataması; keyfi üç program sınırı eklenmez.
- `https://localhost` Android origin, paket kimliği ve WebView saklama alanı
  korunur; yalnız sertifika ve paket adı aynı kalması veri devamlılığına yetmez.
- `fittrack-beta-010-state`, `fittrack-beta-010-user-{userId}` ve salonlu karşılığı;
  `fittrack-beta-010-auth`; `fittrack-beta-0114-editor-{userId|local}-{gymId|none}`;
  `fittrack-beta-010-queue-{userId}`; snapshot, aktif salon, device id, tombstone
  ve legacy sahiplik anahtarları korunur. Tam envanter `FITTRACK_0120A_DEVIR.md` içindedir.
- App / Filesystem / LocalNotifications / Share eklentileri; özel native geri
  köprüsü; `com.fittracklabs.mobile://auth-callback`; yalnız cache FileProvider;
  hatırlatma kimlikleri 7101–7107. Mesaj bildirimi mevcut yerel bildirimdir, push değildir.
- 3D iptal; GIF altyapısı sonraki 0.13.1 hattında. Turnike/aidat/POS bu değişiklikte yok.

## 6. Test sonucu ve sınırları

Bu çalışma kopyasında Node **v24.19.0**, mevcut kilitli bağımlılıklarla
`node scripts/test.cjs` çalıştırıldı: **17/17 PASS**. Yeni
`node tests/trainer-ui-0120.cjs`: **10/10 PASS**. Ayrıntılı loglar kaynakta
`test-results/suites.json` ve her grubun `.log` dosyasındadır.

Kapsam: eski regresyonlar, Auth/senkronizasyon VM testleri, PGlite veritabanı
testleri, altı paletin metin/buton kontrastları, üye antrenman akışı, gezinme,
25 native taşıma sözleşmesi ve yeni trainer öncelik/filtre/eylem kontrolleri.
Yeni testler boş veri, diğer alıcıya ait mesaj, yarım/future kayıt, çözümlenmemiş
atama, Türkçe arama, kendini dışlama ve HTML metin kaçışını da içerir.

İlk toplu koşuda 16/17 geçti; `fixes-0111` tek CSS sınıfı isteyen statik
beklenti nedeniyle kaldı. Beklenti, birden fazla sınıfa izin verip gerçek
`data-action="open-chat"` bağlantısını gerektirecek şekilde güncellendi. Son
toplu koşu 17/17 geçti. İlk sonuç `test-results/first-run-ui-0120/` içinde tutuldu.
`member-ui-0117` içindeki “staff legacy home” beklentisi yeni kullanıcı isteği
nedeniyle “staff/member ayrılığı korunur” olarak değiştirildi; test kaldırılmadı.

**Bu turda yapılmayanlar:** yeni npm kurulumu, tarayıcı render/ekran görüntüsü,
Android derlemesi/imzası, emülatör/telefon, canlı SMTP/Auth/Realtime, iki cihaz,
uzak CI. Statik CSS ve DOM testleri dokunmatik/görsel kabul değildir. Önceki A
test sonuçları `test-results/history-0120A/` altında tarihsel olarak bulunur.

## 7. Somut engel ve devam sırası

Derleme ortamını kontrol eden araç çağrısı şu hatayla sonlandı:
`network approval was cancelled before a decision was returned`.
Bu bir onay iptalidir; yeni araçlar indirilmedi. Android SDK/Gradle/Capacitor
derlemesi başlatılmadı. Farklı bağlantı/kanal kullanılarak aşılmaya çalışılmadı.
Gereken Android/Gradle/Capacitor araçlarının indirilmesi için ağ erişimi ve onay
netleştirilmeli; kullanıcı yanıtı bekleniyor. Bu rapor “izin verildi” kanıtı değildir.

Bir sonraki GPT:

1. Bu raporu, test listesini, Rev6'yı ve tasarım ZIP'indeki kararları oku; mevcut
   değişiklikleri yeni kopyada koru. 0.11.9 telefon kabulünü yeniden sorma.
2. Ağ/onay durumunu çöz; izinli ortamda uyumlu Android SDK, JDK, Gradle ve
   Capacitor sürümlerini resmi kaynaklardan doğrula, kilitle. Sürümleri tahmin etme.
3. Ayrı standart Android kaynak ağacına mevcut native sözleşmeleri taşı;
   orijinal Smali kökenini arşivle. Auth/storage origin ve çift geri dinleyicisine dikkat et.
4. Referans 03–05 ekranları ve antrenör gezinmesini mevcut gerçek işlevlerle tamamla;
   altı temada 390/1024/1440 genişlik ve büyük yazı kontrollerini yap.
5. Hazır olunca web/native/config/manifest/cache/build etiketi birlikte 0.12.0'a
   geçir; versionCode 26'dan büyük olmalı. Eski sürüm/Smali statik testlerini yeni
   karşılıklarına güncelle, veri/oturum/geri/alan koruma testlerini gevşetme.
6. Temiz derle, orijinal beta anahtarıyla imzala, sertifika/package/versionCode,
   paket bütünlüğü ve APK içindeki web dosyalarının kaynakla eşleşmesini doğrula.
7. Dört zorunlu sürüm çıktısını ve SHA-256 kanıtını ver. Telefonda uygulamayı
   kaldırmadan yükseltme testini kullanıcıya bırak; yapılmamış testi geçti yazma.

## 8. İmza ve derleme bilgisi

Özgün kaynak ZIP SHA-256:
`7bf6883635206fcd18a40f970a60280055a725159fffbbe646fafd71969745a4`

Özgün 0.11.9 APK SHA-256:
`4035b4f07308f85831d2e6b02db7f104d0d46a949c8f45da09940d8fd9f46e23`

Beklenen beta sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

`fittrack-beta-0102.jks` ve imza README'si kullanıcı tarafından ayrı sağlandı.
Anahtar ve parolalar kaynak ZIP'inde/raporda bulunmaz; Alper mevcut güvenli
kopyasını kullanmalıdır. Mevcut betikler özel ortam girdileri olarak
`FITTRACK_KEYSTORE`, `FITTRACK_KEY_ALIAS`, `FITTRACK_STORE_PASSWORD`,
`FITTRACK_KEY_PASSWORD` bekler. Değerleri çıktılamayın. `KeyGen.lnk` çalıştırılmaz.

Kaynak kökünde testler:

```sh
node scripts/test.cjs
node tests/trainer-ui-0120.cjs
```

Başka bilgisayarda bağımlılıklar yoksa izinli ağ ve Node 22+ ile
`npm ci --ignore-scripts`, ardından testler. `node_modules` ZIP'e alınmaz.
Bu oturumdaki kopya, önceki çalışma ağacında mevcut modülleri kullandı; yeni temiz
kurulum veya farklı makinede tekrar üretim bu ara çalışmada doğrulanmadı.

Eski `scripts/build_android.py --sign`, **Smali tabanlı 0.11.9 build yoludur**.
Çalıştırılması standart native 0.12.0 taşımasını tamamlamaz. `preflight_0120.py`
özgün 0.11.9 ürününün değişmediğini sınar; UI değişmiş bu ağacı “0.11.9 ile aynı”
saymak için kullanılmaz. Aynı şekilde `apk_inspect.py` sürüm beklentisi yeni
sürüm oluşturulurken bilinçli olarak güncellenmelidir.

## 9. Supabase / Auth / RLS

Bu ara çalışmada `cloud.js`, SQL migration'ları, RLS politikaları, Edge Function,
Auth ayarları veya uzak sunucu değiştirilmedi. Değişiklik için eski migration'ları
yeniden uygulamayın. Ekranda üye gizlemek sunucu yetkilendirmesi değildir; mevcut
rol/RLS modeli korunur, sonraki panel rol/MFA kabulü ayrı kalır.

## 10. Geri alma

Kullanıcının telefonundaki 0.11.9 değiştirilmedi. Bu çalışma ayrı kaynak kopyasıdır.
Yerel UI revizyonunu geri almak için `app.js` ve `styles.css` özgün 0.11.9/A
kopyasından geri alınır; yeni trainer testi ve buna ilişkin eski test beklentileri
beraber geri alınır. Veri göçü yoktur. Telefon uygulamasını kaldırmak, verisini
temizlemek veya kullanıcı oturumunu silmek geri alma yöntemi değildir.

## 11. Ara teslim dosyaları

- `FitTrack-0.12.0-UI-Hazirlik-Source.zip`: tüm kaynak, mevcut native kökeni,
  testler/loglar, bu devir, test listesi, Rev6 ve orijinal UI referans ZIP'i.
- `FITTRACK_ALPER_DEVIR_0.12.0_UI_HAZIRLIK.md`: bu bağımsız okunabilir devir.
- `FITTRACK_0.12.0_TEST_LISTESI.md`: çalıştırılanlar ve yapılacak kabul senaryoları.
- `FITTRACK_0.12.0_UI_HAZIRLIK_KANIT.json`: dosya hashleri, fark envanteri, test durumu.
- **APK eksik:** henüz üretilmedi. Bu set dört zorunlu çıktılı tamamlanmış sürüm değildir.

Kaynak ZIP dışında gereken özel girdiler: mevcut beta imza anahtarı/parolaları;
gerçek hesap/cihaz testleri için Berk/Alper'in test hesapları ve telefonu. Bunlar
rapora kopyalanmaz. Kaynak paketinde eksik gizli girdi var diye yeni beta anahtarı
üretilmez. Kullanıcı açıkça istemeden Alper'e e-posta/mesaj gönderilmez.
