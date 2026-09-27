# FitTrack Beta 0.12.2

17 Eylül 2026 — 0.12.1 telefon kabulünden çıkan iki sorun için sınırlı hotfix.

## Düzeltmeler

- Profil bilgileri yazılırken telefon döndürülürse veya Android WebView yeniden kurulursa
  tamamlanmamış alanlar, açık adım ve kaydırma bağlamı hesap + salon kapsamında korunur.
- Yatay ekranda klavye açıkken üst alan sıkıştırılır; odaktaki alan görünür tutulur.
- JSON yedeğinde iki açık eylem vardır:
  - **Yedeği cihaza kaydet:** Android sistem dosya seçicisini açar; kullanıcı klasör ve
    dosya adını seçer.
  - **Yedeği paylaş:** Android paylaşım panelini açar.
- Kaydetme için geniş depolama izni eklenmemiştir.

## Değişmeyenler

- Paket: `com.fittracklabs.mobile`
- Veri şeması: `14`
- Supabase şeması/RLS/Edge Function: değişmedi
- UI final tasarımları: bu sürüme alınmadı; v0.13.0 kapsamındadır
- K35 canlı iki hesap mesajlaşma kabulü: denenmedi

## Sürüm kimliği

- Version name: `0.12.2`
- Version code: `29`
- Min SDK: `24`
- Target/compile SDK: `36`
