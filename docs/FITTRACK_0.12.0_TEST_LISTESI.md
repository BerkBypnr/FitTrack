> TARİHSEL ARA ÇALIŞMA. Güncel durum: `FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md`.

# FitTrack 0.12.0 — test ve kabul listesi

11 Eylül 2026. Mevcut teslim **UI hazırlığıdır**; 0.12.0 APK henüz yoktur.
Bu listede “bekliyor” yazan hiçbir senaryo geçti sayılmamıştır.

## Durum

| Doğrulama | Sonuç |
| --- | --- |
| Kullanıcının 0.11.9 telefon kabulü | Berk sorunsuz çalıştığını bildirdi |
| Güncel kaynak yerel regresyonu | 17/17 grup PASS; Node v24.19.0 |
| Yeni antrenör UI davranışları | 10/10 yerel VM/DOM kontrolü PASS |
| Tema kontrastı | Mevcut altı palet metin/buton kontrolleri PASS |
| Yeni kaynak temiz npm kurulumu | Bu ara çalışmada yapılmadı; mevcut modüller kullanıldı |
| Tarayıcı görsel kabulü | Bekliyor |
| Standart Android derlemesi / APK imzası | Bekliyor; araç edinmenin ağ onayı iptal edildi |
| 0.12.0 telefon / canlı iki hesap testi | Bekliyor |
| Uzak CI | Bekliyor |

## Yerelde geçen yeni kontroller

1. Ana sayfada en çok üç öncelik; tümüne geçince hiçbir üyenin kaybolmaması.
2. Programsız üye ile ataması olup programı henüz yüklenmemiş üyenin ayrılması.
3. Bugünkü yarım antrenmanın aktivite sayılması; gelecek tarihli kaydın güncel
   aktivite veya bugünkü kayıt üretmemesi.
4. Yalnız bu antrenöre gelen okunmamış mesajın öncelik üretmesi.
5. Türkçe arama ile Programsız filtresinin birleşmesi; kaydın değişmemesi.
6. Program ata kısayolunun yalnız atama formunu açması.
7. Boş antrenör listesinin örnek kişi/program/istatistik üretmemesi.
8. Üye ve program adlarının HTML öğesi olarak çalıştırılmadan metin gösterilmesi.
9. Üyenin kendi ana sayfasında kalması; yeni trainer kısayollarının üyeye açılmaması.
10. Paylaşılan Redline tokenları, CSS ayrıştırması ve altı temada rol ayrılığı.

Bu kontroller VM, DOM modeli ve CSS kaynağı kullanır; gerçek tarayıcı değildir.
Kaynak kökünde `node scripts/test.cjs`; yeni grup için
`node tests/trainer-ui-0120.cjs`. Kanıt `test-results/suites.json` ve grup logları.
İlk toplu koşudaki bir eski CSS sınıfı beklentisi düzeltildi; ilk sonuç saklandı.

## APK üretilmeden önce geliştirici kapısı

- [ ] Standart Gradle/Capacitor kaynağı ve kilitli araç sürümleri tamamlandı.
- [ ] UI referanslarının 03–05 ekranları ve antrenör gezinmesi tamamlandı.
- [ ] Kaynak/web/native/config/cache kimlikleri birlikte 0.12.0 oldu.
- [ ] `versionCode > 26`; paket `com.fittracklabs.mobile`.
- [ ] Özgün beta sertifikası, imza doğrulayıcıyla doğrulandı.
- [ ] APK web dosyaları teslim edilen kanonik kaynakla byte-byte eşleşti.
- [ ] Temiz kaynak kurulumu ve derlemesi tekrar üretildi; güncel testler geçti.
- [ ] APK, source ZIP, devir ve bu liste aynı sürümü anlatıyor; SHA-256 yazıldı.

Beklenen sertifika SHA-256:
`38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE`

## Telefon / tarayıcı kabulü — yeni APK hazır olduğunda

Her satır başlangıçta **BEKLİYOR**. Yeni APK oluşmadan eski APK üzerinde yapılan
deneme bu sürümün testi diye kaydedilmez. Hedef cihaz: Samsung S23 / Android 16;
başka cihaz kullanılırsa model, Android sürümü ve WebView sürümü ayrıca yazılır.

