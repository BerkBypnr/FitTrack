# FitTrack Beta 0.11.6 — Tema Paketi 1

Bu teslim yeni ürün sürümü değildir. `versionName 0.11.6`, `versionCode 23`, paket
adı `com.fittracklabs.mobile` ve yerel veri şeması 14 olarak korunmuştur. Amaç,
onaylanan tema örneklerini mevcut 0.11.6 arayüzüne yerleşim veya akış değişikliği
yapmadan uygulamaktır.

## Yeni tema listesi

| Tema | Mod | Zemin | Ana yüzey | Vurgu |
|---|---|---:|---:|---:|
| Volt Discipline | Koyu | `#050706` | `#0E1511` | `#69B482` |
| Crimson Graphite | Koyu | `#111214` | `#202225` | `#E56A7F` |
| Plum Night | Koyu | `#160F15` | `#281923` | `#F0AEC2` |
| Redline Editorial | Açık | `#F4F0E8` | `#FFFDF8` | `#BD3518` |
| Rosewood Strength | Açık | `#F7F1EE` | `#FFFAF7` | `#8E2F50` |
| Sage Motion | Açık | `#F2F6F3` | `#FFFFFF` | `#18765C` |

Volt Discipline'da ekran zemini siyaha yakın tutuldu; yeşil yalnız vurgu, durum ve
eylem alanlarında kullanılır. Crimson Graphite koyu gri/koyu kırmızı yönünü,
Redline Editorial kırık beyaz/siyah/turuncu yönünü korur. Rosewood Strength ve
Plum Night aynı sıcak ailede açık ve koyu iki ayrı seçenek olarak sunulur. Sage
Motion, açık mint/teal referansının düşük doygunluklu karşılığıdır.

## Teknik uygulama

- `styles.css` içindeki renkler semantik değişkenlere bağlandı. Ölçüler, boşluklar,
  radius değerleri, bileşen sırası ve responsive yerleşim değiştirilmedi.
- Vurgu zemini üzerindeki metin rengi her palet için ayrı `--on-accent` token'ı
  kullanır. Böylece koyu kırmızı ve teal düğmelerde metin kaybolmaz.
- Açık temalara özgü okunabilirlik kuralları tek bir `data-mode="light"` niteliğine
  bağlandı. Aktif antrenman, dinlenme, Auth, alt sayfa ve antrenör ekranları seçili
  paletin açık/koyu modunda kalır.
- Tema seçicisindeki mevcut satır/kart yapısı korunarak önizleme renkleri gerçek
  palet zemini, yüzeyi ve vurgusunu gösterir.
- Android/PWA sistem çubuğu rengi seçili temayla güncellenir. Service worker ve
  dosya sorgu kimliği `0.11.6-theme-pack-1` yapılarak eski CSS önbelleği kırılır.
- Yeni kurulumda varsayılan tema Volt Discipline'dır. Eski kayıtlı seçimler:
  `midnight -> volt-discipline`, `light/ocean -> sage-motion`,
  `rose -> rosewood-strength`, `amber -> redline-editorial` olarak taşınır.

## Değişmeyenler

- Üye ve antrenör ekranlarının DOM/HTML kabuğu, sırası, metinleri ve navigasyonu.
- Giriş/kayıt/kod doğrulama, antrenman, program, mesaj, senkronizasyon ve silme akışları.
- Logo, Android uygulama ikonu, adaptive icon, splash ve bildirim görselleri.
- Android izinleri, deep link, native Smali/XML kaynakları ve imza sertifikası.
- Supabase şeması, migration, RLS, Auth ayarları ve Edge Function'lar.

## Doğrulama

- 13/13 otomatik test grubu geçti.
- Tema testi altı paletin kayıt, yükleme, eski tema geçişi ve önbellek kimliğini doğruladı.
- Ana metin/zemin için en az 7:1; ikincil metin/zemin ve düğme metni için en az
  4.5:1 kontrast eşiği otomatik ölçüldü.
- HTML uygulama kabuğunun önceki 0.11.6 ile aynı SHA-256 değerinde kaldığı doğrulandı.
- APK içindeki 21 web dosyası kaynakla byte-byte aynı bulundu; v1/v2 imza, DEX,
  ZIP bütünlüğü ve hizalama geçti.
- Önceki 0.11.6 APK ile 192 Android görseli ve 190 native XML karşılaştırıldı;
  fark bulunmadı ve izin listesi aynı kaldı.

Fiziksel telefon ve gerçek WebView görsel taraması bu çalışma ortamında yapılamadı.
Samsung S23 / Android 16 üzerinde altı temada üye ana ekranı, aktif antrenman,
programlar, ilerleme, profil/Auth ile antrenör paneli ve Program Stüdyosu ayrıca
kontrol edilmelidir.
