"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const workspace = path.resolve(root, "..", "..", "..");
const android = path.join(root, "android/app/src/main");
const manifest = fs.readFileSync(path.join(android, "AndroidManifest.xml"), "utf8");
const mainActivity = fs.readFileSync(path.join(android, "java/com/fittracklabs/mobile/MainActivity.java"), "utf8");
const config = JSON.parse(fs.readFileSync(path.join(root, "capacitor.config.json"), "utf8"));

assert(manifest.includes('android:enableOnBackInvokedCallback="true"'), "Android predictive-back desteği manifestte etkin değil.");
assert(mainActivity.includes("getOnBackPressedDispatcher().addCallback") && mainActivity.includes("new OnBackPressedCallback(true)"), "Kenar geri hareketi AndroidX geri dağıtıcısına bağlanmadı.");
assert(mainActivity.includes("handleOnBackPressed() { dispatchFitTrackBack(); }"), "Predictive-back callback sınıfı eksik.");
assert.equal(config.plugins.App.disableBackButtonHandler, true, "İkinci App geri yolu kapatılmamış.");
assert(mainActivity.includes("window.FitTrackNativeBack") && mainActivity.includes("evaluateJavascript"), "Android geri callback'i web durum yöneticisine bağlı değil.");

console.log("FitTrack Beta 0.12.2 Android kenardan geri testi: PASS");
