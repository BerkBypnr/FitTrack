"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const workspace = path.resolve(root, "..", "..", "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const mainActivity = fs.readFileSync(path.join(workspace, "android", "rebuilt-0113", "smali_classes9", "com", "fittracklabs", "mobile", "MainActivity.smali"), "utf8");
const backCallback = fs.readFileSync(path.join(workspace, "android", "rebuilt-0113", "smali_classes9", "com", "fittracklabs", "mobile", "MainActivity$1.smali"), "utf8");

assert.match(app, /var VERSION = "0\.11\.3"/, "0.11.3 sürümü eksik.");
assert(app.includes("window.FitTrackNativeBack") && app.includes("confirmCancel()"), "Yerel geri köprüsü antrenman iptaline bağlı değil.");
assert(mainActivity.includes(".method public onBackPressed()V") && mainActivity.includes("FitTrackNativeBack") && mainActivity.includes("evaluateJavascript"), "Android MainActivity geri tuşunu web akışına iletmiyor.");
assert(backCallback.includes('const-string v0, "true"') && backCallback.includes("moveTaskToBack"), "Kök ekranda uygulamayı arkaya alma geri dönüşü eksik.");

assert(app.includes("function renderHomeMessaging()") && app.includes("function renderChatInbox()"), "Ana sayfa mesaj merkezi eksik.");
assert(app.includes('class="member-chat-shortcut"') && app.includes("Üyeye mesaj gönder"), "Antrenör paneli hızlı mesaj eylemi eksik.");
assert(app.includes('title: "Yeni mesajın var"') && app.includes("localNotificationActionPerformed"), "Yeni mesaj yerel bildirimi veya bildirime dokunma akışı eksik.");
assert(app.includes("item.recipientId === currentUserId()"), "Mesaj bildirimi alıcıya göre filtrelenmiyor.");

assert(app.includes("<b>Fit<span>Track</span></b>") && app.includes('class="detail-brand"'), "FitTrack marka yazısı veya ortalanmış detay logosu eksik.");
assert(styles.includes(".assigned-detail-flow .coach-note p") && styles.includes("font-size: 17px"), "Antrenör notu büyütülmedi.");
assert(styles.includes("0.11.1 trainer overrides stay last") && styles.includes(".member-card-copy strong { font-size: 17px; }"), "Antrenör paneli okunabilirlik düzeltmesi eksik.");

console.log("FitTrack Beta 0.11.3 hedefli düzeltme testleri: PASS");
