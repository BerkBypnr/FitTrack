# FitTrack v0.12.1 — Alper → Berk devir notu

14 Eylül 2026. Taban: Berk'in 0.12.0 kaynak ZIP'i. Kapsam: Alper'in 13 Eylül
telefon testleri ve ekran görüntülerindeki düzeltmeler. Bu dosya güncel durumu anlatır;
klasördeki 0.12.0 ve daha eski devirler tarihsel kayıttır.

## Teslim durumu

Kod uygulanmıştır. Yerel test grupları, tarayıcı görünümleri ve Android derleme
kanıtları `test-results/` altındadır. Son paket durumu dış teslim klasöründeki
`FITTRACK_v0.12.1_TESLIM_KANITLARI.json` dosyasında kayıtlıdır.

Bu Mac'te 0.12.0'ın özel beta imza anahtarı yoktur. Üretilen imzasız APK,
kullanıcının telefonuna kurulacak bir güncelleme değildir. Eski anahtar olmadan
aynı uygulamanın üzerine kurulabilir imzalı beta teslim edildiği iddia edilmez.
Yeni anahtar üretilmedi; mevcut uygulamayı kaldırmak çözüm değildir.

## Alper'in bildirdiği değişiklikler

| İstek | Yapılan |
|---|---|
| 1 — Ana sayfadaki tekrar menüler | Büyük Programlar / Üyeler kısayolları kaldırıldı. Alt menü esas giriş. |
| 2 — Renksiz arayüz | Tema renginde başlık ve istatistik ikonları; durum rengine göre kart kenarı/etiket; belirgin ana/ikincil eylemler. Altı tema korunur, Redline kırmızıdır. |
| 4 — Ayarlar alt menüde | Antrenörde Bugün / Üyeler / Programlar / Mesajlar / Ayarlar. Ayarlar aktif sekmesi ve kirli taslak çıkış koruması dahil. Üye menüsü ayrı kalır. |
| 5 — Ayarlarda Salon | Antrenör ayarlarındaki yinelenen Üyeler / Programlar bölümü kaldırıldı. Salon üyeliği ve veri izolasyonu kaldırılmadı. |
| 6 — Program düğmeleri çakışıyor | Satır açma oku ile üç nokta menüsü ayrı genişlik/boşluğa alındı; menü 44 px. |
| 7 — Hep ilk seans açılıyor | Çok günlük programda açık seans seçimi ve ayrı başlatma onayı. |
| 9 — Sohbete dön çalışmıyor | Üye bilgisi panelindeki gereksiz düğme kaldırıldı. X kapanışı ve yazılmış sohbet taslağı korunur. |
| 10 / K09 — Yatay ve klavye | Yatay telefonda tam ekran akış ve tek antrenman kaydırma alanı; arka ana sayfa sızmaz. Profil sihirbazı görünür viewport yüksekliğini kullanır. |
| K08 — Eksik set verisi | Ağırlıklı harekette kilo + tekrar birlikte, ya da ikisi de boş. Tek alan doluysa set tamamlanmaz. Vücut ağırlığı hareketinde tekrar tek başına geçerlidir. Geçmiş düzenlemesi de denetlenir. |

Kullanıcının numaralandırmasındaki 3 ve 8 ayrı hata maddeleri değil, tasarım/çözüm
referans fotoğraflarıdır.

## Seans seçimi sözleşmesi

- Çok günlük program tek paket kalır. Başla basılınca hiçbir seans seçili gelmez.
- Kullanıcı Çekiş / İtiş / Bacak gibi istediği seansı seçer; ardından adı yazılı
  düğmeyle başlatır. İlk seansa veya takvim gününe otomatik geçiş yoktur.
- Her satır hareket sayısını ve biliniyorsa son tamamlanma tarihini gösterir.
  Gün kimliği olmayan eski kayıtlardan tarih tahmin edilmez.
- Aynı programın aynı seansı bu hafta tamamlandıysa tekrar onayı çıkar. Onayla
  yeniden başlanabilir; kısmi/demo/başka program kayıtları bu uyarıyı üretmez.
- Yarım kalan antrenman gün ve program snapshot'ıyla kendi seansından devam eder.
- Program düzenleyicisindeki önerilen hafta günleri tüm program içindir;
  Çarşamba = Bacak gibi bir eşleştirme oluşturmaz. Mevcut bağımsız hatırlatıcı
  ayarları bu tercihle sessizce değiştirilmez; otomatik program takvimi eklenmedi.
