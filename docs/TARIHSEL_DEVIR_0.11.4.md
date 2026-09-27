> TARİHSEL BELGE: 0.11.4 durumunu anlatır. Normal girişte OTP ve üç şablon talimatı 0.11.6 ile kaldırıldı. Güncel kurulum için `docs/KODLU_GIRIS_KURULUMU.md` ve yeni devir raporunu esas alın.

# FITTRACK — ALPER CHATGPT DEVİR — v0.11.4

Tarih: 7 Eylül 2026. Proje sahibi Berk; sonraki geliştirici Alper ve onun ChatGPT/Codex oturumu.
Bu dosya, konuşma geçmişi olmadan devam etmek için yazılmıştır.

## Önce okunacak sonuç ve erişim engeli

**0.11.4 kodu, eski imzalı kurulabilir APK ve kaynak ZIP hazırdır. Canlı e-posta kodu
kurulumu tamamlanmış değildir.** Supabase veritabanı migration'ı uygulanmıştır; Auth
Mail şablonlarını değiştiren yönetim erişimi sağlanamamıştır. Önceki çalışma bu giriş
adımında uzun süre bekledi. Aynı engelde tekrar beklemek yerine bütün bağımsız kod,
test, APK ve paketleme işleri tamamlanıp bu devir hazırlanmıştır.

Alper'in ilk işi: ZIP'teki `docs/KODLU_GIRIS_KURULUMU.md` ile üç Auth e-posta şablonunu
kurmak, sonra gerçek telefon/e-posta kabul testini yapmak. Şablonlar uygulanmadan
"kodlu giriş tamamen hazır" veya "gerçek e-posta testi geçti" demeyin.

## Sürüm ve teslimatlar

| Alan | Değer |
| --- | --- |
| Önceki sürüm | Beta 0.11.3 |
| Önceki versionCode | 20 |
| Yeni sürüm | Beta 0.11.4 |
| Yeni versionCode | 21 |
| Yerel veri şeması | 14; eski şema 13 okunur |
| Android paket adı | `com.fittracklabs.mobile` |
| Minimum/hedef API | 24 / 36 |
| Auth deep link | `com.fittracklabs.mobile://auth-callback` |
| APK | `FitTrack-Android-v0.11.4-beta.apk` |
| Kaynak | `FitTrack-Beta-0.11.4-Source.zip` |
| Devir | `FITTRACK_ALPER_CHATGPT_DEVIR_v0.11.4.md` |

APK SHA-256:
`5801cf7e205cd2bc4a8286c8c69aef5fc62a0b48ac7b33e79fc523957fb94135`

Kaynak ZIP SHA-256:
`d808c314526f4c8f8e50dd300cf8df28e601519e4d13ff842e0da183e6194d5d`

İki bağımsız kaynak derlemesinin eşleşen imzasız APK SHA-256 değeri:
`44f533f4529129f0ce2ee71e4292d1e0c460528b856d26fb02e97cbcbea34f38`

Beta imza sertifikası SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

Boyutlar: APK 15,739,039 bayt; kaynak ZIP 21,982,874 bayt.
Arşivde 6.163 dosya bulunur. Anahtar/parola, gerçek `.env`, node_modules, derleme
önbelleği veya eski APK kaynak ZIP'e dahil değildir. İmzalama anahtarını ayrı, özel
kanaldan kullanın; yeni sertifikayla aynı paket adına sessizce devam etmeyin.

## Yetki, taban ve bağlayıcı ürün kararları

Berk, Alper'in yeniden oluşturduğu Android projesini bu sürüm için iptal etti;
**kendi orijinal 0.11.3 kaynak/APK tabanından bir sürüm daha** istedi. Mevcut yüklenen
kaynak ZIP ve APK birbirleriyle 51 web dosyasında eşleşmişti. Yeni paket bu tabandan
üretildi. Alper validation APK'sı veya onun kaynak ZIP'i kullanılmadı.

Yeni birleşik yol haritası: 0.12.0 → 0.13.0 → 0.14.0 → 0.16.0 kontrollü pilot →
0.17.0 çok salonlu beta → 1.0. Kullanıcının açık talebiyle 0.11.4 acil ara düzeltme
istisnasıdır. Bu görev 0.12.0'ın büyük panel/toplu düzenleme paketini açma yetkisi
vermez. Tamamlanan hotfix işlerini 0.12.0 için tekrar sıfırdan geliştirmeyin.

