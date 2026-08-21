"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const cloud = fs.readFileSync(path.join(root, "cloud.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "fittrack_beta_011_unlimited_assignments_chat.sql"), "utf8");

assert.match(app, /var VERSION = "0\.11\.3"/, "0.11.3 uygulama sürümü eksik.");
assert.match(app, /var SCHEMA = 13/, "0.11.3 veri şeması eksik.");

const nativeBack = app.slice(app.indexOf("function registerNativeBackButton()"), app.indexOf("function formatDay("));
assert(app.includes("window.FitTrackNativeBack = function () { return handleBackNavigation(); };"), "Android geri tuşu iç ekranları işlemiyor.");
assert(nativeBack.includes("window.FitTrackNativeBack()"), "Android geri tuşu yerel köprüyü kullanmıyor.");
assert(!nativeBack.includes('ui.tab = "home"'), "Android geri tuşu hâlâ ana sayfaya zorluyor.");
assert(app.includes(".workout-flow, .rest-overlay, .paused-flow") && app.includes("confirmCancel()"), "Antrenmanda geri tuşu iptal onayı açmıyor.");

assert(app.includes('assigned-program-card equal'), "Antrenmanlar eşit kartlarla oluşturulmuyor.");
assert(app.includes('class="home-workout-card'), "Ana sayfadaki çoklu antrenman kartları eksik.");
assert(!app.includes("ANA PROGRAM"), "Ana antrenman kavramı arayüzde kaldı.");
assert(!/assignments[^;\n]*slice\(0,\s*3\)/.test(app), "İstemcide üç antrenman sınırı kaldı.");
assert(app.includes("unassignTrainerProgram") && cloud.includes("archive_program_assignment"), "Tek tek antrenman kaldırma akışı eksik.");
assert(migration.includes("drop index if exists public.program_assignments_one_active_idx"), "Tek aktif antrenman veritabanı sınırı kaldırılmıyor.");
assert(migration.includes("program_assignments_one_active_program_idx"), "Aynı antrenmanın yinelenmesini önleyen indeks eksik.");

assert(app.includes("function renderChat()") && app.includes("function sendChatMessage()"), "Mesajlaşma arayüzü eksik.");
assert(cloud.includes('table: "chat_messages"') && cloud.includes("processMessage"), "Mesajların bulut eşitlemesi eksik.");
assert(migration.includes("create table if not exists public.chat_messages"), "Mesaj tablosu geçişi eksik.");
assert(migration.includes("enable row level security") && migration.includes("chat_messages_select_participants"), "Mesaj gizliliği RLS ile korunmuyor.");

assert(styles.includes(".profile-menu-group .setting-copy strong") && styles.includes("font-size: 17px"), "Profil menüsü yazıları büyütülmedi.");
assert(styles.includes(".rest-time small { font-size: 13px; }") && styles.includes(".next-card strong { font-size: 18px"), "Dinlenme ekranı yazıları büyütülmedi.");
assert(styles.includes(".compact-editor .history-set-row input { font-size: 18px; }"), "Geçmiş set düzenleme yazıları büyütülmedi.");
assert(styles.includes(".delete-confirm p { font-size: 14px") && styles.includes(".delete-confirm .secondary-btn"), "İptal onayı yazıları büyütülmedi.");

console.log("FitTrack Beta 0.11 hedefli düzeltme testleri: PASS");
