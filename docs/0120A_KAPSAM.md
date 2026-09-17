> TARİHSEL ARA ÇALIŞMA. Güncel durum: `FITTRACK_ALPER_CHATGPT_DEVIR_v0.12.0.md`.

# 0.12.0 A çalışma sözleşmesi

Başlangıç: 0.11.9 / versionCode 26 / yerel şema 14. Bu bir uygulama sürümü
değil, standart Android kaynağına geçiş için test ve envanter teslimidir.

## Değişecek dosyalar

- `tests/migration-baseline-0120.cjs`: mevcut uygulamayı değiştirmeden Node VM
  ve sahte native servislerle depolama, hesap/salon ve köprü sözleşmesini sınar.
- `scripts/test.cjs`: yeni grubu mevcut 15 regresyon grubuna ekler.
- `scripts/preflight_0120.py`: verilen özgün ZIP ile kaynak kimliğini,
  değişmeyen uygulama/native dosyalarını ve taşıma envanterini doğrular.
- `scripts/VerifySigningKey0120.java`: sağlanan özel girdilerle yerel, rastgele
  bir mesajı imzalayıp doğrular; APK üretmeden anahtarın kullanılabildiğini sınar.
- `docs/0120*` ve `test-results/`: kapsam, teknik devir ve ölçüm kanıtları.

## Değişmeyecek sözleşme

Ürün web dosyaları, Android Smali/XML/görseller, Supabase kaynakları,
package.json ve kilitli bağımlılıklar değiştirilmez. Normal giriş şifreli,
kayıt doğrulaması kodlu kalır. Mevcut localStorage anahtarları, şema 14,
program snapshot'ları, tek ana antrenman kaydırıcısı ve altı tema korunur.
Yeni panel, yeni GIF kataloğu, veri göçü ve native taşıma bu göreve dahil değildir.

## Kabul

Özgün APK/ZIP hashleri ve kaynak eşleşmesi; mevcut test grupları ve yeni taşıma
grubu; kilitli bağımlılık kurulumu; sınırlı APK imza denetimi kanıtlanır.
Native API'ler ve yerel depolama kayıtları envanterlenir. VM sonucu fiziksel
Android, tarayıcı render, SMTP veya gerçek iki cihaz testi sayılmaz.
Kapı 0'ın telefon kabulü Berk/Alper tarafından ayrı bildirilmelidir.

## Geri alma

Ürün dosyaları ve şema değişmediği için veri göçü geri alma işlemi yoktur.
Bu göreve ait yeni test/betik/belgeler geri alınır ve scripts/test.cjs önceki
15 gruplu listesine döner. Özgün ZIP ve APK değiştirilmeden tutulur. Telefon
uygulamasını kaldırmak veya verisini temizlemek geri alma yöntemi değildir.

## Durma noktası

A teknik incelemesinden sonra 0.12.0 B ayrı başlatılır. Beklenmedik kaynak
farkı, test başarısızlığı veya yetki belirsizliğinde kapsam genişletilmez.
