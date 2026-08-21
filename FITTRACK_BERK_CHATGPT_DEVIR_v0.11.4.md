# FITTRACK BERK / CHATGPT DEVİR RAPORU — Beta 0.11.4

Tarih: 20 Ağustos 2026  
Hazırlayan: Alper ile çalışan Codex  
Proje: FitTrack  
Paket kimliği: `com.fittracklabs.mobile`

Bu rapor konuşma geçmişi olmadan kullanılabilecek biçimde hazırlanmıştır. Ürün kapsamı Alper’in salon yöneticisi hesabında yaptığı manuel test ve verdiği açık 0.11.4 talebi esas alınarak uygulanmıştır.

## Önceki sürüm ve yeni sürüm numarası

- Önceki sürüm: `FitTrack Beta 0.11.3`, Android `versionCode 20`
- Yeni sürüm: `FitTrack Beta 0.11.4`, Android `versionCode 21`
- Android `versionName`: `0.11.4`
- Yerel veri şeması: `14`
- Runtime `schemaVersion`: `14`
- Min SDK: `24`
- Target / Compile SDK: `36`

Sürüm numarası uygulama içi sürüm metninde, `package.json`, `www/config.js`, Android Gradle yapılandırması, APK manifesti, APK adı, kaynak ZIP adı, sürüm notu ve bu raporda `0.11.4` olarak hizalıdır.

## Bu sürümün amacı

Beta 0.11.4’ün amacı salon yöneticisi deneyimini yöneticinin kendi antrenmanı yerine üyeler, program atamaları, devamlılık ve ayrıntılı ilerleme takibi etrafında kurmak; Program Oluşturucu’daki veri kaybı risklerini gidermek; uygulamayı daha premium ve sakin bir görsel dile taşımak; bütün temel hareketlere uygulamayla paketlenen GIF gösterimleri eklemek ve beklenmeyen oturum düşmesini azaltmaktır.

0.11.3’te doğrulanan FitTrack Android görsel kimliği yeniden tasarlanmadı. Uygulama ikonu, adaptive icon, splash, bildirim rengi, `FitTrack` yazımı, paket kimliği ve imza sertifikası korunmuştur.

## Yapılan bütün değişiklikler

### 1. Salon yöneticisi ana sayfası

- `admin` rolü için ayrı ana sayfa oluşturuldu.
- “Antrenmanların” alanı yerine salon üyeleri gösteriliyor.
- Üyeler şu durumlarla listeleniyor:
  - şu anda aktif antrenmanda,
  - bu hafta aktif,
  - takip gerekiyor,
  - yeni üye.
- Üye satırında bu hafta yaptığı süre, atanan program sayısı ve uygulanmış program sayısı gösteriliyor.
- Üye satırına dokununca mevcut üye detayı, program atama, mesaj ve not ekranı açılıyor.
- Ana sayfaya üye ekleme, program oluşturma ve hareket kütüphanesi kısayolları eklendi.

Canlı antrenman göstergesi üyenin senkronlanan `currentWorkout` snapshot’ına ve snapshot tazeliğine dayanır. Altı saatten eski aktif snapshot canlı kabul edilmez.

### 2. Yönetici için Programlar ekranı

- Yönetici alt navigasyonundaki “Antrenman” etiketi “Programlar” olarak değiştirildi.
- Yönetici ekranından antrenman başlatma akışı kaldırıldı; yönetici kendi antrenmanını yapmıyor.
- Ekran program oluşturma, programları inceleme, üyeye atama ve salon hareket kütüphanesini yönetme işlerine odaklandı.
- Üyeye birden fazla program atama davranışı korundu.
- Her atama kartında programı atayan PT/yönetici adı gösteriliyor.
- Genel üye notu ile programa özel atama notu iki ayrı alan oldu.

### 3. Yönetici için İlerleme ekranı

- Yönetici bütün üyeleri tek listede görebiliyor.
- Üye detayında şu bilgiler gösteriliyor:
  - bu haftaki antrenman sayısı,
  - haftalık toplam süre,
  - tamamlanmış ve yarım antrenmanlar,
  - atanan program sayısı,
  - uygulanan program sayısı,
  - antrenmandaki hareketler,
  - hareket başına süre,
  - setler,
  - kilo,
  - tekrar.
