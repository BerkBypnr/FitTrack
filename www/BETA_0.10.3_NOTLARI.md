# FitTrack Beta 0.10.3 — Sürüm Notları

## Yeni arayüz

- Programlar ekranı artık üyede yalnız antrenörün atadığı programları gösterir.
- Ana program büyük kartta, ek programlar daha kompakt kartlarda sunulur.
- Program ayrıntısı tam ekran açılır; antrenmana başlama düğmesi ekranın altında erişilebilir kalır.
- Hareket kütüphanesine metin araması ve kas grubu filtreleri eklendi.
- Profil ana ekranı sadeleştirildi; ayrıntılı işlemler ilgili alt ekranlara taşındı.
- İsim, yaş, boy, mevcut kilo, hedef kilo ve hedef seçimi için altı adımlı profil akışı eklendi.
- Sayısal alanlar Android'in uygun sayı/ondalık klavyesini açar; kg/lb geçişi değerleri dönüştürür.
- Geçmiş düzenleme bottom sheet yerine tam ekran açılır; set ekleme, set silme, kilo/tekrar ve not düzenleme desteklenir.
- Üyeler ve Programlar yönetimi sadeleştirildi; program kartlarına önizleme, kopyalama, arşivleme ve silme menüsü eklendi.
- Atanmış program silme engellenir; buluttaki silme işlemi RLS ile uyumlu güvenli arşivleme olarak uygulanır.

## Kalite ve uyumluluk

- 320×568, 360×640/740, 390×844, 412×915 ve 768×1024 ekranlarda yatay taşma ve alt düğme görünürlüğü denetlendi.
- 320×420 daralmış görünümle Android klavye açık durumuna karşı profil eylemi doğrulandı.
- Antrenman, geçmiş, program atama, Program Stüdyosu, tema, hatırlatma, yedek, çevrimdışı açılış ve Android köprü akışları regresyon testinden geçirildi.
- Beta 0.10.2 ve daha eski yerel veriler şema 11'e otomatik taşınır.
- Aynı beta imza anahtarı kullanıldığı için 0.10.2 install-fix sürümünün üzerine güncelleme kurulabilir.

## Kapsam notu

İstemci üç atanmış programı gösterecek veri modelini içerir. Canlı Supabase veritabanındaki tek-aktif-program kısıtı bu APK çalışmasında değiştirilmedi. Çoklu bulut ataması, ayrıca onaylanacak üretim migrasyonu ve RLS/RPC testiyle ikinci parça olarak açılabilir.

## Sürüm

- Web/app sürümü: `0.10.3`
- Android versionCode: `14`
- Veri şeması: `11`
- Minimum Android: `7.0` (API 24)
- Hedef Android SDK: `36`