- Haftalık özet tamamlanan antrenman sayısını gösterir. Aynı gün iki gerçek tamamlanma
  iki kayıt sayılır. Demo kayıt sayılmaz.
- History'ye `programId / dayId / dayName`, programa `trainingWeekdays` eklendi.
  İsteğe bağlı JSON alanlarıdır; mevcut şema 14 ve bulut payload ile taşınır.
  Eski `day.weekday` değerleri geçmiş uyumluluğu için okunur, seçim zorlamakta kullanılmaz.
  Yeni Supabase migration veya canlı sunucu değişikliği yapılmadı.

## Kalan testlerde bulunan ek sorunlar

**K28:** Başka hesabın/salonun yedeği mevcut oturum altında içe alınabiliyordu.
Hesap + salon uyuşması zorunlu; belirsiz yerel yedek signed-in hesaba alınmaz.
Reddedilen işlem state/storage/program listesini değiştirmez. Aynı hesap yedeği
aktif rolü ve salon bağlamını değiştiremez. JSON yedeği bir imzalı sunucu yetki belgesi değildir.

**K29:** Bildirime dokunma hesabı ve salonu bağlamıyordu. Yeni mesaj bildirimi
hesap/salon/üye kimliği taşır; dokunmada ve gecikmiş açılışta tekrar kontrol edilir.
Artık erişilmeyen kişi veya eski hesabın bildirimi sohbet açmaz. Aynı dokunma
kısa sürede iki kez gelirse tek işlem yapılır. Bu, uygulama kapalıyken çalışan
uzak push altyapısı eklendiği anlamına gelmez.

**K30:** Auth callback adresi prefix ile kontrol ediliyordu; credentials olmayan
bir bağlantı mevcut oturumu kullanabiliyor ve URL'deki recovery türüne güveniyordu.
Adresin protocol/host/port/path değeri tam eşleşir. Eksik credentials reddedilir.
Aynı callback eşzamanlı ve başarılı tekrar çağrılarda deduplicate edilir.
Şifre yenileme izni URL metninden değil doğrulanmış PKCE sonucu veya mevcut
doğrulama kodu akışından gelir.

## Doğrulama sınırları

`npm test` gerçek uygulama fonksiyonlarını VM, DOM modeli, Linkedom ve yerel
PGlite PostgreSQL ile denetler. Native ve Auth kenar senaryolarında kontrollü
sahte servisler kullanılır. `tests/browser-0121.cjs` Chrome'u, sentetik hesapları
ve viewport boyutlarını kullanır; gerçek hesaba mesaj/atama göndermez.

Tarayıcı ekranları uygulamanın çalışan kaynağından alınmıştır; pazarlama mockup'ı değildir.
Ancak Chrome viewport küçültmesi Samsung klavyesi/Android sistem çubuğu testi değildir.
SMTP teslimi, iki gerçek cihazdaki realtime, offline kuyruk senkronizasyonu,
bildirim izni ve mevcut APK üzerine güncelleme telefon kabulü bekler.
Eski sürümün GEÇTİ sonuçları yeni sürüme taşınmaz.

## Berk'in sonraki adımı

1. Kaynak ZIP'ini ayrı klasörde aç. Mevcut anahtarın bulunduğu güvenli ortamda
   `npm ci --ignore-scripts`, `npm test`, `python3 scripts/build_android.py --sign`.
2. Paket `com.fittracklabs.mobile`, sürüm `0.12.1`, versionCode `28`.
   Beklenen sertifika SHA-256:
   `38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce`.
   Anahtar ve parolaları kaynak ZIP'ine veya sohbete koyma.
3. `FITTRACK_APK=/.../FitTrack-Android-v0.12.1-beta.apk python3 tests/apk_inspect.py`
   ve resmi apksigner doğrulamasını çalıştır. Betik aynı sertifikayı zorunlu tutar.
4. Önce 0.12.0 üzerine veri kaybetmeden güncelleme; sonra yeni telefon listesindeki
   kritik akışlar. K01–K03 başarısızsa uygulamayı kaldırma/verisini silme.
5. Düzeltme kabulünün ardından mevcut yol haritasındaki web paneli, rol ve
   sunucuda MFA aşamasına dön. Bu düzeltme o aşamayı tamamlamış sayılmaz;
   sonraki yol haritası sürümleri kendiliğinden kaydırılmaz.

Bu notta Berk'in tamamladığı işlere veya yapılmamış telefon/sunucu testlerine
yeni başarı atfedilmez; dayanak kaynak, test ve paket kanıtıdır.
