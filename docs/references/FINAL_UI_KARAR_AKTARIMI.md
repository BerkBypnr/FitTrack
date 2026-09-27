# FITTRACK — ALPER'İN CHATGPT'Sİ İÇİN FINAL UI AKTARIMI

**Tarih:** 17 Eylül 2026  
**Geçerli uygulama tabanı:** 0.12.1 / versionCode 28 / yerel şema 14  
**Sıradaki planlı özellik sürümü:** 0.13.0  
**Amaç:** 0.12.1 üzerine geliştirilecek yeni UI paketini, son ürün kararlarını ve eski tasarımları doğru yorumlama kurallarını Alper'in ChatGPT'sine eksiksiz aktarmak.

---

## 1. BU BELGENİN KONUMU VE ÖNCELİĞİ

Bu belge, daha önce hazırlanmış `FITTRACK_ALPER_GPT_AKTARIM_BAGLAMI_REV9.md` dosyasını tamamen silmez. Ancak **final UI görüşmelerinden sonra değişen konularda bu belge eski aktarım dosyasını ve Revizyon 9 yol haritasındaki eski UI ifadelerini geçersiz kılar.**

Alper'in ChatGPT'sine birlikte verilmesi gereken ana kaynaklar:

1. 0.12.1 tam kaynak paketi — tek geçerli kod tabanı.
2. `FitTrack_Guncel_Yol_Haritasi_Revizyon_9` — sürüm sırası ve gelecekteki özelliklerin ana kaynağı.
3. `FitTrack-Final-UI-Tasarimlari.zip` — bütün ekran kapsamı ve final revizyonlar.
4. Bu belge — son kararlar, çelişki çözme ve uygulama talimatı.

Kaynaklar çelişirse öncelik sırası:

1. Berk veya Alper'in bu belgeden sonra verdiği açık ve yeni talimat
2. Bu final UI aktarım belgesi
3. ZIP içindeki `00_FINAL_KARARLAR.md` ve `00_OKUMA_REHBERI.md`
4. `02_Yeni_Final_Revizyonlar` klasöründeki R01–R14 görselleri
5. Güncel Yol Haritası Revizyon 9
6. `01_Tam_Uygulama_Ekran_Arsivi` içindeki 25 kapsam görseli
7. 0.12.1'in mevcut görünümü
8. Eski sohbetler, eski aktarım dosyaları ve taslak görseller

Görseller iş kurallarının yerine geçmez. Bir mockup'ta görünmeyen çalışan özellik kendiliğinden kaldırılmaz. Aynı ekranın birden fazla tasarımı varsa daha yeni final revizyon uygulanır.

---

## 2. TEK GEÇERLİ TEKNİK TABAN

| Alan | Değer |
|---|---|
| Paket | `com.fittracklabs.mobile` |
| Kaynak taban | 0.12.1 |
| versionCode | 28 |
| Yerel şema | 14 |
| Android hedefi | Android 16 |
| İmza | Mevcut beta sertifikası; V1 ve V2 |
| Doğrulanmış test tabanı | 19 test grubu |
| Web–Android eşleşmesi | 22/22 kaynak dosyası |

0.11.9, iptal edilmiş 0.12.0 taslakları veya eski kod parçaları yeni tabana karıştırılmayacak. 0.12.2 yalnız acil 0.12.1 hata yaması gerekirse kullanılacak. Acil yama yoksa sıradaki özellik sürümü 0.13.0 ve minimum versionCode 29'dur.

UI değişikliği yapılırken aşağıdaki mevcut davranışlar korunacak:

- Üye yapmak istediği Çekiş, İtiş veya Bacak seansını kendisi seçer; uygulama önermez ve günlere bağlamaz.
- Aynı seansı aynı hafta yeniden seçmek yalnız uyarı verir.
- Yarım antrenman doğru seans ve setten devam eder.
- Bir üyeye birden fazla farklı aktif program atanabilir.
- Taslak kurtarma, program snapshot'ı, geçmiş düzenleme/silme, Auth callback güvenliği ve hesap/salon izolasyonu korunur.
- Normal giriş e-posta ve şifreyle; kayıt doğrulama ve kullanıcı tarafından başlatılan şifre kurtarma kodla çalışır.
- Antrenörün beş sekmeli mobil yapısı ve rol sınırları korunur.

---

## 3. TASARIM PAKETİNİ OKUMA KURALI

`FitTrack-Final-UI-Tasarimlari.zip` iki görsel bölüm içerir:

- `01_Tam_Uygulama_Ekran_Arsivi`: 25 görsel. Uygulamadaki ekran ve durum kapsamını gösterir.
- `02_Yeni_Final_Revizyonlar`: R01–R14. Son tasarım ve ürün kararlarını gösterir; çakışmada bu klasör kazanır.

