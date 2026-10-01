# FitTrack 0.15 — final ana sayfa revizyonu

## Kimlik
- Kullanıcıya görünen sürüm ve Android versionName: **0.15**.
- Android versionCode: **38**; paket com.fittracklabs.mobile; veri şeması 15.
- npm package sürümü semver gereği 0.15.0. Bu, önceki hatalı 0.15.0 APK değildir; kod 38 final teslimidir.

## Yapılanlar
- İlk referanstaki haftalık takip kartı, üçlü hızlı istatistik (antrenman/süre/set) ve son antrenman satırı uygulandı.
- İkinci referanstaki yatay program kartları korundu; fotoğraf alanı kısaldı, uzun başlıklar iki satırda sınırlandı. Tam ad detay ekranındadır.
- Tamamlanan gün yeşil tik; yalnız yarım kayıt bulunan gün sarı ½; kayıtsız gün nötr. Aynı gün tam ve yarım kayıt varsa gün yeşil, yarım kayıt sayısı altta ayrıca görünür.
- Haftalık istatistikler yalnız tamamlanan, gerçek, bu haftaki kayıtları sayar. Yarım ve demo kayıtlar başarı sayısını artırmaz.
- Son antrenman tarih/saat sırasındaki en son gerçek kaydı açar. Mesajlaşma üstteki düğmede korunur.
- Kırmızı ana vurgu tutarlı; diğer üç tema korunur. Durum renkleri temadan bağımsız yeşil/sarıdır.

## Değiştirilen ana dosyalar
app.js, member-ui.css, design-system.css; config/index/manifest/package/cache ve Android sürüm adı; ilgili test beklentileri ve browser-0151.cjs.

## Doğrulama
- 26/26 otomatik test grubu geçti; 23/23 gerçek Chromium kontrolü geçti. Yeni kontrol dört temada durum renklerini, yarım kayıtların sayılmamasını, set sayısını ve son kaydın açılmasını doğrular.
- Kanonik web kaynakları www ve Android varlıklarına aktarıldı.
- APK: önceki doğrulanmış native APK üzerinde yalnız web ve sürüm adı güncellemesi. Yeni Gradle derlemesi yapılmadı; native payload korundu.
- Resmi apksigner V1/V2/V3 ve 16 KB zipalign doğrulaması başarılı. Aynı beta sertifikası.
- Fiziksel telefon testi bekliyor. Ekran görüntüleri temsili yerel verili gerçek tarayıcıdır.
- Bu işlemde bağımlılık güncellemesi/audit, canlı veritabanı işlemi veya GitHub push/merge yapılmadı.

## Telefon testi
1. Eski kurulumu silmeden APK'yı üstüne kur; oturum/geçmiş korunmalı.
2. Kartları kaydır: yalnız şerit kaymalı; haftalık takip ve alt menü yana gitmemeli.
3. Tamamlanan gün yeşil, yarım kalan sarı olmalı. Bugünün çerçevesi de durum rengini korumalı.
4. Üç istatistiği ve Son antrenmanın satırını açmayı dene.
5. Büyük yazı ve ekran döndürmede içerik taşmamalı; dört tema değişmeli.

## Kaynak aktarımı
Kaynak ZIP'i Git reposu üzerine körlemesine kopyalama. Yamalar klasöründeki iki yama sırayla temiz 73e02c0 bazına yöneliktir: önce 01, sonra 02; her birinde git apply --check yapılmalı. Sonra npm ci, build:web, test ve Android sync/build gerekir. 01 zaten uygulandıysa yalnız 02 kullanılmalı. Tam kaynak ZIP güncel final koddur. İmzalama anahtarı/parola pakette bulunmaz.
