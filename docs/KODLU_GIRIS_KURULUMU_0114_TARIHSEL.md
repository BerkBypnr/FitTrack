> TARİHSEL BELGE: 0.11.4 durumunu anlatır. Normal girişte OTP ve üç şablon talimatı 0.11.6 ile kaldırıldı. Güncel kurulum için `docs/KODLU_GIRIS_KURULUMU.md` ve yeni devir raporunu esas alın.

# 0.11.4 kodlu giriş: kalan sunucu kurulumu

Uygulama `signInWithOtp` + `verifyOtp` kullanır. Supabase'in varsayılan Magic Link
şablonu bırakılırsa e-postada hâlâ bağlantı görünür. Bu bir APK değişikliğiyle tek
başına çözülemez. Bu teslimde üç şablon dosyası hazırlandı; yönetim ekranı girişi
sağlanamadığı için canlı şablonların değiştiği iddia edilmiyor.

Mevcut Supabase projesinin Authentication → Emails → Templates bölümünde:

| Şablon | Kaynak dosya | Konu |
| --- | --- | --- |
| Confirm signup | `supabase/templates/confirmation.html` | FitTrack e-posta doğrulama kodun |
| Magic Link | `supabase/templates/magic_link.html` | FitTrack giriş kodun |
| Reset Password | `supabase/templates/recovery.html` | FitTrack şifre yenileme kodun |

Her şablonun içeriğini ilgili HTML dosyasıyla değiştirip kaydedin. İçindeki
`{{ .Token }}` aynen kalmalıdır. `{{ .ConfirmationURL }}` ve giriş bağlantısı kullanılmaz.
E-posta doğrulaması açık kalsın. SMTP ve ücretli plan ayarları bu işlemde değişmez.

Yönetim API erişimi olan Alper için aynı işi yapan betik:

```sh
python3 scripts/configure_auth_templates.py
# İlk komut sadece değişecek şablonları gösterir.
# SUPABASE_ACCESS_TOKEN güvenli ortam değişkeni olarak tanımlandıktan sonra:
python3 scripts/configure_auth_templates.py --apply
```

Betik yalnız üç şablon/konu alanını değiştirir, önceki değerleri yerel `out/` altında
saklar ve yeni değerleri tekrar okuyarak doğrular. SMTP parolası veya yönetim tokenı
çıktıya yazılmaz. `service_role` anahtarı yerine Supabase Management API erişimi gerekir.
Bu betik canlı sunucuya karşı bu ortamda çalıştırılmadı.

Sonrasında telefonda kendi hesabınızla giriş, kayıt ve şifre yenileme e-postalarını
ayrı ayrı kontrol edin: bağlantı yerine 6–8 rakamlı kod; hatalı/süresi dolmuş kod;
yeniden gönderme; bir kez kullanılan kodun tekrar reddi. Gerçek SMTP teslimatı ve
sağlayıcı hız sınırları otomatik model testlerinin kapsamı dışındadır.

Resmî kaynaklar:
[Supabase e-posta OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless),
[e-posta şablonları](https://supabase.com/docs/guides/auth/auth-email-templates),
[Management API](https://supabase.com/docs/reference/api/v1-update-auth-service-config).