Şifre tekrarı **kayıt ve şifre yenileme** sırasında uygulanmıştır; normal giriş
parolasız e-posta kodudur. Bu, parola + e-posta ile sunucuda zorlanan MFA değildir.
Antrenör/yönetici MFA'sı yol haritasındaki sonraki iş olarak kalır. E-posta kodu
isteğinde `shouldCreateUser:false` kullanılır; giriş isteği yeni hesap yaratmaz.

## Bu sürümün amacı

Program ataması kaldırılınca yarım antrenmanın üyeyi kilitlemesini çözmek; önceki
0.11.3 denetimindeki veri/oluşturucu/senkronizasyon hatalarını gidermek; şifre
tekrarı ve e-posta OTP arayüzünü eklemek; kullanıcının görselde istediği süre/set
 türü/tekrar okunabilirliğini sağlamak. Logo ve native davranış korunur.

## Önemli dosyalar ve neden değiştikleri

| Dosya/yol | Değişiklik ve amacı |
| --- | --- |
| `app.js` | Oturum snapshot/kurtarma, kapanış kimlikleri, doğru tamamlanan set filtresi, süre/rozetler, oluşturucu geçici seçim/dirty-state/recovery/undo, hesap-salon temizliği, birim ve geçmiş birleştirme |
| `cloud.js` | E-posta OTP/kayıt şifre onayı, değişmez kuyruk bağlamı/revizyonu, güvenli ack/retry, gerçek arşiv yazımı, yeni geçmiş silme RPC'si, en yeni mesajlar |
| `styles.css` | Büyük set türü ve tekrar hedefi, toplam süre, seçim/recovery/OTP stilleri |
| `config.js`, `index.html`, `sw.js`, `manifest.webmanifest` | 0.11.4 sürüm/önbellek eşitliği; kullanılmayan config şema alanının kaldırılması |
| `android/` | Orijinal APK'dan çıkarılmış 5536 Smali dosyası, manifest ve kaynaklar; Gradle rekonstrüksiyonu değildir |
| `android/apktool.yml` | versionCode 21 / versionName 0.11.4 |
| `android/assets/capacitor.config.json` | WebView debugging kapalı; diğer mevcut native ayarlar korunur |
| `scripts/build_android.py`, `scripts/SignApk.java`, `scripts/toolchain.json` | Kaynak derleme, ZIP hizalama, eski anahtarla v1/v2 imzalama; araç sürümü/hash sabitleme |
| `supabase/migrations/` | Önceki dokuz gerçek migration ve uygulanmış 0.11.4 hotfix |
| `supabase/functions/delete-account/` | Canlı mevcut Edge Function kaynakları, değiştirilmeden eklendi |
| `supabase/templates/`, `scripts/configure_auth_templates.py` | Üç kod e-postası HTML şablonu ve yönetim API'siyle isteğe bağlı uygulama/doğrulama betiği |
| `package.json`, `package-lock.json`, `.github/workflows/verify.yml` | Taşınabilir test kapısı, sabit bağımlılıklar, CI tanımı |
| `tests/`, `test-results/` | 0.11.3 regresyonları + yeni davranış/DB/APK kontrolleri ve teslim sonuçları |
| `docs/`, `README.md`, `BETA_0.11.4_NOTLARI.md` | Yeni yol haritası, native köken, kurulum ve kalan erişim adımı |

## Teknik kararların nedenleri

- Başlamış antrenmanın tanımını atama listesinden her seferinde yeniden çözmek yerine
  oturuma snapshot koyduk. Atama kaldırma ve yeni program sürümü eski oturumu değiştiremez.
  Tanımı zaten kaybolmuş eski veride gerçek loglar korunur; bilinmeyen veri uydurulmaz.
- Kapanış ve silme kimlikle/tarihle takip edilir. Boş snapshot'tan iptal sonucu
  çıkarılmaz; geri alınan program eski silme listesi yüzünden tekrar yok olmaz.
- Kuyrukta kullanıcı/salon ve içerik nesnesi enqueue anında sabitlenir; aynı öğenin
  revizyonu ayrı tutulur. Ağ yanıtının yeni yazıyı veya başka hesabı ezmesi engellenir.
- Geçmiş silmesi sadece istemci filtresi değildir. Sunucu tombstone/RPC/trigger
  gecikmiş eski istemci yazısını da reddeder. Uyumluluk için eski alanlar tutulmuştur.
- Genel üye notu üyelikte saklanır; program ataması olmaması notu yok etmez. Bu alanın
  görünürlüğü eski üye-genel-not davranışıdır; özel personel notu gibi sunulmaz.
