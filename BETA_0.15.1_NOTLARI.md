# FitTrack 0.15.1 — ana sayfa taşması ve kırmızı tema

Sürüm 0.15.1 / versionCode 38 / şema 15.

- Beş program olduğunda bütün sayfanın yana genişlemesine yol açan grid minimum genişliği düzeltildi.
- Program kartları kendi şeridinde dokunarak kayar ve kart başında durur; haftalık özet, başlık ve alt menü ekran içinde kalır.
- Koyu kırmızı temada pembe ana vurgu kaldırıldı. Ana vurgu, avatar, takvim ve birincil düğmeler ortak kırmızı tokenını kullanır. Diğer üç temanın paleti değişmedi.
- Program seçimi, aktif antrenman, kayıtlar, hesap ve veritabanı davranışı değiştirilmedi.

26 otomatik test grubu ve 22 gerçek Chromium kontrolü geçti. Fiziksel telefon kabulü bekliyor.

APK üretimi: doğrulanmış 0.15.0 Gradle buildine web-only hotfix; yeni native/Gradle buildi değil. Native DEX korunur; versionCode 38 ve mevcut imza ile güncelleme kurulur.
