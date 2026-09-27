# FitTrack AI Geliştirme Protokolü

Durum: Aktif
Kapsam: Berk ve Alper'in GPT/Codex oturumları

## Ana ilke

Gereksiz token tüketimini azalt; kod kalitesi, güvenlik, veri bütünlüğü, test, build ve kullanıcı deneyiminden tasarruf etme.

> Gerektiği kadar kod oku, gereksiz hiçbir şeyi okuma.

## Kaynak ve bağlam

1. GitHub `main` güncel kaynak; FULL ZIP yalnız stabil sürüm yedeğidir.
2. Çalışmaya başlamadan önce pull/fetch yapılır. Eski ZIP, devir, roadmap ve test çıktısı güncel kod yerine kullanılmaz.
3. İnceleme sırası: görev → son Delta Devir → `FITTRACK_CURRENT_STATE.md` → belirtilen dosyalar → gerekirse Graft → gerçek kaynak.
4. Bütün repo baştan taranmaz. Güvenli çözüm için bağlam yetersizse kapsam kontrollü genişletilir.
5. Graft ilişki/caller/dependency bulmak içindir; gerçek kaynak kodun yerine geçmez.
6. `graft/` yerel, yeniden üretilebilir cache'dir; GitHub'a ve FULL pakete girmez.
7. Graft her bilgisayarda bir kez init edilir. Güncel kod çekildikten sonra normalde yalnız `graft build` gerekir; `--deep` varsayılan değildir.
8. `FITTRACK_CURRENT_STATE.md` yalnız uzun süre geçerli kararları; Delta Devir yalnız iki sürüm arasındaki değişimi içerir.

## Kapsam ve kodlama

9. Kodlamadan önce kapsam kısa belirlenir: ekran/feature, muhtemel dosyalar, backend/database etkisi ve kritik risk.
10. Mümkün olan en küçük doğru ve sürdürülebilir değişiklik yapılır.
11. Görev dışındaki çalışan auth, sync, mesajlaşma, program, geçmiş, aktif antrenman, navigation veya Supabase alanı yeniden yazılmaz.
12. Scope dışı küçük sorun backlog'a yazılır. Crash, veri kaybı, güvenlik, yetki sızıntısı, build engeli veya yeni regresyon çözülmeden bırakılmaz.
13. Kritik auth, Supabase, database, RLS, yetki, üyelik, program atama, aktif antrenman verisi, mesajlaşma, QR/turnike, migration, sync ve offline veri işlerinde gerekli bağlamdan kaçınılmaz.
14. Bir şeyi araç kesin kanıtlayabiliyorsa AI tahmin etmez: diff, test, typecheck, lint ve build gerçek araçlarla çalıştırılır.
15. Değişen dosyalar hafızadan tahmin edilmez; mümkünse `git status`, ilgili `git diff` ve `git log` ile doğrulanır.

## Model kullanımı

16. İşi güvenilir yapabilen en ekonomik model seçilir.
17. Küçük UI/CSS/spacing/font/renk/ikon/layout/metin/basit form ve izole bug işleri Luna Low → Medium → High sırasıyla ele alınabilir.
18. UI+state+backend, program sistemi, aktif antrenman, roller, navigation veya karmaşık state işleri Sol'a yükseltilir.
19. Auth/RLS/yetki/migration/veri kaybı/sync çatışması/security veya sürekli build arızasında Sol High kullanılır.
20. Büyük mimari, turnike mimarisi, kritik audit, çok sistemli refactor veya uzun süredir çözülemeyen problemde Astra değerlendirilebilir.
21. Jev şimdilik kullanılmaz.

## Fix protokolü

