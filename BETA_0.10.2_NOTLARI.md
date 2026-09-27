# FitTrack Beta 0.10.2 — Sürüm Notları

## Düzeltilenler

- Geçmişte düzenlenen set, tekrar, kilo ve not verileri yeniden bulut kuyruğuna girer; aynı antrenman kaydı UPDATE edilir.
- `member_snapshots` ve `workout_sessions` Realtime olayları diğer cihazda otomatik bootstrap tetikler.
- Uygulama çevrimiçine veya ön plana döndüğünde kaçırılmış değişiklikleri yeniden kontrol eder.
- Çevrimdışı oturumu bulunan kullanıcı, Supabase isteği başarısız olduğu için giriş ekranına atılmaz.
- Program Stüdyosu artık yedi güne kadar program günü, gün adı ve haftanın günü destekler.
- Her program günü kendi hareket sırasını, set planlarını ve harekete özel antrenör notlarını korur.
- Atanan programlarda “Programı gör” ve ayrı “Başla” eylemleri bulunur.
- Geçmiş kaydında program adı, tarih ve süre salt okunurdur; setler ve not düzenlenebilir.
- Açık temada Hesap ve Bulut kartları açık yüzey ve okunabilir metin renkleri kullanır.
- Android veri dışa aktarma işlemi dosyayı önbelleğe yazdıktan sonra sistem kaydet/paylaş ekranını açar.
- Android geri düğmesi açık sayfa katmanını bir adım geri kapatır.
- Ana ekran metinleri teknik ifadeler yerine gün ve antrenman durumuna göre disiplin odaklı mesajlar gösterir.
- Kayıt sırasında rol seçimi e-posta doğrulamasından sonraki hesap kurulumuna taşındı.
- Geçersiz e-posta biçimleri Supabase isteğinden önce engellenir; yinelenen kayıt mesajı hesap varlığını açık etmez.

## Sürüm

- Web/app sürümü: `0.10.2`
- Veri şeması: `10` (geriye dönük uyumlu; veritabanı DDL değişikliği yok)
