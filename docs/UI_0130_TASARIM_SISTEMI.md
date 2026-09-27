# 0.13 tasarım sistemi ve varlık kaydı

## Kaynaklar

Kullanıcı onaylı kaynak: `FitTrack-Final-UI-Temiz-Paket-v1.zip`.
Kaynak ZIP SHA-256: `1eb256368f5d1a3554e0d78eea9565125b47700ac258e438d2e99220ab4519d6`.
Eski/alternatif antrenör veya dinlenme ekranları tasarım otoritesi değildir.

| Final görsel | Bu sürümdeki uygulama |
|---|---|
| 01 Açılış / üye ana sayfası / özet | Yalnız dumbbell açılışı; diğer iki ekran sonraki aşama |
| 02 Giriş / kayıt | Gerçek Auth formları; insan yerine ekipman/tema zemini |
| 03 Cinsiyet / boy / kilo | Profil akışında kartlar, tekerlek, cetvel + elle giriş |
| 04 Yaş / hedef / hedef kilo | Yaş seçici, dört hedef; hedef kilo isteğe bağlı |
| 21 Doğrulama / şifre | Tek kod alanı, geri sayım, recovery formu, yeni şifre |
| 22 Hesap / salon | Ortak form ve seçim kartları, mevcut sunucu akışı |
| 24 Ayarlar alt ekranları | Dört tema seçicisi; diğer alt ekranların yalnız ortak stilleri |
| 29 Eksik/hata durumları | Ortak hata/bağlantı görünümleri; yeni iş akışı eklenmedi |

Profilde eski taslak adımlarının anlamı değişmesin diye ad/cinsiyet birleştirildi;
hedef kilo beşinci, hedef kartları altıncı adımda kaldı. Bu, eski taslağı yanlış soruda
açmamak için yapılmış açık bir uygulama uyarlamasıdır.

## Tokenlar ve uygulama

- `design-system.css`, mevcut iki CSS'ten sonra yüklenir. Renk için `--bg`, `--surface*`,
  `--text`, `--muted`, `--mint`, `--primary-*`, `--on-accent`, durum tokenları kullanılır.
- Var olan `--mint` adı uyumluluk için kaldı; “her tema yeşil” anlamına gelmez.
- 4/8/12/16/24/32 aralıklar; 14/20/24 köşeler; 54px ana kontroller; görünür focus çerçevesi.
- Dört paletin ana metni en az7:1, ikincil metin ve ana düğme metni en az4.5:1 statik token testiyle denetlenir.
- Bu token testi tüm olası bileşimlerde tam erişilebilirlik sertifikası değildir.
- Profil tekerleği: gerçek scroll-snap + klavye yön/Page/Home/End desteği; elle giriş daima erişilebilir.
- Animasyon azaltma tercihi gözetilir; viewport zoom yasağı kaldırılmıştır.
- Açılış fotoğrafı temadan bağımsız koyu/sıcak sahnedir; düğme rengi seçilen temayı izler.
- Koyu login sınırlı ekipman arka planı, açık login sade renk zemini kullanır.
- Dinlenme/aktif antrenman iş mantığı bu CSS değişikliğinden bağımsızdır.

## Marka ve görsel kaydı

- Web logo: `icon.svg`, app/cloud içindeki aynı FT path'i.
- Android: `android/app/src/main/res/drawable/fittrack_app_icon.xml`.
- Arka plan: `assets/brand/welcome-dumbbell.png`, 1024×1536, dahili imagegen ile üretildi.
- Üretim türü: referansa dayalı yeni ürün fotoğrafı; mevcut ekranı bitmap olarak kullanma değil.
- İnsan, logo, yazı veya düğme üretilmedi. Arka plan ürün varlığıdır; gerçek çekim diye sunulmamalı.
- Diğer hareket fotoğrafları/GIF'ler ve bunların mevcut köken/lisans sorumlulukları değişmedi.

### Kullanılan nihai görsel promptu

Use case: product-mockup. Project-bound asset for actual FitTrack Android welcome screen.
Image 1 is STYLE AND COMPOSITION REFERENCE ONLY, specifically the LEFT phone background.
Generate ONE standalone portrait 1024x1536 cinematic photograph, NOT a UI mockup.
Dark charcoal gym, beautifully textured black iron dumbbell on rubber floor in lower middle/left,
squat rack softly out of focus behind, restrained warm amber/yellow sidelight.
Match realistic metal surfaces and restrained premium gym mood of the left reference screen.
Dumbbell visible around vertical 50–70%, upper third and bottom 20% dark and quiet to allow
overlaid live UI. ABSOLUTELY NO PEOPLE, no logo, no text, no lettering, no phone frame,
no buttons, no montage, no red tint. All branding and text will be implemented as real app elements.

## Resmî teknik başvuru

Auth işleyişi değişmez: https://supabase.com/docs/guides/auth/passwords

Yerel testte kullanılan ayrı Chromium dağıtımının Playwright kullanım tarifi:
https://github.com/Sparticuz/chromium#usage-with-playwright
Bu paket uygulamanın bağımlılıklarına veya APK'sına dahil değildir.
