"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const cloud = fs.readFileSync(path.join(root, "cloud.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.match(app, /var VERSION = "0\.11\.3"/, "Yama sürümü güncel değil.");
assert(app.includes("getCachedAccountContext"), "Çevrimdışı hesap bağlamı eksik.");
assert(cloud.includes("resumeOfflineAccount"), "Çevrimdışı yeniden açılış koruması eksik.");
assert(cloud.includes("revalidateOfflineSession"), "Çevrimiçi dönüş oturum doğrulaması eksik.");
assert(cloud.includes("realtimeTopic === topic"), "Realtime tekil abonelik koruması eksik.");
assert(cloud.includes('enqueue("profile"'), "Profil yazma kuyruğu eksik.");
assert(app.includes("payload.pendingProfileName"), "Bekleyen profil adı bulut bootstrap sırasında korunmuyor.");
assert(app.includes("library-exercise-detail") && app.includes("exercise-detail-flow"), "Hareket detay akışı eksik.");
assert(app.includes('window.FitTrackNativeBack = function () { return handleBackNavigation(); };'), "Android yerel geri köprüsü eksik.");
assert(app.indexOf('if (ui.onboardingStep > 1)') < app.indexOf('else if (state.profile.setupComplete)'), "Profil sihirbazı geri önceliği yanlış.");
assert(styles.includes("color: #f5f8f7") && styles.includes(".workout-card"), "Açık tema hero kontrastı sabitlenmedi.");
assert(styles.includes("appearance: none") && styles.includes("cursor: pointer"), "Yerel düğme stili sıfırlanmadı.");
assert(styles.includes(".countdown-flow > .countdown-close { position: absolute; }"), "Geri düğmesi konumu güvenceye alınmadı.");
assert(app.includes("checkExactNotificationSetting") && app.includes("allowWhileIdle: true") && app.includes("getPending"), "Kesin bildirim planlama/doğrulama akışı eksik.");

console.log("FitTrack Beta 0.11 taban hata düzeltme regresyonları: PASS");