- Native katmanı yeniden tasarlamadık. Kullanıcının mevcut görünümü/geri davranışını
  korumak için orijinal APK'nın Smali ve kaynaklarını derleyen yapı kuruldu. Java/Kotlin
  kaynaklı Gradle projesi varmış gibi sunulmaz; ileri native geliştirme ayrı teknik iştir.

## Test sonuçları

| Kontrol | Sonuç | Yöntem/sınır |
| --- | --- | --- |
| Genel runtime regresyonları | 50/50 geçti | Node VM, küçük DOM ve ağ test çiftleri |
| Yeni hotfix/Auth/DOM senaryoları | 33/33 geçti | Atama kaldırma/bitir/iptal, orphan kurtarma, kod/şifre, exact undo, hesap temizliği |
| Veritabanı kontrolleri | 26/26 geçti | Dokuz migration + hotfix provası + sentetik rol/veri testleri; PGlite PostgreSQL |
| Eski taşınabilir regresyon grupları | 8/8 geçti | Native geri/predictive back kaynak kontrolleri dahil |
| `npm test` grup sonucu | 11/11 geçti | Yukarıdaki grupların ana kapısı |
| APK web kaynağı eşleşmesi | 21/21 geçti | Runtime web dosyaları byte eşitliği; iki orijinal Cordova dosyası ayrıca korunur |
| Native görseller | 192/192 aynı | Orijinal APK ile byte eşitliği |
| Native kaynak XML | 190/190 aynı | Derlenmiş XML anlamlı düğüm/öznitelik karşılaştırması |
| Logo SVG | Aynı | Orijinal 0.11.3 web kaynağıyla byte eşitliği |
| APK v1/v2 imza | Geçti | Android apksig; v2 kriptografik imza ve APK içerik digest'i bağımsız Python kontrolü |
| Paket/sürüm/SDK/izin/ZIP/DEX/hizalama | Geçti | Paket 0.11.4/21, min24/target36, izinler korunur |
| Teslim ZIP'i temiz klasörde native derleme | Geçti | Aynı imzasız APK hash'i tekrar üretildi |
| Kaynak ZIP bütünlüğü/sır örüntü taraması | Geçti | CRC, yasak dosya tipleri, seçili private-key/secret/service-role örüntüleri |
| Canlı migration ve yeni erişim durumu | Geçti | Uygulama yanıtı + yalnız okuma ile RLS/grant doğrulaması |

**Son test turunda başarısız çalışan test yoktur.** İlk turlarda bulunan ürün hataları
giderildi. Eski testlerde 0.11.3/şema13 veya hemen seçim uygulamayı bekleyen kontroller
yeni sözleşmeye uyarlandı. Set azaltma testindeki yanlış fixture alanı düzeltildi;
ürün davranışı çalışan DOM/VM senaryolarıyla ayrıca kontrol edildi. Geçmiş rapordaki
başarısızlıkları bu sonuçlar silmez; orijinal 0.11.3 incelemesi ayrı tarihsel belgedir.

Çalıştırılamayanlar ve nedenleri:

- Fiziksel Samsung S23/Android16, gerçek üstüne kurulum, iki fiziksel cihaz, uçak modu,
  reboot, native bildirim/geri/klavye/TalkBack: bağlı telefon veya Android emulator yok.
- Gerçek tarayıcı/render kabulü: yerel uygulama tarayıcı erişimi engellendi; eski
  Playwright testleri de yeni Auth seçicileri ve tarayıcı ortamı gerektiriyor. Bunlar
  npm kapısında başarılı gösterilmedi; `tests/README.md` listeyi ayırır.
- Gerçek e-posta/kod/şifre sıfırlama: yönetim şablon erişimi ve gerçek test hesabı
  sağlanmadı. Otomatik testler e-posta göndermedi.
- Temiz npm dependency indirme: ağ onayı/cache erişimi bulunmadı. Aynı kesin sürümlerin
  önceden kurulmuş PGlite/Linkedom paketleriyle `npm test` gerçekten çalıştırıldı.
  Kilit dosyası bu sürümlerin var olan integrity kayıtlarına dayanır.
- GitHub CI: dosya eklendi, repo push/CI çalıştırması veya mağaza dağıtımı yapılmadı.

## Samsung S23 / Android 16 kısa kabul listesi — Berk ve Alper

