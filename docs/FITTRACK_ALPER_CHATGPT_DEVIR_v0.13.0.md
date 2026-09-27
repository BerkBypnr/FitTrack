# ALPER'İN CHATGPT'Sİ İÇİN DEVİR — FitTrack 0.13.0

Tarih: 17 Eylül 2026. Tür: uygulama geliştirme devri; tasarım önerisi değil.

## 1. Başlangıç durumu ve otorite

- Çalışılacak kaynak: bu ZIP'in `FitTrack-0.13.0` kökü. 0.12.2 üstüne geliştirilmiştir.
- `package.json`, app/config/manifest/index ve Gradle sürümü: 0.13.0; versionCode 30.
- Şema 14, uygulama kimliği `com.fittracklabs.mobile`, köken `https://localhost` sabit.
- Android: min24 / hedef36, Java21, Gradle8.14.3, AGP8.13.0, Capacitor8.5.1.
- En son açık kullanıcı kararı > bu sürümün devri > temiz final UI paketi > Rev9 > eski belgeler.
- Kaynak vanilla JS/CSS + Capacitor'dır. React/Vite projesine çevrilmedi.
- Eski APK, kaynak, test kayıtları değiştirilmedi. GitHub import-v0.12.2 dalına yazılmadı.
- Canlı Supabase/Auth/RLS/SQL/Edge Function veya gerçek hesaplar değiştirilmedi.

## 2. Bu sürümde uygulananlar

1. `design-system.css`: ortak renk/boşluk/köşe/düğme/focus/durum tokenları; dar ekran ve azaltılmış hareket desteği.
2. Tam dört tema: Koyu Kırmızı, Plum Night, Redline Editorial, Rosewood Strength.
3. FT birleşik işareti: gerçek SVG ve Android vector drawable; eski F+yeşil nokta yerine.
4. Kadınsız, dumbbell ve sıcak sarı ışıklı açılış; gerçek Giriş yap / Hesap oluştur düğmeleri.
5. Giriş/kayıt: etiketli alanlar, şifre göster/gizle, şifre tekrarı, kayıt adımları, mevcut onay ve Auth akışı.
6. Tek alan e-posta kodu, görünür 60 saniye yeniden gönderim sayacı, kullanıcı başlatmalı şifre kurtarma formu ve yeni şifre ekranı.
7. Hesap rolü/salon kurulumunun ortak tasarımı; gerçek yetki yine sunucu üyeliklerinden gelir.
8. Profil: ad/soyad ve isteğe bağlı cinsiyet kartları; yaş/boy tekerlekleri; kilo cetveli + elle giriş; kg/lb dönüşümü; isteğe bağlı hedef kilo; dört hedef kartı.
9. Üye dört / antrenör beş sekmeli menü yapısı korunarak ortak menü ve durum görünümleri yenilendi.
10. Auth katmanı açıkken arka ekranlar `inert`; ekran klavye odağı formu kendiliğinden açtırmaz. Eski login şifrelerine yeni kayıt için olan 8 karakter alt sınırı uygulanmaz.

Görseller birebir resim olarak ekrana yapıştırılmadı. Marka/düğme/metinler gerçek UI;
yalnız dumbbell arka planı raster varlıktır. Yeni insan görseli üretilmedi.

## 3. Veri ve geçiş sözleşmesi — bozma

| Önceki seçim | 0.13 karşılığı |
|---|---|
| Crimson Graphite / Volt Discipline / midnight | Koyu Kırmızı (`dark-red`) |
| Sage Motion / light / ocean | Redline Editorial |
| Plum Night / Redline Editorial / Rosewood Strength | Aynen korunur |
| rose / amber | Rosewood Strength / Redline Editorial |

Bu sadeleştirme kullanıcının son dört tema kararıdır; önceki “altısını koru” mesajı güncel değildir.
Eski anahtarlar yedeklerde okunmaya devam eder, ama seçenek listesinde görünmez.

- `fittrack-beta-010-state`, `fittrack-beta-010-user-`, Auth oturum anahtarı değişmedi.
- `fittrack-beta-0122-profile-draft:` anahtarı özellikle değiştirilmedi; hesap+salon izolasyonu korunur.
- Eski taslakları kaydırmamak için profil adımları 1 ad/cinsiyet, 2 yaş, 3 boy, 4 mevcut kilo, 5 isteğe bağlı hedef kilo, 6 hedef olarak kaldı.
- `profile.gender`: `male`, `female`, `unspecified`; eski profiller sonuncuya geçer.
- `profile.goal`: mevcut `lose`, `fit`, `gain` + `strength`.
- `profile.targetWeight`: sayı veya `null`; boş hedef sayısal sıfır değildir. Yedek/snapshot roundtrip bunu korur.
- Profilde virgüllü kilo girişi noktaya normalize edilir. Geçersiz yaş/kilo ilerletilmez.
- Birim değişimi taslakta çevrilir; geçmiş verileri ancak profil kaydedilince eski dönüşüm fonksiyonuyla güncellenir.
- Kod, e-posta ve şifre doğrulama sunucusunun yerini almaz. Parolalar yerel depolamaya yazılmaz.
- Yeni recovery formu bir tıkta e-posta göndermez; açık form gönderimi gerekir. Yinelenen istek kilidi ve OTP sequence koruması sürer.
- Şema artırılmadı; yeni profil alanları mevcut JSON snapshot/backup içindedir. SQL migration yok.

