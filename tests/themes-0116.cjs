"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { runtime } = require("./review/harness.cjs");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");

const expected = [
  "volt-discipline",
  "crimson-graphite",
  "plum-night",
  "redline-editorial",
  "rosewood-strength",
  "sage-motion"
];

const objectMatch = app.match(/var themes = (\{[\s\S]*?\n  \});\n  var legacyThemes/);
assert(objectMatch, "Tema kayıt defteri okunamadı.");
const themes = vm.runInNewContext(`(${objectMatch[1]})`);
assert.deepEqual(Object.keys(themes), expected, "Tema listesi seçilen altı paletle aynı değil.");

const requiredTokens = [
  "--bg", "--surface", "--surface-2", "--text", "--muted", "--mint",
  "--primary-start", "--primary-end", "--on-accent"
];

function blockFor(id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`html\\[data-theme="${escaped}"\\] \\{([\\s\\S]*?)\\n\\}`));
  assert(match, `${id} CSS paleti eksik.`);
  return match[1];
}

function tokensFor(block) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((match) => [match[1], match[2]]));
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

assert.match(app, /midnight:\s*"volt-discipline"/, "Eski koyu tema geçiş eşlemesi eksik.");
assert.match(app, /light:\s*"sage-motion"/, "Eski açık tema geçiş eşlemesi eksik.");
assert.match(app, /document\.documentElement\.dataset\.mode = theme\.mode/, "Açık/koyu ortak davranış niteliği uygulanmıyor.");
assert.match(app, /theme\.browserColor/, "Android sistem çubuğu rengi seçili temaya bağlanmamış.");
assert.match(index, /styles\.css\?v=0\.12\.2/, "Tema CSS önbellek kırıcı kimliği eksik.");
assert.equal(manifest.version, "0.12.2", "Manifest güncel ürün sürümüyle eşleşmiyor.");
assert.equal(manifest.theme_color, "#050706", "Manifest varsayılan Volt rengiyle uyuşmuyor.");
assert.match(sw, /fittrack-v0122/, "Service worker tema paketi önbellek kimliği eksik.");

const selectedRuntime = runtime({ theme: "rosewood-strength" });
assert.equal(selectedRuntime.app.state.theme, "rosewood-strength", "Yeni tema yerel kayıttan geri yüklenmedi.");
assert.equal(selectedRuntime.document.documentElement.dataset.theme, "rosewood-strength", "Yeni tema belgeye uygulanmadı.");
assert.equal(selectedRuntime.document.documentElement.dataset.mode, "light", "Yeni açık temanın ortak modu uygulanmadı.");
const migratedRuntime = runtime({ theme: "ocean" });
assert.equal(migratedRuntime.app.state.theme, "sage-motion", "Eski tema güvenli eşlemeyle taşınmadı.");
const fallbackRuntime = runtime({ theme: "bilinmeyen" });
assert.equal(fallbackRuntime.app.state.theme, "volt-discipline", "Bilinmeyen tema varsayılan Volt paletine düşmedi.");

const shell = index.slice(index.indexOf("  <body>"), index.indexOf("    <script"));
const shellHash = crypto.createHash("sha256").update(shell).digest("hex");
assert.equal(shellHash, "991393ab05a8944ef1a1b1750452decb0b00b5bad344ba6ca1a0852612daedb0", "Mevcut HTML uygulama kabuğu değiştirildi.");

console.log("FitTrack Beta 0.12.2 tema paketi kontrolleri: PASS (6 palet, kontrast, geçiş, önbellek, değişmeyen kabuk)");