1. Mevcut 0.11.3'te JSON yedeği al; verileri silmeden yeni APK'yı güncelleme olarak kur.
   Uygulama adı/logo/splash, 0.11.4 sürümü ve mevcut geçmişin durduğunu kontrol et.
   Telefonda Alper'in farklı sertifikalı validation APK'sı varsa önce kimliği netleştir;
   bu dosyanın eski beta sertifikasıyla güncelleme koşulu farklıdır.
2. Üye bir antrenmanda set tamamlasın ve duraklatsın. Antrenör o atamayı kaldırsın;
   üyede yenile. Devam/yönet ekranından bitirme ve iptal yollarını ayrı oturumlarda dene.
   Ardından yeni atanmış programı başlat. Eski değerler yeni programa karışmamalı.
3. Antrenmanda toplam süre, duraklat/devam, dinlenme, Normal/Drop/Tükeniş rozetleri ve
   tekrar hedefini küçük ekran/açık-koyu temada kontrol et. Geri hareketi kayıtları
   doğrudan silmemeli; iptal onayı göstermeli.
4. Oluşturucuda seç/bırak, Uygula ve dört vazgeçme yolunu dene. Gün/hareket/set sil–geri al
   yap; hedef/not/sıra korunsun. Değişikliği kaydetmeden çık, uygulamayı kapat/aç,
   taslağı kurtar. Başka hesap/salon o taslağı görmemeli.
5. Geçmiş kaydı sil, offline/online geçişi ve ikinci cihaz yenilemesi yap; geri gelmemeli.
   Yeni mesajlar görünsün. kg/lb değiştirip yeniden açınca rakam/birim tutarlı kalsın.
   Genel üye notu son program kaldırıldıktan sonra da antrenör ekranında kalmalı.
6. **Önce üç Auth şablonunu kur.** Kayıtta eşleşmeyen iki şifreyi dene; sonra kendi test
   hesabınla doğru kayıt ve e-posta kodu. Mevcut hesapta kodla giriş, hatalı/eskimiş/tekrar
   kullanılan kod, yeniden gönderme ve şifre yenilemeyi ayrı ayrı dene. E-postada link
   yerine kod görünmeli. Şifre veya kodu devir raporuna/sohbete yazma.
7. Bildirim izni/zamanlanmış bildirim, reboot sonrası geri yükleme, JSON dışa aktarma
   ve Android paylaşım ekranı: native regresyon listesi. Bunların telefon testi geçmeden
   sürümü pilot veya mağaza yayınına hazır sayma.

## Alper'in sonraki oturumuna başlangıç talimatı

Üç dosyayı birlikte aç: bu MD, 0.11.4 kaynak ZIP ve aynı sürüm APK. SHA-256'ları doğrula.
Önce kalan Auth şablon kurulumunu ve telefon kabulünü tamamla. Kaynak ZIP'in README'sindeki
Java/Python build yolu kullanılır; Gradle projesi arayıp kayıp sayma. İmza ve logoyu koru.
0.12.0'ın kapsamı Berk/Alper tarafından başlatılana kadar yeni büyük özellik açma.
Yalnız mevcut düzeltmeleri doğrulayıp eksikleri gider; tamamlanmış işleri yeniden yol
haritasına eksik özellik diye ekleme. Her kod sürümünde APK + kaynak ZIP + muhataba
uygun `FITTRACK_BERK_CHATGPT_DEVIR_vX.Y.Z.md` / `FITTRACK_ALPER_CHATGPT_DEVIR_vX.Y.Z.md`
teslim et. Aşağıdaki ayrıntılı sürüm notları da bu devirin parçasıdır.

---

# FitTrack Beta 0.11.4 — Düzeltme paketi

Önceki sürüm **0.11.3 / 20**, yeni sürüm **0.11.4 / 21**. 7 Eylül 2026.
Kullanıcı Berk'in açık isteğiyle yeni büyük paket planından önce çıkarılan ara hotfix.
Alper'in Android rekonstrüksiyonu kullanılmadı. İmzalı APK teknik olarak üretildi;
e-posta kodunun canlı şablon kurulumu ve telefon kabulü bekliyor.

## Kullanıcıya görünen değişiklikler

1. **Kaldırılan program ataması antrenmanı kilitlemez.** Başlamış oturumun program/gün/
   set tanımları ve eski atama kimliği oturum snapshot'ında tutulur. Aktif atama listesi
   boşalsa da ana ekranda devam/yönet yolu vardır. Üye tamamlar, kısmi kaydeder veya
   iptal eder; sonra yeni atanan programı başlatabilir. Eski sürümde program tanımı
   kaybolmuşsa var olan tamamlanmış setler kurtarılır; uydurma başlangıç programına
   çevrilmez. Bilinmeyen hareketin adı geri üretilemez; açık kurtarma adı gösterilir.