Öncelikli final görseller:

| Konu | Geçerli görsel |
|---|---|
| Profil kurulumu | `R01_Profil_Kurulumu_Final.png` |
| Üye ana sayfası ve seans seçimi | `R02_Uye_Ana_Sayfa_ve_Antrenman_Secimi_Final.png` |
| Aktif antrenman | `R03_Aktif_Antrenman_Final.png` |
| Hareket ölçüm türleri | `R04_Hareket_Olcum_Turleri_Final.png` |
| Geçmiş antrenman düzenleme | `R05_Gecmis_Antrenman_Duzenleme_Final.png` |
| Vücut ölçümleri ve profil | `R06_Olcumler_ve_Profil_Final.png` |
| Program oluşturma ve alternatifler | `R08_Program_Olusturma_ve_Alternatifler_Final.png` |
| Hareket seçimi, şablon ve atama | `R09_Hareket_Secimi_Sablon_ve_Atama_Final.png` |
| Dört tema | `R10_Dort_Tema_Final.png` |
| Klavye, doğrulama ve mesajlaşma | `R11_Klavye_Dogrulama_ve_Mesajlasma_Final.png` |
| Boş, hata ve bağlantı durumları | `R12_Durumlar_ve_Hatalar_Final.png` |
| Antrenör ana sayfası, üyeler ve üye ayrıntısı | `R13_Antrenor_Ana_Sayfasi_ve_Uyeler_Final.png` |
| Manuel takip ve hatırlatma | `R14_Istege_Bagli_Takip_ve_Hatirlatma_Final.png` |

`R13` ve `R14`, antrenör tarafında `R07` ile veya eski 25 ekranla çelişen alanlarda daha günceldir. Arşivdeki eski aktif antrenman ve antrenör ana sayfası yalnız kapsam referansıdır.

Mockup'ları sabit piksel ölçüsü olarak kopyalama. Tasarım tokenları, Android güvenli alanları, klavye, dar ekran, büyük yazı ve uzun Türkçe metinlerle çalışan uyarlanabilir bileşenler kur.

---

## 4. BAĞLAYICI FINAL ÜRÜN KARARLARI

### 4.1 Temalar

Uygulamada tam olarak dört tema bulunur:

1. Koyu Kırmızı — Crimson Graphite'ın yerini alır.
2. Redline Editorial
3. Plum Night
4. Rosewood Strength

Crimson Graphite seçili mevcut hesaplar veri kaybetmeden Koyu Kırmızı'ya taşınır. Diğer üç tema silinmez.

### 4.2 Aktif antrenman

Geçerli davranış `R03_Aktif_Antrenman_Final.png` ile aşağıdaki kuralların birleşimidir:

- Her ekranda bir hareket gösterilir.
- Büyük hareket GIF'i üstte ve görünür kalır.
- GIF'in altında ayrı bir `Nasıl yapılır?` alanı bulunur. Bu alan başlangıçta kapalıdır; açılınca yalnız maddeli metin talimatlarını gösterir.
- Antrenör kaç set tanımladıysa bütün setler aynı ekranda satır olarak görünür. Set başına ayrı sayfa açılmaz.
- Satırlar hareketin ölçüm profiline göre kilo, tekrar, süre veya mesafe alanlarını gösterir.
- Set kendi satırındaki durum alanından tamamlanır.
- Dinlenme sayacı, dinlenme penceresi, geri sayım ve otomatik hareket geçişi yoktur.
- Kullanıcı `Önceki hareket` ve sabit `Sıradaki hareket` işlemleriyle kendi ilerler.
- İlk harekette önceki bağlantısı gösterilmez. Son harekette ana işlem `Antrenmanı tamamla` olur.
- Girilmiş değerler hareketler arasında gidip gelince korunur.
- Eksik setlerle sonraki harekete geçilebilir; eksik setler tamamlanmış sayılmaz ve kayıt yarım durumu doğru yansıtır.
- Küçük ve açık etiketli bir toplam süre göstergesi olabilir; dinlenme süresi değildir.

### 4.3 Görsel medya kullanımı

- Aktif antrenman ve hareket ayrıntısı: GIF.
- Program oluşturma, program inceleme ve geçmiş düzenleme: sabit hareket fotoğrafı/posteri.
- GIF yüklenemezse set kaydı engellenmez; poster ve açıklama ile akış çalışır.
- Yapay zekâ üretimi olduğu bariz insan görselleri üretim varlığı olarak kabul edilmez. UI belirli bir insan fotoğrafına bağımlı kurulmaz; görseller değiştirilebilir asset anahtarlarıyla yönetilir.