- Hareket başına süre yalnız 0.11.4 ile kaydedilen yeni antrenmanlarda bulunur. Eski kayıtlarda güvenilir hareket süresi olmadığı için yalnız toplam antrenman süresi gösterilir.
- Program devamlılığı, antrenman kaydındaki `assignmentCloudId` ile aktif program atamasını eşleştirir. Eski veya tamamen çevrimdışı kayıtlarda bu kimlik yoksa eşleşme eksik kalabilir.

### 4. Program Oluşturucu güvenlik düzeltmeleri

- Hareket seçimi artık geçici seçim listesinde yapılır.
- Seçili harekete yeniden dokununca hareket seçimden bırakılır.
- `Seçimi uygula` düğmesi geçici listeyi programa uygular.
- `Vazgeç`, X, sheet dışına dokunma ve geri hareketi geçici değişiklikleri uygulamaz.
- Kaydetmeden çıkışta açık uyarı gösterilir.
- Kullanıcı taslak kaydedip çıkabilir, değişiklikleri bırakabilir veya düzenlemeye devam edebilir.
- Program düzenleme taslağı her değişiklikte yerel kurtarma anahtarına yazılır.
- Yarım kalan düzenleme yeniden açıldığında kurtarma veya temiz başlama seçeneği gösterilir.
- Dolu program günü silinmeden önce onay istenir.
- Gün silme, program silme ve özel hareket silme işlemlerine geri alma eylemi eklendi.
- Program silme onayından sonra program arşivlenir; geri alma yapılırsa önceki durumuna getirilir.
- Yayınlanmış program düzenlendiğinde eski sürüm arşivlenir, yeni revizyon oluşturulur.
- Eski program sürümünü kullanan üyeler varsa “Atamaları yeni sürüme taşı” veya “Eski sürümde bırak” seçimi gösterilir. Sistem sessizce karar vermez.
- Program önerileri toplu ekleme yerine tek tek seçilebilen odak önerileri olarak düzenlendi.
- Bir programda birden fazla gün desteği korundu; günler ayrı ayrı adlandırılır ve isteğe bağlı hafta gününe bağlanır.

### 5. Hareket kütüphanesi

- 36 FitTrack temel hareketinin tamamı için uygulamayla paketlenen GIF yolu doğrulandı.
- Önceden görseli bulunmayan 30 hareket için özgün iki-kare egzersiz gösterimleri üretildi.
- GIF’ler karanlık FitTrack sahnesi, aynı model/kamera, başlangıç-bitiş pozu ve mint çalışma kası vurgusu kullanır.
- Salon yöneticisi salona özel hareket ekleyebilir.
- Özel hareket adı, birincil/ikincil kas, ekipman, kilo girişi kullanımı ve form ipuçları kaydedilir.
- FitTrack’in temel hareketleri salt okunur ve silinemez.
- Salona özel hareket silinmeden önce onay istenir; silme geri alınabilir.
- Silinen özel hareket kütüphaneden kaldırılır fakat daha önce hazırlanmış program ve antrenman geçmişindeki gömülü kopyalar korunur.
- GIF’lerin yeniden üretilebilmesi için 10 sprite kaynak PNG’si ve `scripts/build-exercise-gifs.py` kaynak ZIP’e eklendi.

Önemli sınırlama: salona özel yeni harekete bu sürümde fotoğraf/GIF yükleme servisi eklenmedi. Özel hareket medya yoksa uygulamanın güvenli fallback kartını kullanır. Bu, ayrı Storage/RLS ve medya denetimi gerektiren sonraki bir iyileştirmedir.

### 6. Premium görünüm ve temalar

- Resmi Inter Variable font dosyası uygulamaya yerel olarak eklendi; ağ bağlantısı gerektirmez.
- Fontun OFL lisans metni kaynak pakette bulunur.
- Dört yeni tema eklendi:
  - Graphite,
  - Porcelain,
  - Aurora,
  - Plum.
- Yönetici ana sayfası, KPI kartları, üye satırları, program/hareket kütüphanesi, ilerleme ve oturum detayları için yeni premium yüzeyler eklendi.
- Açık Porcelain temasında sistem `theme-color` değeri açık yüzeye uyarlanır.
- Mevcut Midnight, Açık, Rose, Okyanus ve Enerji temaları korunmuştur.