2. **E-posta kodu ve şifre tekrarı.** Girişte e-posta → tek kullanımlık kod. Kayıtta
   ve şifre yenilemede iki şifre eşleşmeden istek gönderilmez; en az 8 karakter.
   Hatalı/süresi dolmuş kod, yeniden gönderme aralığı ve çift dokunma ele alınır.
   6–8 haneli kod desteklenir. Mevcut oturum ve eski auth-callback desteği korunur.
   `docs/KODLU_GIRIS_KURULUMU.md` içindeki üç sunucu şablonu **henüz uygulanamadı**.
3. **Antrenman okunabilirliği.** Aktif ve dinlenme ekranında toplam süre; duraklatmada
   sabit sayaç. Duraklama toplam süreden düşülür. Normal, Isınma, Drop, Tükeniş için
   büyük renkli rozet; tekrar hedefi 30–34 px. Küçük ekran uyarlaması ve mevcut temalar.
4. **Oluşturucu güvenliği.** Hareketler geçici listede seçilir/bırakılır; yalnız
   “Seçimi uygula” doğru güne yazar. Vazgeç/X/geri/dışarı dokunma geçici seçimi iptal
   eder. Dirty-state, üç seçenekli çıkış, hesap/salon bazında taslak kurtarma eklendi.
   Gün/hareket/set silmede onay ve son 20 kaldırma için Geri al; program silmede
   oturumluk Geri al. Geri alınan program eski silme snapshot'ıyla yeniden kaybolmaz.
5. **Antrenör genel üye notu** son program atamasından ayrıldı; sıfır aktif atamada
   da saklanır. Eski son not üyelik kaydına kopyalandı. Programa özel atama notu
   ayrı kalır. Bu alan eski davranış gibi üyeye açık genel nottur; özel personel notu değildir.

## Önceki denetimdeki teknik düzeltmeler

- Tamamlanmamış, yalnız taşınmış/set alanına yazılmış değerler geçmişte tamamlanmış
  set sayılmaz. Filtre normalizasyonun tamamlanma zamanı üretmesinden önce çalışır.
- Kuyruk öğeleri değişmez kullanıcı/salon bağlamı ve ayrı revizyon kimliği taşır.
  Devam eden eski isteğin yanıtı daha yeni yazmayı kuyruktan silemez; başka hesap/
  salona uygulanamaz. 250 öğe kırpması kaldırıldı. Bağımsız hatalar sonraki işlemi
  durdurmaz; çakışmalar ve geçici hatalar zamanlanmış yeniden denemeye girer.
- Offline kayıt “buluta kaydedildi” şeklinde sahte başarı vermez; bekleme durumu açıktır.
  Depolama doluluğu bildirilir. Başarıyla işlenen silme kimlikleri kapsamlı anahtarla
  hatırlanır; aynı silme her kayıtta tekrar kuyruğa alınmaz.
- Hesap/salon geçişinde taslaklar, katmanlar, callback'ler ve sayaçlar temizlenir.
  Salon başına önbellek ayrılır. Hesap silme yerel salon/taslak önbelleklerini de temizler.
- Aynı aktif oturumdaki daha yeni uzaktan ilerleme alınır. İptal/kapanış oturum
  kimliğiyle taşınır; başka cihazın boş/idle snapshot'ı aktif oturumu yanlış kapatmaz.
- Geçmiş silme sunucu tombstone ve RPC ile kalıcı olarak işaretlenir. Eski snapshot
  veya gecikmiş upsert kaydı diriltemez. Tekrarlı silme RPC'si idempotenttir.
- Mevcut cloudId bulunan programın arşiv güncellemesi artık sunucuya yazılır.
- Görsel URL'leri HTML özniteliğine kaçırılır; rest/swap ekranlarında attribute injection giderildi.
- Mesaj sorgusu en yeni 500 kaydı alıp ekranda kronolojik sıraya çevirir. Henüz eski
  mesaj sayfalaması eklenmedi.
- kg/lb dönüşümünde kayıt birimi ve değişiklik zamanı saklanır; eski bulut kaydı
  çevrilmiş değeri eski birimle geri ezmez.
