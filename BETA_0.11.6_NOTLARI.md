# FitTrack Beta 0.11.6 — Giriş akışı düzeltmesi

Önceki teslim: **0.11.4 / versionCode 21**. Yeni teslim: **0.11.6 / versionCode 23**.
0.11.5 yayımlanmadı; sürüm adı Berk'in talimatıyla 0.11.6 seçildi. Yerel veri şeması 14.

## Neden gerekliydi?

Kullanıcının “e-postaya link yerine kod” isteği **ilk kayıt e-posta doğrulaması**
içindi. 0.11.4'te bu istek yanlış yorumlanarak normal giriş şifresiz OTP yapılmıştı.
0.11.6 normal girişte e-posta + şifreyi geri getirir.

## Yapılan değişiklikler

- Girişte tek şifre alanı ve Giriş yap düğmesi; `signInWithPassword` kullanılır.
  Yanlış şifrede e-posta koduna geçilmez ve yeni hesap açılmaz. Eski kısa şifreler
  sunucuya olduğu gibi iletilir; girişe yeni kayıt uzunluk kuralı uygulanmaz.
- Kayıtta şifre/tekrar/izin kontrolü ve e-posta doğrulama kodu korunur. Kod başka
  cihazdan okunarak uygulamaya girilebilir. Sonraki girişlerde şifre yeterlidir.
- Doğrulanmamış kayıt, doğru şifreli girişten kayıt kod ekranına döner. Önceki
  kod kullanılabilir; yeniden gönderme yalnız kullanıcının düğmesine basmasıyla olur.
- Kod ekranındaki “Giriş kodunu yaz” metni kayıt doğrulamasını açıkça belirtir.
  Girişe dön düğmesi şifre formunu açar. Kopyalanan kodun boşlukları temizlenir,
  baştaki sıfırlar ve kodun tüm rakamları korunur.
- Şifremi unuttum akışı yalnız seçildiğinde kurtarma kodu ister; iki yeni şifre
  eşleşmeden parola güncellenmez. Açık oturum saklama/yenileme anahtarı aynıdır.
- Supabase ayar betiği kayıt ve kurtarma şablonları ile `mailer_otp_length:6`
  alanını hazırlar. Magic Link değiştirilmez, uygulamada `signInWithOtp` kullanılmaz.
- Sürüm, önbellek, Android metadata ve test beklentileri 0.11.6/23 olarak eşitlendi.
  Yeni Auth test grubu ve güncellenmiş kurulum/devir belgeleri eklendi.

## Kodun uzunluğu ve kalan kurulum

**5 hane Supabase tarafından desteklenmiyor; desteklenen en kısa kod 6 hane.**
Canlı sunucuda uzunluk ayarı bu ortamda değiştirilemedi. Panelde Email OTP Length
alanı 6 yapılıp kaydedilmeli. Uygulama geçiş sırasında mevcut uzun kodları kesmez;
6–10 rakamı sunucuya eksiksiz iletir. Kodlu kayıt şablonunun da panelde kaydedilmiş
olması gerekir. Ayrıntı: `docs/KODLU_GIRIS_KURULUMU.md`.

Yeni migration, RLS, veritabanı veri değişikliği, Edge Function dağıtımı veya
SMTP değişikliği yok. 0.11.4'te uygulanmış migration tekrar çalıştırılmamalı.
0.11.4'ün antrenman/oluşturucu/senkronizasyon düzeltmeleri aynen devralındı.

## Test durumu

`npm test` 12 gruptur. Auth için 30 senaryo, önceki 50 genel davranış senaryosu,
19 hotfix senaryosu, 26 PostgreSQL kontrolü ve sekiz eski statik/runtime grubu
çalışır. Güncel sonuçlar `test-results/` altındadır. Auth testleri VM/DOM ve sahte
Supabase yanıtları kullanır; gerçek e-posta veya telefon testi değildir.
İlk turda eski sürümü bekleyen bir statik kontrol güncellendi; son turda tüm
gruplar geçti. APK imza/manifest/içerik kontrolleri ayrıca devirde raporlanır.

Fiziksel telefon, gerçek e-posta ve yeni kod uzunluğu kabulü Berk/Alper tarafından
uygulanmalıdır. Açık/koyu tema ve klavye görüntüsü gerçek cihazda ayrıca kontrol edilir.

[Supabase kod uzunluğu sınırı](https://supabase.com/docs/guides/local-development/cli/config#auth.email.otp_length).