### 7. Yönetici profili

- Salon yöneticisinin kişisel bilgi düzenleyicisinde yalnız ad ve soyad alanları gösterilir.
- Hedef kilo, güncel kilo, boy, yaş ve spor hedefi yönetici düzenleyicisinden çıkarıldı.
- Tema, bildirim, gizlilik, üyeler ve programlar girişleri korunmuştur.

### 8. Oturumun kendiliğinden düşmesi

- Native Capacitor ortamında Supabase istemcisinin eski URL oturum belirteçlerini yeniden yorumlaması kapatıldı: `detectSessionInUrl: !isNative()`.
- Geçici ağ/bootstrap hatasında mevcut yerel hesap verisi silinmiyor ve uygulama doğrudan giriş ekranına atılmıyor.
- Cihaz çevrimdışıyken veya `getSession` geçici hata verdiğinde önceden doğrulanmış yerel hesap bağlamı kullanılabiliyor.
- Bağlantı geri geldiğinde ve uygulama yeniden öne çıktığında bulut bootstrap yeniden deneniyor.
- Gerçek Supabase `SIGNED_OUT` olayı yine güvenli çıkış yapar; güvenlik amacıyla gerçek çıkış davranışı bastırılmadı.

### 9. Veri şeması ve Android güvenliği

- Önceki `app.js` / `config.js` şema uyumsuzluğu giderildi; ikisi de `14`.
- Release Capacitor yapılandırmasında WebView debugging kapatıldı.
- Android uygulama ikonu, adaptive icon foreground/background, splash drawable, bildirim rengi ve uygulama adı için 0.11.3 doğrulama kontrolleri korundu.
- Test dosyaları `www/` dışına taşındı; Android WebView ürün paketine artık tarihsel test kaynakları kopyalanmıyor.

## Değiştirilen önemli dosyalar

- `www/app.js`
  - yönetici rol yönlendirmeleri,
  - yeni yönetici ekranları,
  - program güvenliği,
  - revizyon/atama kararı,
  - özel hareket yönetimi,
  - genel üye notu ayrımı,
  - egzersiz süreleri,
  - tema kayıtları.
- `www/styles.css`
  - yerel Inter fontu,
  - dört premium tema,
  - yönetici sayfaları ve Program Oluşturucu güvenlik eylemleri.
- `www/cloud.js`
  - native oturum koruması,
  - geçici bootstrap hata davranışı,
  - salon hareketleri ve genel üye notu kuyruğu,
  - ilgili Realtime abonelikleri.
- `www/config.js`
  - `appVersion 0.11.4`, `schemaVersion 14`.
- `www/sw.js`
  - `fittrack-v0114` cache’i, font ve 36 GIF önbelleği.
- `www/supabase/fittrack_beta_0114_gym_exercises.sql`
  - `gym_exercises`, `member_coach_notes`, indeksler, RLS ve grant’ler.
- `www/assets/gifs/*.gif`
  - toplam 36 temel hareket animasyonu.
- `www/assets/fonts/InterVariable.woff2`
- `www/assets/fonts/Inter-OFL-1.1.txt`
- `source-assets/exercise-sprites/*.png`
- `scripts/build-exercise-gifs.py`
- `scripts/verify-rebuild.cjs`
- `android/app/build.gradle`
  - `versionCode 21`, `versionName 0.11.4`.
- `capacitor.config.json`
  - release WebView debugging kapalı.
- `RELEASE_NOTES_0.11.4.md`
- `README.md` ve `www/README.md`

## Alınan teknik ve ürün kararları

