# FitTrack doğrulama

`npm ci --ignore-scripts` ardından `npm test`.
Güncel koşu 20 grup içerir. Raporlar `test-results/` altında.
`hotfix-0122.cjs`: profil taslağının yeniden yükleme/dönüşte korunması, hesap-salon
izolasyonu, ayrı Kaydet/Paylaş eylemleri, Android `ACTION_CREATE_DOCUMENT` köprüsü,
geniş depolama izni kullanılmaması ve yatay klavye görünümü.
`phone-fixes-0121.cjs`: açık seans seçimi, tekrar onayı, kayıt/hafta günü
roundtrip, kilo/tekrar, ayarlar, yedek kimliği, native bildirim ve Auth callback.
`browser-0121.cjs`: ayrı localhost sentetik önizleme ve Chrome ile gerçek DOM/geometri.
Çalıştırma için `test-results/README.md`.

`docs/FITTRACK_v0.12.2_TELEFON_TESTLERI.md` bu hotfix için fiziksel kabul listesidir.
VM, sahte Auth/native servisleri ve Chrome viewport'ları fiziksel Android,
SMTP/realtime veya iki cihaz kabulü yerine geçmez.
`apk_inspect.py` imzalı v0.12.2 APK için aynı beta sertifikasını zorunlu tutar.
Eski sürüm adlarını taşıyan testler korunmuş regresyonlardır.
