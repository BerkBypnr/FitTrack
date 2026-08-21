"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const workspace = path.resolve(root, "..", "..", "..");
const android = path.join(workspace, "android", "rebuilt-0113");
const manifest = fs.readFileSync(path.join(android, "AndroidManifest.xml"), "utf8");
const mainActivity = fs.readFileSync(path.join(android, "smali_classes9", "com", "fittracklabs", "mobile", "MainActivity.smali"), "utf8");
const gestureCallback = fs.readFileSync(path.join(android, "smali_classes9", "com", "fittracklabs", "mobile", "MainActivity$2.smali"), "utf8");

assert(manifest.includes('android:enableOnBackInvokedCallback="true"'), "Android predictive-back desteği manifestte etkin değil.");
assert(mainActivity.includes("getOnBackPressedDispatcher") && mainActivity.includes("OnBackPressedDispatcher;->addCallback"), "Kenar geri hareketi AndroidX geri dağıtıcısına bağlanmadı.");
assert(gestureCallback.includes("Landroidx/activity/OnBackPressedCallback;") && gestureCallback.includes("handleOnBackPressed()V"), "Predictive-back callback sınıfı eksik.");
assert(gestureCallback.includes("MainActivity;->onBackPressed()V"), "Kenar hareketi FitTrack yerel geri köprüsüne ulaşmıyor.");
assert(mainActivity.includes("window.FitTrackNativeBack") && mainActivity.includes("evaluateJavascript"), "Android geri callback'i web durum yöneticisine bağlı değil.");

console.log("FitTrack Beta 0.11.3 Android kenardan geri testi: PASS");
