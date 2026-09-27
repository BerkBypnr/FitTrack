# FitTrack 0.13.1 — Alper'in ChatGPT'sine devir

## Taban ve kapsam

0.13.1 doğrudan 0.13.0 kaynak paketinin üstüne hazırlanmıştır. Bu sürüm yeni ürün özelliği veya veritabanı değişikliği değildir; telefon testinde bulunan profil/marka geri bildirimlerini düzeltir.

## Bağlayıcı kararlar

1. Doğru logo kırmızı üst parça, beyaz orta kıvrım ve kırmızı alt parçadan oluşan FT monogramıdır. Eski tek parça kırmızı işaret kullanılmayacak.
2. Profil kurulumu 7 adımdır: ad-soyad, cinsiyet, yaş, boy, mevcut kilo, isteğe bağlı hedef kilo, hedef.
3. Yaş ve boy ekranlarında yalnız kaydırmalı tekerlek bulunur. İkinci manuel değer kartı geri getirilmeyecek.
4. Tema kimlikleri geriye uyumluluk için sabittir; yalnız görünen adlar değişmiştir:
   - `dark-red` → Kızıl Güç
   - `plum-night` → Mürdüm Gece
   - `redline-editorial` → Fildişi Enerji
   - `rosewood-strength` → Bordo Asalet
5. Eski 6 adımlı profil taslağı yeni akışta şu adımlara taşınır: 1→1, 2→3, 3→4, 4→5, 5→6, 6→7. Bu geçiş kaldırılmamalı.

## Teknik kimlik

- Sürüm: `0.13.1`
- VersionCode: `31`
- Şema: `14`
- Paket: `com.fittracklabs.mobile`
- Yeni migration veya Supabase değişikliği: yok

## Doğrulama durumu

- `npm test`: 22/22 test grubu geçti.
- 0.13.1'e özel 7 kontrol geçti: logo tutarlılığı, ayrı profil adımları, tek yaş/boy seçici, eski taslak geçişi, tema adları, Auth hata metinleri ve sürüm kimliği.
- Kök web kaynakları Android `public` dizinine aktarıldı ve birebir eşleşti.
- Gradle/Android SDK önbelleği bu çalışma ortamında bulunmadığı için doğrulanmış 0.13.0 APK kontrollü biçimde yeniden paketlendi. Yerel `classes.dex` birebir korundu; yalnız web kaynakları, sürüm metadatası ve onaylı ikon değiştirildi.
- APK, önceki beta sertifikasıyla imzalandı. V2 ve V3 doğrulaması geçti; sertifika SHA-256 değeri beklenen beta anahtarıyla eşleşti.
- APK incelemesinde paket, origin, izinler, min/target SDK, native DEX, 24 web kaynağı ve ZIP hizalaması doğrulandı.
- İmzalama anahtarı ve parolalar kaynak/APK/teslim ZIP'ine dahil edilmedi ve edilmemelidir.

## Fiziksel telefonda kalanlar

0.13.0 listesinden U11, U12 ve U13 henüz doğrulanmadı. 0.13.1'e özel kısa kabul listesi `FITTRACK_v0.13.1_TELEFON_TESTLERI.md` dosyasındadır.
