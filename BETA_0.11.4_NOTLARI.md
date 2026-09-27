> TARİHSEL BELGE: 0.11.4 durumunu anlatır. Normal girişte OTP ve üç şablon talimatı 0.11.6 ile kaldırıldı. Güncel kurulum için `docs/KODLU_GIRIS_KURULUMU.md` ve yeni devir raporunu esas alın.

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
