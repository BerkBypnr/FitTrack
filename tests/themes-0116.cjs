"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { runtime } = require("./review/harness.cjs");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8") + '\n' + fs.readFileSync(path.join(root, "design-system.css"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");

const expected = [
  "dark-red",
  "plum-night",
  "redline-editorial",
  "rosewood-strength"
];

const objectMatch = app.match(/var themes = (\{[\s\S]*?\r?\n  \});\r?\n  var legacyThemes/);
assert(objectMatch, "Tema kayıt defteri okunamadı.");
const themes = vm.runInNewContext(`(${objectMatch[1]})`);
assert.deepEqual(Object.keys(themes), expected, "Tema listesi onaylı dört paletle aynı değil.");

const requiredTokens = [
  "--bg", "--surface", "--surface-2", "--text", "--muted", "--mint",
  "--primary-start", "--primary-end", "--on-accent"
];

function blockFor(id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`html\\[data-theme="${escaped}"\\] \\{([\\s\\S]*?)\\r?\\n\\}`, 'g'))];
  assert(matches.length, `${id} CSS paleti eksik.`);
  return matches.map(m => m[1]).join('\n');
}

function tokensFor(block) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6}|#[0-9a-f]{3})\s*;/gi)].map((match) => [match[1], match[2].length === 4 ? '#' + [...match[2].slice(1)].map(c=>c+c).join('') : match[2]]));
}

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

for (const id of expected) {
  const theme = themes[id];
  const block = blockFor(id);
  const tokens = tokensFor(block);
  for (const token of requiredTokens) assert(tokens[token], `${id} paletinde ${token} eksik.`);
  assert.equal(theme.mode, /color-scheme:\s*light/.test(block) ? "light" : "dark", `${id} açık/koyu modu CSS ile uyuşmuyor.`);
  assert.equal(theme.background.toLowerCase(), tokens["--bg"].toLowerCase(), `${id} önizleme zemini gerçek paletle uyuşmuyor.`);
  assert.equal(theme.text.toLowerCase(), tokens["--text"].toLowerCase(), `${id} önizleme metni gerçek paletle uyuşmuyor.`);
  assert(contrast(tokens["--text"], tokens["--bg"]) >= 7, `${id} ana metin/zemin kontrastı 7:1 altında.`);
  assert(contrast(tokens["--muted"], tokens["--bg"]) >= 4.5, `${id} ikincil metin/zemin kontrastı 4.5:1 altında.`);
  assert(contrast(tokens["--on-accent"], tokens["--primary-start"]) >= 4.5, `${id} birincil düğme başlangıç kontrastı 4.5:1 altında.`);
  assert(contrast(tokens["--on-accent"], tokens["--primary-end"]) >= 4.5, `${id} birincil düğme bitiş kontrastı 4.5:1 altında.`);
}

assert.match(app, /midnight:\s*"dark-red"/, "Eski koyu tema geçiş eşlemesi eksik.");
assert.match(app, /light:\s*"redline-editorial"/, "Eski açık tema geçiş eşlemesi eksik.");
assert.match(app, /document\.documentElement\.dataset\.mode = theme\.mode/, "Açık/koyu ortak davranış niteliği uygulanmıyor.");
assert.match(app, /theme\.browserColor/, "Android sistem çubuğu rengi seçili temaya bağlanmamış.");
assert.match(index, /styles\.css\?v=0\.15\.0/, "Tema CSS önbellek kırıcı kimliği eksik.");
assert.equal(manifest.version, "0.15.0", "Manifest güncel ürün sürümüyle eşleşmiyor.");
assert.equal(manifest.theme_color, "#101113", "Manifest varsayılan zeminle uyuşmuyor.");
assert.match(sw, /fittrack-v0150/, "Service worker tema paketi önbellek kimliği eksik.");

const selectedRuntime = runtime({ theme: "rosewood-strength" });
assert.equal(selectedRuntime.app.state.theme, "rosewood-strength", "Yeni tema yerel kayıttan geri yüklenmedi.");
assert.equal(selectedRuntime.document.documentElement.dataset.theme, "rosewood-strength", "Yeni tema belgeye uygulanmadı.");
assert.equal(selectedRuntime.document.documentElement.dataset.mode, "light", "Yeni açık temanın ortak modu uygulanmadı.");
const migratedRuntime = runtime({ theme: "ocean" });
assert.equal(migratedRuntime.app.state.theme, "redline-editorial", "Eski tema güvenli eşlemeyle taşınmadı.");
const fallbackRuntime = runtime({ theme: "bilinmeyen" });
assert.equal(fallbackRuntime.app.state.theme, "dark-red", "Bilinmeyen tema varsayılan palete düşmedi.");

const shell = index.slice(index.indexOf("  <body>"), index.indexOf("    <script")).replace(/\r\n/g, "\n");
const shellHash = crypto.createHash("sha256").update(shell).digest("hex");
assert.equal(shellHash, "8cab65c8a85773a4bf09392780505eb11364a3c3b4e9e60d806a22d864ce083f", "0.15.0 HTML kabuğu beklenen yapıda değil.");

console.log("FitTrack Beta 0.14.1 tema paketi kontrolleri: PASS (4 palet, kontrast, geçiş, önbellek, değişmeyen kabuk)");
