# FitTrack Beta 0.13.1

Bu sürüm 0.13.0'ın veri modelini değiştirmeyen profil ve marka düzeltmesidir.

## Değişiklikler

- Onaylanan kırmızı-beyaz üç parçalı FT monogramı uygulama içi marka alanlarına, web ikonuna, Android uygulama ikonuna ve açılış ikonuna uygulandı.
- Ad/soyad ile cinsiyet ayrı profil adımlarına bölündü; profil akışı 6 yerine 7 adım oldu.
- Yaş ve boy ekranlarındaki yinelenen manuel değer kartı kaldırıldı. Bu iki değer tek kaydırma tekerleğinden seçiliyor.
- Eski 6 adımlı yarım profil taslakları yeni 7 adımlı akışa kayıpsız eşleniyor.
- Tema anahtarları ve paletleri korunarak kullanıcıya görünen adlar yenilendi: Kızıl Güç, Mürdüm Gece, Fildişi Enerji ve Bordo Asalet.
- Eski şifreyle aynı yeni şifre girildiğinde Türkçe ve açık hata metni gösteriliyor.

## Değişmeyenler

- Paket: `com.fittracklabs.mobile`
- Veri şeması: `14`
- Supabase şeması, RLS, Auth akışı ve depolama anahtarları değişmedi.
- Tema anahtarları değişmedi; mevcut kullanıcıların tema tercihi korunur.
- Üye, antrenör, program, mesajlaşma ve aktif antrenman iş kuralları değiştirilmedi.

## Sürüm

- VersionName: `0.13.1`
- VersionCode: `31`

