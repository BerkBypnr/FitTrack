# 0.11.6 — Kayıtta kod doğrulaması, normal girişte şifre

Bu belge 0.11.4'teki “her girişte e-posta kodu” talimatının yerini alır.
Berk'in istediği akış: kayıt → iki eşleşen şifre → e-postadaki doğrulama kodu.
Doğrulama sonrasındaki normal girişler e-posta + şifreyle yapılır.
E-postayı başka cihazda açıp kodu FitTrack'in kurulu olduğu telefona yazmak yeterlidir.

## Uygulama akışları

| İşlem | İstemci çağrısı | Beklenen sonuç |
| --- | --- | --- |
| Normal giriş | `signInWithPassword({ email, password })` | Doğru şifrede oturum; e-posta gönderilmez |
| Yeni kayıt | `signUp({ email, password, options })` | Confirm email açıkken oturum verilmez, kayıt doğrulama e-postası gönderilir |
| Kayıt kodunu doğrula | `verifyOtp({ email, token, type: 'email' })` | Geçerli kodla kayıt doğrulanır ve oturum açılır |
| Kayıt kodunu yeniden gönder | `resend({ type: 'signup', email, options })` | Yalnız kayıt doğrulama e-postası; yeni kullanıcı oluşturmaz |
| Yarım kalmış kayıt | Şifreli giriş `email_not_confirmed` döner | Önceki kodu girme veya açıkça yeniden gönderme ekranı; otomatik yeni e-posta yok |
| Şifremi unuttum | `resetPasswordForEmail` → `verifyOtp(type: 'recovery')` → `updateUser` | Kullanıcı bu seçeneğe dokunduğunda kodla kurtarma ve iki eşleşen yeni şifre |

Ürün kodunda `signInWithOtp` çağrısı yoktur. Magic Link şablonunun içeriği
normal giriş davranışını değiştirmez. Önceki talimatla değiştirdiyseniz geri
almanız bu düzeltmenin çalışması için gerekli değildir.

## Kalan Supabase panel ayarları

Proje: `eznxeqraejmwfpwcuxxc`.

1. Authentication → Sign In / Providers → Email altında **Confirm email açık**
   kalsın. Salt okunur `/auth/v1/settings` kontrolünde `mailer_autoconfirm:false`,
   `disable_signup:false` ve e-posta sağlayıcısı açık görüldü.
2. Aynı Email bölümünde **Email OTP Length / OTP length = 6** ayarlayıp kaydedin.
   Supabase 6–10 hane destekler; kullanıcının istediği 5 hane mevcut sağlayıcıda
   desteklenmiyor. `{{ .Token }}` içinden rakam kesmek doğrulamayı bozar.
3. Authentication → Emails / Templates alanında aşağıdaki iki şablonu kontrol edin.
   Daha önce kod içerecek şekilde kaydettiyseniz yeniden değiştirmeniz gerekmez.

| Şablon | Kaynak dosya | Konu |
| --- | --- | --- |
| Confirm signup | `supabase/templates/confirmation.html` | FitTrack e-posta doğrulama kodun |
| Reset Password | `supabase/templates/recovery.html` | FitTrack şifre yenileme kodun |

İçeriği ilgili HTML dosyasıyla değiştirip her şablonu kaydedin. `{{ .Token }}`
aynen kalmalıdır; bağlantı veya token kısaltması eklemeyin. Bu sürümün kurulum
betiği **Magic Link şablonuna dokunmaz**.

**Canlı şablonlar ve kod uzunluğu bu çalışma sırasında değiştirilmedi veya
doğrulanmadı.** Erişilebilir bağlantı veritabanını yönetebiliyor, bu Auth ayarını
yazan yönetim işlemi sunmuyor. Panel oturumu beklenerek geliştirme durdurulmadı.
Mevcut kod uzunluğu panelden 6 yapılana kadar uzun gelebilir. Yeni APK geçişte
önceden gönderilmiş 6–10 haneli tam kodları da kabul eder; baştaki sıfırı korur.
Bu tolerans kodu kısaltmaz veya sunucudaki doğrulamayı gevşetmez.

## Yönetim API'si ile aynı ayarı uygulama

```sh
python3 scripts/configure_auth_templates.py
# İlk komut yalnız uygulanacak beş alanı gösterir; ağa yazmaz.
# SUPABASE_ACCESS_TOKEN güvenli ortam değişkeninde tanımlandıktan sonra:
python3 scripts/configure_auth_templates.py --apply
```

Betik `mailer_otp_length:6` ve iki şablonun konu/içerik alanlarını değiştirir.
Önceki beş değeri `out/` içinde yedekler, e-posta doğrulamasının açık olduğunu
kontrol eder, yazdıktan sonra tekrar okuyup eşitliği doğrular. SMTP parolası,
yönetim tokenı veya diğer Auth ayarları çıktıya/yedeğe konulmaz. Betik bu ortamda
yalnız önizleme modunda çalıştırıldı; canlıya uygulanmadı.

## Telefon kabul testi

1. 0.11.6'yı mevcut eski beta imzalı uygulamanın üzerine kur. Açık oturum sürmeli.
2. Çıkış yapıp e-posta + şifreyle gir. E-posta bekletmeden giriş olmalı. Yanlış
   şifre oturum açmamalı ve e-posta göndermemeli.
3. Kendi test adresinle yeni kayıt oluştur. Farklı şifre tekrarı reddedilmeli.
   Doğru kayıtta **6 haneli** e-posta kodunu başka cihazdan okuyup telefona yaz.
4. Bu hesapta çıkış/giriş yap. Yeni doğrulama kodu istenmemeli.
5. Başka bir test kaydını doğrulamadan kapat/aç. E-posta ve doğru şifreyle giriş
   denemesi kayıt doğrulamasına götürmeli; gerekirse yeni kod iste.
6. Hatalı/eskimiş/tekrar kullanılan kodu, yeniden gönderme sınırını ve açıkça
   seçilen Şifremi unuttum akışını dene.

Gerçek posta teslimatı, kodun sunucuda tek kullanım garantisi ve telefon davranışı
bu ortamda test edilmedi. `tests/auth-0116.cjs` gerçek uygulama işleyicilerini test
çiftleriyle çalıştırır; bu kontrollerin yerine geçtiği iddia edilmez.

Resmî kaynaklar:
[Şifreyle giriş](https://supabase.com/docs/reference/javascript/auth-signinwithpassword),
[Kayıt](https://supabase.com/docs/reference/javascript/auth-signup),
[Kod doğrulama](https://supabase.com/docs/reference/javascript/auth-verifyotp),
[Kod uzunluğu sınırı](https://supabase.com/docs/guides/local-development/cli/config#auth.email.otp_length),
[E-posta şablonları](https://supabase.com/docs/guides/auth/auth-email-templates).