22. İlk fix öncesi gerçek hata/ekran davranışı gözlenir ve ilgili dosya bulunur.
23. İlk fix çözmezse: uygulandığını doğrula → yeni hata verisini oku → yalnız ilgili diff'i incele → varsayımı değerlendir → doğrudan bağımlı dosyada ikinci hedefli fix yap → testi tekrarla.
24. Her başarısız denemede kısa kayıt tutulur: ne denendi, neden çalışmadı, sonraki denemede ne değişecek.
25. Aynı çözüm küçük sayı veya kelime değişiklikleriyle tekrar edilmez.
26. Basit bug için hedefli ilk fix, yeni veriyle ikinci fix ve gerekirse üçüncü kontrollü inceleme sınırdır. Sonrasında scope/Graft/model yükseltilir.
27. Fix çalışan davranışı bozuyor, regresyon/build hatası çıkarıyor veya sorunu çözmeden başka alanları etkiliyorsa yalnız problemli patch geri alınır ve çalışan bazdan devam edilir.
28. Build hatasında bütün proje taranmaz; gerçek `ERROR`, `FAILED`, `Exception`, `Caused by`, unresolved/type/compilation satırları ve ilgili dosya incelenir.

## Test, build ve teslim

29. Testten token tasarrufu yapılmaz. Her görevde ilgili feature doğrulanır; her küçük işte tüm test evreni zorunlu değildir.
30. Çalıştırılmayan test geçti diye raporlanmaz.
31. Doğru sıra: doğru kod → hedefli doğrulama → build → APK → smoke test.
32. APK'nın oluşması tek başına başarı değildir; değişen kullanıcı akışı ve ilgili düğme/form/navigation kısa smoke testten geçer.
33. Token önceliği: görev → ilgili kaynak → kod → hata çözümü → test → build → APK → smoke → kısa rapor → dokümantasyon.
34. Kullanım azalırsa uzun açıklama, alternatif, scope dışı araştırma ve uzun rapor azaltılır; test/build/APK bırakılmaz.
35. Ara raporlar kısa olur; kod sohbet içinde tekrar basılmaz.
36. Sürüm sonunda gerektiğinde güncel kaynak, APK, kısa test/build sonucu, bilinen sorun, Delta Devir ve Current State güncellemesi hazırlanır.

## Değişiklik kaydı

37. Her patch/sürüm için kısa kayıt bırakılır: ekran/feature, değiştirilen gerçek dosyalar, yapılan değişiklik, neden, etkilenen alanlar ve test sonucu.
38. Bir görevin dosyaları topluca yazılabilir; “UI düzeltildi” gibi belirsiz kayıt kabul edilmez.
39. Başarısız denemeler sürüm sonu raporunda neden ve farklı çözümle birlikte kısa belirtilir; yoksa “Yok” yazılır.
40. Sürüm sonu kısa raporu şu başlıkları içerir: Yapılanlar, Değiştirilen ana dosyalar, Test/Build, Başarısız denemeler, Bilinen sorunlar, Sonraki sürüme bırakılanlar.
41. Test/Build bölümünde typecheck, web build, Android build, APK ve smoke test ayrı sonuçlandırılır.

## GitHub ve güvenlik

42. Şifre, API key, Supabase service-role key, keystore/parolası, SMTP sırrı ve gizli `.env` GitHub'a girmez.
43. Berk ve Alper başlangıçta sırayla çalışır: çalışan kişi önce pull, iş sonunda test/build/Delta/Current State kontrolü, commit ve push yapar.
44. Aynı anda geliştirme gerekirse branch/PR düzenine ayrıca geçilir.
45. Stabil sürüm kapanışında tag oluşturulur; her küçük düzeltmede tag açılmaz.
46. GitHub gerçek güncel kaynak; FULL ZIP güvenli sürüm yedeğidir.

## Ürün önceliği

47. Yol haritası token durumuna göre değiştirilmez; yeni büyük feature sırf sürüm numarası için açılmaz.
48. Ticari ürün önceliği: stabilite, kullanılabilirlik, güvenlik, veri bütünlüğü ve admin/antrenör/üye deneyimi.
49. Başarı token yüzdesi değildir; istenen değişiklik, korunmuş davranış, güvenli veri/yetki, geçen build/test, çalışan akış ve teslim edilen APK'dır.
50. Zorunlu akış: gerçek görev/hata → ilgili dosya → hedefli fix → test → diff → build → APK → smoke → kısa teknik rapor → Delta Devir.