- Geri sayımın son 600 ms başlatma zamanlayıcısı da iptalde temizlenir.
- Storage nesne güncelleme/silmede sahipliğin yanında etkin salon personeli üyeliği
  ve dizin bağlamı aranır. Workout program/atama FK ilişkilerinde salon/üye bağlamı
  doğrulanır; kaldırılmış atamaya bağlı başlamış oturumun bitirilmesine izin verilir.

## Veritabanı ve geri dönüş

Canlı projeye `20260907134446_fittrack_beta_0114_workout_and_sync_safety.sql` uygulandı.
Yeni üyelik notu, `workout_deletions`, `delete_workout_record`, kayıt/snapshot trigger'ları,
RLS ve Storage policy güncellemeleri eklendi. Eski tablolar/alanlar silinmedi; mevcut
hesap/antrenman/mesajlar topluca silinmedi. Silme RPC'si yalnız kullanıcının kendi
salonundaki açık silme eylemlerinde çalışır. Döndürülen eski RPC tipleri korundu.
Mevcut delete-account Edge Function yalnız kaynak pakete alındı; yeniden dağıtılmadı.

Geri dönüşte eklenmiş tombstone ve üyelik notlarını DROP etmeyin; aksi halde silinen
kayıtlar geri gelebilir/notlar kaybolabilir. Tercih ileri düzeltmedir. 0.11.3 ikilisi
şema 14'ün yeni kapanış/geri alma durumlarını bilmez; aynı kullanıcıdaki cihazların
birlikte güncellenmesi gerekir. Eski istemcide genel not görüntüsü program notuna
bağlı kalabilir. APK downgrade için sürüm numarası/imza/yerel veri ayrıca değerlendirilir;
kullanıcıya kaldırma veya veri temizleme otomatik önerilmez.

## Yapı ve test durumu

- Uygulama/config/önbellek/manifest/build dosyaları 0.11.4; Android versionCode 21.
- `app.js` şema 14 tek yerel şema kaynağıdır; kullanılmayan config `schemaVersion:12`
  kaldırıldı. Yalnız sayı değiştirilerek metadata hatası gizlenmedi.
- Native Smali/manifest/192 görsel ve 190 kaynak XML korunur. WebView debugging kapatıldı.
- Java 17 + Apktool ile kaynak derlendi; eski JKS ile v1/v2 imzalandı. İmza, içerik
  digest'i, ZIP/DEX, web kaynak eşleşmesi ve hizalama doğrulandı.
- `npm test`: 11/11 grup geçti (83 VM/DOM/Auth davranışı, 26 PostgreSQL kontrolü,
  sekiz eski statik/runtime regresyon grubu). Gerçek SMTP, Android kurulum, S23/Android16,
  TalkBack/klavye/tema render'ı ve iki fiziksel cihaz test edilmedi.
- Temiz npm bağımlılık indirme ve eklenen GitHub Actions iş akışı burada çalıştırılamadı.
- 14 Supabase security WARN: 13 yetkili kullanıcıya açık, içeride kimlik/üyelik kontrolü
  yapan SECURITY DEFINER yardımcı/RPC; ayrıca mevcut leaked-password protection kapalı.
  Bunlar “14 doğrulanmış exploit” diye sınıflandırılmadı; son pilot denetiminde incelenmeli.

## Bilinen sınırlar / sonraki paket

Canlı e-posta şablon kurulumu teslimin kalan erişim adımıdır. Şablon kurulmadan
kod e-postası son kullanıcıya hazır kabul edilmemelidir. Kullanıcı hesabına gerçek
kod gönderen test yapılmadı. Önceden yanlış geçmişe yazılmış hayalet setler kanıt
olmadan otomatik silinmedi. Kurtarma yalnız gerçekten var olan yerel veriyi korur.
Programın Geri al işlemi aynı uygulama oturumunda kullanılabilir; kapatıp açınca
silme/geri alma sonucu korunur, geçici undo düğmesinin kendisi kalıcı değildir.

Ayrı antrenör paneli, hızlı toplu programlama, şimdi/sonraki antrenman/taşıma yok
sürüm geçişi, antrenöre özel üye erişim daraltma ve MFA/özel SMTP yeni 0.12.0 kapsamıdır.
Bu sürümde salon-geneli mevcut personel yetki modeli kökten değiştirilmedi.
Hareket ölçüm profilleri, superset, takip, push ve 3D sonraki ana paketlerde kalır.
Eski roadmap numaralarına dönmeyin; bu hotfix'te tamamlananları sonraki paketlerde
“iyileştirme/regresyon” olarak taşıyın.
