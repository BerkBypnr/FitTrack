# Test dizini

Güncel ve desteklenen Beta 0.11.4 doğrulaması kök dizinde `pnpm test` komutuyla çalışır. Bu komut `scripts/verify-rebuild.cjs` üzerinden kaynak bütünlüğünü, sürüm/Android kimliği tutarlılığını ve kritik 0.11.4 ürün güvenlik işaretlerini doğrular.

`legacy-0.11.3/` altındaki dosyalar önceki sürümlerin tarihsel test kaynaklarıdır. Bazıları artık bulunmayan APK çözümleme dizinlerine veya eski sürüm sabitlerine bağlıdır; güncel kabul testi değildir ve varsayılan test komutuna dahil edilmez.

Test kaynakları Android WebView paketine kopyalanmaz.
