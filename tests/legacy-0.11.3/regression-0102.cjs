"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const cloud = fs.readFileSync(path.join(root, "cloud.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const config = fs.readFileSync(path.join(root, "config.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.match(app, /var VERSION = "0\.11\.3"/, "Uygulama sürümü 0.11.3 değil.");
assert.match(config, /appVersion: "0\.11\.3"/, "Bulut cihaz sürümü 0.11.3 değil.");
assert.match(index, /app\.js\?v=0\.11\.3/, "Web önbellek kırıcı sürümü güncel değil.");

assert(!app.includes("Hazırlık formu yok"), "Eski teknik ana ekran metni kaldırılmadı.");
assert(app.includes("homeMotivation"), "Duruma göre motivasyon metni eksik.");
assert(app.includes("assigned-program-detail") && app.includes("İncele"), "Atanan antrenman önizleme eylemi eksik.");

assert(app.includes("normalizeProgramDay"), "Çok günlü program veri modeli eksik.");
assert(app.includes("studio-add-day"), "Program günü ekleme eylemi eksik.");
assert(app.includes("data-studio-weekday"), "Program günü takvim seçimi eksik.");
assert(app.includes("programDayPreview"), "Üye çok günlü program önizlemesi eksik.");

assert(!/id=\\?"historyName/.test(app), "Geçmiş program adı hâlâ düzenlenebilir.");
assert(!/id=\\?"historyDate/.test(app), "Geçmiş tarihi hâlâ düzenlenebilir.");
assert(!/id=\\?"historyDuration/.test(app), "Geçmiş süresi hâlâ düzenlenebilir.");
assert(app.includes('item.cloudSyncedAt = ""'), "Geçmiş düzenlemesi yeniden senkronlanmak üzere işaretlenmiyor.");
assert(app.includes("needsSync: needsSync"), "Workout UPDATE kuyruğu için dirty bayrağı eksik.");
assert(cloud.includes('table: "member_snapshots"'), "Snapshot Realtime aboneliği eksik.");
assert(cloud.includes("record.needsSync"), "Düzenlenmiş workout yeniden gönderilmiyor.");
assert(cloud.includes('document.addEventListener("visibilitychange"'), "Ön plana dönüş senkronizasyonu eksik.");

assert(styles.includes('html[data-theme="light"] .auth-card'), "Açık tema hesap/bulut düzeltmesi eksik.");
assert(app.includes("exportJsonFile"), "Android kaydet/paylaş dışa aktarma akışı eksik.");
assert(app.includes("handleBackNavigation"), "Android geri navigasyon katmanı eksik.");

assert(!cloud.includes('name="authRole"'), "Rol seçimi e-posta doğrulamasından önce gösteriliyor.");
assert(cloud.includes("validEmail"), "E-posta biçim doğrulaması eksik.");

assert(app.includes("assignedPrograms"), "Üye atanmış program filtresi eksik.");
assert(app.includes("data-library-search"), "Hareket kütüphanesi araması eksik.");
assert(app.includes("profile-wizard"), "Adım adım profil kurulumu eksik.");
assert(app.includes("studio-delete-confirm"), "Program silme akışı eksik.");
assert(app.includes("history-edit-flow"), "Tam ekran geçmiş düzenleyici eksik.");
assert(styles.includes("assigned-program-card"), "Onaylanan program kartı tasarımı eksik.");

console.log("FitTrack Beta 0.11 statik regresyon kontrolleri: PASS");
