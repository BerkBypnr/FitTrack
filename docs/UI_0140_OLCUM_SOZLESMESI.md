# Ölçüm sözleşmesi v1 — yerel şema15

`measurementProfile`, `measurementVersion:1`, `measurementReview` ve gerekiyorsa `legacyMeasurementProfile` hareket tanımında, program snapshot'ında ve geçmiş hareketinde taşınır. SQL'de yeni kolon yok; mevcut JSON payload kullanılır.

| Profil | Set log alanları | Hedef alanları | Birim |
|---|---|---|---|
| load_reps | weight, reps | targetWeight, repsTarget | workout/history.units kg veya lb; tekrar adet |
| reps | reps | repsTarget | adet |
| duration | durationSeconds | targetDurationSeconds | saniye, tam sayı |
| distance_duration | distanceMeters, durationSeconds | targetDistanceMeters, targetDurationSeconds | metre + saniye |
| load_distance | weight, distanceMeters | targetWeight, targetDistanceMeters | kg/lb + metre |
| completed | completedAt | Yok | Ölçüm yok |

Log değerleri mevcut sözleşmeyle uyumlu metin değerleridir; girilen Türkçe ondalık virgül noktayla normalize edilir. Yeni SI alanları yalnız mevcutsa eklenir, eski loglara anlamsız boş alan zorlanmaz. `completedAt` ölçümden ayrı, kullanıcı tikidir. Boş log veya sayısal değer tek başına tamamlandı kabul edilmez.

## Doğrulama

Ağırlık 0'dan büyük, en fazla 500 kg/1100 lb; tekrar 1–100 tam sayı; süre 1–86400 saniye tam sayı; mesafe 0'dan büyük, en fazla 1.000.000 metre. İkili alanlarda ikisi birlikte veya ikisi boş. Üs yazımı, NaN, Infinity, negatif ve uygunsuz kesir reddedilir. Süre gerçek zamanlı geri sayım değildir; gerçekleşen süre kullanıcı tarafından yazılır. Planlanan tekrar hedefi mevcut 10–12 aralık biçimini korur.

## Eklemeli eski veri eşlemesi

- requiresWeight:false ve requiresReps:false → completed.
- requiresWeight:false, tekrar açık → reps.
- Varsayılan/ağırlık + tekrar → load_reps.
- requiresWeight:true ve requiresReps:false → eski alanlar aynen korunur, measurementReview:true. Bunun süre veya mesafe olduğu tahmin edilmez.
- Bilinmeyen açık profil adı legacyMeasurementProfile ile saklanır ve inceleme gerektirir.
- Açık geçerli profile kullanıcı/antrenör geçtiğinde yeni alan düzeni kullanılır. Eski kayıt/snapshot geriye dönük yeniden yazılmaz.

İnceleme listesi programlardaki belirsiz hareketleri gösterir. Hareketin adı eşleme için gerekçe değildir. Eski dinlenme hedefi `rest` veri uyumluluğu için saklanır; aktif dinlenme UI'ı ve timer üretmez.

## Önceki değerler

Hareket kimliği ve ölçüm profili eşleşir; yalnız geçmişte tamamlanmış set alınır, current syncId hariçtir. Aynı sıra yoksa önceki son tamamlanan set kullanılır. Kaydın kg/lb birimi farklıysa yalnız weight dönüştürülür; SI alanları değişmez. Tek/toplu uygulama tamamlandı tikini değiştirmez, otomatik uygulanmaz.

## Hacim, kaydetme ve dağıtım

Hacim sadece tamamlanmış, belirsiz olmayan load_reps setlerinin weight×reps toplamıdır. kg×metre veya saniye hacme eklenmez. Geçmiş düzenlemede aday kopya tamamen doğrulanır; hata olursa orijinal kayıt değişmez. Başarılı kayıtta modifiedAt güncellenir, cloudSyncedAt temizlenerek mevcut sync kuyruğuna bırakılır.

Yarım oturumun kimliği ve snapshot bağlantısı değişmez. Eski 0.13 uygulamaları ileri alanları korumayı bilmediğinden aynı pilot hesabının tüm cihazları ve antrenörü 0.14 olmalıdır. Sunucu zorunlu sürüm kontrolü yoktur. Eski program ağırlık hedeflerinin bağımsız birim metadatası yoktur; karışık birimli antrenör/üye hedefleri bu sürümün kabul edilmiş özelliği değildir. Bu sınırlama antrenman loglarının kayıt birimini ortadan kaldırmaz.
