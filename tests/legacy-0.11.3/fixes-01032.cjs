"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");

assert.match(app, /var VERSION = "0\.11\.3"/, "Uygulama sürümü 0.11.3 değil.");
assert(index.includes("styles.css?v=0.11.3") && index.includes("app.js?v=0.11.3"), "Web kaynak önbellek anahtarları güncel değil.");
assert(sw.includes('fittrack-v0113'), "Service worker önbelleği güncel değil.");

assert(app.includes("tabHistory: []"), "Sekme geri geçmişi tanımlanmadı.");
assert(app.includes("function navigateBackTab()"), "Sekme geri gezinme işleyicisi eksik.");
assert(app.includes("if (window.FitTrackNativeBack()) return;"), "Android geri olayı uygulama içi ekranları işlemiyor.");
assert(app.includes('typeof app.exitApp === "function"'), "Ana sayfadaki kontrollü uygulamadan çıkış eksik.");
const nativeBackHandler = app.slice(app.indexOf("function registerNativeBackButton()"), app.indexOf("function formatDay("));
assert(!nativeBackHandler.includes('ui.tab = "home"'), "Android geri dinleyicisinde eski doğrudan ana sayfa ataması kaldı.");

assert(app.includes('second: 0'), "Bildirim tam dakika sıfırlaması eksik.");
assert(app.includes("cancelReminderNotifications().then(function () { if (showSuccess)"), "Kesin alarm izni yokken gecikecek plan iptal edilmiyor.");
assert(app.includes("Alarmlar ve hatırlatıcılar"), "Kesin alarm izin açıklaması eksik.");

assert(app.includes('class="set-remove"') && app.includes(">Sil</button>"), "Set silme eylemi yazılı düğmeye dönüşmedi.");
assert(styles.includes(".set-remove") && styles.includes("var(--danger)"), "Set silme düğmesinin tehlike stili eksik.");
assert(styles.includes(".workout-card-actions > button") && styles.includes("font-size: clamp(16px, 4.5vw, 19px)"), "Ana sayfa eylem yazıları büyütülmedi.");
assert(styles.includes(".compact-library .library-item strong { font-size: 16px; }"), "Programlar ekranı okunabilirlik artışı eksik.");
assert(styles.includes(".cue { font-size: 14px;"), "Antrenman ipucu yazıları büyütülmedi.");
assert(styles.includes(".wizard-cancel") && styles.includes("width: 100%"), "Vazgeç düğmesi yeniden tasarlanmadı.");

console.log("FitTrack Beta 0.11 önceki hedefli düzeltme regresyonları: PASS");
