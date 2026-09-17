# FitTrack Beta 0.9.1 — Android Kurulum Düzeltmesi

Beta 0.9.1, Beta 0.9 ile aynı uygulama özelliklerini içerir. Bu yama Android'de görülen genel “Uygulama kurulamadı” hatasını düzeltir.

## Düzeltilen sorun

Önceki Beta 0.9 APK yeniden paketlenirken sıkıştırılmamış Android kaynakları zorunlu 4 bayt sınırına hizalanmamıştı. APK imzası geçerli görünse de Android paket yöneticisi kurulumu reddediyordu.

Beta 0.9.1 doğru hizalanmış APK olarak üretildi ve doğrulama paketine sıkıştırılmamış girdilerin hizasını denetleyen regresyon kontrolü eklendi.

## Android sürümü

- versionName: `0.9.1`
- versionCode: `10`
- Paket: `com.fittracklabs.mobile`
- Minimum API: `24`
- Hedef API: `36`

Beta 0.8 kuruluysa kaldırmadan Beta 0.9.1 APK üzerine kurulabilir. Aynı beta sertifikası kullanılmıştır.
