# FitTrack Beta 0.11.9 — Açıklama üzerinde kaydırma düzeltmesi

10 Eylül 2026. Önceki: 0.11.8 / 25. Yeni: **0.11.9 / 26**. Şema 14.

Aktif antrenmanın açık Nasıl yapılır? alanında max-height + overflow-y:auto +
overscroll-behavior-y:contain ayrı bir kaydırma alanı oluşturuyordu. Dokunma bu
alanda başladığında hareket ana kaydırıcıya geçmiyordu; kilo kartına erişim zorlaşıyordu.

member-ui.css içinde bu üç kısıt kaldırıldı. Açıklama kutusunun overflow:hidden
kuralı da kaldırıldı. İçerik doğal yüksekliğinde büyür; antrenör notuyla birlikte
member-player-scroll içinde kayar. app.js içindeki iki açıklama bölgesinden artık
gereksiz olan tabindex=0 kaldırıldı; bölge etiketleri korunur. Başlığa kısa dokunma
ile aç/kapat ve varsayılan açık durum sürer. Alt tamamla düğmesi sabit; kilo/tekrar
kartı ana içeriğin en sonundadır. Tema, logo ve diğer arayüzler korunur.

Sürüm/cache alanları ve APK inceleme beklentisi 0.11.9 / 26 olarak güncellendi.
Önceki regresyon grupları değişmeden çalıştırıldı (yalnız sürüm beklentileri yükseltildi):
15/15 grup, üye 30/30, gezinme 16/16 geçti. Yeni davranışı kanıtladığı iddia edilen
bir yapay dokunmatik test eklenmedi. Fiziksel telefon/tarayıcı kaydırması test edilmedi.

Orijinal imzayla kaynak derlemesi başarılı; v1/v2 ve sertifika doğrulandı. 22 web
dosyası kaynakla eşleşti. 192 native görsel, 190 XML ve 10 DEX 0.11.8 ile aynı;
ZIP CRC, DEX bütünlüğü ve hizalama geçti. Supabase/Auth/migration/RLS değişikliği yok.

Mevcut 0.11.8 üzerine kurup açıklamanın başında, ortasında ve sonunda parmağı
metnin üzerinde kaydırın. Sayfa kilo kartına kadar kaymalı; tamamla sabit kalmalı.
Kısa/uzun açıklama, başlığı kapat/aç ve klavyeyle kilo girişini kontrol edin.
Ayrıntı ve dosya hashleri FITTRACK_ALPER_CHATGPT_DEVIR_v0.11.9.md içindedir.