| ID | Adımlar | Beklenen sonuç |
| --- | --- | --- |
| T01 Yükseltme | 0.11.9'da hesap, salon, tema, geçmiş ve atanmış programları kaydet. Uygulamayı kaldırmadan 0.12.0 üzerine kur. | Kimlik/oturum/veriler korunur; sürüm 0.12.0 görünür. |
| T02 Aktif kayıt | Kilo/tekrar girilmiş yarım antrenmanla yükselt; kapat/aç, arka plana al/dön. | Aynı program/gün/hareket/set ve girilmiş değerler korunur. |
| T03 Açıklama kaydırma | Uzun Nasıl yapılır? ve antrenör notunun üzerinden kaydır; büyük yazı ayarında tekrarla. | Açıklamalar açık başlar, tek ana kaydırıcı hareket eder; kilo/tekrara ulaşılır; yalnız tamamla düğmesi sabit. |
| T04 Klavye | Kilo ve tekrar alanlarını klavye açıkken düzenle, adımlayıcıları kullan, set tamamla. | Giriş ve tamamlama erişilebilir; alanlar kaybolmaz; klavye yanlış katmanı kapatmaz. |
| T05 Sistem geri | Antrenmanda geri → Hayır; programdan hareket detayını aç → geri; kökte geri. | Antrenman değerleri korunur; aynı program detayına dönülür; bir hareket iki kez işlenmez, mevcut kök davranışı korunur. |
| T06 Tema | Altı temayı üye ve antrenör hesaplarında gez; yeniden başlat. | Seçim korunur; Redline kırmızı/beyaz düğmeli; kart ve yazı okunur; üye antrenman yerleşimi korunur. |
| T07 Öncelik özeti | En az beş farklı nedenli test üyesi oluştur; ana sayfayı ve tüm öncelikleri aç. | Ana sayfada en çok üç kart; tümünde tüm eşleşenler; her kartta gerçek neden; kendi antrenör kaydı sayılmaz. |
| T08 Filtre/arama | Tümü/Öncelikli/Programsız değiştir; “İlker” için “ilker” ara; boş sonuç dene. | Doğru birleşik sonuç, açık boş durum; yeni arama kayıtları değiştirmez. |
| T09 Kayıt anlamı | Bugün yarım antrenman, en az 7 günlük kayıt, henüz yüklenmemiş program ve yeni üye ile dene. | Yarım kayıt aktivitedir; programsız ile bekleyen program ayrılır; salona gelmedi/program tamamlandı gibi veri dışı iddia yoktur. |
| T10 Kart eylemleri | Üyeyi aç, Program ata, Mesaj/Yanıtla düğmelerine bas. | Doğru üye/sohbet açılır. Program ata yalnız formu açar, seçim/onay olmadan atama yapmaz. |
| T11 Çoklu program | Bir üyeye birden çok program ata; üye hesabında listele ve birini başlat. | Tüm atamalar erişilebilir; üç adet sınırı yok; başlayan antrenmanın snapshot'ı korunur. |
| T12 Stüdyo | Taslak oluştur, gün/hareket/set düzenle, geri al; çıkıştan vazgeç; uygulamayı yeniden aç. | Taslak ve işlemler doğru hesap/salonda korunur; kaydetmeden çıkış koruması çalışır. |
| T13 JSON paylaşım | Yedek dışa aktar; sistem paylaşım ekranından kaydet/aç. | Gerçek JSON dosyası paylaşılır; hata sahte başarı üretmez; dosya içeriği beklenen kullanıcı verisidir. |
| T14 Bildirim | İzni reddet/kabul et; kesin alarm ayarını değiştir; gün/saat ayarla; yeniden başlat. | Reddedilmiş izinle planlandı denmez; doğru gün/saat, tekrar ve bildirim açılışı çalışır. |
| T15 Auth | Test hesabıyla normal şifreli giriş; yeni hesapta iki şifre/kod; açık kurtarma; uygulama açık/kapalı auth dönüşü. | Normal giriş kodlu moda dönüşmez; uygun akış bir kez tamamlanır; oturum yanlış hesaba taşınmaz. |
| T16 İki hesap / salon | Antrenör A, üye B ve ikinci salonla mesaj/program/tema/geçmiş değiştir. | Yalnız yetkili veriler görünür; başka alıcının mesajı veya başka salonun kuyruğu görünmez. |
| T17 Çevrimdışı | Atama/mesaj/geçmiş işlemlerini offline yap; yeniden aç; bağlantıyı getir. | Doğru hesap/salon kuyruğu tekilleştirilir; silinmiş antrenman geri gelmez; geciken veri yeniymiş gibi gösterilmez. |
| T18 Duyarlı görünüm | 390, 1024, 1440 genişlik; 320 dar ekran; büyük yazı; uzun isim/not. | Yatay taşma, kesilen eylem veya okunmayan durum yok; gerçek render ekran görüntüsü saklanır. |
| T19 Üye regresyonu | Üye ana sayfası, tüm programlar, ilerleme, geçmiş düzenleme, rozetler, özet ve iptali dene. | 0.11.9'da kabul edilen akışlar ve kayıt tutarlılığı korunur. |

İzinli test hesaplarıyla çalışın; mevcut telefon uygulamasını kaldırmayın veya
verisini temizlemeyin. İmza uyuşmazlığını kaldırıp yükleyerek geçiştirmeyin.

## Berk/Alper sonuç kayıt biçimi

Her senaryo için aşağıdakini doldurun; token, parola veya özel anahtar eklemeyin:

```text
APK dosyası ve SHA-256:
Uygulama sürümü / versionCode:
Cihaz / Android / WebView:
Önceki sürüm üzerine kurulum: Evet / Hayır
Hesap rolü / ağ durumu / tema:
Senaryo ID:
Sonuç: GEÇTİ / KALDI / DENENMEDİ
Tekrarlama adımları:
Beklenen / görülen:
Ekran görüntüsü veya video:
```

Bir kritik veri/oturum kaybı, yanlış hesap görünümü veya imza uyuşmazlığı varsa
yeni sürümü kabul edildi saymayın. Kanıtı kaydedip son devir raporunda açık bırakın.
