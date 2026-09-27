# FitTrack Delta Devir — 0.14.4 → 0.14.5

## Baz

- Kaynak: FitTrack 0.14.4
- Android: `versionCode 36`
- Yerel şema: 15

## 0.14.4'te yapılanlar

- Seans seçimi, aktif antrenman safe-area ve yatay görünüm düzeltildi.
- Antrenman kontrolü beş kompakt satıra çevrildi; önceki sete dönüş eklendi.
- Hareket detayı, kas/ekipman etiketleri, numaralı açıklamalar ve antrenör notu referansa yaklaştırıldı.
- İlk üye kaydı tek forma çevrildi; taslak saklama ve doğrulama korundu.
- Program kartları 0.14.2 düzenine döndürüldü.
- Ölçümlere ayrı ikonlar, son kayıt ve düzenleme ikonu eklendi.
- Tema renklerini değiştiren 0.14.3 ek kuralları kaldırıldı.
- İptal, erken bitirme, silme, duraklatma, yarım özet ve kurtarma pencereleri güncellendi.
- E-posta kodu ekranındaki uzun alt açıklama kaldırıldı.

## Değiştirilen ana dosyalar

- `app.js`
- `cloud.js`
- `reference-ui.css`
- Sürüm bilgileri: `config.js`, `index.html`, `sw.js`, `package.json`, `package-lock.json`, `android/app/build.gradle`
- Hedefli test: `tests/browser-0144.cjs`

## Korunacak davranışlar

- Dört tema ve 0.14.2 renk tokenları.
- Aktif antrenman set verisi, duraklatma/devam ve yarım kayıt.
- Mevcut auth, Supabase, mesajlaşma, program atama ve navigation davranışları.
- Aynı Android paket kimliği ve beta imzası.

## Doğrulama durumu

- 9/9 hedefli Chromium kontrol grubu geçti.
- Runtime grupları 50/50, 19/19 ve 30/30 geçti; veritabanı/metric kontrolleri geçti.
- Web build ve standart imzasız Android release buildi geçti.
- Kaynak ZIP güvenlik taraması ve arşiv bütünlüğü geçti.
- 320/360/390 dikey ve 740 yatay viewport kontrol edildi.
- APK içindeki web çıktısı kaynakla eşleşti.
- 0.14.3 → 0.14.4 emülatör güncellemesi ve açılış başarılı.
- Fiziksel telefon, gerçek e-posta ve canlı hesap kontrolleri bekliyor.

## GitHub ve AI çalışma ortamı

- `main`, 0.14.4 kaynak kodunu ve önceki Git tarihçesini birlikte taşır.
- `AGENTS.md`, `tokenkuralları.md` ve bu Delta yeni görevlerin başlangıç bağlamıdır.
- Graft grafiği kaynakla senkrondur; `graft/` ve makineye özel `.local-tools/` commitlenmez.
- GitHub Actions 0.14.4 kimliğiyle hedefli runtime, veritabanı, güvenlik, kaynak paketleme ve Android build kontrollerini çalıştırır.

## 0.14.5 başlangıcı

- Yeni görev gelmeden feature kapsamı açma.
- Önce bu Delta, `FITTRACK_CURRENT_STATE.md` ve `tokenkuralları.md` okunmalı.
- İlgili dosyalar belli değilse Graft kullanılmalı; bütün repo yeniden taranmamalı.
