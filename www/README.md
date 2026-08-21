# FitTrack Beta 0.11.4

Beta 0.11.4 salon yöneticisi deneyimini üyeler, program atamaları ve üye ilerlemesi etrafında düzenler; Program Oluşturucu’daki kayıp veri risklerini giderir ve mevcut 0.11.3 Android görsel kimliğini korur.

## Ürün kapsamı

- Salon yöneticisinin ana ekranı canlı antrenman yapan, bu hafta aktif olan ve takip gerektiren üyeleri gösterir.
- Yönetici alt navigasyonunda “Antrenman” yerine “Programlar” bulunur; yönetici kendi antrenmanını başlatmaz.
- İlerleme ekranı üye bazında toplam süre, hareket süresi, set, tekrar ve kilo kayıtlarını açar. Hareket süresi yalnız 0.11.4 ve sonrasında kaydedilen oturumlarda bulunur.
- Üyenin atanan programı uygulayıp uygulamadığı ve programı hangi PT’nin atadığı görünür.
- Yönetici salona özel hareket ekleyebilir, özel hareketi onayla silebilir ve silmeyi geri alabilir. FitTrack’in 36 temel hareketi silinemez.
- Bütün temel hareketlerin uygulamayla paketlenen GIF gösterimi vardır.
- Yönetici profilinde yalnız ad ve soyad düzenlenir; tema ve bildirim ayarları korunur.
- Dört yeni premium tema (`Graphite`, `Porcelain`, `Aurora`, `Plum`) ve yerel Inter Variable font eklendi.
- Program Oluşturucu hareket seçimi geçici çalışır; `Seçimi uygula` değişikliği işler, `Vazgeç` eski listeyi korur.
- Kaydetmeden çıkış uyarısı, otomatik taslak kurtarma, gün/program/hareket silme onayı ve geri alma davranışları eklendi.
- Yayınlanmış programın yeni revizyonunda mevcut üye atamaları açık seçimle yeni sürüme taşınır veya eski sürümde bırakılır.
- Genel üye takip notu, programa özel atama notundan ayrıdır.
- Geçici Supabase/bootstrap sorunları yerel oturumu giriş ekranına atmaz; native auth istemcisi eski URL oturumlarını yorumlamaz.

## Bulut ve veri modeli

Yerel veri şeması `14`, kalıcı anahtar `fittrack-beta-010-state` değeridir. Anahtar eski kurulum verisini korumak için değişmez.

`supabase/fittrack_beta_0114_gym_exercises.sql`:

- RLS korumalı salon hareket kütüphanesini ekler.
- Program atama notundan ayrı, yalnız yetkili salon personelinin erişebildiği genel üye takip notlarını ekler.

Migration uygulanmadan uygulama yerel hareket/not kullanımını sürdürür; ilgili bulut yazmaları çevrimdışı kuyrukta kalabilir. Service-role anahtarı istemciye konmaz.

## Test ve sürüm

Kök dizinde `pnpm cap:sync` sonrasında `pnpm test` çalıştırılır. Doğrulama; kaynak hash’lerini, 36 GIF’i, sürüm tutarlılığını, Program Oluşturucu güvenlik işaretlerini, rol yönlendirmelerini, RLS migration’ını ve Android kimlik kaynaklarını kontrol eder.

Android paketi: `versionName 0.11.4`, `versionCode 21`, minimum API 24, hedef API 36.
