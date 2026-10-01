"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const workspace = path.resolve(root, "..", "..", "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const mainActivity = fs.readFileSync(path.join(root, "android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java"), "utf8");

assert.match(app, /var VERSION = "0\.14\.4"/, "0.14.4 sürümü eksik.");
assert(app.includes("window.FitTrackNativeBack") && app.includes("confirmCancel()"), "Yerel geri köprüsü antrenman iptaline bağlı değil.");
assert(mainActivity.includes("dispatchFitTrackBack()") && mainActivity.includes("FitTrackNativeBack") && mainActivity.includes("evaluateJavascript"), "Android MainActivity geri tuşunu web akışına iletmiyor.");
assert(mainActivity.includes('if (!"true".equals(value)) moveTaskToBack(true)'), "Kök ekranda uygulamayı arkaya alma geri dönüşü eksik.");

assert(app.includes("function renderHomeMessaging()") && app.includes("function renderChatInbox()"), "Ana sayfa mesaj merkezi eksik.");
// The revised card also uses secondary-btn; assert the chat action, not a sole CSS class.
assert(/class="[^"]*\bmember-chat-shortcut\b[^"]*" data-action="open-chat"/.test(app) && app.includes("Üyeye mesaj gönder"), "Antrenör paneli hızlı mesaj eylemi eksik.");
assert(app.includes('title: "Yeni mesajın var"') && app.includes("localNotificationActionPerformed"), "Yeni mesaj yerel bildirimi veya bildirime dokunma akışı eksik.");
assert(app.includes("item.recipientId === currentUserId()"), "Mesaj bildirimi alıcıya göre filtrelenmiyor.");

assert(app.includes("<b>Fit<span>Track</span></b>") && app.includes('class="detail-brand"'), "FitTrack marka yazısı veya ortalanmış detay logosu eksik.");
assert(styles.includes(".assigned-detail-flow .coach-note p") && styles.includes("font-size: 17px"), "Antrenör notu büyütülmedi.");
assert(styles.includes("0.11.1 trainer overrides stay last") && styles.includes(".member-card-copy strong { font-size: 17px; }"), "Antrenör paneli okunabilirlik düzeltmesi eksik.");

console.log("FitTrack Beta 0.14.1 hedefli düzeltme testleri: PASS");
