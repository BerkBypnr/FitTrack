# FitTrack Beta 0.10 — Sürüm Notları

Beta 0.10'un odağı hesaplar ve güvenli buluttur. 0.9.1'de doğrulanan antrenman motoru, geçmiş, Program Stüdyosu, yerel bildirimler, temalar ve Android kurulum hizalama düzeltmesi korunur.

## Eklenenler

- Supabase Auth kayıt/giriş ve hesap yönetimi
- Salon yöneticisi, antrenör ve üye rolleri
- Süre/kullanım sınırlı salon davet kodu
- Hesaba özel yerel veri ve eski veriyi tek hesaba taşıma
- Program, atama, not, snapshot ve antrenman bulut senkronizasyonu
- Çevrimdışı işlem kuyruğu, idempotent kayıt ve snapshot çakışma çözümü
- Realtime yenileme, bulut dışa aktarma ve tüm cihazlardan çıkış
- JWT doğrulamalı kalıcı hesap silme
- Salonlar arası veri ayrımı için tüm tablolarda RLS

## Android

- `versionName 0.10.1`, `versionCode 12`
- Üye davet RPC'sindeki `gym_id` belirsizliği giderildi; mevcut davet kodları korunur.
- E-posta doğrulama ve parola kurtarma deep-link'i Android uygulamasında yakalanır.
- Parola kurtarma bağlantısı için uygulama içi yeni şifre ekranı eklendi.
- Paket kimliği ve beta imza sertifikası değişmedi
- Android 16 / API 36 hedefi korundu
- `com.fittracklabs.mobile://auth-callback` intent-filter eklendi
- APK v2/v3 imzası, ZIP yapısı, 4/4096 bayt hizalama, manifest ve bulut varlıkları otomatik doğrulanır

## Güvenlik notu

Yayımlanabilir Supabase anahtarı uygulamada bulunabilir; erişim yetkisi vermez. Yetki RLS, salon üyeliği ve güvenli RPC kontrolleriyle belirlenir. Service-role anahtarı APK veya kaynak `config.js` içinde yer almaz.