1. Yeni yönetici ana ekranları yalnız `admin` rolünde açılır. `trainer` ve `member` akışları sessizce aynı ekrana zorlanmadı.
2. Salon yöneticisi için antrenman başlatma eylemi gösterilmez; aynı sekme program yönetimidir.
3. FitTrack temel hareketleri global, değiştirilemez ve silinemezdir; salon hareketleri gym kapsamlıdır.
4. Özel hareket silme işlemi geçmiş program kayıtlarını değiştirmez.
5. Program revizyonu eski yayınlanmış sürümü yerinde ezmez. Atamaların taşınması kullanıcı kararına bağlıdır.
6. Genel üye notu ile program atamasına özel not ayrı tablolarda/alanlarda tutulur.
7. Eski antrenmanlara sahte hareket süresi üretilmez; hareket süresi yalnız yeni kayıtlar için gösterilir.
8. Geçici bulut hatası gerçek oturum kapanması sayılmaz; gerçek Auth çıkış olayı korunur.
9. Egzersiz görselleri kaynağı belirsiz üçüncü taraf GIF’lerinden alınmadı; özgün kaynak karelerden üretildi.
10. Kaynak ZIP’e GIF üretim kaynakları eklendi; `node_modules`, cache, APK, JKS, parola ve token eklenmedi.

## Kararların nedenleri

- Yönetici ve üye görevlerini ayırmak, yanlışlıkla yönetici hesabından antrenman başlatılmasını önler.
- Geçici seçim ve açık uygula/vazgeç modeli Program Oluşturucu’da geri dönüşü olmayan seçim hatalarını azaltır.
- Yayınlanmış programı yerinde değiştirmemek, üyelerin devam eden programını sessizce değiştirmez ve geçmişi denetlenebilir tutar.
- Genel not / atama notu ayrımı, üyeye ait uzun vadeli takip bilgisini tek programa bağlamaz.
- Eski kayıtlara tahmini süre yazmamak, yönetici raporlarının doğruluğunu korur.
- RLS ile gym kapsamı, başka salonun hareket/not verisinin okunmasını veya değiştirilmesini önler.
- Yerel font ve GIF paketleme, bağlantı olmadan aynı görsel deneyimi sağlar.

## Tamamlanan yol haritası maddeleri

- Program Oluşturucu hareket seçme/bırakma.
- Geçici seçim.
- `Seçimi uygula` / `Vazgeç`.
- Kaydetmeden çıkış uyarısı.
- Taslak kurtarma.
- Silme onayı.
- Geri alma.
- Program revizyonunda mevcut atama kararı.
- Genel üye notu / programa özel atama notu ayrımı.
- Kritik sürüm tutarlılığı ve kaynak bütünlüğü kontrolleri.
- Salon yöneticisi üye odaklı ana sayfa.
- Yönetici program atama ekranı.
- Yönetici üye ilerleme ayrıntıları.
- Salon hareket kütüphanesi ekleme/silme.
- 36 temel hareket GIF kapsamı.
- Premium tema/font genişlemesi.
- Geçici bulut hatasında oturum koruma.

## Yarım kalan veya ertelenen işler

- Salona özel harekete fotoğraf/GIF yükleme, Supabase Storage bucket ve medya RLS akışı eklenmedi.
- PT’nin hangi üyelerden sorumlu olduğunu yönetici ekranında ayrı bir PT filtresiyle süzme yok; atama kartında atayan kişi görünür.
- Eski 0.11.3 geçmiş kayıtlarına hareket başına süre geriye dönük eklenmedi.
- Üretim Supabase projesine 0.11.4 migration uygulanmadı; SQL kaynakta teslim edildi.
- Fiziksel Android 16 cihaz testi bu çalışma ortamında yapılamadı.
- Browser görsel/E2E testi, uygulama içi tarayıcı bağlantısının güvenli çalışma yolu doğrulamasına takılması nedeniyle çalıştırılamadı.

## Bilinen hatalar ve kalan riskler

- `fittrack_beta_0114_gym_exercises.sql` uygulanmadan özel hareket ve genel üye notu bulut yazmaları başarısız olup çevrimdışı kuyrukta kalabilir. Yerel kayıt korunur.
- RLS ve Realtime davranışı gerçek Supabase staging/prod ortamında çalıştırılmadı.
- Canlı üye durumu üyenin snapshot eşitlemesine bağlıdır; zayıf bağlantıda gecikebilir.
- Program uygulandı metriği `assignmentCloudId` olmayan eski/yerel kayıtlarda eksik sayabilir.
- Hareket başına süre, yeni oturumda hareket ekranında geçirilen etkin süreyi ölçer; sensör tabanlı gerçek egzersiz süresi değildir.
- Yeni hareket GIF’leri özgün iki-kare öğretici görsellerdir. Fiziksel cihazda kalite, kırpma, animasyon hızı ve anatomik doğruluk spor uzmanıyla gözden geçirilmelidir.
- Salona özel hareketlerde medya yükleme olmadığı için fallback görsel kullanılır.
- Samsung S23 / Android 16’da ekran ölçüsü, sistem font ölçeği, geri hareketi ve bildirim izinleri ayrıca test edilmelidir.