## 4. Bu sürümde YAPILMAYANLAR / sonraki aşama

| Sürüm | Kapsam |
|---|---|
| 0.14 | Hareket ölçüm modeli; final aktif antrenman; geçmiş kayıt düzenleme |
| 0.15 | Üye ana sayfası, programlar/kütüphane, ilerleme, mesajlaşma, profil/ayarlar alt ekranları |
| 0.16 | Antrenör ana sayfası, üyeler, program stüdyosu, atama, yalnız manuel takip |

Şu an mevcut aktif antrenmanda set ekranı ve dinlenme davranışları HALA eski işleyiştir.
0.13 tam UI bitti diye tanıtılmamalı. 0.14'teki kesin final:

- Büyük ve sabit GIF; altında maddeli açılır/kapanır “Nasıl yapılır”; ardından aynı hareketin bütün set girişleri.
- Set sayısını antrenörün programı belirler; her sette yeni ekran yok.
- Dinlenme sayacı, otomatik başlatma/sonraki hareket geçişi yok; altta Sonraki hareket, üstte Önceki hareket.
- Geçmiş düzenleme/program oluşturma sabit fotoğraf; GIF yalnız aktif antrenman/hareket inceleme.
- Antrenman/seans tercihi kullanıcıya aittir. Gün önerisi veya takvim gününü bir seansa zorlama yok.

0.16 final antrenör kuralları:

- Ana sayfada baskın Yeni program düğmesi yok; hazır program atama daha sık kullanılan iş.
- Antrenman kaydı yokluğu salon yoklaması değildir. Gelmeyen üyeyi otomatik baskı/takip kuyruğuna alma yok.
- Hoca isterse üyeyi manuel takip eder, yazar veya uygun bildirim gönderir.
- Programa zorunlu 4/6 hafta sınırı, otomatik süresi doldu/yenileme baskısı yok.
- QR gelecekte duvarda; antrenöre her geleni okutma ekranı yok. Turnike pilot sonrasıdır.
- Program talebi, ilerleme fotoğrafları, AI antrenör, 3D avatar, yeni sağlık formu bu UI sürümlerine gizlice eklenmez.

Rev9'un diğer ileriki işleri silinmiş değildir. Bu sürüm sadece UI geçişinin ilk aşamasıdır;
üyelik/paket/giriş hakkı, bildirim güvenilirliği ve pilot ölçümleri gibi ürün işleri kendi yol haritasında kalır.

## 5. Kontrol kanıtları

- `npm test`: 21/21 test grubu; yeni `design-system-0130` grubunda 15 kontrol.
- `test-results/browser-0130/results.json`: 10/10 gerçek Chromium test grubu; yeni ekranlar/dört tema/manuel giriş/yükleme/recovery.
- `test-results/browser-0121/results.json`: 15/15 tarayıcı regresyonu; eski antrenman, program/seans, antrenör, taslak ve klavye yüksekliği benzetimleri.
- Tarayıcı sürümü 153.0.8010.0. Sentetik yerel hesaplar; 0.13 testinde harici ağ istekleri bloke edilir.
- Masaüstü Chromium viewport değiştirmek fiziksel Android IME/ekran döndürme testi değildir.
- Resmi APK imza/kimlik/hizalama ve kaynak eşleşmesi kanıtları teslim paketinin `Dogrulama` klasöründe.
- Başarı raporları yeniden çalıştırılan kontrolleri gösterir; eski teslimden kopyalanmış test sonucu sayılmaz.

Fiziksel test açıkları: 0.12.2 T01 profil klavye/dönüş, T02 gerçek cihaz dosya kaydı;
daha önce denenemeyen K35. Kullanıcının önceki “yazmadıklarım geçti” mesajı, açıkça denenemedi
dediği bir maddeyi otomatik geçirmez. Bu sürümün yeni telefon listesi ayrıca uygulanmalı.

## 6. Geliştirme ve teslim kuralları

- Kökte düzenle; `android/app/src/main/assets/public/` çıktısını elle değiştirme.
- `npm ci --ignore-scripts`, `npm test`, `npm run build:web`; sonra `scripts/build_android.py`.
- Tarayıcı: Playwright kurulu ortamda `node tests/browser-0130.cjs` ve `node tests/browser-0121.cjs`.
- Özel ortamda `FITTRACK_PLAYWRIGHT` modül yolu, `FITTRACK_CHROME` Chrome yolu seçilebilir.
- Bu çalışma ortamında kullanılan alternatif Chromium yalnız dış `.tooling` altında; uygulamaya bağımlılık eklenmedi.
- Android release üretimi: JDK21 + SDK36 + mevcut Gradle; beta anahtarı dışarıdan dört FITTRACK_* ortam değişkeniyle.
- Beklenen sertifika SHA-256: `38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce`.
- Private key / parola / service-role anahtarı kaynak, APK veya devre eklenmez.
- APK'yı kaldırıp temiz kurma önerme; önce mevcut uygulamanın üstüne kurarak veri korumalı yükseltmeyi test et.
- Bu sürümün telefon kabulünden sonra 0.14'e geç. Hata varsa küçük, açık kapsamlı hotfix; bütün yol haritasını bir numara ileri kaydırma.
