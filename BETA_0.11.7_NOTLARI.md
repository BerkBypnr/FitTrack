# FitTrack Beta 0.11.7 — Üye ekranları ve Başarıların

Tarih: 9 Eylül 2026. Önceki sürüm: 0.11.6 tema paketi / 23. Yeni sürüm: 0.11.7 / 24.
Paket: `com.fittracklabs.mobile`. Yerel şema: 14 (değişmedi).

## Kullanıcıya görünen değişiklikler

- Üye ana sayfası kişisel karşılama, büyük program kartı, set ilerlemesi, aktif
  antrenmanda geçen süre, başla/devam et/incele, haftalık devamlılık ve antrenör
  mesaj kısayoluyla yenilendi. Program atanmamış hesapta program uydurulmaz.
- Birden fazla atamaya Antrenmanlarım üzerinden erişilir. Ataması kaldırılmış
  yarım antrenman, kayıtlı snapshot üzerinden bitirilebilir veya iptal edilebilir.
- Aktif antrenmanın üstünde program/gün adı, sayaç ve ilerleme çubuğu bulunur.
  Hareket X / Y ve Set X / Y bilgileri 20 px, belirgin kalınlıkta gösterilir.
- Hareket görseli büyük gösterilir; ek oynat, açı veya döndür kontrolleri yoktur.
  GIF kaynağı varsa kendiliğinden oynar; mevcut görsel arşivi değiştirilmedi.
- Hedef tekrar ve set türü ayrı kartlardır. Dinlenme metni bu alandan çıkarıldı;
  set sonrasındaki mevcut dinlenme ekranı ve zamanlayıcı aynen devam eder.
- Nasıl yapılır? ilk açılışta kapalıdır. Uzun adımlar kendi alanında kayabilir.
  Mevcut antrenör notu ayrı açılır alanda korunur.
- Ağırlık/gerçekleşen tekrar ve Seti tamamla alanı ekranın altına yerleştirildi.
  Orta içerik bağımsız kayar. Klavye için görünür yükseklik izlenir; çok kısa
  alanda giriş kartı da kayabilir, tamamlama düğmesi ayrı satırda kalır.
  Önceki değerleri kullanma, seti düzenleme ve isteğe bağlı kayıt korunur.
- İlerleme ekranının sonuna Başarıların eklendi. Mevcut filtre, süre grafiği,
  hareket gelişimi ve geçmiş bölümleri değiştirilmedi.

## Rozet kuralları

| Rozet | Koşul |
|---|---|
| İlk adım | 1 tam antrenman |
| İlk 10 antrenman | 10 tam antrenman |
| 25 antrenman | 25 tam antrenman |
| 50 antrenman | 50 tam antrenman |
| 100 antrenman | 100 tam antrenman |
| 4 hafta devamlılık | Ardışık 4 haftanın her birinde en az 1 tam antrenman |
| 8 hafta devamlılık | Ardışık 8 haftanın her birinde en az 1 tam antrenman |

Yarım, iptal, demo, boş, geleceğe tarihli ve yinelenen kayıtlar ödül oluşturmaz.
Hafta pazartesi başlar; aynı haftadaki birden fazla antrenman tek aktif haftadır.
En uzun kayıtlı seri kullanılır. Hesap değişince veriler ayrıdır. Rozetler geçmişten
hesaplanır; sunucuda kalıcı ödül kaydı oluşturulmaz. Mevcut 200 geçmiş kaydı sınırı
nedeniyle çok eski bir seri zamanla hesap dışında kalabilir.

## Korunan kapsam

Volt Discipline, Crimson Graphite, Plum Night, Redline Editorial, Rosewood Strength,
Sage Motion paletleri ve seçimleri korundu. `styles.css`, orijinal marka görselleri,
native davranışlar, antrenör ekranları ve `cloud.js` değişmedi. Yeni `member-ui.css`
mevcut renk değişkenlerini kullanır; genel antrenör sınıflarını hedeflemez.

Supabase/RLS/migration/Auth/Edge Function ve yerel veri şeması değişmedi. Normal
giriş e-posta + şifre; ilk kayıt doğrulaması e-posta kodu olarak devam eder.

## Doğrulama ve sınırlar

14 test grubunun tamamı, bunların içinde yeni üye arayüzüne özel 30 kontrol geçti.
Bu kontroller VM, DOM modeli, CSS ayrıştırma, statik native kontroller ve PGlite
kullanır. Gerçek tarayıcı, SMTP, iki cihaz senkronizasyonu veya telefon testi değildir.

Chromium indirmesi ağ hatalarıyla tamamlanamadı; yönetilen tarayıcı yerel önizleme
erişimi güvenlik denetimince reddedildi. Gerçek ekran taşması/klavye/GIF ve Android
geri davranışı telefonda kontrol edilmelidir. APK ve kaynak paketinin imza/derleme
sonuçları teslim devir raporunda ve `test-results/` dizinindedir.

Sonraki güncelleme antrenör arayüzüne ayrılacak. Yeni renk paleti, 3D oynatıcı,
randevu takvimi veya ilerleme sayfasını baştan tasarlama bu sürümde yapılmadı.