## Çalıştırılan testler

### Geçen testler

- `node --check www/app.js`: geçti.
- `node --check www/cloud.js`: geçti.
- `pnpm cap:sync`: geçti; 4 Capacitor eklentisi Android projesine eşitlendi.
- `node scripts/verify-rebuild.cjs`: final kaynakta **234/234 kontrol geçti**.
  - tam `www/` SHA-256 kapsamı,
  - 0.11.4 / versionCode 21 tutarlılığı,
  - 36 GIF dosyası,
  - Inter font + lisans,
  - Program Oluşturucu apply/cancel, kurtarma, çıkış uyarısı, silme/undo işaretleri,
  - yönetici rol rotaları,
  - revizyon atama kararı,
  - genel/atama notu ayrımı,
  - hareket süresi kaydı,
  - tema kayıtları,
  - auth koruma işaretleri,
  - RLS migration içeriği,
  - Android ikon/splash/uygulama adı doğrulaması,
  - Capacitor kopyalanan web kaynak hash’leri.
- Tarihsel tarayıcısız runtime/Android geri regresyonu mevcut 0.11.4 `app.js` üzerinde geçti.
- `gradlew.bat --offline --no-daemon assembleRelease`: geçti, 284 Gradle göreviyle release APK üretildi.
- Android Lint Vital: Gradle release akışında geçti.
- `apksigner verify --verbose --print-certs`: geçti.
  - v2 imza: true,
  - v3 imza: true,
  - tek imzalayan,
  - sertifika SHA-256 beklenen değerle eşleşti.
- `aapt2 dump badging`: paket `com.fittracklabs.mobile`, versionCode `21`, versionName `0.11.4`, minSdk `24`, targetSdk `36` doğrulandı.
- Kaynak ZIP `7z t`: geçti; 237 dosya / 67 klasör, CRC hatası yok.
- ZIP yasaklı dosya taraması: 0 eşleşme (`node_modules`, build cache, APK/AAB, JKS/keystore, `.env`, `local.properties`, idsig).

### Başarısız olan testler

Aşağıdaki tarihsel 0.11.3 testleri güncel kabul testi değildir fakat deneme sırasında çalıştırılmış ve başarısız olmuştur:

- `auth-deeplink.cjs`: proje bağımlılıklarında Playwright olmadığı için `MODULE_NOT_FOUND`.
- `fixes-01031.cjs`: eski `0.11.3` sabit sürüm beklentisi nedeniyle başarısız.
- `fixes-0112.cjs`: artık bulunmayan eski APK çözümleme dizinine bağlı olduğu için `ENOENT`.

Bu tarihsel dosyalar `tests/legacy-0.11.3/` altına taşındı ve güncel `pnpm test` komutuna dahil edilmedi. APK içine kopyalanmaz.

### Çalıştırılamayan testler ve nedenleri

- Fiziksel Samsung S23 / Android 16: bu çalışma ortamında cihaz/ADB bağlantısı yok.
- Tam UI görsel ve etkileşimli browser E2E: uygulama içi browser runtime güvenli modül yolu doğrulamasında bağlantı kurulamadı; harici Playwright fallback kullanılmadı.
- Gerçek Supabase Auth/RLS/Realtime uçtan uca testi: migration üretim/staging veritabanına uygulanmadı ve dış veritabanında değişiklik yapılmadı.
- Play Store / Play App Signing testi: teslim APK’sı beta JKS ile yan yükleme içindir; Google Play üretim anahtarı kullanılmadı.

## Supabase, veritabanı, migration, RLS veya Auth değişiklikleri

Yeni migration: `www/supabase/fittrack_beta_0114_gym_exercises.sql`