### 4.4 Geçmiş antrenman düzenleme

- Bütün hareketler aynı sayfada açık kartlar olarak alt alta bulunur.
- Her hareketin sabit fotoğrafı, adı ve set tablosu görünür.
- Değerler doğrudan düzenlenir; doğru sayısal klavye açılır.
- Bütün değişiklikler tek `Değişiklikleri kaydet` işlemiyle kaydedilir.
- Cetvelli kilo seçici, hareket seçme açılır menüsü, setler arasında sayfa geçişi ve dinlenme sayacı kullanılmaz.
- Düzenleme sırasında alt navigasyon gösterilmez.

### 4.5 Antrenör ana sayfası ve üyeler

Geçerli kaynaklar `R13` ve `R14`'tür:

- Ana sayfada büyük veya sabit `Yeni program` düğmesi yoktur. Program oluşturma Programlar sekmesindedir.
- Salon özeti: toplam üye, bugünkü antrenman kayıtları ve haftalık aktif üye.
- `Kurulum ve iletişim` alanında yalnız `Programsız üyeler` ve `Okunmamış mesajlar` kısa yolları bulunur.
- `Tamamlanmamış davetler` ana sayfada bulunmaz. Mevcut genel davet kodları kişiye özgü davet takibi sağlamaz.
- Uzun süredir antrenman kaydı olmayan kişi otomatik olarak problemli, devamsız veya takip edilmesi gereken üye sayılmaz.
- Uygulama turnike verisi olmadan `salona gelmedi` demez. `Son antrenman kaydı` yalnız uygulamada kaydedilmiş antrenmandır.
- Üye listesi son antrenman kaydına göre tarafsız biçimde sıralanabilir.
- `Takibe al`, `Mesaj` ve `Hatırlatma` yalnız antrenörün seçtiği manuel işlemlerdir.
- Sistem hareketsizlik nedeniyle kendiliğinden takip etiketi koymaz veya hatırlatma göndermez.
- Hatırlatma metni düzenlenebilir ve tek seferliktir.
- Gelecekte turnike bağlanırsa `Son salon girişi` ile `Son antrenman kaydı` ayrı alanlar olur.

Canlı test verisindeki Mert/Can için daha önce kullanılan otomatik `Takip Et` beklentisi artık ürün kuralı değildir. Bu test kayıtları silinmesin; fakat arayüz onları otomatik takip listesine sokmasın. Takip listesi yalnız antrenörün manuel seçimlerinden oluşur.

### 4.6 Program ataması

- Program atamasında zorunlu hafta sayısı, süre, bitiş tarihi, geri sayım veya otomatik sona erme yoktur.
- `Programın süresi doluyor` bildirimi yoktur.
- Program, antrenör kaldırana veya tamamlandı olarak işaretleyene kadar aktif kalır.
- Üye ara verebilir; aradan sonra kaldığı programla devam edebilir.
- Program kartında atanma tarihi, tamamlanan antrenman sayısı ve son antrenman kaydı gösterilebilir.
- Bir üyeye birden fazla farklı aktif program atanabilir.
- Antrenör hareket başına 1–3 onaylı alternatif tanımlayabilir. Üye yalnız bu alternatifler arasından seçim yapabilir.

### 4.7 Profil, ölçümler ve diğer kapsam

- Profil kurulumunda cinsiyet kartları, kaydırmalı boy seçimi ve cetvelli kilo seçimi bulunur; boy ve kilo elle de girilebilir.
- Hareket ölçümleri: yük+tekrar, vücut ağırlığı tekrarı, süre, mesafe+süre, yük+mesafe ve yalnız tamamlandı.
- Vücut ölçümleri: bel, boyun, kol ve kalça. İlerleme fotoğrafı yoktur.
- Egzersiz kütüphanesi alfabetik liste, arama, kas ve ekipman filtresi kullanır.
- Antrenman sonunda motive edici özet olabilir; RPE, ağrı, zorluk veya medikal soru yoktur.
- QR, turnike, antrenör QR tarayıcısı ve navbar QR sekmesi pilot kapsamına alınmaz.
- Beslenme, AI koç, topluluk, giyilebilir cihaz, 3D, üye içi online ödeme ve PT randevusu aktif kapsamda değildir.

---

## 5. ESKİ KAYNAKLARDA GÖRÜLÜRSE UYGULANMAYACAK YORUMLAR

Aşağıdakiler taslaklarda, eski görsellerde veya yol haritasının eski cümlelerinde görülse bile final kararı değildir:

