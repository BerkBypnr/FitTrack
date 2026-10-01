"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const config = fs.readFileSync(path.join(root, "config.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");

assert.match(app, /var VERSION = "0\.15"/, "0.15 uygulama sürümü eksik.");
assert.match(config, /appVersion: "0\.15"/, "0.15 bulut sürümü eksik.");
assert(index.includes("styles.css?v=0.15") && index.includes("app.js?v=0.15"), "0.15 önbellek kırıcıları eksik.");
assert(sw.includes('fittrack-v015-final38'), "0.15 service worker önbelleği eksik.");

assert.match(app, /\["Bilgiler", "Günler", "Hareketler", "Kontrol"\]/, "Dört adımlı program oluşturucu eksik.");
assert.match(app, /function studioStepCanContinue\(step\)/, "Adım doğrulaması eksik.");
assert.match(app, /status === "draft"\) return true/, "Eksik programı taslak kaydetme desteği eksik.");
assert.match(app, /studio-name-suggestion/, "Hızlı program adı önerileri eksik.");
assert.match(app, /studio-finish-selection/, "Toplu hareket seçimini bitirme eylemi eksik.");
assert.match(app, /ui\.studioSelection/, "Geçici hareket seçimi eksik.");
assert.match(app, /if \(ui\.editorDraft\) \{ if \(ui\.studioStep > 1\)/, "Android geri hareketinin oluşturucuda önceki adıma dönmesi eksik.");
assert.match(app, /studio-review-edit-day/, "Son kontrolden güne geri dönme eylemi eksik.");

assert.match(css, /\.studio-wizard-flow \{ display: flex; flex-direction: column; \}/, "Program sihirbazı yerleşimi eksik.");
assert.match(css, /\.studio-stepper[\s\S]*grid-template-columns: repeat\(4, 1fr\)/, "Dört adımlı ilerleme göstergesi stili eksik.");
assert.match(css, /\.studio-wizard-footer button \{ min-height: 58px/, "Büyük alt eylem düğmeleri eksik.");
assert.match(css, /\.catalog-choice \{ min-height: 82px/, "Okunabilir hareket seçim kartları eksik.");
assert.match(css, /\.studio-exercise-copy strong \{ font-size: 15px; \}/, "Hareket başlıkları büyütülmemiş.");

console.log("FitTrack Beta 0.14.1 program oluşturucu testleri: PASS");