### `gym_exercises`

- Gym kapsamlı özel hareket tanımları.
- `(gym_id, client_key)` benzersizliği.
- Admin ve trainer/member için gym kapsamında select.
- Yalnız `admin` için insert/update/delete.
- `created_by = auth.uid()` kontrolü.
- Silme uygulamada `active=false` soft-delete şeklinde kuyruğa alınır.

### `member_coach_notes`

- Genel üye takip notunu program atamasındaki `coach_note` alanından ayırır.
- `(gym_id, member_id)` benzersizliği.
- Admin/trainer için select/insert/update.
- Admin için delete.
- Üyenin aynı gym’de aktif `member` olması insert politikasında doğrulanır.
- Not uzunluğu en fazla 180 karakterdir.

### Auth

- Native uygulamada URL’den oturum algılama kapalıdır.
- Geçici bootstrap/getSession hatası yerel oturumu silmez.
- Gerçek `SIGNED_OUT` olayı değişmedi.

Migration **uygulanmadı**. Berk/Alper uygulamadan önce hedef Supabase projesinde mevcut `has_gym_role` fonksiyonunun bulunduğunu doğrulamalı, SQL’i staging’de çalıştırmalı, ardından admin/member hesaplarıyla RLS negatif/pozitif testlerini yapmalıdır.

## Berk’in Samsung S23 / Android 16 üzerinde uygulayacağı kısa telefon test listesi

1. Mevcut 0.11.3’ün üstüne 0.11.4 APK’yı kur; uygulama verisi ve hesap oturumu korunuyor mu kontrol et.
2. Launcher ikonu, adaptive icon kırpması, splash, `FitTrack` yazımı ve bildirim ikon/rengi 0.11.3 ile aynı mı kontrol et.
3. Salon yöneticisi hesabında alt navigasyonda “Programlar” görünüyor mu; yöneticiye antrenman başlatma düğmesi çıkmıyor mu kontrol et.
4. Ana sayfada üyeler, canlı durum, aktif/takip metrikleri ve üyeye dokunma akışını test et.
5. Bir üye hesabında antrenman başlat; yöneticide canlı durumun Realtime/snapshot sonrasında görünüp görünmediğini kontrol et.
6. Yönetici olarak üyeye iki program ata; atayan PT adı ve programa özel not doğru mu kontrol et.
7. Genel üye notunu değiştir; mevcut program atama notlarının değişmediğini kontrol et.
8. Program Oluşturucu’da hareket seç, tekrar dokunup bırak, `Vazgeç` ve `Seçimi uygula` sonuçlarını ayrı ayrı test et.
9. Değişiklik yapıp geri hareketi kullan; kaydetmeden çıkış uyarısı geliyor mu kontrol et.
10. Uygulamayı Program Oluşturucu ortasında kapat/aç; otomatik kurtarma taslağı geliyor mu kontrol et.
11. Dolu günü sil; onay, vazgeç ve silme sonrası geri alma akışlarını test et.
12. Programı sil; onay ve geri alma akışlarını test et.
13. Yayınlanmış programı düzenleyip yeni revizyon yayınla; mevcut üyeyi yeni sürüme taşıma ve eski sürümde bırakma seçeneklerini ayrı programlarla test et.
14. Salon hareketi ekle; kütüphanede göründüğünü, programa eklenebildiğini, silme onayı/geri alma çalıştığını ve temel hareketlerin silinemediğini kontrol et.
15. 36 temel hareketi hızlıca kaydır; eksik görsel, bozuk GIF, kötü kırpma veya belirgin anatomik hata var mı not al.
16. Graphite, Porcelain, Aurora ve Plum temalarını ana sayfa, Programlar, İlerleme, Profil ve sheet’lerde kontrol et.
17. Yönetici profili düzenlemede yalnız ad/soyad olduğunu; tema ve bildirimlerin kaldığını kontrol et.
18. Üye hesabında bir antrenman bitir; yönetici İlerleme ekranında toplam süre, hareket süresi, set, kilo ve tekrar ayrıntısını kontrol et.
19. Wi‑Fi/mobil veriyi kapatıp uygulamayı arka plana al/aç; uygulamanın kendiliğinden login ekranına düşmediğini ve bağlantı gelince senkronlandığını kontrol et.
20. Android geri hareketini ana sekmelerde, Program Oluşturucu’da, sheet’lerde ve antrenmanda test et.
21. Bildirim iznini ver/reddet senaryolarını ve kesin alarm açıklamasını test et.
22. Sistem font ölçeğini %130–150 yap; taşan/kesilen yönetici ekranlarını ekran görüntüsüyle raporla.