- Aktif antrenmanda dinlenme sayacı veya otomatik hareket geçişi
- Her set için ayrı ekran
- Aktif antrenmanda küçük ya da kaybolan GIF
- Antrenör ana sayfasında dev `Yeni program` işlemi
- Uzun süre kayıt girmeyen üyeyi otomatik sorun veya takip konusu yapma
- `Salona gelmedi` ifadesi
- Otomatik hatırlatma veya otomatik takip listesi
- Ana sayfada `Tamamlanmamış davetler`
- Program için zorunlu 4/6 hafta, bitiş tarihi veya süre dolumu bildirimi
- Profilde ilerleme fotoğrafı
- Antrenöre veya navbar'a QR okutma düğmesi

Yol haritasının 0.16.0 bölümündeki `uzun süredir kayıt girmeyenlere kısa yol` ve otomatik `Takip Et` dili, final R13/R14 kararıyla değiştirilmiştir. Veri raporlanabilir; kullanıcı yargılanmaz ve takip işlemi manuel kalır.

---

## 6. GELİŞTİRME SIRASI

UI paketi tek dev teslim olarak uygulanmayacak. Astra Max kullanılsa bile veri ve regresyon riski nedeniyle sıra korunacak:

| Sürüm | Kapsam |
|---|---|
| 0.13.0 | Tasarım sistemi, dört tema, auth, profil kurulumu, navigasyon kabukları ve ortak durum bileşenleri |
| 0.14.0 | Hareket ölçüm modeli, aktif antrenman ve geçmiş antrenman düzenleme |
| 0.15.0 | Üye ana sayfası, programlar, kütüphane, ilerleme, mesajlaşma, profil ve ortak ayarlar |
| 0.16.0 | Antrenör ana sayfası, üyeler, Program Stüdyosu, program atama, manuel takip ve hatırlatma |

0.17.0 ve sonrasındaki push, check-in, program sürümleme, superset, senkronizasyon, paketler, web, koşullu QR, iOS, çok salon ve turnike planları Revizyon 9 yol haritasında korunur. Final UI kararları gelecekteki bu özellikleri silmez.

Hata düzeltmesi planlanan özellik yerine geçmiş sayılmaz. Bir sürümün planlı kapsamı bitmeden yalnız bug düzeltildi diye sonraki sürüme geçmiş kabul edilmez. Gerekirse 0.13.1 gibi yama sürümü çıkar; yol haritası sessizce kaydırılmaz.

---

## 7. ALPER'İN CHATGPT'Sİ İÇİN İLK GÖREV

Dosyalar yüklendiğinde hemen kod yazmaya veya APK üretmeye başlama. İlk yanıtında:

1. Aldığın dosyaları adlarıyla listele.
2. 0.12.1'in tek geçerli kod tabanı olduğunu doğrula.
3. Yol haritası ile bu belgedeki değişen kararları özellikle listele.
4. ZIP'teki final görsellerin öncelik sırasını doğrula.
5. 0.13.0 A için kaynak, test, tema/token ve ekran eşleme inceleme planını yaz.
6. Yalnız gerçekten davranışı değiştirecek belirsizlikleri sor; eski taslaktan yeni karar üretme.
7. Berk veya Alper açıkça geliştirmeyi başlatmadan canlı Supabase, kaynak veya APK üzerinde değişiklik yapma.

0.13.0 A başladığında önce mevcut test tabanını yeniden çalıştır; paket, sürüm, şema, imza, üstüne kurulum ve kullanıcı verisinin korunmasını doğrula. Ardından merkezi tasarım tokenları ile dört temayı kurup auth ve profil ekranlarını taşı.

---

## 8. HER TESLİMİN KABUL PAKETİ

Her özellik sürümünde:

1. İmzalı APK
2. Tam kaynak ZIP
3. Değişiklik listesi
4. Otomatik test sonuçları ve çalıştırılamayan testler
5. Samsung S23 / Android 16 fiziksel telefon test listesi
6. Veri göçü ve geri alma notu
7. Sonraki GPT/geliştirici için güncel devir dosyası

bulunmalıdır.

İmza anahtarı, parola, service-role anahtarı veya başka bir gizli bilgi kaynak ZIP'e, Git'e ya da aktarım belgelerine eklenmez.

---

## 9. TEK CÜMLELİK ÇALIŞMA TALİMATI

0.12.1'in çalışan iş kurallarını koru; Revizyon 9'u sürüm planı, final tasarım ZIP'ini görsel ve ekran kapsamı, bu belgeyi ise son çelişki çözme ve ürün kararı kaynağı olarak kullan; önce doğrula, sonra küçük kabul adımlarıyla uygula ve her tamamlanma iddiasını test kanıtıyla destekle.