## Bir sonraki sürüm için önerilen öncelikler

1. Önce 0.11.4 migration’ını staging’e uygula ve Auth/RLS/Realtime regresyonlarını bitir.
2. Samsung S23 / Android 16 telefon testindeki P0/P1 hataları düzelt; yeni büyük özellik ekleme.
3. 36 hareket GIF’ini spor uzmanıyla hareket doğruluğu açısından gözden geçir; yalnız sorunlu olanları iyileştir.
4. Yönetici ekranlarında gerçek salon verisiyle performans ve uzun liste testi yap.
5. Salona özel hareket için Supabase Storage tabanlı medya yükleme kapsamını Berk ve Alper ayrıca kararlaştırırsa tasarla; Storage RLS olmadan uygulama.
6. PT bazlı üye/atama filtresi ihtiyacını gerçek kullanım sonrası değerlendir.

Tamamlanmış 0.11.4 maddelerini gelecek yol haritasına “sıfırdan geliştirilecek” diye yeniden ekleme. Gerekirse “iyileştirme/regresyon testi” olarak sınıflandır.

## Berk’in ChatGPT’sinin projeye devam ederken bilmesi gereken yeni özel kararlar

- Güncel taban artık `0.11.4`, versionCode `21`, schema `14`.
- Yönetici rolü üye operasyonu yapar; kendi antrenmanını başlatmaz.
- `trainer` rolünü `admin` ekranlarına sessizce dönüştürme; ürün kararı gerekir.
- FitTrack temel hareketleri değiştirilemez; salon hareketleri gym kapsamlıdır.
- Genel üye notu `member_coach_notes`; programa özel not `program_assignments.coach_note` alanındadır. Birbirine geri birleştirme.
- Yayınlanmış programı yerinde ezme. Yeni revizyon oluştur ve atama taşıma kararını kullanıcıya sor.
- Eski antrenmanlara tahmini hareket süresi yazma.
- Bulut hatasında Auth oturumunu otomatik silme; yalnız gerçek `SIGNED_OUT` olayı çıkış yapmalı.
- Özel hareket medya yükleme ayrı ürün/veri güvenliği kapsamıdır; mevcut sürümde yoktur.
- 0.11.3 Android görsel kimliği ve beta sertifikası korunmuştur.
- Test edilmemiş fiziksel telefon veya Supabase davranışına “test edildi” deme.
- Kaynak ZIP üretirken `node_modules`, Gradle build/cache, APK, JKS, `.env`, token ve service-role anahtarı ekleme.

## APK ve kaynak ZIP dosyasının dosya adları

- APK: `FitTrack-Android-v0.11.4-beta.apk`
- Kaynak: `FitTrack-Beta-0.11.4-Source.zip`
- Devir raporu: `FITTRACK_BERK_CHATGPT_DEVIR_v0.11.4.md`

## SHA-256 değerleri

- `FitTrack-Android-v0.11.4-beta.apk`  
  `888AACF0477FF6BE1D2E8CC41A0AE18F923A676F4A0F6E64D0FCE46EE040F07D`
- `FitTrack-Beta-0.11.4-Source.zip`  
  `70AC1E6DEB61EFA1A6FD58CCA1ED6F70489420EE8C58E99761E48E6A3738D7D1`

APK imza sertifikası SHA-256:

`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

## Teslim özeti

APK release modunda derlendi, zipalign uygulandı, eski FitTrack beta JKS sertifikasıyla imzalandı ve v2/v3 imzası doğrulandı. Kaynak ZIP yeniden üretim girdilerini, Android/Capacitor projesini, migration/RLS dosyasını, font lisansını, hareket sprite’larını, GIF üretim betiğini ve bütünlük testlerini içerir; gizli anahtar veya derleme önbelleği içermez.
