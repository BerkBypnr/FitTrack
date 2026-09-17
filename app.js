(function () {
  "use strict";

  var VERSION = "0.12.2";
  var SCHEMA = 14;
  var STORAGE_KEY = "fittrack-beta-010-state";
  var ACCOUNT_KEY_PREFIX = "fittrack-beta-010-user-";
  var PROFILE_DRAFT_PREFIX = "fittrack-beta-0122-profile-draft:";
  var LEGACY_KEYS = ["fittrack-beta-09-state", "fittrack-beta-08-state", "fittrack-beta-07-state", "fittrack-beta-06-state", "fittrack-beta-05-state", "fittrack-beta-04-state", "fittrack-v4-state", "fittrack-v3-state"];
  var REMINDER_IDS = [7101, 7102, 7103, 7104, 7105, 7106, 7107];
  var ASSET = {
    bench: "./assets/gifs/bench-press.gif", squat: "./assets/gifs/goblet-squat.gif",
    pull: "./assets/gifs/lat-pulldown.gif", pushup: "./assets/gifs/push-up.gif",
    bodySquat: "./assets/gifs/bodyweight-squat.gif", row: "./assets/gifs/seated-cable-row.gif"
  };

  var icons = {
    bolt: '<svg viewBox="0 0 24 24"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9h-6v-6H9v6H3v-9Z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24"><path d="M4 9v6M8 6v12M16 6v12M20 9v6M8 12h8"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><path d="m9 3-.6 2.2-2 .9-2-.6L2 9l1.6 1.6v2.8L2 15l2.4 3.5 2-.6 2 .9L9 21h6l.6-2.2 2-.9 2 .6L22 15l-1.6-1.6v-2.8L22 9l-2.4-3.5-2 .6-2-.9L15 3Z"/><circle cx="12" cy="12" r="3"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.6-5 3.2-7 8-7s7.4 2 8 7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    message: '<svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 9h8M8 13h5"/></svg>'
  };

  function fallbackImage(name, muscle) {
    var label = String(name || "FT").split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#15251e"/><stop offset="1" stop-color="#08100c"/></linearGradient></defs><rect width="480" height="480" rx="42" fill="url(#g)"/><circle cx="240" cy="205" r="105" fill="#76f5a4" opacity=".08"/><path d="M152 238h38m100 0h38M190 208v60m100-60v60m-100-30h100" stroke="#76f5a4" stroke-width="18" stroke-linecap="round"/><text x="240" y="376" text-anchor="middle" fill="#eefbf3" font-family="Arial" font-size="48" font-weight="800">' + label + '</text><text x="240" y="415" text-anchor="middle" fill="#8ba398" font-family="Arial" font-size="20">' + String(muscle || "Hareket") + '</text></svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }
  function defaultSetPlan(sets, repsTarget, rest, type) { var plan = []; for (var i = 0; i < (sets || 3); i += 1) plan.push({ type: type || "normal", repsTarget: repsTarget || "10–12", targetWeight: "", rest: Number(rest) || 60 }); return plan; }
  function exercise(data) {
    var value = Object.assign({ sets: 3, requiresWeight: true, requiresReps: true, alternatives: [], equipment: "Diğer", category: "Kuvvet", cues: [], coachNote: "", flowGroup: "" }, data);
    value.muscles = Array.isArray(value.muscles) && value.muscles.length ? value.muscles.slice(0, 2) : ["Tüm Vücut", "Destek"];
    value.setPlan = Array.isArray(value.setPlan) && value.setPlan.length ? value.setPlan : defaultSetPlan(value.sets, value.repsTarget, value.rest, value.setType);
    value.sets = value.setPlan.length;
    value.repsTarget = value.repsTarget || value.setPlan[0].repsTarget;
    value.rest = Number(value.rest) || value.setPlan[0].rest || 60;
    value.target = value.target || value.sets + " set · " + value.repsTarget + " tekrar";
    value.image = value.image || fallbackImage(value.name, value.muscles[0]);
    return value;
  }
  function catalogItem(id, name, muscle, equipment, requiresWeight, image, cues, secondary) { return exercise({ id: id, name: name, image: image || "", muscles: [muscle, secondary || "Destek"], equipment: equipment, requiresWeight: requiresWeight !== false, cues: cues || ["Hareket boyunca gövdeni kontrollü tut.", "Ağırlığı savurmadan tam aralıkta çalış.", "Form bozulursa yükü azalt."], builtIn: true }); }
  var exerciseCatalog = [
    catalogItem("bench-press", "Bench Press", "Göğüs", "Barbell", true, ASSET.bench, ["Ayaklarını yere sağlam bas.", "Kürek kemiklerini geride tut.", "Barı kontrollü indir, güçlü kaldır."], "Triceps"),
    catalogItem("goblet-squat", "Goblet Squat", "Bacak", "Dumbbell", true, ASSET.squat, ["Ağırlığı göğsüne yakın tut.", "Dizlerini ayak yönünde takip ettir.", "Topuklarından güç alarak yüksel."], "Kalça"),
    catalogItem("lat-pulldown", "Lat Pulldown", "Sırt", "Makine", true, ASSET.pull, ["Göğsünü hafifçe yukarı kaldır.", "Barı enseye değil, göğse çek.", "Dirseklerini aşağı ve geriye sür."], "Biceps"),
    catalogItem("push-up", "Şınav", "Göğüs", "Vücut", false, ASSET.pushup, ["Başından topuğuna düz bir çizgi oluştur.", "Dirseklerini yaklaşık 45° açıyla indir.", "Göğsünü kontrollü indirip zemini it."], "Triceps"),
    catalogItem("bodyweight-squat", "Vücut Ağırlığı Squat", "Bacak", "Vücut", false, ASSET.bodySquat, ["Ayaklarını omuz genişliğinde sabitle.", "Dizlerini ayak uçlarınla aynı yönde tut.", "Topuklarını kaldırmadan güçlü biçimde yüksel."], "Kalça"),
    catalogItem("cable-row", "Seated Cable Row", "Sırt", "Kablo", true, ASSET.row, ["Omurganı nötr, göğsünü açık tut.", "Kolu alt kaburgalarına doğru çek.", "Öne dönüşte ağırlığı kontrollü bırak."], "Biceps"),
    catalogItem("incline-db-press", "Incline Dumbbell Press", "Göğüs", "Dumbbell", true, "", null, "Omuz"),
    catalogItem("pec-deck", "Pec Deck Fly", "Göğüs", "Makine", true, "", null, "Omuz"),
    catalogItem("cable-crossover", "Cable Crossover", "Göğüs", "Kablo", true, "", null, "Omuz"),
    catalogItem("overhead-press", "Overhead Press", "Omuz", "Barbell", true, "", null, "Triceps"),
    catalogItem("lateral-raise", "Lateral Raise", "Omuz", "Dumbbell", true, "", null, "Üst Gövde"),
    catalogItem("face-pull", "Face Pull", "Omuz", "Kablo", true, "", null, "Sırt"),
    catalogItem("triceps-pushdown", "Triceps Pushdown", "Triceps", "Kablo", true, "", null, "Kol"),
    catalogItem("dips", "Dips", "Triceps", "Vücut", false, "", null, "Göğüs"),
    catalogItem("barbell-row", "Barbell Row", "Sırt", "Barbell", true, "", null, "Biceps"),
    catalogItem("one-arm-row", "One Arm Dumbbell Row", "Sırt", "Dumbbell", true, "", null, "Biceps"),
    catalogItem("pull-up", "Pull-up", "Sırt", "Vücut", false, "", null, "Biceps"),
    catalogItem("biceps-curl", "Biceps Curl", "Biceps", "Dumbbell", true, "", null, "Kol"),
    catalogItem("hammer-curl", "Hammer Curl", "Biceps", "Dumbbell", true, "", null, "Ön Kol"),
    catalogItem("back-squat", "Barbell Back Squat", "Bacak", "Barbell", true, "", null, "Kalça"),
    catalogItem("leg-press", "Leg Press", "Bacak", "Makine", true, "", null, "Kalça"),
    catalogItem("romanian-deadlift", "Romanian Deadlift", "Arka Bacak", "Barbell", true, "", null, "Kalça"),
    catalogItem("leg-curl", "Leg Curl", "Arka Bacak", "Makine", true, "", null, "Bacak"),
    catalogItem("leg-extension", "Leg Extension", "Ön Bacak", "Makine", true, "", null, "Bacak"),
    catalogItem("calf-raise", "Calf Raise", "Baldır", "Makine", true, "", null, "Bacak"),
    catalogItem("hip-thrust", "Hip Thrust", "Kalça", "Barbell", true, "", null, "Arka Bacak"),
    catalogItem("walking-lunge", "Walking Lunge", "Bacak", "Dumbbell", true, "", null, "Kalça"),
    catalogItem("deadlift", "Deadlift", "Tüm Vücut", "Barbell", true, "", null, "Sırt"),
    catalogItem("glute-bridge", "Glute Bridge", "Kalça", "Vücut", false, "", null, "Arka Bacak"),
    catalogItem("plank", "Plank", "Core", "Vücut", false, "", null, "Karın"),
    catalogItem("crunch", "Crunch", "Karın", "Vücut", false, "", null, "Core"),
    catalogItem("hanging-leg-raise", "Hanging Leg Raise", "Karın", "Vücut", false, "", null, "Core"),
    catalogItem("russian-twist", "Russian Twist", "Core", "Vücut", false, "", null, "Karın"),
    catalogItem("mountain-climber", "Mountain Climber", "Kardiyo", "Vücut", false, "", null, "Core"),
    catalogItem("kettlebell-swing", "Kettlebell Swing", "Tüm Vücut", "Kettlebell", true, "", null, "Kalça"),
    catalogItem("burpee", "Burpee", "Kardiyo", "Vücut", false, "", null, "Tüm Vücut")
  ];
  function catalogById(id) { return exerciseCatalog.find(function (item) { return item.id === id; }); }
  var pushup = catalogById("push-up"); var bodySquat = catalogById("bodyweight-squat"); var cableRow = catalogById("cable-row");
  var baseExercises = [catalogById("bench-press"), catalogById("goblet-squat"), catalogById("lat-pulldown")];
  baseExercises[0].alternatives = [pushup]; baseExercises[1].alternatives = [bodySquat]; baseExercises[2].alternatives = [cableRow];
  var builtInPrograms = [
    { id: "starter", name: "Temel Kuvvet A", description: "Yeni başlayanlar için tüm vücut kuvvet akışı.", generalNote: "İlk sette kontrollü başla; form bozulursa yükü azalt.", meta: "Tüm vücut · 28 dk", badge: "BUGÜN", image: "./assets/bench-press.jpg", status: "published", revision: 1, exercises: baseExercises },
    { id: "lower", name: "Alt Vücut & Core", description: "Bacak, kalça ve core odaklı temel program.", generalNote: "Diz ve ayak yönünü her tekrarda koru.", meta: "Bacak · Kalça · 34 dk", badge: "PERŞEMBE", image: "./assets/goblet-squat.jpg", status: "published", revision: 1, exercises: [baseExercises[1], bodySquat, catalogById("plank")] },
    { id: "upper", name: "Üst Vücut Denge", description: "İtiş ve çekiş dengesini koruyan üst gövde programı.", generalNote: "Omuzlarını kulaklarından uzak tut.", meta: "Göğüs · Sırt · 31 dk", badge: "CUMARTESİ", image: "./assets/lat-pulldown.jpg", status: "published", revision: 1, exercises: [baseExercises[2], baseExercises[0], pushup] }
  ];
  var programs = builtInPrograms.slice();
  var themes = {
    "volt-discipline": { name: "Volt Discipline", copy: "Siyah ve kontrollü koyu yeşil", color: "#69b482", background: "#050706", surface: "#141e18", text: "#f4faf6", mode: "dark", browserColor: "#050706" },
    "crimson-graphite": { name: "Crimson Graphite", copy: "Koyu gri ve derin kırmızı", color: "#e56a7f", background: "#111214", surface: "#202225", text: "#faf8f7", mode: "dark", browserColor: "#111214" },
    "plum-night": { name: "Plum Night", copy: "Koyu mürdüm ve yumuşak pembe", color: "#f0aec2", background: "#160f15", surface: "#281923", text: "#fff8fb", mode: "dark", browserColor: "#160f15" },
    "redline-editorial": { name: "Redline Editorial", copy: "Kırık beyaz ve belirgin kırmızı", color: "#d9362b", background: "#f4f0e8", surface: "#fffdf8", text: "#1b1916", mode: "light", browserColor: "#f4f0e8" },
    "rosewood-strength": { name: "Rosewood Strength", copy: "Krem ve zarif bordo", color: "#8e2f50", background: "#f7f1ee", surface: "#fffaf7", text: "#251c20", mode: "light", browserColor: "#f7f1ee" },
    "sage-motion": { name: "Sage Motion", copy: "Açık zemin ve premium koyu teal", color: "#18765c", background: "#f2f6f3", surface: "#ffffff", text: "#18231e", mode: "light", browserColor: "#f2f6f3" }
  };
  var legacyThemes = Object.freeze({ midnight: "volt-discipline", light: "sage-motion", rose: "rosewood-strength", ocean: "sage-motion", amber: "redline-editorial" });
  function normalizeThemeKey(key, fallback) { return themes[key] ? key : themes[legacyThemes[key]] ? legacyThemes[key] : fallback; }

  var ui = { tab: "home", tabHistory: [], restInterval: null, countdownTimer: null, toastTimer: null, progressRange: "days", progressExercise: "", trainerQuery: "", trainerFilter: "all", trainerMemberId: "", chatPartnerId: "", chatInboxOpen: false, studioView: "", studioProgramId: "", studioQuery: "", studioMuscle: "all", studioStep: 1, libraryQuery: "", libraryMuscle: "all", exerciseDetailId: "", exerciseDetailReturn: null, programDetailId: "", editorDraft: null, historyDraft: null, historyEditId: "", historyCollapsed: {}, onboardingStep: 1, onboardingDraft: null };
  var state = loadState();
  var topbar = document.getElementById("topbar");
  var screen = document.getElementById("screen");
  var bottomNav = document.getElementById("bottomNav");
  var flowLayer = document.getElementById("flowLayer");
  var sheetLayer = document.getElementById("sheetLayer");
  var toast = document.getElementById("toast");

  function demoSets(values) { return values.map(function (pair, index) { return { number: index + 1, weight: pair[0], reps: pair[1], completedAt: new Date().toISOString() }; }); }
  function defaultTrainer(withDemo) {
    var members = [{ id: "member-self", name: "Mert Yılmaz", programId: "starter", joinedAt: offsetDate(-120), note: "Bugün kontrollü başla; son setlerde formunu koru.", isSelf: true, history: [] }];
    if (withDemo !== false) members = members.concat([
      { id: "member-elif", name: "Elif Kaya", programId: "lower", joinedAt: offsetDate(-74), note: "Squat derinliğini acele etmeden koru.", isSelf: false, history: [{ id: "elif-1", date: offsetDate(-1), name: "Alt Vücut & Core", duration: 42, status: "completed", exercises: [] }, { id: "elif-2", date: offsetDate(-4), name: "Alt Vücut & Core", duration: 36, status: "completed", exercises: [] }] },
      { id: "member-can", name: "Can Demir", programId: "upper", joinedAt: offsetDate(-51), note: "Bu hafta ilk antrenmanı bekleniyor.", isSelf: false, history: [{ id: "can-1", date: offsetDate(-8), name: "Üst Vücut Denge", duration: 31, status: "completed", exercises: [] }] },
      { id: "member-zeynep", name: "Zeynep Arslan", programId: "starter", joinedAt: offsetDate(-19), note: "Yeni üye; ilk hafta hareket formuna odaklan.", isSelf: false, history: [] }
    ]);
    return { enabled: true, members: members };
  }
  function defaultState(withDemo) {
    var demos = withDemo === false ? [] : [
      { id: "demo-1", date: offsetDate(-2), name: "Temel Kuvvet A", duration: 47, status: "completed", notes: "Son sette formu korudum.", exercises: [
        { id: "bench-press", name: "Bench Press", requiresWeight: true, sets: demoSets([["42.5", "10"], ["45", "10"], ["45", "9"]]) },
        { id: "goblet-squat", name: "Goblet Squat", requiresWeight: true, sets: demoSets([["18", "12"], ["18", "12"], ["20", "10"]]) },
        { id: "lat-pulldown", name: "Lat Pulldown", requiresWeight: true, sets: demoSets([["37.5", "12"], ["40", "12"], ["40", "11"]]) }
      ] },
      { id: "demo-2", date: offsetDate(-5), name: "Üst Vücut Denge", duration: 68, status: "completed", notes: "", exercises: [
        { id: "lat-pulldown", name: "Lat Pulldown", requiresWeight: true, sets: demoSets([["35", "12"], ["37.5", "12"], ["37.5", "10"]]) },
        { id: "bench-press", name: "Bench Press", requiresWeight: true, sets: demoSets([["40", "10"], ["42.5", "10"], ["42.5", "8"]]) },
        { id: "push-up", name: "Şınav", requiresWeight: false, sets: demoSets([["", "15"], ["", "13"], ["", "12"]]) }
      ] }
    ];
    return {
      version: SCHEMA,
      theme: "volt-discipline",
      profile: { firstName: "Mert", lastName: "Yılmaz", age: 28, height: 178, currentWeight: 78, targetWeight: 75, units: "kg", goal: "fit", setupComplete: withDemo !== false },
      gym: { id: "", name: "Nova Fitness", coach: "Emre Hoca", coachId: "coach-demo", connected: true },
      selectedProgramId: "starter",
      assignment: { programId: "starter", dayId: "day-1", cloudId: "", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" },
      assignments: withDemo === false ? [{ programId: "starter", dayId: "day-1", cloudId: "", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" }] : [
        { programId: "starter", dayId: "day-1", cloudId: "", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" },
        { programId: "lower", dayId: "day-1", cloudId: "", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" },
        { programId: "upper", dayId: "day-1", cloudId: "", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" }
      ],
      trainer: defaultTrainer(withDemo),
      customExercises: [],
      customPrograms: [],
      deletedProgramIds: [], programDeletionState: {}, deletedHistoryIds: [], closedWorkoutIds: {}, workoutUpdatedAt: "",
      reminder: { enabled: false, time: "18:00", days: [1, 3, 5] },
      notifiedMessageIds: [],
      messages: withDemo === false ? [] : [
        { id: "demo-message-1", clientMutationId: "", senderId: "coach-demo", recipientId: "member-self", body: "Bugün kontrollü başla, son setlerde formunu koru.", createdAt: offsetDate(-1) + "T16:20:00.000Z", readAt: offsetDate(-1) + "T16:25:00.000Z" },
        { id: "demo-message-2", clientMutationId: "", senderId: "member-self", recipientId: "coach-demo", body: "Tamam hocam, antrenmandan sonra haber vereceğim.", createdAt: offsetDate(-1) + "T16:26:00.000Z", readAt: offsetDate(-1) + "T16:28:00.000Z" }
      ],
      history: demos.map(normalizeHistoryItem),
      currentWorkout: null,
      cloud: { userId: "", email: "", gymId: "", role: "", status: "signed-out", detail: "", pending: 0, snapshotVersion: 0, lastSyncedAt: "", migrationCompletedAt: "", migrationSource: "" }
    };
  }

  function normalizeSet(raw, index) { raw = raw || {}; return { number: index + 1, weight: String(raw.weight == null ? "" : raw.weight).slice(0, 8), reps: String(raw.reps == null ? "" : raw.reps).slice(0, 4), completedAt: raw.completedAt || (raw.completed === false ? null : new Date().toISOString()) }; }
  function exerciseIdFromName(name) { var slug = String(name || "exercise").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); return slug || "exercise"; }
  function normalizeHistoryExercise(entry) {
    entry = entry || {};
    var sets = Array.isArray(entry.sets) && entry.sets.length ? entry.sets.map(normalizeSet) : [normalizeSet({ weight: entry.weight, reps: entry.reps, completed: true }, 0)];
    return { id: clean(entry.id, exerciseIdFromName(entry.name), 80), name: clean(entry.name, "Hareket", 60), requiresWeight: entry.requiresWeight !== false, sets: sets.slice(0, 20) };
  }
  function historyVolume(item) { return (item.exercises || []).reduce(function (total, entry) { return total + (entry.sets || []).reduce(function (sum, set) { var weight = Number(set.weight); var reps = Number(set.reps); return sum + (Number.isFinite(weight) && Number.isFinite(reps) ? weight * reps : 0); }, 0); }, 0); }
  function historySetCount(item) { return (item.exercises || []).reduce(function (sum, entry) { return sum + (entry.sets || []).filter(function (set) { return Boolean(set.completedAt); }).length; }, 0); }
  function newUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var bytes = new Uint8Array(16); if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes); else for (var byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) bytes[byteIndex] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes).map(function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }
  function normalizeHistoryItem(item, index) {
    item = item || {};
    var exercises = Array.isArray(item.exercises) ? item.exercises.map(normalizeHistoryExercise) : [];
    var key = /^\d{4}-\d{2}-\d{2}$/.test(item.date || "") ? item.date : todayKey();
    var duration = safeNumber(item.duration == null ? item.durationMin : item.duration, 1, 1440, 30);
    var startedAt = validDateTime(item.startedAt, new Date(key + "T12:00:00").toISOString());
    var finishedAt = validDateTime(item.finishedAt, new Date(new Date(startedAt).getTime() + duration * 60000).toISOString());
    var normalized = {
      id: clean(item.id, "history-" + Date.now() + "-" + (index || 0), 90),
      syncId: /^[0-9a-f-]{36}$/i.test(item.syncId || "") ? item.syncId : newUuid(),
      date: key,
      name: clean(item.name || item.routineName, "Antrenman", 60),
      duration: duration,
      status: item.status === "partial" ? "partial" : "completed",
      notes: String(item.notes || "").slice(0, 240),
      exercises: exercises,
      startedAt: startedAt,
      finishedAt: finishedAt,
      programId: clean(item.programId, "", 90),
      dayId: clean(item.dayId, "", 60),
      dayName: clean(item.dayName, "", 40),
      programCloudId: /^[0-9a-f-]{36}$/i.test(item.programCloudId || "") ? item.programCloudId : "",
      assignmentCloudId: /^[0-9a-f-]{36}$/i.test(item.assignmentCloudId || "") ? item.assignmentCloudId : "",
      cloudRecordId: /^[0-9a-f-]{36}$/i.test(item.cloudRecordId || "") ? item.cloudRecordId : "",
      cloudSyncedAt: item.cloudSyncedAt ? validDateTime(item.cloudSyncedAt, "") : "",
      modifiedAt: validDateTime(item.modifiedAt, finishedAt),
      units: item.units === "lb" ? "lb" : item.units === "kg" ? "kg" : null,
      isDemo: Boolean(item.isDemo || /^demo-/.test(item.id || ""))
    };
    normalized.moves = exercises.filter(function (entry) { return entry.sets.length; }).length || safeNumber(item.moves, 0, 99, 0);
    normalized.totalSets = historySetCount(normalized);
    normalized.volume = Math.round(historyVolume(normalized));
    return normalized;
  }
  function normalizePlanSet(raw, index, fallback) {
    raw = raw && typeof raw === "object" ? raw : {}; fallback = fallback || {};
    var types = ["warmup", "normal", "drop", "failure"];
    return {
      type: types.indexOf(raw.type) !== -1 ? raw.type : (types.indexOf(fallback.type) !== -1 ? fallback.type : "normal"),
      repsTarget: clean(raw.repsTarget, clean(fallback.repsTarget, "10–12", 18), 18),
      targetWeight: String(raw.targetWeight == null ? (fallback.targetWeight || "") : raw.targetWeight).slice(0, 8),
      rest: safeInteger(raw.rest, 0, 600, safeInteger(fallback.rest, 0, 600, 60)),
      number: index + 1
    };
  }
  function cloneExerciseDefinition(raw, index) {
    raw = raw && typeof raw === "object" ? raw : {}; var known = exerciseCatalog.find(function (item) { return item.id === raw.id; }); var source = Object.assign({}, known || {}, raw);
    var fallbackPlan = Array.isArray(known && known.setPlan) ? known.setPlan : defaultSetPlan(source.sets, source.repsTarget, source.rest, source.setType);
    var planSource = Array.isArray(source.setPlan) && source.setPlan.length ? source.setPlan : fallbackPlan;
    var plan = planSource.slice(0, 12).map(function (set, setIndex) { return normalizePlanSet(set, setIndex, fallbackPlan[Math.min(setIndex, fallbackPlan.length - 1)]); });
    if (!plan.length) plan = defaultSetPlan(3, "10–12", 60, "normal").map(normalizePlanSet);
    return exercise({
      id: clean(source.id, "exercise-" + (index || 0), 80), name: clean(source.name, "Hareket", 60), image: typeof source.image === "string" && source.image.slice(0, 5) === "data:" ? source.image.slice(0, 12000) : clean(source.image, "", 300),
      muscles: Array.isArray(source.muscles) ? source.muscles.slice(0, 2).map(function (item) { return clean(item, "Destek", 30); }) : ["Tüm Vücut", "Destek"], equipment: clean(source.equipment, "Diğer", 30), category: clean(source.category, "Kuvvet", 30),
      requiresWeight: source.requiresWeight !== false, requiresReps: source.requiresReps !== false, cues: Array.isArray(source.cues) ? source.cues.slice(0, 5).map(function (cue) { return clean(cue, "Kontrollü çalış.", 120); }) : [],
      coachNote: String(source.coachNote || "").slice(0, 240), flowGroup: String(source.flowGroup || "").slice(0, 12), alternatives: [], setPlan: plan, builtIn: Boolean(source.builtIn)
    });
  }
  function normalizeCustomExercise(raw, index) { var item = cloneExerciseDefinition(raw, index); item.builtIn = false; item.id = clean(raw && raw.id, "custom-exercise-" + Date.now() + "-" + (index || 0), 80); return item; }
  function normalizeProgramDay(raw, index, fallbackExercises) {
    raw = raw && typeof raw === "object" ? raw : {};
    var exercises = Array.isArray(raw.exercises) ? raw.exercises : (fallbackExercises || []);
    var weekday = raw.weekday == null || raw.weekday === "" ? NaN : Number(raw.weekday);
    return { id: clean(raw.id, "day-" + (index + 1), 60), name: clean(raw.name, (index + 1) + ". Gün", 40), weekday: Number.isInteger(weekday) && weekday >= 0 && weekday <= 6 ? weekday : null, exercises: exercises.slice(0, 24).map(cloneExerciseDefinition) };
  }
  function programDays(program) { return program && Array.isArray(program.days) && program.days.length ? program.days : [{ id: "day-1", name: "1. Gün", weekday: null, exercises: program && program.exercises || [] }]; }
  function programTrainingWeekdays(program) {
    var values = program && Array.isArray(program.trainingWeekdays) ? program.trainingWeekdays : programDays(program).map(function (day) { return day.weekday; });
    return [1, 2, 3, 4, 5, 6, 0].filter(function (day) { return values.some(function (value) { return value != null && value !== "" && Number(value) === day; }); });
  }
  function activeProgramDay(program, preferredId) {
    var days = programDays(program); var preferred = days.find(function (day) { return day.id === preferredId; }); if (preferred) return preferred;
    return days[0];
  }
  function programMeta(program) {
    var days = programDays(program); var allExercises = days.reduce(function (list, day) { return list.concat(day.exercises); }, []);
    var minutes = allExercises.reduce(function (sum, item) { return sum + item.setPlan.reduce(function (setSum, set) { return setSum + Math.max(20, set.rest); }, 0) + item.sets * 35; }, 0);
    var muscles = []; allExercises.forEach(function (item) { if (item.muscles[0] && muscles.indexOf(item.muscles[0]) === -1) muscles.push(item.muscles[0]); });
    return (days.length > 1 ? days.length + " gün · " : "") + (muscles.slice(0, 2).join(" · ") || "Özel") + " · " + Math.max(5, Math.round(minutes / Math.max(1, days.length) / 60)) + " dk/gün";
  }
  function normalizeCustomProgram(raw, index) {
    raw = raw && typeof raw === "object" ? raw : {}; var status = ["draft", "published", "archived"].indexOf(raw.status) !== -1 ? raw.status : "draft";
    var exercises = Array.isArray(raw.exercises) ? raw.exercises.slice(0, 24).map(cloneExerciseDefinition) : [];
    var days = Array.isArray(raw.days) && raw.days.length ? raw.days.slice(0, 7).map(function (day, dayIndex) { return normalizeProgramDay(day, dayIndex); }) : [normalizeProgramDay({ exercises: exercises }, 0)];
    exercises = days[0].exercises;
    var cover = typeof raw.image === "string" && raw.image.indexOf("./assets/") === 0 ? raw.image : exercises[0] && typeof exercises[0].image === "string" && exercises[0].image.indexOf("./assets/") === 0 ? exercises[0].image : "./assets/bench-press.jpg";
    var program = { id: clean(raw.id, "custom-program-" + Date.now() + "-" + (index || 0), 90), rootId: clean(raw.rootId, clean(raw.id, "custom-program-" + Date.now() + "-" + (index || 0), 90), 90), cloudId: /^[0-9a-f-]{36}$/i.test(raw.cloudId || "") ? raw.cloudId : "", cloudRootId: /^[0-9a-f-]{36}$/i.test(raw.cloudRootId || "") ? raw.cloudRootId : "", name: clean(raw.name, "İsimsiz program", 60), description: String(raw.description || "").slice(0, 240), generalNote: String(raw.generalNote || "").slice(0, 320), status: status, revision: safeInteger(raw.revision, 1, 999, 1), badge: status === "draft" ? "TASLAK" : status === "archived" ? "ARŞİV" : "ÖZEL", image: cover, createdAt: validDateTime(raw.createdAt, new Date().toISOString()), updatedAt: validDateTime(raw.updatedAt, new Date().toISOString()), cloudSyncedAt: raw.cloudSyncedAt ? validDateTime(raw.cloudSyncedAt, "") : "", trainingWeekdays: programTrainingWeekdays(raw), days: days, exercises: exercises };
    program.meta = programMeta(program); return program;
  }
  function refreshPrograms(sourceState) { var source = sourceState || state; programs = builtInPrograms.concat(source && Array.isArray(source.customPrograms) ? source.customPrograms : []); }
  function programById(id) { return programs.find(function (program) { return program.id === id; }) || builtInPrograms[0]; }
  function assignablePrograms() { return programs.filter(function (program) { return program.status === "published"; }); }
  function normalizeAssignment(raw, index, coach) {
    raw = raw && typeof raw === "object" ? raw : {};
    var program = programs.find(function (item) { return item.id === raw.programId; });
    return {
      programId: program ? program.id : clean(raw.programId, "unavailable-program", 90),
      dayId: program ? activeProgramDay(program, raw.dayId).id : clean(raw.dayId, "", 90),
      cloudId: /^[0-9a-f-]{36}$/i.test(raw.cloudId || "") ? raw.cloudId : "",
      assignedAt: validDateTime(raw.assignedAt, new Date().toISOString()),
      assignedBy: clean(raw.assignedBy, coach || "Antrenör", 60),
      coachNote: String(raw.coachNote || "").slice(0, 500)
    };
  }
  function assignedPrograms() {
    var list = Array.isArray(state.assignments) ? state.assignments : state.assignment ? [state.assignment] : [];
    return list.filter(Boolean).map(function (assignment) { return { assignment: assignment, program: programs.find(function (item) { return item.id === assignment.programId; }) }; }).filter(function (entry) { return Boolean(entry.program); }).filter(function (entry, index, values) { return values.findIndex(function (other) { return other.program.id === entry.program.id; }) === index; });
  }
  function selectedAssignment() {
    var list = Array.isArray(state.assignments) ? state.assignments : [];
    return list.find(function (item) { return item.programId === state.selectedProgramId; }) || list[0] || state.assignment || null;
  }
  function selectAssignment(programId) {
    var target = (state.assignments || []).find(function (item) { return item.programId === programId; });
    if (!target) return false;
    state.selectedProgramId = target.programId;
    state.assignment = Object.assign({}, target);
    return true;
  }

  function normalizeMessage(raw, index) {
    raw = raw && typeof raw === "object" ? raw : {};
    var createdAt = validDateTime(raw.createdAt || raw.created_at, new Date().toISOString());
    return {
      id: clean(raw.id, "message-" + Date.now() + "-" + (index || 0), 90),
      clientMutationId: /^[0-9a-f-]{36}$/i.test(raw.clientMutationId || raw.client_mutation_id || "") ? (raw.clientMutationId || raw.client_mutation_id) : "",
      senderId: clean(raw.senderId || raw.sender_id, "", 80),
      recipientId: clean(raw.recipientId || raw.recipient_id, "", 80),
      body: String(raw.body || "").trim().slice(0, 1000),
      createdAt: createdAt,
      readAt: raw.readAt || raw.read_at ? validDateTime(raw.readAt || raw.read_at, "") : "",
      pending: Boolean(raw.pending)
    };
  }
  function mergeMessages(localItems, remoteItems) {
    var map = {};
    (localItems || []).concat(remoteItems || []).map(normalizeMessage).filter(function (item) { return item.senderId && item.recipientId && item.body; }).forEach(function (item) {
      var key = item.clientMutationId || item.id;
      var previous = map[key];
      if (!previous || (!item.pending && previous.pending) || String(item.readAt || "") > String(previous.readAt || "")) map[key] = item;
    });
    return Object.keys(map).map(function (key) { return map[key]; }).sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); }).slice(-500);
  }
  function catalogExercises() { return exerciseCatalog.concat(state && Array.isArray(state.customExercises) ? state.customExercises : []); }
  function normalizeTrainerMember(member, index) {
    member = member || {};
    var memberAssignments = Array.isArray(member.assignments) ? member.assignments : [{ programId: member.programId, cloudId: member.cloudAssignmentId, coachNote: member.note }];
    memberAssignments = memberAssignments.map(function (item, assignmentIndex) { return normalizeAssignment(item, assignmentIndex, state && state.gym && state.gym.coach || "Antrenör"); }).filter(function (item, assignmentIndex, list) { return list.findIndex(function (other) { return other.programId === item.programId; }) === assignmentIndex; });
    return {
      id: clean(member.id, "member-" + (index || 0), 80),
      name: clean(member.name, "Üye", 60),
      programId: memberAssignments[0] ? memberAssignments[0].programId : member.programId ? programById(member.programId).id : "",
      programIds: memberAssignments.map(function (item) { return item.programId; }),
      assignments: memberAssignments,
      cloudAssignmentId: memberAssignments[0] ? memberAssignments[0].cloudId : "",
      joinedAt: /^\d{4}-\d{2}-\d{2}$/.test(member.joinedAt || "") ? member.joinedAt : todayKey(),
      note: String(member.note || "").slice(0, 180),
      isSelf: Boolean(member.isSelf),
      history: Array.isArray(member.history) ? member.history.slice(0, 100).map(normalizeHistoryItem) : []
    };
  }
  function normalizeTrainer(saved, fallbackValue, allowNoSelf) {
    var fallback = fallbackValue && Array.isArray(fallbackValue.members) ? fallbackValue : defaultTrainer(fallbackValue);
    var source = saved && Array.isArray(saved.members) ? saved.members : fallback.members;
    var members = source.slice(0, 200).map(normalizeTrainerMember);
    var selfIndex = members.findIndex(function (member) { return member.isSelf || member.id === "member-self"; });
    if (selfIndex === -1 && !allowNoSelf) members.unshift(normalizeTrainerMember(fallback.members[0], 0));
    else members.forEach(function (member, index) { member.isSelf = index === selfIndex; });
    return { enabled: !saved || saved.enabled !== false, members: members };
  }
  function validDateTime(value, fallback) { var time = new Date(value).getTime(); return Number.isFinite(time) ? new Date(time).toISOString() : fallback; }
  function normalizeActiveLog(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    return { weight: String(raw.weight == null ? "" : raw.weight).slice(0, 8), reps: String(raw.reps == null ? "" : raw.reps).slice(0, 4), completedAt: typeof raw.completedAt === "string" && Number.isFinite(new Date(raw.completedAt).getTime()) ? raw.completedAt : null, carried: Boolean(raw.carried) };
  }
  function normalizeCurrentWorkout(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.exerciseIndex != null) {
      var program = workoutProgram(raw); var workoutDay = activeProgramDay(program, raw.dayId); var workoutExercises = workoutDay.exercises;
      var swaps = {};
      if (raw.swaps && typeof raw.swaps === "object") Object.keys(raw.swaps).forEach(function (key) {
        var index = Number(key); var replacement = raw.swaps[key]; var original = workoutExercises[index];
        if (!Number.isInteger(index) || !original || !replacement || typeof replacement.id !== "string") return;
        if (original.alternatives.some(function (item) { return item.id === replacement.id; })) swaps[index] = { id: replacement.id };
      });
      var exerciseIndex = safeInteger(raw.exerciseIndex, 0, workoutExercises.length - 1, 0);
      var selected = workoutExercises[exerciseIndex];
      if (swaps[exerciseIndex]) selected = selected.alternatives.find(function (item) { return item.id === swaps[exerciseIndex].id; }) || selected;
      var setIndex = safeInteger(raw.setIndex, 0, selected.sets - 1, 0);
      var logs = {};
      if (raw.logs && typeof raw.logs === "object") Object.keys(raw.logs).forEach(function (exerciseKey) {
        var moveIndex = Number(exerciseKey); var moveLogs = raw.logs[exerciseKey]; var move = workoutExercises[moveIndex];
        if (!Number.isInteger(moveIndex) || !move || !moveLogs || typeof moveLogs !== "object") return;
        Object.keys(moveLogs).forEach(function (setKey) {
          var moveSet = Number(setKey);
          if (!Number.isInteger(moveSet) || moveSet < 0 || moveSet >= move.sets) return;
          if (!logs[moveIndex]) logs[moveIndex] = {};
          logs[moveIndex][moveSet] = normalizeActiveLog(moveLogs[setKey]);
        });
      });
      var skipped = Array.isArray(raw.skipped) ? raw.skipped.map(Number).filter(function (index, position, list) { return Number.isInteger(index) && index >= 0 && index < workoutExercises.length && list.indexOf(index) === position; }) : [];
      var next = raw.next && typeof raw.next === "object" ? { exerciseIndex: Number(raw.next.exerciseIndex), setIndex: Number(raw.next.setIndex) } : null;
      if (next) { var nextMove = workoutExercises[next.exerciseIndex]; if (!nextMove || !Number.isInteger(next.setIndex) || next.setIndex < 0 || next.setIndex >= nextMove.sets) next = null; }
      var startedAt = validDateTime(raw.startedAt, new Date().toISOString());
      var pausedAt = Number(raw.pausedAt);
      return { id: clean(raw.id, "workout-" + Date.now(), 90), syncId: /^[0-9a-f-]{36}$/i.test(raw.syncId || "") ? raw.syncId : newUuid(), programId: program.id, programSnapshot: raw.orphaned ? null : snapshotProgram(program), orphaned: Boolean(raw.orphaned), assignmentCloudId: raw.assignmentCloudId || "", updatedAt: validDateTime(raw.updatedAt, raw.startedAt || ""), units: raw.units === "lb" ? "lb" : "kg", dayId: workoutDay.id, exerciseIndex: exerciseIndex, setIndex: setIndex, startedAt: startedAt, finishedAt: raw.finishedAt ? validDateTime(raw.finishedAt, null) : null, duration: safeNumber(raw.duration, 1, 1440, null), logs: logs, swaps: swaps, skipped: skipped, restEnd: Number.isFinite(Number(raw.restEnd)) && Number(raw.restEnd) > 0 ? Number(raw.restEnd) : null, restDuration: safeInteger(raw.restDuration, 0, 600, null), next: next, status: raw.status === "paused" ? "paused" : "active", pausedAt: Number.isFinite(pausedAt) && pausedAt > 0 ? pausedAt : null, pauseRemaining: safeNumber(raw.pauseRemaining, 0, 86400000, null), totalPausedMs: safeNumber(raw.totalPausedMs, 0, 31536000000, 0), partial: Boolean(raw.partial), summarySaved: Boolean(raw.summarySaved) };
    }
    var legacyProgram = workoutProgram(raw); var legacyDay = activeProgramDay(legacyProgram, raw.dayId); var legacyExercises = legacyDay.exercises; var legacyLogs = raw.logs || {}; var converted = {};
    (raw.completed || []).forEach(function (exerciseIndex) {
      var old = legacyLogs[exerciseIndex] || {}; converted[exerciseIndex] = {};
      if (!legacyExercises[exerciseIndex]) return;
      for (var setIndex = 0; setIndex < legacyExercises[exerciseIndex].sets; setIndex += 1) converted[exerciseIndex][setIndex] = { weight: String(old.weight || ""), reps: String(old.reps || ""), completedAt: new Date().toISOString(), carried: false };
    });
    var activeIndex = safeInteger(raw.index, 0, legacyExercises.length - 1, 0);
    return { id: clean(raw.id, "workout-" + Date.now(), 90), syncId: /^[0-9a-f-]{36}$/i.test(raw.syncId || "") ? raw.syncId : newUuid(), programId: legacyProgram.id, programSnapshot: raw.orphaned ? null : snapshotProgram(legacyProgram), orphaned: Boolean(raw.orphaned), assignmentCloudId: raw.assignmentCloudId || "", updatedAt: validDateTime(raw.updatedAt, raw.startedAt || ""), units: raw.units === "lb" ? "lb" : "kg", dayId: legacyDay.id, exerciseIndex: activeIndex, setIndex: 0, startedAt: validDateTime(raw.startedAt, new Date().toISOString()), finishedAt: null, duration: null, logs: converted, swaps: {}, skipped: [], restEnd: null, next: null, status: "active", pausedAt: null, pauseRemaining: null, totalPausedMs: 0, partial: false, summarySaved: Boolean(raw.summarySaved) };
  }

  function mergeKnown(fresh, saved) {
    saved = saved || {}; var p = saved.profile || {};
    var savedCloud = saved.cloud || {};
    fresh.cloud = {
      userId: clean(savedCloud.userId, "", 80), email: clean(savedCloud.email, "", 160), gymId: clean(savedCloud.gymId, "", 80), role: ["admin", "trainer", "member"].indexOf(savedCloud.role) !== -1 ? savedCloud.role : "",
      status: clean(savedCloud.status, "signed-out", 30), detail: clean(savedCloud.detail, "", 120), pending: safeInteger(savedCloud.pending, 0, 999, 0), snapshotVersion: safeInteger(savedCloud.snapshotVersion, 0, 2147483647, 0),
      lastSyncedAt: savedCloud.lastSyncedAt ? validDateTime(savedCloud.lastSyncedAt, "") : "", migrationCompletedAt: savedCloud.migrationCompletedAt ? validDateTime(savedCloud.migrationCompletedAt, "") : "", migrationSource: clean(savedCloud.migrationSource, "", 80)
    };
    fresh.customExercises = Array.isArray(saved.customExercises) ? saved.customExercises.slice(0, 100).map(normalizeCustomExercise) : [];
    fresh.deletedProgramIds = Array.isArray(saved.deletedProgramIds) ? saved.deletedProgramIds.map(String).slice(0, 100) : [];
    mergeProgramDeletionState(fresh, saved);
    fresh.customPrograms = Array.isArray(saved.customPrograms) ? saved.customPrograms.slice(0, 100).map(normalizeCustomProgram).filter(function (item) { return fresh.deletedProgramIds.indexOf(item.id) === -1; }) : [];
    refreshPrograms(fresh);
    Object.keys(fresh.profile).forEach(function (key) { if (Object.prototype.hasOwnProperty.call(p, key)) fresh.profile[key] = p[key]; });
    fresh.gym = Object.assign(fresh.gym, saved.gym || {});
    fresh.profile = { firstName: clean(fresh.profile.firstName, "Sporcu", 28), lastName: clean(fresh.profile.lastName, "", 32), age: safeNumber(fresh.profile.age, 14, 100, 28), height: safeNumber(fresh.profile.height, 120, 230, 175), currentWeight: safeNumber(fresh.profile.currentWeight, 30, 660, 75), targetWeight: safeNumber(fresh.profile.targetWeight, 30, 660, 75), units: fresh.profile.units === "lb" ? "lb" : "kg", goal: ["lose", "fit", "gain"].indexOf(fresh.profile.goal) !== -1 ? fresh.profile.goal : "fit", setupComplete: typeof p.setupComplete === "boolean" ? p.setupComplete : Boolean(p.firstName && p.lastName && !(p.firstName === "Mert" && p.lastName === "Yılmaz" && Number(p.age) === 28 && Number(p.height) === 178 && Number(p.currentWeight) === 78 && Number(p.targetWeight) === 75)) };
    fresh.gym = { id: clean(fresh.gym.id, "", 80), name: clean(fresh.gym.name, "Salon", 60), coach: clean(fresh.gym.coach, "Antrenör", 60), coachId: clean(fresh.gym.coachId, "", 80), connected: Boolean(fresh.gym.connected) };
    var assignmentSource = Array.isArray(saved.assignments) ? saved.assignments : saved.assignment ? [saved.assignment] : fresh.assignments;
    fresh.assignments = assignmentSource.map(function (item, index) { return normalizeAssignment(item, index, fresh.gym.coach); }).filter(function (item, index, list) { return list.findIndex(function (other) { return other.programId === item.programId; }) === index; });
    var legacyPrimary = assignmentSource.find(function (item) { return item && item.isPrimary; });
    fresh.selectedProgramId = fresh.assignments.length ? clean(saved.selectedProgramId || legacyPrimary && legacyPrimary.programId, fresh.assignments[0].programId, 90) : "";
    var selected = fresh.assignments.find(function (item) { return item.programId === fresh.selectedProgramId; }) || fresh.assignments[0];
    fresh.selectedProgramId = selected ? selected.programId : "";
    fresh.assignment = selected ? Object.assign({}, selected) : null;
    fresh.trainer = normalizeTrainer(saved.trainer, fresh.trainer, ["admin", "trainer"].indexOf(fresh.cloud.role) !== -1);
    var self = fresh.trainer.members.find(function (member) { return member.isSelf; });
    if (self) { self.name = (clean(fresh.profile.firstName, "Sporcu", 28) + " " + clean(fresh.profile.lastName, "", 32)).trim(); self.programId = selected ? selected.programId : ""; self.programIds = fresh.assignments.map(function (item) { return item.programId; }); self.assignments = fresh.assignments.map(function (item) { return Object.assign({}, item); }); }
    fresh.theme = normalizeThemeKey(saved.theme, fresh.theme);
    if (saved.reminder) fresh.reminder = { enabled: Boolean(saved.reminder.enabled), time: /^\d{2}:\d{2}$/.test(saved.reminder.time || "") ? saved.reminder.time : "18:00", days: Array.isArray(saved.reminder.days) && saved.reminder.days.length ? saved.reminder.days.map(Number).filter(function (day) { return day >= 0 && day <= 6; }) : [1, 3, 5] };
    if (Array.isArray(saved.history)) fresh.history = saved.history.slice(0, 200).map(normalizeHistoryItem);
    if (Array.isArray(saved.workoutHistory)) fresh.history = saved.workoutHistory.slice(0, 200).map(normalizeHistoryItem);
    fresh.notifiedMessageIds = Array.isArray(saved.notifiedMessageIds) ? saved.notifiedMessageIds.map(String).slice(-300) : [];
    fresh.messages = mergeMessages(fresh.messages, saved.messages || []);
    fresh.deletedHistoryIds = Array.isArray(saved.deletedHistoryIds) ? saved.deletedHistoryIds.filter(function (id) { return typeof id === "string"; }) : [];
    fresh.history = fresh.history.filter(function (item) { return fresh.deletedHistoryIds.indexOf(item.syncId) < 0; });
    fresh.closedWorkoutIds = Object.assign({}, saved.closedWorkoutIds || {});
    fresh.workoutUpdatedAt = validDateTime(saved.workoutUpdatedAt, "");
    fresh.currentWorkout = normalizeCurrentWorkout(saved.currentWorkout);
    if (fresh.currentWorkout && fresh.closedWorkoutIds[fresh.currentWorkout.syncId]) fresh.currentWorkout = null;
    return fresh;
  }
  function loadState() {
    var nativeRuntime = Boolean(window.FITTRACK_FORCE_CLOUD || (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()));
    var fresh = defaultState(!nativeRuntime);
    try {
      var current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (current) return mergeKnown(fresh, current);
      for (var i = 0; i < LEGACY_KEYS.length; i += 1) { var legacy = JSON.parse(localStorage.getItem(LEGACY_KEYS[i]) || "null"); if (legacy) { var migrated = mergeKnown(fresh, legacy); migrated.cloud.migrationSource = LEGACY_KEYS[i]; return migrated; } }
    } catch (error) { console.warn("FitTrack verisi okunamadı", error); }
    return fresh;
  }

  function clean(value, fallback, max) { return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback; }
  function safeNumber(value, min, max, fallback) { var number = Number(value); return Number.isFinite(number) && number >= min && number <= max ? number : fallback; }
  function safeInteger(value, min, max, fallback) { var number = Number(value); return Number.isInteger(number) && number >= min && number <= max ? number : fallback; }
  function pad(value) { return String(value).padStart(2, "0"); }
  function dateKey(date) { return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function offsetDate(days) { var date = new Date(); date.setDate(date.getDate() + days); return dateKey(date); }
  function fullName() { return (clean(state.profile.firstName, "Sporcu", 28) + " " + clean(state.profile.lastName, "", 32)).trim(); }
  function initials(name) { return clean(name, "FT", 60).split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase(); }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]; }); }
  function exerciseImage(item) { return item && item.image ? item.image : fallbackImage(item && item.name, item && item.muscles && item.muscles[0]); }
  function exerciseImg(item, className, alt) { var fallback = fallbackImage(item && item.name, item && item.muscles && item.muscles[0]); return '<img' + (className ? ' class="' + esc(className) + '"' : '') + ' src="' + esc(exerciseImage(item)) + '" data-fallback="' + esc(fallback) + '" alt="' + esc(alt == null ? (item && item.name) || "Hareket" : alt) + '">'; }
  function setTypeLabel(type) { return { warmup: "Isınma", normal: "Normal", drop: "Drop", failure: "Tükeniş" }[type] || "Normal"; }
  function snapshotProgram(raw) {
    var copy = normalizeCustomProgram(raw);
    copy.days.forEach(function (day, dayIndex) {
      var source = programDays(raw)[dayIndex];
      day.exercises.forEach(function (item, index) { item.alternatives = ((source.exercises[index] || {}).alternatives || []).slice(0, 8).map(cloneExerciseDefinition); });
    });
    return copy;
  }
  function recoveryProgram(workout) {
    var logs = workout.logs || {}; var last = Math.max(Number(workout.exerciseIndex) || 0, 0);
    Object.keys(logs).forEach(function (key) { if (/^\d+$/.test(key)) last = Math.min(23, Math.max(last, Number(key))); });
    var exercises = [];
    for (var i = 0; i <= last; i += 1) {
      var count = Math.min(12, Math.max(1, Number(workout.setIndex) + 1 || 1, Object.keys(logs[i] || {}).reduce(function (max, key) { return /^\d+$/.test(key) ? Math.max(max, Number(key) + 1) : max; }, 0)));
      exercises.push(cloneExerciseDefinition({ id: "recovered-" + i, name: "Önceki hareket " + (i + 1), sets: count }));
    }
    return normalizeCustomProgram({ id: workout.programId || "recovered-workout", name: "Önceki antrenman", status: "archived", days: [{ id: workout.dayId || "day-1", name: "Kurtarılan kayıt", exercises: exercises }] });
  }
  function workoutProgram(workout) {
    if (workout.programSnapshot && programDays(workout.programSnapshot).some(function (day) { return day.exercises.length; })) return workout.programSnapshot;
    var known = programs.find(function (program) { return program.id === workout.programId; });
    if (known && programDays(known).some(function (day) { return day.exercises.length; })) {
      workout.programSnapshot = snapshotProgram(known); workout.orphaned = false; return workout.programSnapshot;
    }
    workout.orphaned = true;
    return recoveryProgram(workout);
  }
  function currentProgram() {
    if (state && state.currentWorkout) return workoutProgram(state.currentWorkout);
    var selected = state ? selectedAssignment() : null;
    return programById(selected && selected.programId || "starter");
  }

  function currentProgramDay() { var selected = state ? selectedAssignment() : null; var preferred = state && state.currentWorkout ? state.currentWorkout.dayId : selected ? selected.dayId : ""; return activeProgramDay(currentProgram(), preferred); }
  function currentExercises() { return currentProgramDay().exercises; }
  function isCloudStaff() { return state.cloud && ["admin", "trainer"].indexOf(state.cloud.role) !== -1; }
  function canUseTrainerPanel() { return isCloudStaff() || !state.cloud || !state.cloud.userId; }
  function nextWorkoutTimestamp() { return new Date(Math.max(Date.now(), (Date.parse(state.workoutUpdatedAt || "") || 0) + 1)).toISOString(); }
  function closeCurrentWorkout() {
    if (state.currentWorkout) { state.workoutUpdatedAt = nextWorkoutTimestamp(); state.closedWorkoutIds[state.currentWorkout.syncId] = state.workoutUpdatedAt; }
    state.currentWorkout = null;
  }
  function saveState(options) {
    options = options || {}; state.version = SCHEMA;
    var workout = state.currentWorkout;
    var fingerprint = workout ? JSON.stringify(Object.assign({}, workout, { updatedAt: "" })) : "";
    if (!options.remote && fingerprint !== ui.workoutFingerprint) {
      var now = nextWorkoutTimestamp();
      if (workout) workout.updatedAt = now;
      else if (ui.lastWorkoutSyncId) state.closedWorkoutIds[ui.lastWorkoutSyncId] = now;
      state.workoutUpdatedAt = now;
    }
    ui.workoutFingerprint = fingerprint;
    ui.lastWorkoutSyncId = workout && workout.syncId || "";
    try {
      var serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      if (state.cloud && state.cloud.userId) {
        localStorage.setItem(ACCOUNT_KEY_PREFIX + state.cloud.userId, serialized);
        if (state.cloud.gymId) localStorage.setItem(ACCOUNT_KEY_PREFIX + state.cloud.userId + "-gym-" + state.cloud.gymId, serialized);
      }
    } catch (error) { console.warn("Yerel kayıt tamamlanamadı", error); if (toast) showToast("Cihaz depolaması dolu; son değişikliği yedekle."); }
    window.dispatchEvent(new CustomEvent("fittrack:state-saved", { detail: { remote: Boolean(options.remote) } }));
  }

  function resolveExerciseAt(index) { var original = currentExercises()[index]; var replacement = state.currentWorkout && state.currentWorkout.swaps && state.currentWorkout.swaps[index]; if (!replacement) return original; return original.alternatives.concat([original]).find(function (item) { return item.id === replacement.id; }) || original; }
  function currentExercise() { return state.currentWorkout ? resolveExerciseAt(state.currentWorkout.exerciseIndex) : null; }
  function currentSetDefinition(item, setIndex) { item = item || currentExercise(); setIndex = setIndex == null && state.currentWorkout ? state.currentWorkout.setIndex : setIndex; return item && item.setPlan && item.setPlan[setIndex] ? item.setPlan[setIndex] : normalizePlanSet({}, Number(setIndex) || 0, { repsTarget: item && item.repsTarget, rest: item && item.rest }); }
  function currentPositionText() { if (!state.currentWorkout) return ""; var item = currentExercise(); return item.name + " · Set " + (state.currentWorkout.setIndex + 1) + "/" + item.sets; }
  function getLog(exerciseIndex, setIndex, create) { var workout = state.currentWorkout; if (!workout) return {}; if (!workout.logs[exerciseIndex] && create) workout.logs[exerciseIndex] = {}; if (!workout.logs[exerciseIndex]) return {}; if (!workout.logs[exerciseIndex][setIndex] && create) workout.logs[exerciseIndex][setIndex] = {}; return workout.logs[exerciseIndex][setIndex] || {}; }
  function getCurrentLog() { return getLog(state.currentWorkout.exerciseIndex, state.currentWorkout.setIndex, true); }
  function completedSetCount(workout) { var total = 0; Object.keys(workout.logs || {}).forEach(function (exerciseIndex) { Object.keys(workout.logs[exerciseIndex] || {}).forEach(function (setIndex) { if (workout.logs[exerciseIndex][setIndex].completedAt) total += 1; }); }); return total; }
  function totalPlanSets() { return currentExercises().reduce(function (sum, item) { return sum + item.sets; }, 0); }

  function applyTheme() { var key = normalizeThemeKey(state.theme, "volt-discipline"); var theme = themes[key]; state.theme = key; document.documentElement.dataset.theme = key; document.documentElement.dataset.mode = theme.mode; var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", theme.browserColor); }
  function render() { applyTheme(); renderHeader(); renderNav(); if (ui.tab === "home") renderHome(); if (ui.tab === "programs") renderPrograms(); if (ui.tab === "progress") renderProgress(); if (ui.tab === "profile") renderProfile(); window.scrollTo(0, 0); }
  function navigateToTab(tab, resetHistory) {
    var allowed = ["home", "programs", "progress", "profile"];
    if (allowed.indexOf(tab) === -1) tab = "home";
    if (resetHistory) ui.tabHistory = [];
    else if (tab !== ui.tab) ui.tabHistory = (ui.tabHistory || []).concat([ui.tab]).slice(-16);
    ui.tab = tab;
    render();
  }
  function navigateBackTab() {
    ui.tabHistory = [];
    return false;
  }
  function renderHeader() {
    if (ui.tab === "programs" || ui.tab === "profile") { topbar.classList.add("minimal-hidden"); topbar.innerHTML = ""; return; }
    topbar.classList.remove("minimal-hidden");
    var cloudStatus = state.cloud && state.cloud.status || "signed-out";
    var unread = totalUnreadMessages();
    var cloudLabel = { synced: "Bulut güncel", syncing: "Senkronize ediliyor", pending: "İşlem bekliyor", offline: "Çevrimdışı", error: "Senkron hatası", preview: "Yerel önizleme", "signed-out": "Hesap" }[cloudStatus] || "Hesap";
    topbar.innerHTML = '<button class="brand" data-action="nav" data-tab="home" aria-label="Ana sayfa"><span class="brand-mark">' + icons.bolt + '</span><b>Fit<span>Track</span></b></button><div class="top-actions"><button class="cloud-status-btn ' + esc(cloudStatus) + '" data-cloud-action="account-manager" aria-label="' + esc(cloudLabel) + '"><i></i><span>' + (state.cloud && state.cloud.pending ? state.cloud.pending : "") + '</span></button><button class="icon-btn" data-action="message-alerts" aria-label="' + (unread ? unread + ' okunmamış mesaj' : 'Bildirimler') + '">' + icons.bell + (unread ? '<i class="header-unread-badge">' + unread + '</i>' : state.reminder.enabled ? '<i class="notification-dot"></i>' : "") + '</button><button class="avatar-btn" data-action="nav" data-tab="profile" aria-label="Profil">' + esc(initials(fullName())) + '</button></div>';
  }
  function renderNav() { bottomNav.classList.toggle("staff-bottom-nav", isCloudStaff()); if (isCloudStaff()) { bottomNav.innerHTML = staffNavigation(ui.tab === "profile" ? "settings" : ui.tab === "home" ? "home" : "", false); return; } var items = [["home", "Ana Sayfa", icons.home], ["programs", "Antrenman", icons.dumbbell], ["progress", "İlerleme", icons.chart], ["profile", "Profil", icons.user]]; bottomNav.innerHTML = items.map(function (item) { return '<button class="nav-btn ' + (ui.tab === item[0] ? "active" : "") + '" data-action="nav" data-tab="' + item[0] + '">' + item[2] + '<span>' + item[1] + '</span></button>'; }).join(""); }
  function staffNavigation(selected, embedded) {
    var buttons = [["home", "Bugün", icons.home], ["members", "Üyeler", icons.user], ["programs", "Programlar", icons.dumbbell], ["messages", "Mesajlar", icons.message], ["settings", "Ayarlar", icons.settings]].map(function (item) {
      return '<button class="nav-btn ' + (selected === item[0] ? "active" : "") + '" data-action="staff-nav" data-section="' + item[0] + '"' + (selected === item[0] ? ' aria-current="page"' : '') + '>' + item[2] + '<span>' + item[1] + '</span></button>';
    }).join("");
    return embedded ? '<nav class="trainer-bottom-nav" aria-label="Antrenör menüsü">' + buttons + '</nav>' : buttons;
  }
  function decorateTrainerNavigation(selected) {
    if (!isCloudStaff()) return;
    flowLayer.innerHTML = flowLayer.innerHTML.replace(/<\/div>$/, staffNavigation(selected, true) + '</div>');
  }
  function activateStaffSection(section) {
    if (!isCloudStaff() || ["home", "members", "programs", "messages", "settings"].indexOf(section) < 0) return;
    if (ui.editorDraft) return requestEditorExit(function () { activateStaffSection(section); });
    closeSheet(); ui.trainerMemberId = ""; ui.chatPartnerId = ""; ui.chatInboxOpen = false; ui.staffProgramId = "";
    ui.staffMemberReturn = ""; ui.tab = "home";
    if (section === "home") closeFlow();
    else if (section === "members") renderTrainerPanel();
    else if (section === "settings") { closeFlow(); navigateToTab("profile", false); }
    else if (section === "programs") renderProgramStudio();
    else renderChatInbox();
  }

  function mondayFor(key) { var date = new Date(key + "T12:00:00"); var day = date.getDay(); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return dateKey(date); }
  function addDays(key, amount) { var date = new Date(key + "T12:00:00"); date.setDate(date.getDate() + amount); return dateKey(date); }
  function completedHistory() { return state.history.filter(function (item) { return item.status !== "partial"; }); }
  function calculateStreak() { var weeks = {}; completedHistory().forEach(function (item) { weeks[mondayFor(item.date)] = true; }); var cursor = mondayFor(todayKey()); if (!weeks[cursor]) cursor = addDays(cursor, -7); var streak = 0; while (weeks[cursor]) { streak += 1; cursor = addDays(cursor, -7); } return streak; }
  function renderWeek() { var labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]; var monday = mondayFor(todayKey()); var done = {}; completedHistory().forEach(function (item) { done[item.date] = true; }); return labels.map(function (label, index) { var key = addDays(monday, index); var cls = done[key] ? "done" : key === todayKey() ? "today" : ""; return '<div class="day ' + cls + '"><small>' + label + '</small><span>' + (done[key] ? "✓" : new Date(key + "T12:00:00").getDate()) + '</span></div>'; }).join(""); }
  function selfTrainerMember() { return state.trainer.members.find(function (member) { return member.isSelf; }) || state.trainer.members[0]; }
  function currentCoachNote() { var member = selfTrainerMember(); return member && member.note ? member.note : "Bugün kontrollü başla; son setlerde formunu koru."; }
  function totalUnreadMessages() { var ownId = currentUserId(); return (state.messages || []).filter(function (item) { return item.recipientId === ownId && !item.readAt; }).length; }
  function lastChatMessage(partnerId) { var items = chatMessages(partnerId); return items.length ? items[items.length - 1] : null; }
  function shortMessagePreview(message, fallback) { var value = message && message.body ? message.body : fallback; return String(value || "").slice(0, 86); }
  function staffMessagePartners() { var ownId = currentUserId(); return (state.trainer && state.trainer.members || []).filter(function (member) { return !member.isSelf && member.id !== ownId; }); }
  function latestStaffConversation() {
    var partners = staffMessagePartners().map(function (member) { return { member: member, message: lastChatMessage(member.id), unread: unreadFrom(member.id) }; });
    partners.sort(function (a, b) { return String(b.message && b.message.createdAt || "").localeCompare(String(a.message && a.message.createdAt || "")); });
    return partners[0] || null;
  }
  function renderHomeMessaging() {
    if (isCloudStaff()) {
      var latest = latestStaffConversation(); var unread = totalUnreadMessages();
      var name = latest ? memberName(latest.member) : "Üye mesajları";
      var preview = latest ? shortMessagePreview(latest.message, "İlk mesajı göndererek iletişimi başlat.") : "Üyelerinle program ve antrenman hakkında konuş.";
      return '<section class="section home-messages"><div class="section-head"><div><p class="section-label">MESAJLAR</p><h2>Üyelerinle bağlantıda kal</h2></div>' + (unread ? '<span class="program-badge">' + unread + ' yeni</span>' : '') + '</div><button class="card home-message-card" data-action="chat-inbox"><span class="coach-avatar">' + (latest ? esc(initials(name)) : icons.message) + '</span><span class="home-message-copy"><small>' + (latest ? esc(name) + ' · ' + esc(state.gym.name) : esc(state.gym.name)) + '</small><h3>' + (unread ? 'Yeni mesajın var' : 'Mesaj merkezi') + '</h3><p>' + esc(preview) + '</p><b>Mesaj merkezini aç</b></span>' + (unread ? '<span class="unread-badge">' + unread + '</span>' : '') + '<span class="small-arrow">' + icons.arrow + '</span></button></section>';
    }
    var coachId = state.gym.coachId || "coach-demo"; var coachUnread = unreadFrom(coachId); var last = lastChatMessage(coachId);
    return '<section class="section home-messages"><div class="section-head"><div><p class="section-label">ANTRENÖRÜN</p><h2>Mesajlaş</h2></div>' + (coachUnread ? '<span class="program-badge">' + coachUnread + ' yeni</span>' : '') + '</div><button class="card home-message-card" data-action="open-chat" data-partner-id="' + esc(coachId) + '"><span class="coach-avatar">' + esc(initials(state.gym.coach)) + '</span><span class="home-message-copy"><small>' + esc(state.gym.coach) + ' · ' + esc(state.gym.name) + '</small><h3>' + (coachUnread ? 'Yeni mesajın var' : 'Antrenörünle bağlantıda kal') + '</h3><p>' + esc(shortMessagePreview(last, currentCoachNote())) + '</p><b>Sohbeti aç</b></span>' + (coachUnread ? '<span class="unread-badge">' + coachUnread + '</span>' : '') + '<span class="small-arrow">' + icons.arrow + '</span></button></section>';
  }
  function homeMotivation() {
    if (state.currentWorkout) return { title: "Ritmi bozma, " + state.profile.firstName + ".", copy: "Kaldığın set hazır. Devam etmek için dokun." };
    if (state.history.some(function (item) { return item.date === todayKey() && item.status !== "partial"; })) return { title: "Bugünün işi tamam, " + state.profile.firstName + ".", copy: "Şimdi toparlan; bir sonraki antrenman için güç biriktir." };
    var messages = [
      { title: "Bugünün işi belli, " + state.profile.firstName + ".", copy: "Programın hazır. İlk set için dokun." },
      { title: "Sıra sende, " + state.profile.firstName + ".", copy: "Küçük başla, bütün setleri tamamla." },
      { title: "Motivasyonu bekleme.", copy: "Disiplin ilk setle başlar. Programın hazır." },
      { title: "Seriyi bugün de koru.", copy: "Planına sadık kal; gerisini tekrarlar getirir." },
      { title: "Bugün ne çalışıyoruz?", copy: "Programını gör, hazır olduğunda antrenmana başla." }
    ];
    var seed = todayKey().split("").reduce(function (sum, char) { return sum + char.charCodeAt(0); }, 0);
    return messages[seed % messages.length];
  }
  function homeWorkoutCard(entry) {
    var program = entry.program; var active = state.currentWorkout && state.currentWorkout.programId === program.id;
    return '<article class="home-workout-card ' + (active ? "active" : "") + '" data-program-id="' + esc(program.id) + '">' + exerciseImg(programDays(program)[0].exercises[0] || {}, "home-workout-cover", "") + '<div class="home-workout-copy"><small>' + (active ? "DEVAM EDİYOR" : "ANTRENMAN") + '</small><h3>' + esc(program.name) + '</h3><p>' + esc(programMeta(program)) + '</p><div class="weekday-pills">' + programWeekdays(program) + '</div></div><div class="home-workout-actions"><button class="secondary-btn" data-action="assigned-program-detail" data-program-id="' + esc(program.id) + '">İncele</button><button class="primary-btn" data-action="start-assigned-program" data-program-id="' + esc(program.id) + '">' + (active ? "Devam et" : "Hemen başla") + '<span class="btn-arrow">' + icons.arrow + '</span></button></div></article>';
  }
  function renderLegacyHome() {
    var motivation = homeMotivation(); var assigned = assignedPrograms();
    screen.innerHTML = '<section class="hello-row"><p class="eyebrow">BUGÜN · ' + formatDay(todayKey()).toUpperCase() + '</p><h1>' + esc(motivation.title) + '</h1><p class="subcopy">' + esc(motivation.copy) + '</p></section>' +
      (state.currentWorkout && !assigned.some(function (entry) { return entry.program.id === state.currentWorkout.programId; }) ? '<article class="card active-workout-recovery"><p class="eyebrow">YARIM KALAN ANTRENMAN</p><h2>' + esc(currentProgram().name) + '</h2><p>Atama kaldırılmış olsa da başladığın antrenmanı bitirebilir veya iptal edebilirsin.</p><button class="primary-btn" data-action="start">Devam et / Antrenmanı yönet</button><button class="danger-text" data-action="confirm-cancel">Antrenmanı iptal et</button></article>' : '') +
      '<section class="section home-workouts"><div class="section-head"><div><p class="section-label">SANA ATANAN</p><h2>Antrenmanların</h2></div><span class="program-badge">' + assigned.length + ' antrenman</span></div><div class="home-workout-list">' + (assigned.length ? assigned.map(homeWorkoutCard).join("") : '<article class="card empty-state"><h3>Henüz antrenman atanmadı.</h3><p>Antrenörün yeni bir antrenman atadığında burada görünecek.</p></article>') + '</div></section>' +
      '<section class="section"><div class="section-head"><div><p class="section-label">BU HAFTA</p><h2>Devamlılığın</h2></div><button class="text-btn" data-action="nav" data-tab="progress">Süreleri gör</button></div><article class="card week-card"><div class="week-row">' + renderWeek() + '</div></article></section>' + renderHomeMessaging();
  }


  // Member home and workout behaviour remain isolated from the staff summary.
  function homeFeatured(assigned) {
    if (state.currentWorkout) return { program: currentProgram(), day: currentProgramDay(), workout: state.currentWorkout };
    var entry = assigned.find(function (item) { return item.program.id === state.selectedProgramId; }) || assigned[0];
    return entry ? { program: entry.program, day: activeProgramDay(entry.program, entry.assignment.dayId), workout: null } : null;
  }
  function renderMemberHero(featured, assigned) {
    if (!featured) return '<article class="card member-home-hero empty-state"><h2>Henüz antrenman atanmadı.</h2><p>Antrenörün bir program atadığında burada görünecek.</p><button class="secondary-btn" data-action="nav" data-tab="programs">Antrenmanlarım</button></article>';
    var program = featured.program, day = featured.day, workout = featured.workout;
    var multiDay = !workout && programDays(program).length > 1;
    var total = multiDay ? programDays(program).reduce(function (sum, entry) { return sum + entry.exercises.reduce(function (sets, item) { return sets + item.sets; }, 0); }, 0) : workout ? currentExercises().reduce(function (sum, _, index) { return sum + resolveExerciseAt(index).sets; }, 0) : day.exercises.reduce(function (sum, item) { return sum + item.sets; }, 0);
    var done = workout ? completedSetCount(workout) : 0, percent = total ? Math.min(100, Math.round(done / total * 100)) : 0;
    var removed = workout && !assigned.some(function (entry) { return entry.program.id === program.id; });
    var status = workout ? workout.summarySaved ? "Tamamlandı" : workout.status === "paused" ? "Duraklatıldı" : "Devam ediyor" : "Hazır";
    var action = workout ? 'data-action="start"' : 'data-action="start-assigned-program" data-program-id="' + esc(program.id) + '"';
    var label = workout ? workout.summarySaved ? "Sonucu gör" : "Devam et" : "Antrenmana başla";
    return '<article class="card member-home-hero ' + (removed ? 'active-workout-recovery' : '') + '" data-program-id="' + esc(program.id) + '"><div class="member-home-hero-top"><div class="member-home-hero-copy"><p class="eyebrow">' +
      (workout ? "KALDIĞIN YERDEN" : "ATANAN ANTRENMANIN") + '</p><h2>' + esc(program.name) + '</h2>' +
      (programDays(program).length > 1 ? '<p class="member-day-name">' + (workout ? esc(day.name) : programDays(program).length + " antrenman · Seansını sen seç") + '</p>' : '') + '<span class="member-home-status"><i aria-hidden="true"></i>' + status + '</span></div>' +
      exerciseImg({ image: program.image || day.exercises[0] && day.exercises[0].image, name: program.name }, "member-home-hero-cover", "") + '</div>' +
      '<div class="member-home-hero-stats"><span>' + icons.dumbbell + (multiDay ? total + ' set · programın tamamı' : done + ' / ' + total + ' set') + '</span><span>' + (workout ? '<strong data-home-clock>' + workoutClock() + '</strong><small>geçen süre</small>' : (multiDay ? programDays(program).length + ' seans' : day.exercises.length + ' hareket')) + '</span></div>' +
      (multiDay ? '' : '<div class="member-progress-row"><div class="member-progress" role="progressbar" aria-label="Antrenman ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '"><i style="width:' + percent + '%"></i></div><b>%' + percent + '</b></div>') +
      (removed ? '<p class="member-recovery-copy">Atama kaldırılmış olsa da başladığın antrenmanı bitirebilir veya iptal edebilirsin.</p>' : '') +
      '<div class="member-home-hero-actions"><button class="primary-btn" ' + action + '>' + icons.arrow + label + '</button>' +
      (removed ? '<button class="secondary-btn" data-action="confirm-cancel">Antrenmanı iptal et</button>' : '<button class="secondary-btn" data-action="assigned-program-detail" data-program-id="' + esc(program.id) + '">' + icons.chart + 'Programı incele</button>') + '</div></article>';
  }
  function renderMemberWeek(assigned) {
    var start = mondayFor(todayKey()), end = addDays(start, 7), scheduled = {};
    var count = completedHistory().filter(function (item) { return !item.isDemo && item.date >= start && item.date < end && item.date <= todayKey(); }).length;
    assigned.forEach(function (entry) { programTrainingWeekdays(entry.program).forEach(function (day) { scheduled[day] = true; }); });
    var goal = Object.keys(scheduled).length || assigned.reduce(function (sum, entry) { return sum + programDays(entry.program).length; }, 0);
    return '<section class="card member-week"><button class="member-week-head" data-action="nav" data-tab="progress"><strong>Bu hafta <b>' + count + (goal ? ' / ' + goal : '') + '</b> antrenman tamamlandı</strong>' + icons.arrow + '</button><div class="week-row">' + renderWeek() + '</div></section>';
  }

  function renderMemberCoach() {
    var coachId = state.gym.coachId || "coach-demo", unread = unreadFrom(coachId), last = lastChatMessage(coachId);
    return '<button class="card member-coach" data-action="open-chat" data-partner-id="' + esc(coachId) + '"><span class="coach-avatar">' + esc(initials(state.gym.coach)) + '</span><span class="member-coach-copy"><strong>' + esc(state.gym.coach || "Antrenörün") + '</strong><span>' + esc(shortMessagePreview(last, currentCoachNote())) + '</span></span>' + (unread ? '<b class="unread-badge">' + unread + '</b>' : icons.arrow) + '</button>';
  }
  function renderHome() {
    if (isCloudStaff()) return renderTrainerHome();
    var assigned = assignedPrograms(), featured = homeFeatured(assigned), hour = new Date().getHours();
    var greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
    screen.innerHTML = '<div class="member-home"><section class="member-greeting"><h1>' + greeting + ', ' + esc(state.profile.firstName) + '</h1><p>Kendine bugün de iyi bak.</p></section>' + renderMemberHero(featured, assigned) +
      (assigned.length > 1 ? '<button class="member-all-programs" data-action="nav" data-tab="programs"><span>Tüm antrenmanların <b>' + assigned.length + '</b></span>' + icons.arrow + '</button>' : '') +
      renderMemberWeek(assigned) + renderMemberCoach() + '</div>';
    if (state.currentWorkout) startWorkoutClock();
  }

  function programWeekdays(program) {
    var weekdays = programTrainingWeekdays(program);
    return weekdays.length ? '<span class="weekday-label">Önerilen günler</span>' + weekdays.map(function (day) { return '<span>' + esc(weekdayName(day).slice(0, 3)) + '</span>'; }).join("") : '<span>Esnek günler</span>';
  }

  function assignedProgramCard(entry, index) {
    var program = entry.program; var active = state.currentWorkout && state.currentWorkout.programId === program.id; var meta = programMeta(program);
    return '<article class="assigned-program-card equal ' + (active ? "active" : "") + '" data-program-id="' + esc(program.id) + '">' + exerciseImg(programDays(program)[0].exercises[0] || {}, "assigned-program-thumb", "") + '<div class="assigned-program-copy"><small>' + (active ? "DEVAM EDİYOR" : "ATANAN ANTRENMAN") + '</small><h2>' + esc(program.name) + '</h2><p>' + esc(meta) + '</p><div class="weekday-pills">' + programWeekdays(program) + '</div></div><div class="assigned-program-actions"><button class="secondary-btn" data-action="assigned-program-detail" data-program-id="' + esc(program.id) + '">İncele</button><button class="primary-btn" data-action="start-assigned-program" data-program-id="' + esc(program.id) + '">' + (active ? "Devam et" : "Hemen başla") + '</button></div></article>';
  }
  function libraryMuscles() {
    var values = [];
    catalogExercises().forEach(function (item) { var muscle = item.muscles && item.muscles[0]; if (muscle && values.indexOf(muscle) === -1) values.push(muscle); });
    return values.slice(0, 5);
  }
  function filteredLibrary() {
    var query = String(ui.libraryQuery || "").trim().toLocaleLowerCase("tr-TR");
    return catalogExercises().filter(function (item) { var text = (item.name + " " + item.muscles.join(" ") + " " + item.equipment).toLocaleLowerCase("tr-TR"); return (!query || text.indexOf(query) !== -1) && (ui.libraryMuscle === "all" || item.muscles.indexOf(ui.libraryMuscle) !== -1); });
  }
  function renderLibraryItems() {
    var list = document.getElementById("memberExerciseLibrary"); if (!list) return; var catalog = filteredLibrary();
    list.innerHTML = catalog.length ? catalog.map(function (item) { return '<button type="button" class="library-item" data-action="library-exercise-detail" data-exercise-id="' + esc(item.id) + '" aria-label="' + esc(item.name) + ' hareket detayını aç">' + exerciseImg(item, "library-thumb", item.name + " önizlemesi") + '<span><strong>' + esc(item.name) + '</strong><small>' + esc(item.muscles[0]) + ' · ' + esc(item.equipment) + '</small></span><b>' + icons.arrow + '</b></button>'; }).join("") : '<article class="card empty-state"><h3>Hareket bulunamadı.</h3><p>Arama kelimesini veya filtreyi değiştir.</p></article>';
  }
  function renderExerciseDetail(id, options) {
    var item = options && options.exercise || catalogExercises().find(function (entry) { return entry.id === id; });
    if (!item) return showToast("Hareket detayı bulunamadı.");
    ui.exerciseDetailReturn = options && options.returnTo || null;
    if (!ui.exerciseDetailReturn) ui.programDetailId = "";
    ui.exerciseDetailId = item.id; flowLayer.classList.add("active");
    flowLayer.innerHTML = '<div class="full-flow exercise-detail-flow"><header class="detail-head"><button class="back-btn" data-action="close-exercise-detail" aria-label="' + (ui.exerciseDetailReturn ? 'Antrenmanı incelemeye dön' : 'Hareketlere dön') + '">' + icons.back + '</button><strong>Hareket detayı</strong><span class="detail-head-spacer" aria-hidden="true"></span></header><main class="exercise-detail-scroll">' + exerciseImg(item, "exercise-detail-media", item.name + " hareket gösterimi") + '<p class="eyebrow">' + esc(item.muscles[0]) + '</p><h1>' + esc(item.name) + '</h1><div class="exercise-detail-meta"><span>' + esc(item.equipment) + '</span><span>' + esc(item.category || "Kuvvet") + '</span><span>' + (item.requiresWeight === false ? "Vücut ağırlığı" : "Ağırlıklı") + '</span></div><section class="exercise-detail-cues"><h2>Nasıl yapılır?</h2><ol>' + (item.cues || []).map(function (cue) { return '<li>' + esc(cue) + '</li>'; }).join("") + '</ol>' + (!item.cues || !item.cues.length ? '<p>Bu harekete henüz açıklama eklenmedi. Antrenörüne danışabilirsin.</p>' : '') + '</section><article class="coach-note"><strong>HEDEF BÖLGELER</strong><p>' + esc((item.muscles || []).join(" · ")) + '</p></article></main></div>';
  }
  function openAssignedExerciseDetail(programId, dayIndex, exerciseIndex) {
    var entry = assignedPrograms().find(function (candidate) { return candidate.program.id === programId; });
    dayIndex = Number(dayIndex); exerciseIndex = Number(exerciseIndex);
    var day = entry && Number.isInteger(dayIndex) && programDays(entry.program)[dayIndex];
    var item = day && Number.isInteger(exerciseIndex) && day.exercises[exerciseIndex];
    if (!item) return showToast("Bu programdaki hareket artık bulunamıyor. Programını yeniden inceleyebilirsin.");
    var scroll = flowLayer.querySelector(".assigned-detail-scroll");
    renderExerciseDetail(item.id, { exercise: item, returnTo: { programId: programId, dayIndex: dayIndex, exerciseIndex: exerciseIndex, scrollTop: scroll && scroll.scrollTop || 0 } });
  }
  function closeExerciseDetail() {
    var returnTo = ui.exerciseDetailReturn;
    ui.exerciseDetailId = ""; ui.exerciseDetailReturn = null;
    if (!returnTo) return closeFlow();
    renderAssignedProgramDetail(returnTo.programId);
    var scroll = flowLayer.querySelector(".assigned-detail-scroll");
    if (!scroll) return;
    var row = scroll.querySelector('[data-day-index="' + returnTo.dayIndex + '"][data-exercise-index="' + returnTo.exerciseIndex + '"]');
    if (row) row.focus({ preventScroll: true });
    scroll.scrollTop = returnTo.scrollTop;
  }
  function renderPrograms() {
    var assigned = assignedPrograms(); var muscles = libraryMuscles(); var coach = assigned[0] && assigned[0].assignment.assignedBy || state.gym.coach;
    screen.innerHTML = '<section class="programs-heading"><div><h1>Programlarım</h1><p>' + esc(coach) + ' tarafından atanan ' + assigned.length + ' program</p></div><button class="avatar-btn" data-action="nav" data-tab="profile">' + esc(initials(fullName())) + '</button></section>' +
      '<div class="assigned-program-list">' + (assigned.length ? assigned.map(assignedProgramCard).join("") : '<article class="card empty-state"><h3>Henüz program atanmadı.</h3><p>Antrenörün program atadığında burada görünecek.</p></article>') + '</div>' +
      '<p class="assigned-only-note"><span>i</span> Yalnızca sana atanan programlar gösteriliyor.</p>' +
      '<section class="section exercise-library-section"><div class="section-head"><div><p class="section-label">HAREKET KÜTÜPHANESİ</p><h2>Hareketler</h2></div><small class="edit-hint">' + catalogExercises().length + ' hareket</small></div><label class="trainer-search member-library-search">' + icons.search + '<input data-library-search type="search" placeholder="Hareket ara" value="' + esc(ui.libraryQuery) + '"></label><div class="library-filter-pills"><button data-action="library-filter" data-muscle="all" class="' + (ui.libraryMuscle === "all" ? "active" : "") + '">Tümü</button>' + muscles.map(function (muscle) { return '<button data-action="library-filter" data-muscle="' + esc(muscle) + '" class="' + (ui.libraryMuscle === muscle ? "active" : "") + '">' + esc(muscle) + '</button>'; }).join("") + '</div><div id="memberExerciseLibrary" class="library-grid visual-library compact-library"></div></section>';
    renderLibraryItems();
  }

  function renderAssignedProgramDetail(id) {
    var entry = assignedPrograms().find(function (item) { return item.program.id === id; }); if (!entry) return closeFlow(); var program = entry.program;
    flowLayer.classList.add("active"); ui.programDetailId = id; ui.exerciseDetailId = ""; ui.exerciseDetailReturn = null;
    flowLayer.innerHTML = '<div class="full-flow assigned-detail-flow"><header class="detail-head"><button class="back-btn" data-action="close-program-detail" aria-label="Geri">' + icons.back + '</button><span class="detail-brand"><span class="brand-mark">' + icons.bolt + '</span><strong>FitTrack</strong></span><span class="detail-head-spacer" aria-hidden="true"></span></header><main class="assigned-detail-scroll"><p class="eyebrow">' + esc(entry.assignment.assignedBy) + ' TARAFINDAN ATANDI</p><section class="assigned-detail-hero">' + exerciseImg(programDays(program)[0].exercises[0] || {}, "assigned-detail-cover", "") + '<div><h1>' + esc(program.name) + '</h1><p>' + esc(programMeta(program)) + '</p><div class="weekday-pills">' + programWeekdays(program) + '</div></div></section>' + (program.generalNote ? '<article class="coach-note"><strong>ANTRENÖR NOTU</strong><p>' + esc(program.generalNote) + '</p></article>' : '') + programDays(program).map(function (day, dayIndex) { return '<section class="assigned-detail-day"><div class="section-head"><div><p class="section-label">' + (dayIndex + 1) + '. GÜN</p><h2>' + esc(day.name) + '</h2></div><span>' + day.exercises.length + ' hareket</span></div><div class="assigned-exercise-list">' + day.exercises.map(function (item, exerciseIndex) { return '<button type="button" class="assigned-exercise-item" data-action="assigned-exercise-detail" data-program-id="' + esc(program.id) + '" data-day-index="' + dayIndex + '" data-exercise-index="' + exerciseIndex + '" aria-label="' + esc(item.name) + ' nasıl yapılır?">' + exerciseImg(item, "", "") + '<span><strong>' + esc(item.name) + '</strong><small>' + item.sets + ' set · ' + esc(item.repsTarget || item.setPlan[0].repsTarget) + ' tekrar</small></span><b aria-hidden="true">' + icons.arrow + '</b></button>'; }).join("") + '</div></section>'; }).join("") + '</main><div class="detail-action-bar"><button class="primary-btn" data-action="start-assigned-program" data-program-id="' + esc(program.id) + '">' + (state.currentWorkout && state.currentWorkout.programId === program.id ? "Antrenmana dön" : "Antrenmana başla") + '</button></div></div>';
  }

  function formatDuration(minutes) { minutes = Math.max(0, Math.round(Number(minutes) || 0)); if (!minutes) return "—"; if (minutes < 60) return minutes + " dk"; return Math.floor(minutes / 60) + "s " + pad(minutes % 60) + "d"; }
  function durationForDate(key) { return state.history.reduce(function (sum, item) { return item.date === key ? sum + safeNumber(item.duration, 0, 1440, 0) : sum; }, 0); }
  function activityBuckets(range) {
    var values = [];
    if (range === "days") for (var offset = -6; offset <= 0; offset += 1) { var key = offsetDate(offset); values.push({ key: key, label: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(new Date(key + "T12:00:00")).replace(".", ""), minutes: durationForDate(key) }); }
    if (range === "weeks") { var monday = mondayFor(todayKey()); for (var week = -3; week <= 0; week += 1) { var start = addDays(monday, week * 7); var minutes = 0; for (var day = 0; day < 7; day += 1) minutes += durationForDate(addDays(start, day)); values.push({ key: start, label: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(start + "T12:00:00")), minutes: minutes }); } }
    if (range === "months") { var now = new Date(); for (var month = -5; month <= 0; month += 1) { var date = new Date(now.getFullYear(), now.getMonth() + month, 1); var monthKey = date.getFullYear() + "-" + pad(date.getMonth() + 1); var total = state.history.reduce(function (sum, item) { return item.date.indexOf(monthKey) === 0 ? sum + safeNumber(item.duration, 0, 1440, 0) : sum; }, 0); values.push({ key: monthKey, label: new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date).replace(".", ""), minutes: total }); } }
    return values;
  }
  function exerciseOptions() { var map = {}; state.history.forEach(function (item) { (item.exercises || []).forEach(function (entry) { map[entry.id || exerciseIdFromName(entry.name)] = entry.name; }); }); return Object.keys(map).map(function (id) { return { id: id, name: map[id] }; }); }
  function exerciseProgress(id) { return state.history.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).reduce(function (list, item) { var entry = (item.exercises || []).find(function (candidate) { return (candidate.id || exerciseIdFromName(candidate.name)) === id; }); if (!entry) return list; var weights = entry.sets.filter(function (set) { return String(set.weight || "").trim() !== ""; }).map(function (set) { return Number(set.weight); }).filter(Number.isFinite); var reps = entry.sets.filter(function (set) { return String(set.reps || "").trim() !== ""; }).map(function (set) { return Number(set.reps); }).filter(Number.isFinite); list.push({ date: item.date, weight: weights.length ? Math.max.apply(null, weights) : 0, reps: reps.length ? Math.max.apply(null, reps) : 0 }); return list; }, []).slice(-8); }

  // Recomputed from the active account. Longest streak survives later breaks.
  function achievementStats() {
    var seen = {}, weeks = {}, count = 0, today = todayKey();
    completedHistory().forEach(function (item) {
      var id = item.syncId || item.id;
      if (item.status !== "completed" || item.isDemo || !historySetCount(item) || item.date > today || seen[id]) return;
      seen[id] = true; count += 1; weeks[mondayFor(item.date)] = true;
    });
    var longest = 0, run = 0, previous = "";
    Object.keys(weeks).sort().forEach(function (week) {
      run = previous && addDays(previous, 7) === week ? run + 1 : 1;
      longest = Math.max(longest, run); previous = week;
    });
    return { workouts: count, weeks: longest };
  }
  function achievements() {
    var stats = achievementStats();
    var definitions = [
      { id: "first-workout", name: "İlk adım", goal: 1, metric: "workouts", description: "İlk tam antrenmanını bitir.", symbol: "bolt" },
      { id: "ten-workouts", name: "İlk 10 antrenman", goal: 10, metric: "workouts", description: "10 tam antrenman kaydı oluştur.", symbol: "dumbbell" },
      { id: "twenty-five-workouts", name: "25 antrenman", goal: 25, metric: "workouts", description: "25 tam antrenman kaydı oluştur.", symbol: "dumbbell" },
      { id: "fifty-workouts", name: "50 antrenman", goal: 50, metric: "workouts", description: "50 tam antrenman kaydı oluştur.", symbol: "chart" },
      { id: "hundred-workouts", name: "100 antrenman", goal: 100, metric: "workouts", description: "100 tam antrenman kaydı oluştur.", symbol: "chart" },
      { id: "four-weeks", name: "4 hafta devamlılık", goal: 4, metric: "weeks", description: "Arka arkaya 4 haftanın her birinde en az bir tam antrenman bitir.", symbol: "bolt" },
      { id: "eight-weeks", name: "8 hafta devamlılık", goal: 8, metric: "weeks", description: "Arka arkaya 8 haftanın her birinde en az bir tam antrenman bitir.", symbol: "bolt" }
    ];
    return definitions.map(function (item) { return Object.assign({}, item, { value: Math.min(item.goal, stats[item.metric]), earned: stats[item.metric] >= item.goal }); });
  }
  function achievementRow(item) {
    return '<button class="achievement-row ' + (item.earned ? "earned" : "locked") + '" data-action="achievement-detail" data-id="' + item.id + '"><span class="achievement-symbol" aria-hidden="true">' + icons[item.symbol] + '</span><span class="achievement-copy"><strong>' + item.name + '</strong><small>' + (item.earned ? "Kazanıldı" : item.value + ' / ' + item.goal + (item.metric === "weeks" ? " hafta" : " antrenman")) + '</small></span>' + (item.earned ? '<span class="achievement-check" aria-label="Kazanıldı">' + icons.check + '</span>' : icons.arrow) + '</button>';
  }
  function renderAchievements() {
    var list = achievements(), earned = list.filter(function (item) { return item.earned; });
    var preview = earned.slice(-2).concat(list.filter(function (item) { return !item.earned; }).slice(0, earned.length ? 1 : 3));
    return '<section class="section achievements-section"><div class="section-head"><div><p class="section-label">HER ADIM DEĞERLİ</p><h2>Başarıların</h2></div><button class="text-btn" data-action="achievements">Tüm rozetler</button></div><p class="achievements-caption">' + earned.length + ' / ' + list.length + ' rozet kazanıldı</p><div class="card achievements-list">' + preview.map(achievementRow).join("") + '</div></section>';
  }
  function openAchievements(id) {
    var list = achievements(), item = list.find(function (entry) { return entry.id === id; });
    var head = '<div class="sheet-head"><div><h2>' + (item ? item.name : "Başarıların") + '</h2><p>' + (item ? item.earned ? "Bu rozeti kazandın." : "Adım adım yaklaşıyorsun." : "Tamamladığın antrenmanların karşılığı.") + '</p></div><button class="close-btn" data-action="close-sheet" aria-label="Kapat">×</button></div>';
    var content = item ? '<div class="achievement-detail"><span class="achievement-symbol" aria-hidden="true">' + icons[item.symbol] + '</span><p>' + item.description + '</p><strong>' + item.value + ' / ' + item.goal + (item.metric === "weeks" ? " hafta" : " antrenman") + '</strong><progress max="' + item.goal + '" value="' + item.value + '" aria-label="Rozet ilerlemesi"></progress><p class="sheet-note">Yalnız tamamlanmış antrenmanlar sayılır. Rozetler bu hesaptaki kayıtlı geçmişinden hesaplanır; bir kayıt silinir veya yarım olarak düzeltilirse yeniden değerlendirilir.</p><button class="secondary-btn" data-action="achievements">Tüm rozetler</button></div>' : '<div class="achievements-list">' + list.map(achievementRow).join("") + '</div>';
    openSheet(head + content);
  }

  function renderProgress() {
    var completed = completedHistory(); var totalMinutes = state.history.reduce(function (sum, item) { return sum + safeNumber(item.duration, 0, 1440, 0); }, 0); var activity = activityBuckets(ui.progressRange); var max = Math.max.apply(null, activity.map(function (item) { return item.minutes; }).concat([1])); var rangeMinutes = activity.reduce(function (sum, item) { return sum + item.minutes; }, 0); var options = exerciseOptions(); if (!ui.progressExercise || !options.some(function (item) { return item.id === ui.progressExercise; })) ui.progressExercise = options.length ? options[0].id : ""; var progress = exerciseProgress(ui.progressExercise); var maxWeight = Math.max.apply(null, progress.map(function (item) { return item.weight; }).concat([1]));
    screen.innerHTML = '<section class="page-head"><p class="eyebrow">İLERLEME</p><h1>Ritmin görünür.</h1><p class="subcopy">Gün, hafta ve ay bazında süreni; hareket bazında kilo ve tekrar gelişimini gör.</p></section>' +
      '<div class="metric-row"><article class="card metric-card"><span>🔥</span><strong>' + calculateStreak() + '</strong><small>hafta seri</small></article><article class="card metric-card"><span>✓</span><strong>' + completed.length + '</strong><small>tam antrenman</small></article><article class="card metric-card"><span>◷</span><strong>' + formatDuration(totalMinutes) + '</strong><small>toplam süre</small></article></div>' +
      '<section class="section"><div class="section-head"><div><p class="section-label">DEVAMLILIK</p><h2>Antrenman süresi</h2></div><span class="program-badge">' + formatDuration(rangeMinutes) + '</span></div><div class="range-tabs"><button data-action="progress-range" data-range="days" class="' + (ui.progressRange === "days" ? "active" : "") + '">7 gün</button><button data-action="progress-range" data-range="weeks" class="' + (ui.progressRange === "weeks" ? "active" : "") + '">4 hafta</button><button data-action="progress-range" data-range="months" class="' + (ui.progressRange === "months" ? "active" : "") + '">6 ay</button></div><article class="card chart-card"><div class="chart-scale"><span>' + formatDuration(max) + '</span><span>' + formatDuration(Math.round(max / 2)) + '</span><span>0</span></div><div class="bar-chart duration-chart">' + activity.map(function (item) { var height = item.minutes ? Math.max(12, item.minutes / max * 100) : 3; return '<div class="bar-column"><b>' + formatDuration(item.minutes) + '</b><i style="height:' + height + '%"></i><span>' + esc(item.label) + '</span></div>'; }).join("") + '</div></article></section>' +
      '<section class="section"><div class="section-head"><div><p class="section-label">HAREKET GELİŞİMİ</p><h2>Kilo / tekrar</h2></div></div>' + (options.length ? '<select class="progress-select" data-progress-exercise aria-label="Hareket seç">' + options.map(function (item) { return '<option value="' + esc(item.id) + '" ' + (item.id === ui.progressExercise ? "selected" : "") + '>' + esc(item.name) + '</option>'; }).join("") + '</select><article class="card lift-chart">' + (progress.length ? progress.map(function (item) { return '<div class="lift-point"><div class="lift-bar"><i style="height:' + Math.max(8, item.weight / maxWeight * 100) + '%"></i></div><strong>' + (item.weight ? item.weight + " " + esc(state.profile.units) : "Vücut") + '</strong><small>' + item.reps + ' tekrar</small><span>' + formatShortDate(item.date) + '</span></div>'; }).join("") : '<p class="sheet-note">Bu hareket için henüz kayıt yok.</p>') + '</article>' : '<article class="card empty-state"><p>Hareket verisi oluştuğunda gelişim grafiği burada görünecek.</p></article>') + '</section>' +
      '<section class="section"><div class="section-head"><div><p class="section-label">GEÇMİŞ</p><h2>Son antrenmanlar</h2></div><small class="edit-hint">Setleri düzenlemek için dokun</small></div><div class="history-list">' + renderHistory() + '</div></section>' + renderAchievements();
  }
  function renderHistory() { if (!state.history.length) return '<article class="card empty-state"><span>⌁</span><h3>İlk antrenmanın burada görünecek.</h3><p>Küçük bir başlangıç, görünür bir ritme dönüşür.</p></article>'; return state.history.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 30).map(function (item) { return '<button class="history-item ' + (item.status === "partial" ? "partial" : "") + '" data-action="history-detail" data-id="' + esc(item.id) + '"><span class="history-icon">' + (item.status === "partial" ? "½" : "✓") + '</span><span class="history-copy"><strong>' + esc(item.name) + '</strong><small>' + formatDate(item.date) + ' · ' + item.totalSets + ' set · ' + (item.status === "partial" ? "Yarım" : "Tamamlandı") + '</small></span><span class="history-duration"><strong>' + formatDuration(item.duration) + '</strong><small>' + (item.volume ? item.volume + " " + esc(state.profile.units) + " hacim" : "DÜZENLE ›") + '</small></span></button>'; }).join(""); }

  function renderProfile() {
    var connected = Boolean(state.cloud && state.cloud.userId && state.gym.id);
    var roleLabel = { admin: "Salon yöneticisi", trainer: "Antrenör", member: "Üye" }[state.cloud && state.cloud.role] || "Yerel pilot";
    var staffRows = !isCloudStaff() && canUseTrainerPanel() ? '<section class="profile-menu-group"><p class="section-label">SALON</p>' + settingRow("trainer-panel", "◎", "Üyeler", "Üye ara, program ata ve takip et") + settingRow("program-studio", "◫", "Programlar", "Yayınlar, taslaklar ve arşiv") + '</section>' : '';
    screen.innerHTML = '<section class="profile-simple-head"><h1>' + (isCloudStaff() ? "Ayarlar" : "Profil") + '</h1></section><article class="profile-identity"><div class="profile-avatar">' + esc(initials(fullName())) + '</div><div><h2>' + esc(fullName()) + '</h2><p>' + esc(roleLabel) + (connected ? ' · ' + esc(state.gym.name) : '') + '</p></div></article><div class="sync-summary"><span>✓</span><strong>' + esc(connected ? (state.cloud.detail || "Verilerin güncel") : "Yerel verilerin hazır") + '</strong></div>' +
      '<section class="profile-menu-group"><p class="section-label">PROFİL</p>' + settingRow("profile-edit", "♙", "Kişisel bilgiler", "") + settingRow("theme-edit", "◐", "Görünüm ve tema", "") + settingRow("reminders", "♧", "Bildirimler", "") + '</section>' + staffRows +
      '<section class="profile-menu-group"><p class="section-label">HESAP</p><button class="setting-row" data-cloud-action="account-manager"><span class="setting-icon">♢</span><span class="setting-copy"><strong>Güvenlik ve oturumlar</strong></span><span class="small-arrow">' + icons.arrow + '</span></button>' + settingRow("privacy", "▢", "Gizlilik ve veriler", "") + (state.cloud && state.cloud.userId ? '<button class="setting-row sign-out-row" data-cloud-action="sign-out"><span class="setting-icon">↪</span><span class="setting-copy"><strong>Bu cihazdan çıkış yap</strong></span></button>' : '') + '</section><p class="profile-version">FitTrack Beta ' + VERSION + '</p>';
  }
  function settingRow(action, icon, title, sub) { return '<button class="setting-row" data-action="' + action + '"><span class="setting-icon">' + icon + '</span><span class="setting-copy"><strong>' + title + '</strong><small>' + sub + '</small></span><span class="small-arrow">' + icons.arrow + '</span></button>'; }

  function memberName(member) { return member.isSelf ? fullName() : member.name; }
  function memberHistory(member) { return member.isSelf ? state.history : member.history; }
  function memberCompleted(member) { return memberHistory(member).filter(function (item) { return item.status !== "partial"; }); }
  function daysSince(key) { if (!key) return null; return Math.max(0, Math.floor((new Date(todayKey() + "T12:00:00").getTime() - new Date(key + "T12:00:00").getTime()) / 86400000)); }
  function memberMetrics(member) {
    var completed = memberCompleted(member).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var weekStart = mondayFor(todayKey()); var sessions = completed.filter(function (item) { return item.date >= weekStart && item.date <= addDays(weekStart, 6); });
    var last = completed[0] || null; var absence = last ? daysSince(last.date) : null;
    var status = !last ? { key: "new", label: "Başlamadı", detail: "İlk antrenman bekleniyor" } : absence <= 3 ? { key: "active", label: "Aktif", detail: absence === 0 ? "Bugün antrenman yaptı" : absence + " gün önce antrenman yaptı" } : { key: "followup", label: "Takip et", detail: absence + " gündür antrenman yok" };
    return { completed: completed, sessions: sessions.length, weekMinutes: sessions.reduce(function (sum, item) { return sum + safeNumber(item.duration, 0, 1440, 0); }, 0), last: last, absence: absence, status: status };
  }
  function trainerRoster() {
    return state.trainer.members.filter(function (member) { return !isCloudStaff() || !member.isSelf && member.id !== currentUserId(); });
  }
  function memberAttention(member) {
    var entries = memberProgramEntries(member), assignments = member.assignments || [], unread = unreadFrom(member.id);
    // Both partial and full sessions are activity. Never infer gym attendance.
    var history = memberHistory(member).filter(function (item) { return /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.date <= todayKey(); }).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var last = history[0], age = last ? daysSince(last.date) : daysSince(member.joinedAt), reasons = [];
    if (unread) reasons.push(unread + " okunmamış mesaj");
    if (!assignments.length) reasons.push("Henüz program atanmadı");
    if (age >= 7) reasons.push(last ? age + " gündür yeni antrenman kaydı görünmüyor" : "Henüz antrenman kaydı görünmüyor");
    var label = unread ? "Yeni mesaj" : !assignments.length ? "Programsız" : age >= 7 ? "Kayıt kontrolü" : last ? "Kayıt güncel" : "Kayıt yok";
    return { entries: entries, noProgram: !assignments.length, unread: unread, reasons: reasons, last: last,
      score: (unread ? 40 : 0) + (!assignments.length ? 30 : 0) + (age >= 7 ? 20 : 0), label: label,
      tone: unread ? "info" : !assignments.length || age >= 7 ? "warning" : last ? "success" : "neutral",
      detail: reasons.join(" · ") || (last ? "Son antrenman kaydı: " + formatDate(last.date) : "İlk antrenman kaydı bekleniyor") };
  }
  function trainerPriorityMembers() {
    return trainerRoster().map(function (member) { return { member: member, attention: memberAttention(member) }; })
      .filter(function (entry) { return entry.attention.score > 0; })
      .sort(function (a, b) { return b.attention.score - a.attention.score || memberName(a.member).localeCompare(memberName(b.member), "tr"); });
  }
  function renderTrainerHome() {
    var members = trainerRoster(), priorities = trainerPriorityMembers(), todayRecords = 0, recent = [];
    members.forEach(function (member) {
      memberHistory(member).forEach(function (item) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || item.date > todayKey()) return;
        if (item.date === todayKey()) todayRecords += 1;
        recent.push({ member: member, record: item });
      });
    });
    recent.sort(function (a, b) { return b.record.date.localeCompare(a.record.date) || memberName(a.member).localeCompare(memberName(b.member), "tr"); });
    var noProgram = members.filter(function (member) { return memberAttention(member).noProgram; }).length;
    screen.innerHTML = '<div class="trainer-home"><section class="trainer-home-heading"><p class="section-label">ANTRENÖR · ' + esc(state.gym.name) + '</p><h1>Merhaba, ' + esc(state.profile.firstName) + '</h1><p>Bugünün üye ve antrenman özeti.</p></section>' +
      '<div class="trainer-overview"><button class="trainer-stat trainer-stat-members" data-action="trainer-panel"><i class="trainer-stat-icon" aria-hidden="true">' + icons.users + '</i><strong>' + members.length + '</strong><span>Üye</span></button><article class="trainer-stat trainer-stat-activity"><i class="trainer-stat-icon" aria-hidden="true">' + icons.check + '</i><strong>' + todayRecords + '</strong><span>Bugünkü kayıt</span></article><button class="trainer-stat trainer-stat-programless" data-action="trainer-open-filter" data-filter="no-program"><i class="trainer-stat-icon" aria-hidden="true">' + icons.dumbbell + '</i><strong>' + noProgram + '</strong><span>Programsız</span></button></div>' +
      '<section class="section trainer-priorities"><div class="section-head"><h2>Öncelikli üyeler <span class="trainer-count">' + priorities.length + '</span></h2><button class="text-btn" data-action="trainer-open-filter" data-filter="priority">Tüm öncelikleri gör</button></div><div class="trainer-member-list priority-member-list">' +
      (priorities.length ? priorities.slice(0, 3).map(function (entry) { return renderTrainerMemberCard(entry.member); }).join("") : '<article class="card trainer-empty"><strong>Öncelikli işlem görünmüyor.</strong><small>Yeni mesaj ve antrenman kayıtları geldikçe bu alan güncellenir.</small></article>') + '</div></section>' +
      renderHomeMessaging() + '<section class="section trainer-recent"><div class="section-head"><h2>Son antrenman kayıtları</h2></div><div class="trainer-recent-list">' +
      (recent.length ? recent.slice(0, 3).map(function (entry) { return '<button data-action="trainer-member" data-member-id="' + esc(entry.member.id) + '"><span class="member-avatar">' + esc(initials(memberName(entry.member))) + '</span><span><strong>' + esc(memberName(entry.member)) + '</strong><small>' + esc(entry.record.name) + ' · ' + (entry.record.status === "partial" ? "Yarım" : "Tam") + ' · ' + formatDate(entry.record.date) + '</small></span><span class="small-arrow">' + icons.arrow + '</span></button>'; }).join("") : '<p class="trainer-data-note">Henüz antrenman kaydı görünmüyor.</p>') + '</div></section><p class="trainer-data-note">Bu özet cihazda bulunan son kayıtlara dayanır. Çevrimdışıyken yeni mesajlar ve kayıtlar henüz görünmeyebilir.</p></div>';
  }
  function trainerFilteredMembers() {
    var query = String(ui.trainerQuery || "").trim().toLocaleLowerCase("tr-TR");
    var members = ui.trainerFilter === "priority" ? trainerPriorityMembers().map(function (entry) { return entry.member; }) : trainerRoster();
    return members.filter(function (member) { var attention = memberAttention(member); var queryMatch = !query || memberName(member).toLocaleLowerCase("tr-TR").indexOf(query) !== -1; var filterMatch = ui.trainerFilter === "all" || ui.trainerFilter === "priority" || ui.trainerFilter === "no-program" && attention.noProgram; return queryMatch && filterMatch; });
  }
  function trainerHeader(title, subtitle, backAction) { return '<header class="trainer-head"><button class="back-btn" data-action="' + backAction + '" aria-label="Geri">' + icons.back + '</button><div><strong>' + esc(title) + '</strong><small>' + esc(subtitle) + '</small></div><span class="pilot-badge ' + (state.cloud && state.cloud.userId ? "cloud" : "") + '">' + (state.cloud && state.cloud.userId ? "BULUTTA" : "YEREL PİLOT") + '</span></header>'; }
  function renderTrainerPanel() {
    clearRestTimer(); flowLayer.classList.add("active");
    if (ui.trainerMemberId) return renderTrainerMember(ui.trainerMemberId);
    var members = trainerRoster(); var filtered = trainerFilteredMembers();
    flowLayer.innerHTML = '<div class="full-flow trainer-flow members-flow trainer-ui-revision">' + trainerHeader("Üyeler", members.length + " üye", "close-trainer") + '<main class="trainer-scroll"><button class="primary-btn member-add-btn" data-cloud-action="invite-manager">+ Üye ekle</button><label class="trainer-search">' + icons.search + '<input data-trainer-search type="search" aria-label="Üye ara" placeholder="Üye ara" value="' + esc(ui.trainerQuery) + '"></label><div class="trainer-filters">' + [["all", "Tümü"], ["priority", "Öncelikli"], ["no-program", "Programsız"]].map(function (filter) { return '<button data-action="trainer-filter" data-filter="' + filter[0] + '" aria-pressed="' + (ui.trainerFilter === filter[0]) + '" class="' + (ui.trainerFilter === filter[0] ? "active" : "") + '">' + filter[1] + '</button>'; }).join("") + '</div><p class="trainer-data-note">Öncelikler, bu cihazdaki son mesaj ve antrenman kayıtlarına göre belirlenir.</p><div class="trainer-member-list revised-members">' + (filtered.length ? filtered.map(renderTrainerMemberCard).join("") : '<article class="trainer-empty"><span>⌁</span><strong>Eşleşen üye yok.</strong><small>Aramayı veya filtreyi değiştir.</small></article>') + '</div></main></div>';
    decorateTrainerNavigation("members");
  }
  function memberProgramEntries(member) {
    var list = Array.isArray(member.assignments) ? member.assignments : [];
    return list.map(function (assignment) { return { assignment: assignment, program: programs.find(function (item) { return item.id === assignment.programId; }) }; }).filter(function (entry) { return Boolean(entry.program); }).filter(function (entry, index, values) { return values.findIndex(function (other) { return other.program.id === entry.program.id; }) === index; });
  }
  function renderTrainerMemberCard(member) {
    var attention = memberAttention(member), entries = attention.entries, name = memberName(member);
    var programCopy = entries.length ? entries[0].program.name + (entries.length > 1 ? " · +" + (entries.length - 1) + " program" : "") : attention.noProgram ? "Program atanmadı" : "Program bilgisi bekleniyor";
    return '<article class="trainer-member-card revised-member-card"><button class="member-card-main" data-action="trainer-member" data-member-id="' + esc(member.id) + '" aria-label="' + esc(name) + ' üye detayını aç"><span class="member-avatar">' + esc(initials(name)) + '</span><span class="member-card-copy"><strong>' + esc(name) + (member.isSelf ? ' <i>SEN</i>' : '') + '</strong><span class="trainer-state trainer-state-' + attention.tone + '">' + esc(attention.label) + '</span></span><span class="small-arrow">' + icons.arrow + '</span></button><div class="trainer-member-summary"><p>' + esc(programCopy) + '</p><small>' + esc(attention.detail) + '</small></div><div class="trainer-card-actions"><button class="secondary-btn" data-action="' + (attention.noProgram ? "trainer-assign-shortcut" : "trainer-member") + '" data-member-id="' + esc(member.id) + '">' + (attention.noProgram ? "Program ata" : "Üyeyi aç") + '</button><button class="secondary-btn member-chat-shortcut" data-action="open-chat" data-partner-id="' + esc(member.id) + '" aria-label="' + esc(name) + ' adlı üyeye mesaj gönder">' + icons.message + '<span>' + (attention.unread ? "Yanıtla" : "Mesaj") + '</span>' + (attention.unread ? '<b>' + attention.unread + '</b>' : '') + '</button></div></article>';
  }
  function trainerProgramDayChips(program) { return programDays(program).map(function (day) { return '<div class="program-day-chip-group"><b>' + esc(day.name) + '</b>' + day.exercises.map(function (item) { return '<span>' + esc(item.name) + ' · ' + item.sets + ' set</span>'; }).join("") + '</div>'; }).join(""); }
  function renderTrainerMember(id) {
    var member = state.trainer.members.find(function (item) { return item.id === id; }); if (!member) { ui.trainerMemberId = ""; return renderTrainerPanel(); }
    var metrics = memberMetrics(member); var recent = memberHistory(member).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 5); var locked = Boolean(member.isSelf && state.currentWorkout); var assignedEntries = memberProgramEntries(member); var assignedIds = assignedEntries.map(function (entry) { return entry.program.id; });
    var choices = assignablePrograms().filter(function (item) { return assignedIds.indexOf(item.id) === -1; });
    var assignedCards = assignedEntries.map(function (entry) { var program = entry.program; var isRunning = member.isSelf && state.currentWorkout && state.currentWorkout.programId === program.id; return '<article class="member-assignment-card">' + exerciseImg(programDays(program)[0].exercises[0] || {}, "member-assignment-thumb", "") + '<div><strong>' + esc(program.name) + '</strong><small>' + esc(programMeta(program)) + '</small></div><button class="danger-text" data-action="unassign-program" data-member-id="' + esc(member.id) + '" data-program-id="' + esc(program.id) + '" ' + (isRunning ? "disabled" : "") + '>' + (isRunning ? "Devam ediyor" : "Kaldır") + '</button></article>'; }).join("");
    var memberUnread = unreadFrom(member.id);
    flowLayer.innerHTML = '<div class="full-flow trainer-flow">' + trainerHeader(memberName(member), metrics.status.detail, "trainer-dashboard") + '<main class="trainer-scroll member-detail"><section class="member-hero"><div class="member-avatar large">' + esc(initials(memberName(member))) + '</div><div><span class="member-status ' + metrics.status.key + '">' + esc(metrics.status.label) + '</span><h1>' + esc(memberName(member)) + '</h1><p>' + (member.isSelf ? "Bu cihazdaki sporcu profili" : "Üyelik: " + formatDate(member.joinedAt)) + '</p></div></section><div class="member-metrics"><article><strong>' + metrics.sessions + '</strong><small>BU HAFTA</small></article><article><strong>' + formatDuration(metrics.weekMinutes) + '</strong><small>HAFTALIK SÜRE</small></article><article><strong>' + metrics.completed.length + '</strong><small>TAM ANTRENMAN</small></article></div><button class="primary-btn member-message-btn" data-action="open-chat" data-partner-id="' + esc(member.id) + '">' + icons.message + '<span>' + (memberUnread ? memberUnread + ' yeni mesajı aç' : 'Üyeye mesaj gönder') + '</span></button><section class="trainer-card"><div class="trainer-card-head"><div><p class="section-label">ATANAN ANTRENMANLAR</p><h2>' + assignedEntries.length + ' aktif antrenman</h2></div><span class="connected">● AKTİF</span></div><div class="member-assignment-list">' + (assignedCards || '<div class="trainer-empty compact"><strong>Henüz antrenman atanmadı.</strong><small>Aşağıdan istediğin kadar antrenman ekleyebilirsin.</small></div>') + '</div><div class="field select-field"><label for="trainerProgram">YENİ ANTRENMAN EKLE</label><select id="trainerProgram" ' + (!choices.length ? "disabled" : "") + '>' + (choices.length ? choices.map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.name) + (item.revision > 1 ? " · v" + item.revision : "") + '</option>'; }).join("") : '<option>Eklenebilecek başka antrenman yok</option>') + '</select></div>' + (locked ? '<p class="assignment-warning">Devam eden antrenman kaldırılamaz; diğer antrenmanları eklemeye devam edebilirsin.</p>' : '') + '<button class="primary-btn" data-action="assign-program" data-member-id="' + esc(member.id) + '" ' + (!choices.length ? "disabled" : "") + '>Antrenmanı ekle</button></section><section class="trainer-card"><div class="trainer-card-head"><div><p class="section-label">ANTRENÖR NOTU</p><h2>Sporcuya gösterilecek not</h2></div></div><textarea id="memberNote" aria-label="Antrenör notu" maxlength="180" placeholder="Kısa ve uygulanabilir bir not yaz…">' + esc(member.note) + '</textarea><button class="secondary-btn" data-action="save-member-note" data-member-id="' + esc(member.id) + '">Notu kaydet</button></section><section class="trainer-card"><div class="trainer-card-head"><div><p class="section-label">SON ANTRENMANLAR</p><h2>Üye geçmişi</h2></div></div><div class="trainer-history">' + (recent.length ? recent.map(function (item) { return '<article><span class="history-icon">' + (item.status === "partial" ? "½" : "✓") + '</span><div><strong>' + esc(item.name) + '</strong><small>' + formatDate(item.date) + ' · ' + formatDuration(item.duration) + '</small></div><em>' + (item.status === "partial" ? "Yarım" : "Tam") + '</em></article>'; }).join("") : '<div class="trainer-empty compact"><strong>Henüz antrenman yok.</strong><small>İlk tamamlanan kayıt burada görünür.</small></div>') + '</div></section></main></div>';
  }
  function assignTrainerProgram(memberId) {
    var member = state.trainer.members.find(function (item) { return item.id === memberId; }); var select = document.getElementById("trainerProgram"); if (!member || !select) return; var program = programById(select.value);
    if (memberProgramEntries(member).some(function (entry) { return entry.program.id === program.id; })) return showToast("Bu antrenman üyeye zaten atanmış.");
    var newAssignment = normalizeAssignment({ programId: program.id, dayId: activeProgramDay(program, "").id, cloudId: "", assignedAt: new Date().toISOString(), assignedBy: state.gym.coach, coachNote: member.note }, member.assignments.length, state.gym.coach);
    member.assignments.push(newAssignment); member.programIds = member.assignments.map(function (item) { return item.programId; }); member.programId = member.programIds[0] || program.id;
    if (member.isSelf) {
      var knownAssignment = state.assignments.find(function (item) { return item.programId === program.id; });
      if (!knownAssignment) state.assignments.push(newAssignment);
      if (!selectedAssignment()) selectAssignment(program.id);
    }
    saveState(); renderTrainerMember(memberId);
    if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud) {
      showToast(program.name + " bulut atama kuyruğuna alındı.");
      window.FitTrackCloud.assignProgram(memberId, program, member.note).then(function () { showToast(program.name + " üyeye atandı."); }).catch(function () { showToast("Atama çevrimdışı kuyrukta; bağlantı gelince gönderilecek."); });
    } else showToast(program.name + " atandı.");
  }
  function unassignTrainerProgram(memberId, programId) {
    var member = state.trainer.members.find(function (item) { return item.id === memberId; }); if (!member) return; var entry = memberProgramEntries(member).find(function (item) { return item.program.id === programId; }); if (!entry) return;
    if (member.isSelf && state.currentWorkout && state.currentWorkout.programId === programId) return showToast("Devam eden antrenman kaldırılamaz.");
    member.assignments = member.assignments.filter(function (item) { return item.programId !== programId; }); member.programIds = member.assignments.map(function (item) { return item.programId; }); member.programId = member.programIds[0] || "";
    if (member.isSelf) { state.assignments = state.assignments.filter(function (item) { return item.programId !== programId; }); var selected = selectedAssignment(); state.selectedProgramId = selected ? selected.programId : ""; state.assignment = selected ? Object.assign({}, selected) : null; }
    saveState(); renderTrainerMember(memberId);
    if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud && entry.assignment.cloudId) window.FitTrackCloud.unassignProgram(memberId, entry.assignment.cloudId).then(function () { showToast(entry.program.name + " üyeden kaldırıldı."); }).catch(function () { showToast("Kaldırma işlemi çevrimdışı kuyruğa alındı."); });
    else showToast(entry.program.name + " kaldırıldı.");
  }
  function saveMemberNote(memberId) {
    var member = state.trainer.members.find(function (item) { return item.id === memberId; }); var input = document.getElementById("memberNote"); if (!member || !input) return;
    member.note = String(input.value || "").trim().slice(0, 180); saveState(); renderTrainerMember(memberId);
    if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.saveCoachNote(memberId, member.note).then(function () { showToast("Antrenör notu bulutta güncellendi."); }).catch(function () { showToast("Not çevrimdışı kuyruğa alındı."); });
    else showToast("Antrenör notu kaydedildi.");
  }
  function weekdayName(value) { return ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][value] || "Esnek gün"; }
  function programDayPreview(day) {
    return '<section class="program-day-preview"><div class="program-day-head"><div><small>Seansını başlarken seç</small><h3>' + esc(day.name) + '</h3></div></div><div class="program-preview-list">' + day.exercises.map(function (item, index) {
      return '<article><span>' + (index + 1) + '</span>' + exerciseImg(item, "", "") + '<div><strong>' + esc(item.name) + '</strong><small>' + item.sets + ' set · ' + esc(item.setPlan.map(function (set) { return setTypeLabel(set.type); }).join(" / ")) + '</small>' + (item.coachNote ? '<em>' + esc(item.coachNote) + '</em>' : '') + '</div></article>';
    }).join("") + '</div></section>';
  }

  function openProgramPreview(id) { var program = programById(id); var assigned = (state.assignments || []).some(function (item) { return item.programId === program.id; }); openSheet('<div class="sheet-head"><div><h2>' + esc(program.name) + '</h2><p>' + esc(program.meta) + (program.revision > 1 ? " · Sürüm " + program.revision : "") + '</p></div><button class="close-btn" data-action="close-sheet">×</button></div>' + (program.description ? '<p class="program-description">' + esc(program.description) + '</p>' : '') + (program.generalNote ? '<article class="coach-note"><strong>ANTRENÖRÜN GENEL NOTU</strong><p>' + esc(program.generalNote) + '</p></article>' : '') + programDays(program).map(function (day) { return programDayPreview(day, program, assigned); }).join("") + (assigned ? '<button class="primary-btn preview-start" data-action="start-assigned-program" data-program-id="' + esc(program.id) + '">' + (state.currentWorkout && state.currentWorkout.programId === program.id ? "Antrenmana dön" : "Seans seç ve başla") + '</button>' : '<p class="sheet-note">Bu programı antrenör panelinden üyeye atayabilirsin.</p>')); }


  function editorRecoveryKey() { return "fittrack-beta-0114-editor-" + (state.cloud.userId || "local") + "-" + (state.cloud.gymId || "none"); }
  function editorFingerprint(draft) { return JSON.stringify(draft ? { name: draft.name, description: draft.description, generalNote: draft.generalNote, trainingWeekdays: programTrainingWeekdays(draft), days: draft.days } : null); }
  function beginEditor(draft) { ui.editorUndo = []; ui.editorBaseline = editorFingerprint(draft); return draft; }
  function saveEditorRecovery() {
    if (!ui.editorDraft) return;
    try { localStorage.setItem(editorRecoveryKey(), JSON.stringify({ draft: ui.editorDraft, step: ui.studioStep, baseline: ui.editorBaseline, updatedAt: new Date().toISOString() })); }
    catch (_) { showToast("Taslak cihazda saklanamadı; depolama alanını kontrol et."); }
  }
  function getEditorRecovery() { try { var saved = JSON.parse(localStorage.getItem(editorRecoveryKey()) || "null"); return saved && saved.draft && Array.isArray(saved.draft.days) && saved.draft.days.length ? saved : null; } catch (_) { return null; } }
  function restoreEditorRecovery() {
    var saved = getEditorRecovery(); if (!saved) return;
    var draft = saved.draft;
    draft.days = draft.days.slice(0, 7).map(function (day, index) { return normalizeProgramDay(day, index); });
    ui.editorDraft = draft; editorActiveDay(); ui.editorBaseline = saved.baseline || ""; ui.editorUndo = []; ui.studioStep = safeInteger(saved.step, 1, 4, 1);
    closeSheet(); renderStudioEditor(); showToast("Kaydedilmemiş taslağın geri yüklendi.");
  }
  function discardEditorRecovery() { localStorage.removeItem(editorRecoveryKey()); }
  function requestEditorExit(after) {
    if (!ui.editorDraft) return after();
    if (editorFingerprint(ui.editorDraft) === ui.editorBaseline) { discardEditorRecovery(); ui.editorDraft = null; return after(); }
    saveEditorRecovery(); ui.editorExit = after;
    openSheet('<div class="delete-confirm"><h2>Kaydedilmemiş değişikliklerin var.</h2><p>Taslağını bu cihazda saklayabilir veya değişikliklerden vazgeçebilirsin.</p><button class="primary-btn" data-action="editor-exit-keep">Taslağı sakla ve çık</button><button class="danger-btn solid" data-action="editor-exit-discard">Değişiklikleri sil ve çık</button><button class="secondary-btn close-btn" data-action="close-sheet">Düzenlemeye devam et</button></div>');
  }
  function finishEditorExit(keep) { var after = ui.editorExit || renderProgramStudio; if (keep) saveEditorRecovery(); else discardEditorRecovery(); ui.editorExit = null; ui.editorDraft = null; ui.studioSelection = null; closeSheet(); after(); }
  function rememberEditorUndo() { if (!ui.editorDraft) return; ui.editorUndo = ui.editorUndo || []; ui.editorUndo.push(JSON.stringify(ui.editorDraft)); if (ui.editorUndo.length > 20) ui.editorUndo.shift(); }
  function undoEditorChange() {
    if (!ui.editorUndo || !ui.editorUndo.length) return;
    ui.editorDraft = JSON.parse(ui.editorUndo.pop()); editorActiveDay(); closeSheet(); renderStudioEditor(); showToast("Son kaldırma geri alındı.");
  }
  function confirmEditorRemoval(title, operation) {
    ui.pendingDelete = operation;
    openSheet('<div class="delete-confirm"><h2>' + esc(title) + '</h2><p>Set hedefleri ve notlar da kaldırılır. İşlemden sonra Geri al ile geri getirebilirsin.</p><button class="danger-btn solid" data-action="editor-confirm-remove">Evet, kaldır</button><button class="secondary-btn close-btn" data-action="close-sheet">Vazgeç</button></div>');
  }
  function commitEditorRemoval() { var operation = ui.pendingDelete; ui.pendingDelete = null; closeSheet(); if (operation && ui.editorDraft) { rememberEditorUndo(); operation(); saveEditorRecovery(); } }
  function removeStudioExercise(index) {
    if (!ui.editorDraft || !ui.editorDraft.exercises[index]) return;
    var draft = ui.editorDraft; var day = editorActiveDay(); var item = day.exercises[index];
    confirmEditorRemoval(item.name + " kaldırılsın mı?", function () { if (ui.editorDraft !== draft) return; var position = day.exercises.indexOf(item); if (position >= 0) day.exercises.splice(position, 1); renderStudioEditor(); });
  }
  function mergeProgramDeletionState(target, remote) {
    var decisions = Object.assign(Object.create(null), target.programDeletionState || {});
    Object.keys(remote.programDeletionState || {}).forEach(function (id) {
      var candidate = remote.programDeletionState[id]; if (!candidate || typeof candidate.deleted !== "boolean" || !validDateTime(candidate.at, "")) return;
      if (!decisions[id] || candidate.at > decisions[id].at) decisions[id] = { deleted: candidate.deleted, at: candidate.at };
    });
    target.programDeletionState = decisions;
    target.deletedProgramIds = Array.from(new Set((target.deletedProgramIds || []).concat(remote.deletedProgramIds || [], Object.keys(decisions)))).filter(function (id) { return !decisions[id] || decisions[id].deleted; });
  }
  function setProgramDeletion(id, deleted) {
    var previous = state.programDeletionState[id];
    var at = new Date(Math.max(Date.now(), (Date.parse(previous && previous.at || "") || 0) + 1)).toISOString();
    state.programDeletionState[id] = { deleted: deleted, at: at }; mergeProgramDeletionState(state, {}); return at;
  }
  function undoProgramDelete() {
    var old = ui.programUndo; if (!old) return;
    ui.programUndo = null; state.deletedProgramIds = state.deletedProgramIds.filter(function (id) { return id !== old.id; });
    old.updatedAt = setProgramDeletion(old.id, false); state.customPrograms.push(old); refreshPrograms(); saveState(); renderProgramStudio();
    if (state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.publishProgram(old).catch(function () { showToast("Geri alma eşitlenmek üzere bekliyor."); });
  }

  function emptyEditorDraft() { var day = normalizeProgramDay({ id: "day-" + Date.now(), name: "1. Gün", exercises: [] }, 0); ui.studioStep = 1; return beginEditor({ _sourceId: "", _sourceStatus: "", rootId: "", revision: 1, name: "", description: "", generalNote: "", trainingWeekdays: [], days: [day], activeDayIndex: 0, exercises: day.exercises }); }

  function editorDraftFromProgram(program, copy) {
    if (!program) return emptyEditorDraft();
    var days = programDays(program).map(function (day, index) { return normalizeProgramDay({ id: copy ? "day-" + Date.now() + "-" + index : day.id, name: day.name, weekday: day.weekday, exercises: day.exercises }, index); });
    ui.studioStep = 1;
    return beginEditor({ _sourceId: copy || builtInPrograms.some(function (item) { return item.id === program.id; }) ? "" : program.id, _sourceStatus: copy ? "" : program.status, rootId: copy ? "" : (program.rootId || program.id), revision: copy ? 1 : (program.revision || 1), name: copy ? program.name + " Kopyası" : program.name, description: program.description || "", generalNote: program.generalNote || "", trainingWeekdays: programTrainingWeekdays(program), days: days, activeDayIndex: 0, exercises: days[0].exercises });
  }

  function statusText(status) { return status === "published" ? "YAYINDA" : status === "archived" ? "ARŞİV" : "TASLAK"; }
  function studioProgramCard(program) {
    var builtIn = builtInPrograms.some(function (item) { return item.id === program.id; });
    var days = programDays(program); var exerciseCount = days.reduce(function (sum, day) { return sum + day.exercises.length; }, 0);
    var assignedCount = (state.trainer.members || []).filter(function (member) { return memberProgramEntries(member).some(function (entry) { return entry.program.id === program.id; }); }).length;
    return '<article class="studio-program-card ' + esc(program.status) + '"><span class="studio-program-icon">' + (program.status === "draft" ? "▤" : "◫") + '</span><div class="studio-program-main"><span class="studio-status">' + (builtIn ? "HAZIR ŞABLON" : statusText(program.status)) + '</span><h3>' + esc(program.name) + '</h3><p>' + days.length + ' gün · ' + exerciseCount + ' hareket · ' + Math.max(5, Number((program.meta.match(/(\d+) dk/) || [])[1]) || 30) + ' dk</p>' + (assignedCount ? '<em>' + assignedCount + ' üyeye atanmış</em>' : '') + '</div><div class="studio-overflow"><button class="more-btn" data-action="studio-menu" data-program-id="' + esc(program.id) + '" aria-label="Program menüsü">' + icons.more + '</button></div><div class="studio-card-primary"><button data-action="' + (builtIn ? "studio-copy" : "studio-edit") + '" data-program-id="' + esc(program.id) + '">' + (builtIn ? "Şablondan oluştur" : "Düzenle") + '</button></div></article>';
  }
  function renderProgramStudio() {
    clearRestTimer(); flowLayer.classList.add("active");
    if (ui.editorDraft) return renderStudioEditor();
    ui.staffProgramId = ""; ui.staffMemberReturn = "";
    var published = state.customPrograms.filter(function (item) { return item.status === "published"; });
    var drafts = state.customPrograms.filter(function (item) { return item.status === "draft"; });
    flowLayer.innerHTML = '<div class="full-flow trainer-flow studio-flow trainer-programs-flow">' + trainerHeader("Programlar", published.length + " yayında · " + drafts.length + " taslak", "close-trainer") + '<main class="trainer-scroll">' +
      (getEditorRecovery() ? '<article class="card editor-recovery"><strong>Kaydedilmemiş taslak bulundu.</strong><button class="primary-btn" data-action="editor-recover">Taslağı geri yükle</button><button class="secondary-btn" data-action="editor-discard-recovery">Taslağı sil</button></article>' : '') +
      (ui.programUndo ? '<button class="secondary-btn editor-undo" data-action="program-undo-delete">↶ Program silmeyi geri al</button>' : '') +
      '<button class="primary-btn studio-create" data-action="studio-new">+ Yeni program</button><label class="trainer-search">' + icons.search + '<input data-program-search type="search" aria-label="Program ara" placeholder="Program ara…" value="' + esc(ui.programQuery || "") + '"></label>' +
      '<div class="trainer-tabs">' + [["all", "Tümü"], ["published", "Yayında"], ["draft", "Taslak"]].map(function (item) { return '<button data-action="program-filter" data-filter="' + item[0] + '" aria-pressed="' + ((ui.programFilter || "all") === item[0]) + '">' + item[1] + '</button>'; }).join("") + '</div><div id="trainerProgramResults"></div></main>' + staffNavigation("programs", true) + '</div>';
    renderTrainerProgramResults();
  }
  function trainerProgramList() {
    var query = String(ui.programQuery || "").trim().toLocaleLowerCase("tr-TR"), filter = ui.programFilter || "all";
    return state.customPrograms.filter(function (program) { return program.name.toLocaleLowerCase("tr-TR").indexOf(query) !== -1 && (filter === "all" || program.status === filter); })
      .sort(function (a, b) { return String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")); });
  }
  function trainerProgramRow(program) {
    var days = programDays(program), count = trainerRoster().filter(function (member) { return memberProgramEntries(member).some(function (entry) { return entry.program.id === program.id; }); }).length;
    return '<article class="trainer-program-row"><button data-action="staff-program-detail" data-program-id="' + esc(program.id) + '">' + exerciseImg(days[0].exercises[0] || {}, "trainer-program-cover", "") + '<span><strong>' + esc(program.name) + '</strong><small class="trainer-state trainer-state-' + (program.status === "published" ? "success" : "warning") + '">' + statusText(program.status) + '</small><em>' + days.length + ' gün · ' + days.reduce(function (sum, day) { return sum + day.exercises.length; }, 0) + ' hareket · ' + count + ' üye</em></span><span class="small-arrow">' + icons.arrow + '</span></button><button class="more-btn" data-action="studio-menu" data-program-id="' + esc(program.id) + '" aria-label="' + esc(program.name) + ' program işlemleri">' + icons.more + '</button></article>';
  }
  function renderTrainerProgramResults() {
    var node = document.getElementById("trainerProgramResults"); if (!node) return;
    var list = trainerProgramList(), active = list.filter(function (item) { return item.status !== "archived"; }), archived = list.filter(function (item) { return item.status === "archived"; });
    node.innerHTML = '<div class="trainer-program-list">' + (active.length ? active.map(trainerProgramRow).join("") : '<article class="trainer-empty"><strong>Eşleşen program yok.</strong><small>Aramayı değiştir veya yeni program oluştur.</small></article>') + '</div>' +
      ((ui.programFilter || "all") === "all" ? '<details class="archived-programs"><summary>Arşiv (' + archived.length + ')</summary>' + archived.map(trainerProgramRow).join("") + '</details>' : '') +
      '<details class="trainer-templates"><summary>Hazır şablonlardan oluştur</summary><div class="studio-program-list">' + builtInPrograms.filter(function (program) { return program.name.toLocaleLowerCase("tr-TR").indexOf(String(ui.programQuery || "").trim().toLocaleLowerCase("tr-TR")) >= 0; }).map(studioProgramCard).join("") + '</div></details>';
  }
  function renderStaffProgramDetail(id, tab) {
    var program = programs.find(function (item) { return item.id === id; }); if (!program || !canUseTrainerPanel()) return;
    ui.staffProgramId = id; ui.staffProgramTab = tab || "program"; flowLayer.classList.add("active");
    var members = trainerRoster().filter(function (member) { return memberProgramEntries(member).some(function (entry) { return entry.program.id === id; }); });
    var content = ui.staffProgramTab === "members" ? '<div class="trainer-member-list">' + (members.length ? members.map(renderTrainerMemberCard).join("") : '<article class="trainer-empty"><strong>Henüz üyeye atanmadı.</strong></article>') + '</div>' :
      (program.generalNote ? '<article class="coach-note"><strong>ANTRENÖR NOTU</strong><p>' + esc(program.generalNote) + '</p></article>' : '') + programDays(program).map(function (day, index) { return '<details class="trainer-program-day" ' + (index === 0 ? "open" : "") + '><summary>' + (index + 1) + '. Gün · ' + esc(day.name) + '<span>' + day.exercises.length + ' hareket</span></summary><div>' + day.exercises.map(function (item) { return '<article>' + exerciseImg(item, "", "") + '<span><strong>' + esc(item.name) + '</strong><small>' + item.sets + ' set · ' + esc(item.repsTarget) + ' tekrar</small></span></article>'; }).join("") + '</div></details>'; }).join("");
    flowLayer.innerHTML = '<div class="full-flow trainer-flow staff-program-detail">' + trainerHeader(program.name, statusText(program.status), "staff-programs-return") + '<main class="trainer-scroll"><div class="trainer-tabs"><button data-action="staff-program-tab" data-tab="program" aria-pressed="' + (ui.staffProgramTab === "program") + '">Program</button><button data-action="staff-program-tab" data-tab="members" aria-pressed="' + (ui.staffProgramTab === "members") + '">Üyeler (' + members.length + ')</button></div>' + content + '</main><div class="trainer-detail-actions"><button class="secondary-btn" data-action="studio-edit" data-program-id="' + esc(id) + '">Düzenle</button>' + (program.status === "published" ? '<button class="primary-btn" data-action="staff-program-pick-member" data-program-id="' + esc(id) + '">Üyeye ata</button>' : '<span class="trainer-data-note">Atamak için önce yayınla.</span>') + '</div></div>';
  }
  function openProgramMemberPicker(id) {
    var program = programs.find(function (item) { return item.id === id && item.status === "published"; }); if (!program || !canUseTrainerPanel()) return;
    ui.assignPickerProgramId = id;
    openSheet('<div class="sheet-head"><div><h2>Üyeye ata</h2><p>' + esc(program.name) + '</p></div><button class="close-btn" data-action="close-sheet">×</button></div><p class="trainer-data-note">Üyeyi seç; atama formunda kontrol edip onayla.</p><label class="trainer-search">' + icons.search + '<input data-assignment-search type="search" aria-label="Atama için üye ara" placeholder="Üye ara…"></label><div id="assignmentMemberResults" class="assignment-member-results"></div>');
    renderAssignmentMemberResults("");
  }
  function renderAssignmentMemberResults(query) {
    var node = document.getElementById("assignmentMemberResults"), id = ui.assignPickerProgramId; if (!node) return;
    var list = trainerRoster().filter(function (member) { return memberName(member).toLocaleLowerCase("tr-TR").indexOf(String(query).trim().toLocaleLowerCase("tr-TR")) >= 0; });
    node.innerHTML = list.length ? list.map(function (member) { var assigned = memberProgramEntries(member).some(function (entry) { return entry.program.id === id; }); return '<button data-action="staff-program-assign-member" data-member-id="' + esc(member.id) + '" data-program-id="' + esc(id) + '" ' + (assigned ? "disabled" : "") + '><span class="member-avatar">' + esc(initials(memberName(member))) + '</span><span><strong>' + esc(memberName(member)) + '</strong><small>' + (assigned ? "Zaten atanmış" : memberProgramEntries(member).length + " program") + '</small></span>' + icons.arrow + '</button>'; }).join("") : '<p class="trainer-data-note">Eşleşen üye yok.</p>';
  }

  function openStudioProgramMenu(id) {
    var program = programById(id); var builtIn = builtInPrograms.some(function (item) { return item.id === program.id; });
    openSheet('<div class="sheet-head"><div><h2>' + esc(program.name) + '</h2><p>Program işlemleri</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="program-action-menu"><button data-action="studio-preview" data-program-id="' + esc(program.id) + '">Önizle</button><button data-action="studio-copy" data-program-id="' + esc(program.id) + '">' + (builtIn ? "Şablondan oluştur" : "Kopyala") + '</button>' + (!builtIn && program.status !== "archived" ? '<button data-action="studio-archive" data-program-id="' + esc(program.id) + '">Arşivle</button><button class="danger-text" data-action="studio-delete-confirm" data-program-id="' + esc(program.id) + '">Sil</button>' : '') + '</div>');
  }
  function confirmDeleteStudioProgram(id) {
    var program = state.customPrograms.find(function (item) { return item.id === id; }); if (!program) return;
    var assigned = (state.trainer.members || []).some(function (member) { return memberProgramEntries(member).some(function (entry) { return entry.program.id === id; }); }) || assignedPrograms().some(function (entry) { return entry.program.id === id; });
    if (assigned) return showToast("Atanmış program silinemez; önce üyelerin programını değiştir.");
    openSheet('<div class="delete-confirm"><span>!</span><h2>Program silinsin mi?</h2><p>' + esc(program.name) + ' listeden kaldırılacak. Bu oturumda Geri al ile geri getirebilirsin.</p><button class="danger-btn solid" data-action="studio-delete" data-program-id="' + esc(id) + '">Evet, programı sil</button><button class="secondary-btn" data-action="studio-dashboard">Vazgeç</button></div>');
  }
  function deleteStudioProgram(id) {
    var program = state.customPrograms.find(function (item) { return item.id === id; }); if (!program) return;
    ui.programUndo = JSON.parse(JSON.stringify(program));
    if (state.currentWorkout && state.currentWorkout.programId === id) workoutProgram(state.currentWorkout);
    program.status = "archived"; program.updatedAt = setProgramDeletion(program.id, true); state.deletedProgramIds = (state.deletedProgramIds || []).concat([program.id]).filter(function (item, index, list) { return list.indexOf(item) === index; }).slice(-100);
    state.customPrograms = state.customPrograms.filter(function (item) { return item.id !== id; }); refreshPrograms(); saveState(); closeSheet(); renderProgramStudio(); showToast("Program silindi.");
    if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.publishProgram(program).catch(function () { showToast("Bulut silme işlemi bağlantı gelince tamamlanacak."); });
  }

  function renderStudioExerciseCard(item, index) {
    var types = item.setPlan.map(function (set) { return setTypeLabel(set.type); });
    return '<article class="studio-exercise-card">' + exerciseImg(item, "studio-exercise-thumb", "") + '<div class="studio-exercise-copy"><b>' + (index + 1) + '</b><strong>' + esc(item.name) + '</strong><small>' + item.sets + ' set · ' + esc(types.join(" / ")) + '</small>' + (item.coachNote ? '<em>Not: ' + esc(item.coachNote) + '</em>' : '') + '</div><div class="studio-move-actions"><button data-action="studio-move" data-index="' + index + '" data-delta="-1" ' + (index === 0 ? "disabled" : "") + ' aria-label="Yukarı taşı">↑</button><button data-action="studio-move" data-index="' + index + '" data-delta="1" ' + (index === ui.editorDraft.exercises.length - 1 ? "disabled" : "") + ' aria-label="Aşağı taşı">↓</button><button class="studio-config-btn" data-action="studio-config" data-index="' + index + '">Setleri düzenle</button><button class="danger-text studio-remove-move" data-action="studio-remove" data-index="' + index + '" aria-label="Hareketi kaldır">Kaldır</button></div></article>';
  }
  function editorActiveDay() { var draft = ui.editorDraft; if (!draft) return null; draft.activeDayIndex = safeInteger(draft.activeDayIndex, 0, draft.days.length - 1, 0); var day = draft.days[draft.activeDayIndex]; draft.exercises = day.exercises; return day; }
  function selectEditorDay(index) { if (!ui.editorDraft || !ui.editorDraft.days[index]) return; ui.editorDraft.activeDayIndex = index; ui.editorDraft.exercises = ui.editorDraft.days[index].exercises; renderStudioEditor(); }
  function addEditorDay() { var draft = ui.editorDraft; if (!draft || draft.days.length >= 7) return showToast("Bir programa en fazla 7 gün eklenebilir."); var index = draft.days.length; var day = normalizeProgramDay({ id: "day-" + Date.now(), name: (index + 1) + ". Gün", exercises: [] }, index); draft.days.push(day); selectEditorDay(index); showToast(day.name + " eklendi."); }
  function removeEditorDay() {
    var draft = ui.editorDraft; if (!draft || draft.days.length <= 1) return showToast("Programda en az bir gün olmalı.");
    var day = editorActiveDay();
    confirmEditorRemoval(day.name + " kaldırılsın mı?", function () { if (ui.editorDraft !== draft) return; var index = draft.days.indexOf(day); if (index >= 0) draft.days.splice(index, 1); draft.activeDayIndex = Math.max(0, index - 1); editorActiveDay(); renderStudioEditor(); });
  }

  function studioDaySetCount(day) { return (day.exercises || []).reduce(function (sum, item) { return sum + item.sets; }, 0); }
  function studioStepHeader(step) {
    var labels = ["Bilgiler", "Günler", "Hareketler", "Kontrol"];
    return '<nav class="studio-stepper" aria-label="Program oluşturma adımları">' + labels.map(function (label, index) { var number = index + 1; return '<button data-action="studio-jump-step" data-step="' + number + '" class="' + (number === step ? "active" : number < step ? "done" : "") + '" ' + (number > step ? "disabled" : "") + '><b>' + (number < step ? "✓" : number) + '</b><span>' + label + '</span></button>'; }).join("") + '</nav>';
  }
  function studioStepIntro(kicker, title, copy) { return '<section class="studio-step-intro"><p>' + kicker + '</p><h1>' + title + '</h1><span>' + copy + '</span></section>'; }
  function renderStudioBasics(draft) {
    var suggestions = ["Adaptasyon", "Göğüs + Biceps", "Omuz + Ön Kol", "Bacak + Omuz"];
    return studioStepIntro("1. ADIM", "Programın adı ne?", "Önce yalnızca adı belirle. Açıklama ve not istersen eklenebilir.") + '<section class="studio-form-card studio-basics-card"><div class="field"><label for="studioName">PROGRAM ADI</label><input id="studioName" data-studio-field="name" maxlength="60" placeholder="Örn. Göğüs + Biceps" value="' + esc(draft.name) + '" autofocus></div><div class="studio-name-suggestions"><small>HIZLI AD ÖNERİLERİ</small><div>' + suggestions.map(function (name) { return '<button data-action="studio-name-suggestion" data-name="' + esc(name) + '">' + esc(name) + '</button>'; }).join("") + '</div></div><details class="studio-optional-fields" ' + (draft.description || draft.generalNote ? "open" : "") + '><summary>İsteğe bağlı açıklama ve antrenör notu</summary><div class="field"><label for="studioDescription">KISA AÇIKLAMA</label><textarea id="studioDescription" data-studio-field="description" maxlength="240" placeholder="Programın amacı ve odağı…">' + esc(draft.description) + '</textarea></div><div class="field"><label for="studioGeneralNote">GENEL ANTRENÖR NOTU</label><textarea id="studioGeneralNote" data-studio-field="generalNote" maxlength="320" placeholder="Sporcunun programın başında göreceği not…">' + esc(draft.generalNote) + '</textarea></div></details></section>';
  }
  function renderStudioDaysStep(draft, day) {
    var weekdayOptions = [{ value: "", label: "Esnek / gün seçilmedi" }].concat([1, 2, 3, 4, 5, 6, 0].map(function (value) { return { value: String(value), label: weekdayName(value) }; }));
    return studioStepIntro("2. ADIM", "Antrenman günlerini kur", "Her seansı ayrı ekle. Önerilen hafta günleri tüm program içindir; üye istediği seansı seçer.") + '<div class="studio-day-builder-list">' + draft.days.map(function (item, index) { return '<button data-action="studio-day-select" data-index="' + index + '" class="studio-day-builder-card ' + (index === draft.activeDayIndex ? "active" : "") + '"><b>' + (index + 1) + '</b><span><strong>' + esc(item.name || (index + 1) + ". Gün") + '</strong><small>' + "Bağımsız seans" + (item.exercises.length ? " · " + item.exercises.length + " hareket" : "") + '</small></span><em>' + (index === draft.activeDayIndex ? "DÜZENLENİYOR" : "DÜZENLE") + '</em></button>'; }).join("") + '</div><section class="studio-form-card studio-day-editor"><div class="field"><label for="studioDayName">GÜN ADI</label><input id="studioDayName" data-studio-day-name maxlength="40" value="' + esc(day.name) + '" placeholder="Örn. Göğüs + Biceps"></div><div class="field studio-training-weekdays"><label>ÖNERİLEN HAFTA GÜNLERİ</label><p class="field-hint">Programın tamamı için. Seanslarla eşleşmez.</p><div class="day-toggle-row">' + [1, 2, 3, 4, 5, 6, 0].map(function (weekday) { var selected = programTrainingWeekdays(draft).indexOf(weekday) !== -1; return '<button type="button" data-action="studio-training-weekday" data-weekday="' + weekday + '" aria-pressed="' + selected + '" class="day-toggle ' + (selected ? 'active' : '') + '">' + esc(weekdayName(weekday).slice(0, 3)) + '</button>'; }).join("") + '</div></div>'  + (draft.days.length > 1 ? '<button class="danger-text studio-remove-day" data-action="studio-remove-day">Bu günü kaldır</button>' : '') + '</section><button class="studio-add-day-card" data-action="studio-add-day" ' + (draft.days.length >= 7 ? "disabled" : "") + '><b>＋</b><span><strong>Başka antrenman günü ekle</strong><small>Örn. Omuz + Ön Kol veya Bacak</small></span></button>';
  }
  function renderStudioMovesStep(draft, day) {
    return studioStepIntro("3. ADIM", "Hareketleri seç", "Birden fazla hareketi arka arkaya seç; setleri daha sonra ayrı ayrı düzenleyebilirsin.") + '<div class="studio-day-tabs studio-move-day-tabs">' + draft.days.map(function (item, index) { return '<button data-action="studio-day-select" data-index="' + index + '" class="' + (index === draft.activeDayIndex ? "active" : "") + '"><small>' + (item.exercises.length ? "✓ " + item.exercises.length + " HAREKET" : "HAREKET BEKLİYOR") + '</small><strong>' + esc(item.name) + '</strong></button>'; }).join("") + '</div><section class="studio-move-builder"><div class="studio-move-builder-head"><div><p class="section-label">' + esc(day.name.toUpperCase()) + '</p><h2>' + day.exercises.length + ' hareket · ' + studioDaySetCount(day) + ' set</h2></div><button data-action="studio-add-move">+ Hareket seç</button></div><div class="studio-selected-list">' + (day.exercises.length ? day.exercises.map(renderStudioExerciseCard).join("") : '<article class="studio-move-empty"><span>＋</span><strong>Henüz hareket eklenmedi.</strong><small>Arama ve kas grubu filtresiyle birkaç hareketi tek seferde seçebilirsin.</small><button class="primary-btn" data-action="studio-add-move">Hareketleri seç</button></article>') + '</div>' + (day.exercises.length ? '<button class="secondary-btn studio-add" data-action="studio-add-move">+ Başka hareketler ekle</button>' : '') + '</section>';
  }
  function renderStudioReviewStep(draft) {
    var exerciseTotal = draft.days.reduce(function (sum, day) { return sum + day.exercises.length; }, 0); var setTotal = draft.days.reduce(function (sum, day) { return sum + studioDaySetCount(day); }, 0);
    return studioStepIntro("4. ADIM", "Son kontrol", "Yayınladığında antrenman üyeye atanabilir. İstersen taslak olarak da saklayabilirsin.") + '<section class="studio-review-hero"><span>HAZIRLANAN PROGRAM</span><h2>' + esc(draft.name) + '</h2>' + (draft.description ? '<p>' + esc(draft.description) + '</p>' : '') + '<div><b>' + draft.days.length + '<small>GÜN</small></b><b>' + exerciseTotal + '<small>HAREKET</small></b><b>' + setTotal + '<small>SET</small></b></div><button data-action="studio-jump-step" data-step="1">Bilgileri düzenle</button></section>' + (draft.generalNote ? '<article class="studio-review-note"><strong>ANTRENÖR NOTU</strong><p>' + esc(draft.generalNote) + '</p></article>' : '') + '<div class="studio-review-days">' + draft.days.map(function (day, dayIndex) { return '<article><header><span><small>' + (dayIndex + 1) + ". SEANS" + '</small><strong>' + esc(day.name) + '</strong></span><button data-action="studio-review-edit-day" data-index="' + dayIndex + '">Düzenle</button></header><div>' + day.exercises.map(function (item, index) { return '<p><b>' + (index + 1) + '</b><span><strong>' + esc(item.name) + '</strong><small>' + item.sets + ' set · ' + esc(item.repsTarget) + ' tekrar</small></span></p>'; }).join("") + '</div></article>'; }).join("") + '</div>';
  }
  function studioEditorFooter(step) {
    if (step === 1) return '<div class="studio-wizard-footer single-next"><button class="secondary-btn" data-action="studio-dashboard">Vazgeç</button><button class="primary-btn" data-action="studio-next-step">Devam et</button></div>';
    if (step < 4) return '<div class="studio-wizard-footer"><button class="secondary-btn" data-action="studio-previous-step">Geri</button><button class="primary-btn" data-action="studio-next-step">Devam et</button></div>';
    return '<div class="studio-wizard-footer publish"><button class="secondary-btn" data-action="studio-save-draft">Taslak kaydet</button><button class="primary-btn" data-action="studio-publish">Yayınla</button></div>';
  }
  function studioStepCanContinue(step) {
    var draft = ui.editorDraft; if (!draft) return false;
    if (step === 1 && !clean(draft.name, "", 60)) { showToast("Devam etmek için program adını yaz."); return false; }
    if (step === 2) { var unnamed = draft.days.find(function (day) { return !clean(day.name, "", 40); }); if (unnamed) { showToast("Her antrenman gününe bir ad ver."); return false; } }
    if (step === 3) { var empty = draft.days.find(function (day) { return !day.exercises.length; }); if (empty) { draft.activeDayIndex = draft.days.indexOf(empty); draft.exercises = empty.exercises; showToast(empty.name + " için en az bir hareket seç."); renderStudioEditor(); return false; } }
    return true;
  }
  function setStudioStep(next, force) { var current = safeInteger(ui.studioStep, 1, 4, 1); next = safeInteger(next, 1, 4, current); if (!force && next > current && !studioStepCanContinue(current)) return; ui.studioStep = next; renderStudioEditor(); }
  function renderStudioEditor() {
    if (!ui.editorDraft) return renderProgramStudio();
    saveEditorRecovery();
    var draft = ui.editorDraft; var day = editorActiveDay(); var step = safeInteger(ui.studioStep, 1, 4, 1); flowLayer.classList.add("active");
    var content = step === 1 ? renderStudioBasics(draft) : step === 2 ? renderStudioDaysStep(draft, day) : step === 3 ? renderStudioMovesStep(draft, day) : renderStudioReviewStep(draft);
    flowLayer.innerHTML = '<div class="full-flow trainer-flow studio-flow studio-wizard-flow">' + trainerHeader(draft.name || "Yeni program", "Adım " + step + " / 4", "studio-editor-back") + '<main class="trainer-scroll studio-editor">' + studioStepHeader(step) + (ui.editorUndo && ui.editorUndo.length ? '<button class="secondary-btn editor-undo" data-action="editor-undo">↶ Son kaldırmayı geri al</button>' : '') + (step < 4 && clean(draft.name, "", 60) ? '<button class="studio-quick-save" data-action="studio-save-draft">Taslak kaydet ve çık</button>' : '') + content + '</main>' + studioEditorFooter(step) + '</div>';
  }

  function studioCatalogList() {
    var query = String(ui.studioQuery || "").trim().toLocaleLowerCase("tr-TR");
    return catalogExercises().filter(function (item) { return (!query || (item.name + " " + item.muscles.join(" ") + " " + item.equipment).toLocaleLowerCase("tr-TR").indexOf(query) !== -1) && (ui.studioMuscle === "all" || item.muscles.indexOf(ui.studioMuscle) !== -1); });
  }
  function renderStudioCatalogItems() {
    var list = document.getElementById("studioCatalogList"); if (!list) return; var items = studioCatalogList(); if (!ui.studioSelection) return;
    list.innerHTML = items.length ? items.map(function (item) { var selected = ui.studioSelection.exercises.some(function (chosen) { return chosen.id === item.id; }); return '<button class="catalog-choice ' + (selected ? "selected" : "") + '" data-action="studio-add-exercise" data-exercise-id="' + esc(item.id) + '" ' + 'aria-pressed="' + (selected ? 'true' : 'false') + '"' + '>' + exerciseImg(item, "", "") + '<span><strong>' + esc(item.name) + '</strong><small>' + esc(item.muscles[0]) + ' · ' + esc(item.equipment) + '</small></span><b>' + (selected ? "✓" : "+") + '</b></button>'; }).join("") : '<article class="trainer-empty compact"><strong>Hareket bulunamadı.</strong><small>Aramayı değiştir veya özel hareket oluştur.</small></article>';
    var count = document.getElementById("studioSelectedCount"); if (count) count.textContent = ui.studioSelection.exercises.length + " hareket seçildi";
  }

  function openStudioCatalog(reuse) {
    if (!ui.editorDraft) return;
    if (!reuse || !ui.studioSelection) ui.studioSelection = { dayId: editorActiveDay().id, exercises: JSON.parse(JSON.stringify(ui.editorDraft.exercises)) };
    ui.studioQuery = ""; ui.studioMuscle = "all"; var muscles = []; catalogExercises().forEach(function (item) { item.muscles.forEach(function (muscle) { if (muscle && muscle !== "Destek" && muscles.indexOf(muscle) === -1) muscles.push(muscle); }); }); muscles.sort(function (a, b) { return a.localeCompare(b, "tr"); });
    openSheet('<div class="sheet-head studio-catalog-head"><div><h2>Hareketleri seç</h2><p>Seçmek veya bırakmak için dokun. Değişiklikler yalnız Seçimi uygula ile kaydedilir.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><label class="trainer-search studio-search">' + icons.search + '<input data-studio-catalog-search type="search" placeholder="Hareket, kas veya ekipman ara"></label><div class="field select-field studio-muscle-filter"><label for="studioMuscle">KAS GRUBU</label><select id="studioMuscle" data-studio-muscle><option value="all">Tümü</option>' + muscles.map(function (muscle) { return '<option value="' + esc(muscle) + '">' + esc(muscle) + '</option>'; }).join("") + '</select></div><button class="secondary-btn studio-custom-move" data-action="studio-custom-exercise">+ Özel hareket oluştur</button><div id="studioCatalogList" class="catalog-list"></div><div class="studio-catalog-footer"><span id="studioSelectedCount">' + ui.editorDraft.exercises.length + ' hareket seçildi</span><button class="primary-btn" data-action="studio-finish-selection">Seçimi uygula</button><button class="secondary-btn close-btn" data-action="close-sheet">Vazgeç</button></div>'); renderStudioCatalogItems();
  }

  function addStudioExercise(id) {
    var item = catalogExercises().find(function (entry) { return entry.id === id; });
    var selection = ui.studioSelection; if (!item || !ui.editorDraft || !selection) return;
    var index = selection.exercises.findIndex(function (entry) { return entry.id === id; });
    if (index >= 0) selection.exercises.splice(index, 1);
    else { if (selection.exercises.length >= 24) return showToast("Bir güne en fazla 24 hareket eklenebilir."); selection.exercises.push(cloneExerciseDefinition(item)); }
    renderStudioCatalogItems();
  }

  function finishStudioExerciseSelection() {
    var selection = ui.studioSelection; var draft = ui.editorDraft;
    if (!selection || !draft) return closeSheet();
    var day = draft.days.find(function (item) { return item.id === selection.dayId; });
    if (!day) { closeSheet(); return showToast("Seçimin yapıldığı gün artık bulunmuyor."); }
    rememberEditorUndo(); day.exercises = selection.exercises; editorActiveDay(); ui.studioSelection = null;
    closeSheet(); renderStudioEditor(); showToast("Hareket seçimi uygulandı.");
  }

  function openCustomExerciseEditor() { openSheet('<div class="sheet-head"><div><h2>Özel hareket</h2><p>Hareket programla birlikte salon bulutuna güvenli biçimde eşitlenir.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="field"><label for="customExerciseName">HAREKET ADI</label><input id="customExerciseName" maxlength="60" placeholder="Örn. Landmine Press"></div><div class="form-grid"><div class="field"><label for="customExerciseMuscle">ANA KAS</label><input id="customExerciseMuscle" maxlength="30" placeholder="Omuz"></div><div class="field"><label for="customExerciseSecondary">İKİNCİL KAS</label><input id="customExerciseSecondary" maxlength="30" placeholder="Triceps"></div></div><div class="field"><label for="customExerciseEquipment">EKİPMAN</label><input id="customExerciseEquipment" maxlength="30" placeholder="Barbell, Makine, Vücut…"></div><label class="toggle-row compact"><span><strong>Kilo girişi kullan</strong><small>Kapalıysa yalnız tekrar kaydedilir</small></span><input id="customExerciseWeight" type="checkbox" checked><i></i></label><div class="field"><label for="customExerciseCues">FORM İPUÇLARI</label><textarea id="customExerciseCues" maxlength="360" placeholder="Her satıra bir kısa ipucu yaz…"></textarea></div><button class="primary-btn" data-action="save-custom-exercise">Hareketi oluştur ve ekle</button>'); }
  function saveCustomExercise() {
    var name = clean(document.getElementById("customExerciseName").value, "", 60); if (!name) return showToast("Hareket adı gerekli.");
    var cues = String(document.getElementById("customExerciseCues").value || "").split(/\n+/).map(function (cue) { return clean(cue, "", 120); }).filter(Boolean).slice(0, 5);
    var item = normalizeCustomExercise({ id: "custom-" + exerciseIdFromName(name) + "-" + Date.now(), name: name, muscles: [clean(document.getElementById("customExerciseMuscle").value, "Tüm Vücut", 30), clean(document.getElementById("customExerciseSecondary").value, "Destek", 30)], equipment: clean(document.getElementById("customExerciseEquipment").value, "Diğer", 30), requiresWeight: document.getElementById("customExerciseWeight").checked, cues: cues, setPlan: defaultSetPlan(3, "10–12", 60, "normal") }, state.customExercises.length);
    state.customExercises.push(item); if (!ui.studioSelection) ui.studioSelection = { dayId: editorActiveDay().id, exercises: JSON.parse(JSON.stringify(ui.editorDraft.exercises)) }; ui.studioSelection.exercises.push(cloneExerciseDefinition(item)); saveState(); openStudioCatalog(true); showToast("Özel hareket oluşturuldu.");
  }

  function openStudioExerciseConfig(index) {
    var item = ui.editorDraft && ui.editorDraft.exercises[index]; if (!item) return; ui.studioExerciseIndex = index;
    openSheet('<div class="sheet-head"><div><h2>' + esc(item.name) + '</h2><p>Her setin türünü ve hedefini ayrı belirle.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="field"><label for="studioCoachNote">HAREKETE ÖZEL ANTRENÖR NOTU</label><textarea id="studioCoachNote" maxlength="240" placeholder="Form, tempo veya ağrıya göre alternatif notu…">' + esc(item.coachNote) + '</textarea></div><div id="studioSetRows" class="studio-set-rows">' + item.setPlan.map(renderStudioSetRow).join("") + '</div><div class="set-count-actions"><button class="secondary-btn" data-action="studio-remove-set" ' + (item.setPlan.length <= 1 ? "disabled" : "") + '>− Set azalt</button><button class="secondary-btn" data-action="studio-add-set" ' + (item.setPlan.length >= 12 ? "disabled" : "") + '>+ Set ekle</button></div>' + (ui.editorUndo && ui.editorUndo.length ? '<button class="secondary-btn" data-action="editor-undo">↶ Geri al</button>' : '') + '<button class="primary-btn" data-action="studio-save-config">Hareket ayarlarını kaydet</button>');
  }

  function renderStudioSetRow(set, index) {
    return '<article class="studio-set-row"><b>SET ' + (index + 1) + '</b><label>Tür<select data-config-type data-set-index="' + index + '">' + ["warmup", "normal", "drop", "failure"].map(function (type) { return '<option value="' + type + '" ' + (set.type === type ? "selected" : "") + '>' + setTypeLabel(type) + '</option>'; }).join("") + '</select></label><label>Tekrar<input data-config-reps data-set-index="' + index + '" maxlength="18" value="' + esc(set.repsTarget) + '"></label><label>Hedef kilo<input data-config-weight data-set-index="' + index + '" inputmode="decimal" maxlength="8" placeholder="—" value="' + esc(set.targetWeight) + '"></label><label>Dinlenme<input data-config-rest data-set-index="' + index + '" type="number" min="0" max="600" value="' + set.rest + '"><span>sn</span></label></article>';
  }
  function captureStudioExerciseConfig() {
    var item = ui.editorDraft && ui.editorDraft.exercises[ui.studioExerciseIndex]; if (!item) return null; var note = document.getElementById("studioCoachNote"); if (note) item.coachNote = String(note.value || "").trim().slice(0, 240);
    var types = Array.from(document.querySelectorAll("[data-config-type]")); if (types.length) item.setPlan = types.map(function (select, index) { var reps = document.querySelector('[data-config-reps][data-set-index="' + index + '"]'); var weight = document.querySelector('[data-config-weight][data-set-index="' + index + '"]'); var rest = document.querySelector('[data-config-rest][data-set-index="' + index + '"]'); return normalizePlanSet({ type: select.value, repsTarget: reps ? reps.value : "10–12", targetWeight: weight ? weight.value : "", rest: rest ? Number(rest.value) : 60 }, index); }); item.sets = item.setPlan.length; item.repsTarget = item.setPlan[0].repsTarget; item.rest = item.setPlan[0].rest; item.target = item.sets + " set · " + item.repsTarget + " tekrar"; return item;
  }
  function changeStudioSetCount(delta) {
    var item = captureStudioExerciseConfig(); if (!item) return;
    if (delta > 0 && item.setPlan.length < 12) { item.setPlan.push(normalizePlanSet(item.setPlan[item.setPlan.length - 1], item.setPlan.length)); item.sets = item.setPlan.length; saveEditorRecovery(); openStudioExerciseConfig(ui.studioExerciseIndex); }
    if (delta < 0 && item.setPlan.length > 1) {
      var draft = ui.editorDraft; var index = ui.studioExerciseIndex;
      confirmEditorRemoval("Son set kaldırılsın mı?", function () { if (ui.editorDraft !== draft) return; item.setPlan.pop(); item.sets = item.setPlan.length; renderStudioEditor(); openStudioExerciseConfig(index); });
    }
  }

  function moveStudioExercise(index, delta) { var draft = ui.editorDraft; var target = index + delta; if (!draft || !draft.exercises[index] || target < 0 || target >= draft.exercises.length) return; var moved = draft.exercises.splice(index, 1)[0]; draft.exercises.splice(target, 0, moved); renderStudioEditor(); }
  function validateEditorDraft(status) { var draft = ui.editorDraft; if (!draft) return false; if (!clean(draft.name, "", 60)) { showToast("Program adı gerekli."); return false; } if (status === "draft") return true; var emptyDay = draft.days.find(function (day) { return !clean(day.name, "", 40) || !day.exercises.length; }); if (emptyDay) { showToast((emptyDay.name || "Program günü") + " için en az bir hareket ekle."); return false; } return true; }
  function persistEditorDraft(status) {
    if (!validateEditorDraft(status)) return; var draft = ui.editorDraft; var now = new Date().toISOString(); var existingIndex = state.customPrograms.findIndex(function (item) { return item.id === draft._sourceId; }); var existing = existingIndex >= 0 ? state.customPrograms[existingIndex] : null; var id; var revision = draft.revision || 1; var rootId = draft.rootId;
    if (status === "draft" && existing && existing.status === "draft") id = existing.id;
    else if (status === "published" && existing && existing.status === "draft") id = existing.id;
    else { rootId = rootId || "custom-program-" + Date.now(); if (status === "published" && existing && existing.status === "published") { existing.status = "archived"; existing.updatedAt = now; if (state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.publishProgram(existing).catch(function () {}); revision = (existing.revision || 1) + 1; } else if (!existing) revision = 1; id = rootId + (revision > 1 ? "-r" + revision : "") + "-" + Date.now(); }
    var saved = normalizeCustomProgram({ id: id, rootId: rootId || id, name: draft.name, description: draft.description, generalNote: draft.generalNote, status: status, revision: revision, createdAt: existing && id === existing.id ? existing.createdAt : now, updatedAt: now, trainingWeekdays: programTrainingWeekdays(draft), days: draft.days }, state.customPrograms.length);
    var targetIndex = state.customPrograms.findIndex(function (item) { return item.id === id; }); if (targetIndex >= 0) state.customPrograms[targetIndex] = saved; else state.customPrograms.push(saved); refreshPrograms(); saveState(); discardEditorRecovery(); ui.editorDraft = null; ui.editorUndo = []; renderProgramStudio(); showToast(status === "published" ? "Program yayınlandı; üyeye atanabilir." : "Taslak kaydedildi.");
    if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.publishProgram(saved).then(function () { showToast("Program bulutla eşitlendi."); }).catch(function () { showToast("Program çevrimdışı kuyruğa alındı."); });
  }

  function archiveStudioProgram(id) { var program = state.customPrograms.find(function (item) { return item.id === id; }); if (!program) return; program.status = "archived"; program.updatedAt = new Date().toISOString(); refreshPrograms(); saveState(); renderProgramStudio(); showToast("Program arşivlendi; mevcut atamalar korunuyor."); if (state.cloud && state.cloud.userId && isCloudStaff() && window.FitTrackCloud) window.FitTrackCloud.publishProgram(program).catch(function () { showToast("Arşiv işlemi çevrimdışı kuyruğa alındı."); }); }

  function sessionHistory(program, day) {
    return state.history.filter(function (item) {
      return !item.isDemo && item.status === "completed" && item.dayId === day.id &&
        ((program.cloudId && item.programCloudId === program.cloudId) || item.programId === program.id);
    }).sort(function (a, b) { return String(b.finishedAt).localeCompare(String(a.finishedAt)); });
  }
  function sessionDoneThisWeek(program, day) {
    var start = mondayFor(todayKey()), end = addDays(start, 7);
    return sessionHistory(program, day).some(function (item) { return item.date >= start && item.date < end; });
  }
  function openSessionPicker(reuse) {
    if (state.currentWorkout) return startWorkout();
    if (!assignedPrograms().length) return showToast("Başlatılabilir bir program atanmadı.");
    var program = currentProgram();
    if (!reuse || ui.sessionProgramId !== program.id) { ui.sessionProgramId = program.id; ui.sessionDayId = ""; }
    closeSheet(); clearCountdown(); flowLayer.classList.add("active");
    var selected = programDays(program).find(function (day) { return day.id === ui.sessionDayId; });
    flowLayer.innerHTML = '<div class="full-flow session-picker"><header class="detail-head"><button class="back-btn" data-action="close-flow" aria-label="Geri">' + icons.back + '</button><strong>Seans seç</strong></header><main class="session-picker-scroll"><p class="eyebrow">' + esc(program.name) + '</p><h1>Hangi antrenmanı yapmak istiyorsun?</h1><p>Bugün çalışmak istediğin seansı seç.</p><div class="session-options">' + programDays(program).map(function (day, index) {
      var history = sessionHistory(program, day), last = history[0];
      var detail = last ? "Son tamamlanma: " + new Date(last.date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : "Seansa ait tamamlanma kaydı yok";
      return '<button class="session-option" data-action="choose-workout-session" data-day-id="' + esc(day.id) + '" aria-pressed="' + (day.id === ui.sessionDayId) + '" ' + (!day.exercises.length ? 'disabled' : '') + '><span class="session-number">' + (index + 1) + '</span><span><strong>' + esc(day.name) + '</strong><small>' + day.exercises.length + ' hareket · ' + esc(detail) + '</small>' + (sessionDoneThisWeek(program, day) ? '<em>Bu hafta tamamlandı</em>' : '') + '</span><span aria-hidden="true">' + (day.id === ui.sessionDayId ? '✓' : '○') + '</span></button>';
    }).join("") + '</div><p class="sheet-note">Önerilen haftalık günler hangi seansı seçeceğini belirlemez.</p></main><footer class="session-picker-footer"><button class="primary-btn" data-action="begin-workout-session" ' + (!selected ? 'disabled' : '') + '>' + (selected ? esc(selected.name) + ' antrenmanını başlat' : 'Önce bir seans seç') + '</button></footer></div>';
  }
  function beginWorkoutSession(confirmed) {
    if (state.currentWorkout) return startWorkout();
    var program = currentProgram(), day = programDays(program).find(function (item) { return item.id === ui.sessionDayId; });
    var assignment = selectedAssignment();
    if (!assignment || ui.sessionProgramId !== program.id || !day || !day.exercises.length) return openSessionPicker(false);
    if (!confirmed && sessionDoneThisWeek(program, day)) {
      return openSheet('<div class="delete-confirm"><h2>Bu seansı bu hafta tamamladın.</h2><p>Tekrar başlatmak istiyor musun?</p><button class="primary-btn" data-action="repeat-workout-session">Evet, tekrar başlat</button><button class="secondary-btn" data-action="close-sheet">Vazgeç</button></div>');
    }
    assignment.dayId = day.id;
    state.assignment = Object.assign({}, assignment);
    state.currentWorkout = newWorkout();
    ui.sessionProgramId = ""; ui.sessionDayId = "";
    saveState(); closeSheet(); startWorkout();
  }

  function openCountdown() { if (state.currentWorkout) return startWorkout(); if (programDays(currentProgram()).length > 1) return openSessionPicker(false); closeSheet(); clearCountdown(); flowLayer.classList.add("active"); flowLayer.innerHTML = '<div class="full-flow countdown-flow"><button class="countdown-close" data-action="close-flow" aria-label="Antrenman başlangıcını kapat">' + icons.back + '</button><p class="eyebrow">' + esc(currentProgram().name.toUpperCase()) + '</p><div class="countdown-orbit"><span id="countdownNumber">3</span></div><h1 id="countdownTitle">Antrenman başlıyor.</h1><p>İlk set için pozisyonunu al.</p></div>'; var value = 3; vibrate(20); ui.countdownTimer = window.setInterval(function () { value -= 1; var number = document.getElementById("countdownNumber"); var title = document.getElementById("countdownTitle"); if (value > 0) { if (number) { number.textContent = value; number.classList.remove("pulse"); void number.offsetWidth; number.classList.add("pulse"); } vibrate(20); } else { clearCountdown(); if (number) { number.textContent = "BAŞLA"; number.classList.add("word"); } if (title) title.textContent = "İlk set zamanı."; vibrate([30, 45, 60]); ui.countdownLaunchTimer = window.setTimeout(function () { ui.countdownLaunchTimer = null; if (flowLayer.classList.contains("active")) startWorkout(); }, 600); } }, 850); }
  function clearCountdown() { if (ui.countdownTimer) window.clearInterval(ui.countdownTimer); window.clearTimeout(ui.countdownLaunchTimer); ui.countdownLaunchTimer = null; ui.countdownTimer = null; }

  function newWorkout() { return { id: "workout-" + Date.now(), syncId: newUuid(), programId: currentProgram().id, programSnapshot: snapshotProgram(currentProgram()), assignmentCloudId: (selectedAssignment() || {}).cloudId || "", updatedAt: new Date().toISOString(), units: state.profile.units, dayId: currentProgramDay().id, exerciseIndex: 0, setIndex: 0, startedAt: new Date().toISOString(), logs: {}, swaps: {}, skipped: [], restEnd: null, restDuration: null, next: null, status: "active", pausedAt: null, pauseRemaining: null, totalPausedMs: 0, summarySaved: false }; }

  function startWorkout() { clearCountdown(); if (!state.currentWorkout && !assignedPrograms().length) return showToast("Başlatılabilir bir program atanmadı. Programlarını yenileyip tekrar dene."); if (!state.currentWorkout) { if (programDays(currentProgram()).length > 1) return openSessionPicker(false); state.currentWorkout = newWorkout(); saveState(); } var workout = state.currentWorkout; if (workout.orphaned || !currentExercises().length) return renderOrphanedWorkout(); if (workout.summarySaved) return renderSummary(); if (workout.status === "paused") return renderPaused(); if (workout.restEnd && workout.restEnd > Date.now()) return renderRest(); if (workout.restEnd && workout.next) applyNextPosition(); renderWorkout(); }

  function logControl(field, label, value, step, suffix) {
    var maximum = field === "reps" ? 100 : state.profile.units === "lb" ? 1100 : 500;
    var readable = field === "weight" ? "Ağırlığı" : "Tekrarı";
    return '<div class="log-control"><label for="log-' + field + '">' + label + '</label><div class="log-stepper"><button data-action="adjust-log" data-field="' + field + '" data-delta="-' + step + '" aria-label="' + readable + ' azalt">−</button><input id="log-' + field + '" data-log-field="' + field + '" inputmode="' + (field === "reps" ? "numeric" : "decimal") + '" type="number" min="0" max="' + maximum + '" step="' + step + '" placeholder="—" value="' + esc(value || "") + '"><span>' + suffix + '</span><button data-action="adjust-log" data-field="' + field + '" data-delta="' + step + '" aria-label="' + readable + ' artır">+</button></div></div>';
  }
  function previousWorkoutSet(item, setIndex) { var histories = state.history.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }); for (var i = 0; i < histories.length; i += 1) { var entry = (histories[i].exercises || []).find(function (candidate) { return candidate.id === item.id || candidate.name === item.name; }); if (entry && entry.sets && entry.sets.length) return entry.sets[Math.min(setIndex, entry.sets.length - 1)]; } return null; }
  function renderSetDots(item, active) { var html = ""; for (var i = 0; i < item.sets; i += 1) { var log = getLog(state.currentWorkout.exerciseIndex, i, false); html += '<span class="set-dot ' + (log.completedAt ? "done" : i === active ? "active" : "") + '">' + (log.completedAt ? "✓" : i + 1) + '</span>'; } return html; }

  function renderWorkout() {
    clearRestTimer();
    var workout = state.currentWorkout;
    if (!workout) return closeFlow();
    if (workout.orphaned) return renderOrphanedWorkout();
    var item = currentExercise(), definition = currentSetDefinition(item, workout.setIndex);
    var log = getCurrentLog(), previous = previousWorkoutSet(item, workout.setIndex), completed = Boolean(log.completedAt);
    var total = currentExercises().reduce(function (sum, _, index) { return sum + resolveExerciseAt(index).sets; }, 0);
    var progress = total ? Math.min(100, Math.round(completedSetCount(workout) / total * 100)) : 0;
    var title = currentProgram().name + (programDays(currentProgram()).length > 1 ? " · " + currentProgramDay().name : "");
    var note = item.coachNote || (workout.exerciseIndex === 0 ? currentProgram().generalNote : "");
    var cues = Array.isArray(item.cues) ? item.cues : [];
    flowLayer.classList.add("active");
    flowLayer.innerHTML = '<div class="full-flow workout-flow member-workout">' +
      '<header class="member-player-header"><div class="member-player-top"><button class="back-btn" data-action="confirm-cancel" aria-label="Antrenmandan çık">' + icons.back + '</button><h1>' + esc(title) + '</h1><strong class="member-player-clock" data-workout-clock aria-label="Geçen süre">' + workoutClock() + '</strong><button class="more-btn" data-action="workout-menu" aria-label="Antrenman menüsü">' + icons.more + '</button></div>' +
      '<div class="player-progress" role="progressbar" aria-label="Antrenman ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '"><span style="width:' + progress + '%"></span></div>' +
      '<div class="member-player-position"><strong>Hareket <b>' + (workout.exerciseIndex + 1) + ' / ' + currentExercises().length + '</b></strong><strong>Set <b>' + (workout.setIndex + 1) + ' / ' + item.sets + '</b></strong></div></header>' +
      '<main class="member-player-scroll"><div class="exercise-visual">' + exerciseImg(item, "", item.name + " hareket animasyonu") + '</div><section class="member-exercise-info"><div class="member-exercise-heading"><h2>' + esc(item.name) + '</h2>' +
      (item.alternatives && item.alternatives.length ? '<button class="swap-btn" data-action="swap">Değiştir</button>' : '') + '</div>' +
      '<div class="member-set-targets"><div><small>Hedef tekrar</small><strong class="rep-target">' + esc(definition.repsTarget) + '</strong></div><div><small>Set türü</small><strong class="set-kind set-kind-' + esc(definition.type) + '">' + esc(setTypeLabel(definition.type)) + ' set</strong></div></div>' +
      (item.requiresWeight && definition.targetWeight ? '<p class="member-weight-target">Hedef ağırlık: <strong>' + esc(definition.targetWeight) + ' ' + esc(state.profile.units) + '</strong></p>' : '') +
      '<details class="workout-instructions" open><summary><span>' + icons.user + '<strong>Nasıl yapılır?</strong></span><small>' + cues.length + ' adım</small><span class="instruction-chevron" aria-hidden="true">⌄</span></summary><div class="workout-instruction-scroll" role="region" aria-label="Hareket adımları"><ol>' + cues.map(function (cue) { return '<li>' + esc(cue) + '</li>'; }).join("") + '</ol>' +
      (!cues.length ? '<p>Bu harekete henüz açıklama eklenmedi. Antrenörüne danışabilirsin.</p>' : '') + '</div></details>' +
      (note ? '<details class="workout-instructions workout-coach-instructions"><summary><span>' + icons.message + '<strong>Antrenör notu</strong></span><span class="instruction-chevron" aria-hidden="true">⌄</span></summary><div class="workout-instruction-scroll" role="region" aria-label="Antrenör notu"><p>' + esc(note) + '</p></div></details>' : '') +
      '</section>' +
      '<section class="performance-card" id="entryCard"><div class="performance-head"><strong>' + (workout.setIndex + 1) + '. set</strong>' +
      (previous ? '<button class="member-previous" data-action="use-previous" aria-label="Önceki antrenmanın değerlerini kullan">Önceki: ' + (item.requiresWeight && previous.weight ? esc(previous.weight) + ' ' + esc(state.profile.units) + ' × ' : '') + esc(previous.reps || "—") + '<span>Aynısını kullan</span></button>' : '<small>Kayıt isteğe bağlı</small>') + '</div>' +
      '<div class="performance-grid ' + (item.requiresWeight ? "" : "single") + '">' +
      (item.requiresWeight ? logControl("weight", "Ağırlık (" + esc(state.profile.units) + ")", log.weight, 2.5, state.profile.units) : '<div class="bodyweight-chip">Vücut ağırlığı</div>') +
      logControl("reps", "Yapılan tekrar", log.reps, 1, "tekrar") + '</div>' +
      (log.carried ? '<p class="carry-note">Önceki setten taşındı; değiştirebilirsin.</p>' : '') +
      '<p class="entry-warning" id="entryWarning" role="alert"></p></section></main><footer class="member-player-dock"><div class="player-actions"><button class="primary-btn" data-action="complete-set">' + icons.check + (completed ? "Seti güncelle" : "Seti tamamla") + '</button></div></footer></div>';
    startWorkoutClock(); updateWorkoutViewport();
  }

  if (window.visualViewport) window.visualViewport.addEventListener("resize", updateWorkoutViewport);
  window.addEventListener("resize", updateWorkoutViewport);
  window.addEventListener("orientationchange", function () {
    saveProfileWizardRecovery();
    window.setTimeout(updateWorkoutViewport, 120);
  });

  function updateWorkoutViewport() {
    var viewport = window.visualViewport;
    var height = viewport && viewport.height || window.innerHeight;
    var width = window.innerWidth || viewport && viewport.width;
    if (!Number.isFinite(height) || height <= 0) return;
    var landscape = width > height && height <= 600;
    var inset = width >= 560 && !landscape ? 48 : 0;
    if (document.documentElement.style) { document.documentElement.style.setProperty("--fittrack-viewport-height", height + "px"); document.documentElement.style.setProperty("--form-height", Math.max(160, height - inset) + "px"); }
    var screenHeight = window.screen && Number(window.screen.height) || Number(window.innerHeight) || height;
    var keyboardOpen = Boolean(viewport && screenHeight - height > 120);
    if (document.documentElement.classList) document.documentElement.classList.toggle("fittrack-keyboard-open", keyboardOpen);
    var active = document.activeElement;
    var profileField = active && active.matches && active.matches("[data-profile-wizard]") ? active.dataset.profileWizard : "";
    if (profileField) {
      saveProfileWizardRecovery();
      window.clearTimeout(ui.profileViewportTimer);
      ui.profileViewportTimer = window.setTimeout(function () {
        var field = document.querySelector('[data-profile-wizard="' + profileField + '"]');
        if (field && field.scrollIntoView) field.scrollIntoView({ block: "center" });
      }, 160);
    }
    var player = document.querySelector(".member-workout");
    if (player) player.style.setProperty("--workout-height", Math.max(160, height - inset) + "px");
  }

  function adjustLog(field, delta) { var log = getCurrentLog(); var current = Number(log[field] || 0); var value = Math.max(0, current + Number(delta)); value = field === "weight" ? Math.round(value * 2) / 2 : Math.round(value); log[field] = value ? String(value) : ""; delete log.carried; saveState(); var input = document.querySelector('[data-log-field="' + field + '"]'); if (input) input.value = log[field]; clearEntryError(); vibrate(10); }
  function clearEntryError() { var card = document.getElementById("entryCard"); var warning = document.getElementById("entryWarning"); if (card) card.classList.remove("invalid"); if (warning) warning.textContent = ""; }
  function validateCurrentLog() { var item = currentExercise(); var log = getCurrentLog(); var weightText = String(log.weight || "").trim(); var repsText = String(log.reps || "").trim(); var weight = Number(weightText); var reps = Number(repsText); var maxWeight = state.profile.units === "lb" ? 1100 : 500; var message = ""; if (item.requiresWeight && weightText && (!Number.isFinite(weight) || weight <= 0 || weight > maxWeight)) message = "Kilo 0–" + maxWeight + " arasında olmalı ya da boş bırakılmalı."; if (repsText && (!Number.isInteger(reps) || reps <= 0 || reps > 100)) message = "Tekrar 1–100 arasında tam sayı olmalı ya da boş bırakılmalı."; if (!message && item.requiresWeight && Boolean(weightText) !== Boolean(repsText)) message = "Ağırlık ve tekrarı birlikte gir veya ikisini de boş bırak."; if (!message) return true; var card = document.getElementById("entryCard"); var warning = document.getElementById("entryWarning"); if (card) { card.classList.add("invalid"); card.scrollIntoView({ behavior: "smooth", block: "center" }); } if (warning) warning.textContent = message; showToast(message); vibrate([35, 40, 35]); return false; }
  function nextPosition(exerciseIndex, setIndex) { var item = resolveExerciseAt(exerciseIndex); if (setIndex < item.sets - 1) return { exerciseIndex: exerciseIndex, setIndex: setIndex + 1 }; for (var next = exerciseIndex + 1; next < currentExercises().length; next += 1) if (state.currentWorkout.skipped.indexOf(next) === -1) return { exerciseIndex: next, setIndex: 0 }; return null; }
  function carryCurrentValues(next) { if (!next || next.exerciseIndex !== state.currentWorkout.exerciseIndex) return; var source = getCurrentLog(); var target = getLog(next.exerciseIndex, next.setIndex, true); if (!target.weight && !target.reps) { target.weight = source.weight || ""; target.reps = source.reps || ""; target.carried = Boolean(target.weight || target.reps); } }
  function completeSet() { if (!validateCurrentLog()) return; var workout = state.currentWorkout; var log = getCurrentLog(); var restSeconds = currentSetDefinition(currentExercise(), workout.setIndex).rest; log.completedAt = log.completedAt || new Date().toISOString(); delete log.carried; var next = nextPosition(workout.exerciseIndex, workout.setIndex); vibrate([25, 30, 35]); if (!next) return finishWorkout(false); carryCurrentValues(next); workout.next = next; workout.restEnd = Date.now() + restSeconds * 1000; workout.restDuration = restSeconds; saveState(); if (restSeconds <= 0) return applyNextPosition(); renderRest(); }
  function renderRest() { var workout = state.currentWorkout; var next = workout.next || nextPosition(workout.exerciseIndex, workout.setIndex); if (!next) return finishWorkout(false); var nextItem = resolveExerciseAt(next.exerciseIndex); var same = next.exerciseIndex === workout.exerciseIndex; flowLayer.classList.add("active"); flowLayer.innerHTML = '<div class="full-flow rest-overlay">' + renderWorkoutClock() + '<button class="rest-menu secondary-btn" data-action="workout-menu">Antrenman menüsü</button><p class="rest-kicker">DİNLENME ZAMANI</p><div class="rest-ring" id="restRing" style="--rest-progress:100%"><div class="rest-time"><strong id="restTime">01:00</strong><small>NEFESİNİ TOPARLA</small></div></div><article class="card next-card">' + exerciseImg(nextItem, 'next-thumb', '') + '<span><small>' + (same ? "AYNI HAREKET" : "SIRADAKİ HAREKET") + '</small><strong>' + esc(nextItem.name) + ' · Set ' + (next.setIndex + 1) + '/' + nextItem.sets + '</strong></span></article><div class="rest-actions"><button class="secondary-btn" data-action="add-rest" data-seconds="30">+30 sn</button><button class="primary-btn" data-action="skip-rest">Dinlenmeyi geç <span class="btn-arrow">' + icons.arrow + '</span></button></div></div>'; startWorkoutClock(); updateRest(); clearRestTimer(); ui.restInterval = window.setInterval(updateRest, 250); }

  function updateRest() { if (!state.currentWorkout) return; var remaining = Math.max(0, state.currentWorkout.restEnd - Date.now()); if (remaining <= 0) return applyNextPosition(); var seconds = Math.ceil(remaining / 1000); var total = Math.max(1, state.currentWorkout.restDuration || currentSetDefinition(currentExercise(), state.currentWorkout.setIndex).rest); var ring = document.getElementById("restRing"); var time = document.getElementById("restTime"); if (ring) ring.style.setProperty("--rest-progress", Math.min(100, remaining / (total * 1000) * 100) + "%"); if (time) time.textContent = pad(Math.floor(seconds / 60)) + ":" + pad(seconds % 60); }
  function applyNextPosition() { clearRestTimer(); var workout = state.currentWorkout; var next = workout.next || nextPosition(workout.exerciseIndex, workout.setIndex); if (!next) return finishWorkout(false); workout.exerciseIndex = next.exerciseIndex; workout.setIndex = next.setIndex; workout.next = null; workout.restEnd = null; saveState(); renderWorkout(); }
  function clearRestTimer() { if (ui.restInterval) window.clearInterval(ui.restInterval); ui.restInterval = null; }
  function addRest(seconds) { if (!state.currentWorkout || !state.currentWorkout.restEnd) return; state.currentWorkout.restEnd += Number(seconds) * 1000; saveState(); updateRest(); vibrate(10); }
  function previousPosition() { var workout = state.currentWorkout; if (workout.setIndex > 0) return { exerciseIndex: workout.exerciseIndex, setIndex: workout.setIndex - 1 }; for (var index = workout.exerciseIndex - 1; index >= 0; index -= 1) if (workout.skipped.indexOf(index) === -1) return { exerciseIndex: index, setIndex: resolveExerciseAt(index).sets - 1 }; return null; }
  function goPreviousSet() { var previous = previousPosition(); if (!previous) return; clearRestTimer(); state.currentWorkout.exerciseIndex = previous.exerciseIndex; state.currentWorkout.setIndex = previous.setIndex; state.currentWorkout.next = null; state.currentWorkout.restEnd = null; saveState(); closeSheet(); renderWorkout(); showToast("Önceki seti düzenleyebilirsin."); }
  function usePreviousValues() { var item = currentExercise(); var previous = previousWorkoutSet(item, state.currentWorkout.setIndex); if (!previous) return; var log = getCurrentLog(); log.weight = item.requiresWeight ? String(previous.weight || "") : ""; log.reps = String(previous.reps || ""); delete log.carried; saveState(); renderWorkout(); showToast("Geçen antrenmanın değerleri uygulandı."); }

  function elapsedSeconds(workout) {
    var end = workout.finishedAt ? new Date(workout.finishedAt).getTime() : Date.now();
    var paused = workout.totalPausedMs || 0;
    if (workout.status === "paused" && workout.pausedAt) paused += Math.max(0, end - workout.pausedAt);
    return Math.max(0, Math.floor((end - new Date(workout.startedAt).getTime() - paused) / 1000));
  }
  function elapsedMinutes(workout) { return Math.max(1, Math.round(elapsedSeconds(workout) / 60)); }
  function workoutClock() {
    if (!state.currentWorkout) return "00:00";
    var seconds = elapsedSeconds(state.currentWorkout);
    return (seconds >= 3600 ? pad(Math.floor(seconds / 3600)) + ":" : "") + pad(Math.floor(seconds / 60) % 60) + ":" + pad(seconds % 60);
  }
  function renderWorkoutClock() { return '<div class="workout-elapsed"><span>TOPLAM SÜRE</span><strong data-workout-clock>' + workoutClock() + '</strong></div>'; }
  function updateWorkoutClock() { Array.from(document.querySelectorAll("[data-workout-clock], [data-home-clock]")).forEach(function (element) { element.textContent = workoutClock(); }); }
  function startWorkoutClock() { window.clearInterval(ui.workoutClockTimer); updateWorkoutClock(); ui.workoutClockTimer = window.setInterval(updateWorkoutClock, 1000); }
  function renderOrphanedWorkout() {
    var workout = state.currentWorkout; if (!workout) return closeFlow();
    flowLayer.classList.add("active");
    flowLayer.innerHTML = '<div class="full-flow paused-flow recovery-flow"><h1>Önceki antrenmanın yarım kalmış.</h1><p>Programın ayrıntıları artık bu cihazda bulunmuyor. Tamamladığın setleri kısmi kayıt olarak saklayabilir veya antrenmanı iptal edebilirsin.</p>' + renderWorkoutClock() + '<button class="primary-btn" data-action="finish-early" ' + (!completedSetCount(workout) ? 'disabled' : '') + '>Tamamlanan setleri kaydet</button><button class="danger-btn solid" data-action="confirm-cancel">Antrenmanı iptal et</button><button class="secondary-btn" data-action="close-flow">Ana sayfaya dön</button></div>';
    startWorkoutClock();
  }

  function workoutHistoryItem(workout, partial) { var entries = currentExercises().map(function (_, index) { var item = resolveExerciseAt(index); var logs = workout.logs[index] || {}; var sets = Object.keys(logs).map(Number).sort(function (a, b) { return a - b; }).filter(function (setIndex) { return Boolean(logs[setIndex] && logs[setIndex].completedAt); }).map(function (setIndex) { return normalizeSet(logs[setIndex], setIndex); }).filter(function (set) { return set.completedAt; }); return { id: item.id, name: item.name, requiresWeight: item.requiresWeight, sets: sets }; }).filter(function (entry) { return entry.sets.length; }); var daySuffix = programDays(currentProgram()).length > 1 ? " · " + currentProgramDay().name : ""; var assignment = (state.assignments || []).find(function (item) { return item.programId === workout.programId; }); return normalizeHistoryItem({ id: workout.id, units: workout.units || state.profile.units, syncId: workout.syncId || newUuid(), date: todayKey(), programId: workout.programId, dayId: workout.dayId, dayName: currentProgramDay().name, name: currentProgram().name + daySuffix, duration: elapsedMinutes(workout), status: partial ? "partial" : "completed", notes: "", exercises: entries, startedAt: workout.startedAt, finishedAt: workout.finishedAt || new Date().toISOString(), modifiedAt: workout.finishedAt || new Date().toISOString(), programCloudId: currentProgram().cloudId || "", assignmentCloudId: workout.assignmentCloudId || assignment && assignment.cloudId || "" }); }

  function finishWorkout(partial) { var workout = state.currentWorkout; if (!workout) return; if (!completedSetCount(workout)) { closeSheet(); return showToast("Henüz tamamlanan set yok; istersen antrenmanı iptal et."); } clearRestTimer(); partial = Boolean(partial || workout.skipped.length || completedSetCount(workout) < totalPlanSets()); if (!workout.summarySaved) { workout.finishedAt = new Date().toISOString(); workout.duration = elapsedMinutes(workout); workout.partial = partial; workout.summarySaved = true; state.history.unshift(workoutHistoryItem(workout, partial)); state.history = state.history.slice(0, 200); saveState(); } closeSheet(); renderSummary(); }
  function renderSummary() { var workout = state.currentWorkout; var partial = Boolean(workout.partial); var sets = completedSetCount(workout); flowLayer.classList.add("active"); flowLayer.innerHTML = '<div class="full-flow summary-flow"><div class="success-mark ' + (partial ? "partial" : "") + '">' + (partial ? "½" : icons.check) + '</div><h1>' + (partial ? "Antrenman erken bitirildi." : "Antrenman tamamlandı.") + '</h1><p>' + (partial ? "Tamamladığın setler yarım kayıt olarak geçmişe eklendi; seri hesabına katılmadı." : "Bütün setlerin ve opsiyonel kilo/tekrar değerlerin geçmişe eklendi.") + '</p><div class="summary-grid"><article class="summary-stat"><span>◷</span><strong>' + workout.duration + ' dk</strong><small>SÜRE</small></article><article class="summary-stat"><span>⌁</span><strong>' + sets + '</strong><small>SET</small></article><article class="summary-stat"><span>🔥</span><strong>' + calculateStreak() + ' hafta</strong><small>DEVAMLILIK</small></article></div><article class="card coach-message"><span class="coach-avatar">EH</span><span class="coach-copy"><small>' + esc(state.gym.coach) + '</small><h3>' + (partial ? "Kayıt alındı." : "Harika iş çıkardın!") + '</h3><p>Tamamlanma durumu antrenör görünümüne hazırlandı.</p></span></article><button class="primary-btn" data-action="summary-home">Ana sayfaya dön <span class="btn-arrow">' + icons.arrow + '</span></button></div>'; }

  function pauseWorkout() { var workout = state.currentWorkout; if (!workout || workout.status === "paused") return; workout.pauseRemaining = workout.restEnd ? Math.max(0, workout.restEnd - Date.now()) : null; workout.restEnd = null; workout.status = "paused"; workout.pausedAt = Date.now(); saveState(); closeSheet(); renderPaused(); }
  function renderPaused() { clearRestTimer(); var workout = state.currentWorkout; flowLayer.classList.add("active"); flowLayer.innerHTML = '<div class="full-flow paused-flow">' + renderWorkoutClock() + '<span class="pause-symbol">Ⅱ</span><p class="eyebrow">ANTRENMAN DURAKLATILDI</p><h1>' + esc(currentPositionText()) + '</h1><p>Kayıtların ve kaldığın set güvende. Hazır olduğunda devam et.</p><button class="primary-btn" data-action="resume-workout">Antrenmana devam et</button><button class="secondary-btn" data-action="close-flow">Daha sonra devam et</button></div>'; }
  function resumeWorkout() { var workout = state.currentWorkout; if (!workout || workout.status !== "paused") return; workout.totalPausedMs += Math.max(0, Date.now() - workout.pausedAt); workout.pausedAt = null; workout.status = "active"; if (workout.pauseRemaining) { workout.restEnd = Date.now() + workout.pauseRemaining; workout.pauseRemaining = null; saveState(); renderRest(); } else { saveState(); renderWorkout(); } }
  function skipExercise() { var workout = state.currentWorkout; if (!workout) return; if (workout.skipped.indexOf(workout.exerciseIndex) === -1) workout.skipped.push(workout.exerciseIndex); var next = null; for (var index = workout.exerciseIndex + 1; index < currentExercises().length; index += 1) if (workout.skipped.indexOf(index) === -1) { next = { exerciseIndex: index, setIndex: 0 }; break; } if (!next) { closeSheet(); return finishWorkout(true); } workout.exerciseIndex = next.exerciseIndex; workout.setIndex = 0; workout.next = null; workout.restEnd = null; saveState(); closeSheet(); renderWorkout(); showToast("Hareket atlandı."); }
  function cancelWorkout() { clearRestTimer(); closeCurrentWorkout(); saveState(); closeSheet(); closeFlow(); showToast("Antrenman iptal edildi; geçmişe eklenmedi."); }
  function openWorkoutMenu() { var workout = state.currentWorkout; openSheet('<div class="sheet-head"><div><h2>Antrenman kontrolü</h2><p>' + esc(currentPositionText()) + ' · ' + completedSetCount(workout) + ' set tamamlandı</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="workout-menu-list"><button data-action="pause-workout"><span>Ⅱ</span><div><strong>Duraklat</strong><small>Süreyi durdur, aynı setten devam et</small></div></button><button data-action="previous-set" ' + (workout.exerciseIndex === 0 && workout.setIndex === 0 ? "disabled" : "") + '><span>↶</span><div><strong>Önceki sete dön</strong><small>Kilo ve tekrar değerini düzelt</small></div></button><button data-action="skip-exercise"><span>⇥</span><div><strong>Hareketi atla</strong><small>Sıradaki harekete geç</small></div></button><button data-action="confirm-finish-early"><span>½</span><div><strong>Erken bitir</strong><small>Tamamlanan setleri yarım kayıt olarak sakla</small></div></button><button data-action="confirm-cancel" class="danger"><span>×</span><div><strong>Antrenmanı iptal et</strong><small>Bu antrenmanı geçmişe ekleme</small></div></button></div><button class="secondary-btn" data-action="close-flow">Daha sonra devam et</button>'); }
  function confirmFinishEarly() { openSheet('<div class="delete-confirm"><span>½</span><h2>Antrenman erken bitsin mi?</h2><p>Tamamladığın setler geçmişe “yarım” olarak eklenir ve seri hesabına katılmaz.</p><button class="primary-btn" data-action="finish-early">Evet, yarım kaydet</button><button class="secondary-btn" data-action="workout-menu">Vazgeç</button></div>'); }
  function confirmCancel() { openSheet('<div class="delete-confirm"><span>!</span><h2>Antrenman iptal edilsin mi?</h2><p>Bu oturumdaki set kayıtları silinir ve geçmişe eklenmez.</p><button class="danger-btn solid" data-action="cancel-workout">Evet, iptal et</button><button class="secondary-btn" data-action="dismiss-workout-cancel">Hayır, iptal etme</button></div>'); }

  function openSwapSheet() { var original = currentExercises()[state.currentWorkout.exerciseIndex]; var current = currentExercise(); var choices = [original].concat(original.alternatives); openSheet('<div class="sheet-head"><div><h2>Hareketi değiştir</h2><p>Her seçenek kendi animasyonu ve set planıyla açılır.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="alternative-list">' + choices.map(function (choice) { return '<button class="alternative ' + (current.id === choice.id ? "current" : "") + '" data-action="choose-swap" data-id="' + choice.id + '"><img src="' + esc(choice.image) + '" alt=""><span><strong>' + esc(choice.name) + '</strong><small>' + esc(choice.target) + ' · ' + (choice.requiresWeight ? "Kilo + tekrar opsiyonel" : "Vücut ağırlığı") + '</small></span><span class="radio"></span></button>'; }).join("") + '</div>'); }
  function chooseSwap(id) { var index = state.currentWorkout.exerciseIndex; var original = currentExercises()[index]; var choices = [original].concat(original.alternatives); var chosen = choices.find(function (item) { return item.id === id; }); if (!chosen) return; if (chosen.id === original.id) delete state.currentWorkout.swaps[index]; else state.currentWorkout.swaps[index] = { id: chosen.id }; delete state.currentWorkout.logs[index]; state.currentWorkout.setIndex = 0; saveState(); closeSheet(); renderWorkout(); showToast(chosen.name + " seçildi; bu hareketin set kayıtları yenilendi."); }

  function historySetEditor(entry, exerciseIndex) {
    var maximum = state.profile.units === "lb" ? 1100 : 500; var collapsed = Boolean(ui.historyCollapsed[exerciseIndex]);
    return '<article class="history-exercise compact-editor ' + (collapsed ? "collapsed" : "") + '"><button class="history-exercise-head" data-action="history-toggle-exercise" data-index="' + exerciseIndex + '"><strong>' + esc(entry.name) + '</strong><small>' + entry.sets.length + ' set</small><span>' + (collapsed ? "⌄" : "⌃") + '</span></button><div class="history-set-table"><div class="history-set-labels"><span>SET</span><span>' + (entry.requiresWeight ? "KG" : "AĞIRLIK") + '</span><span>TEKRAR</span><span>SİL</span></div>' + entry.sets.map(function (set, setIndex) { return '<div class="history-set-row"><b>' + (setIndex + 1) + '</b>' + (entry.requiresWeight ? '<label><input data-history-exercise="' + exerciseIndex + '" data-history-set="' + setIndex + '" data-history-field="weight" inputmode="decimal" type="number" min="0" max="' + maximum + '" step="0.5" value="' + esc(set.weight || "") + '" aria-label="Kilo"></label>' : '<div class="weight-free">—</div>') + '<label><input data-history-exercise="' + exerciseIndex + '" data-history-set="' + setIndex + '" data-history-field="reps" inputmode="numeric" type="number" min="1" max="100" value="' + esc(set.reps || "") + '" aria-label="Tekrar"></label><button class="set-remove" data-action="history-remove-set" data-exercise-index="' + exerciseIndex + '" data-set-index="' + setIndex + '" aria-label="' + (setIndex + 1) + '. seti sil"><span aria-hidden="true">×</span>Sil</button></div>'; }).join("") + '<button class="history-add-set" data-action="history-add-set" data-exercise-index="' + exerciseIndex + '">＋ Set ekle</button></div></article>';
  }
  function renderHistoryEditor() {
    var item = ui.historyDraft; if (!item) return closeFlow();
    flowLayer.classList.add("active");
    flowLayer.innerHTML = '<div class="full-flow history-edit-flow"><header class="history-edit-head"><button class="back-btn" data-action="close-history-editor" aria-label="Geri">' + icons.back + '</button><strong>Antrenmanı düzenle</strong><button data-action="save-history" data-id="' + esc(item.id) + '">Kaydet</button></header><main class="history-edit-scroll"><section class="history-edit-summary"><h1>' + esc(item.name) + '</h1><p>' + formatDate(item.date) + ' · ' + formatDuration(item.duration) + ' · ' + (item.status === "partial" ? "Yarım" : "Tamamlandı") + ' · ' + historySetCount(item) + ' set</p><small>Setleri ve antrenman notunu değiştirebilirsin.</small></section><div class="history-exercise-editor">' + (item.exercises.length ? item.exercises.map(historySetEditor).join("") : '<p class="sheet-note">Bu eski kayıtta set detayı bulunmuyor.</p>') + '</div><div class="field history-note-field"><label for="historyNotes">ANTRENMAN NOTU</label><textarea id="historyNotes" maxlength="240" placeholder="Notunu buraya yazabilirsin…">' + esc(item.notes || "") + '</textarea></div><button class="danger-text history-delete" data-action="ask-delete-history" data-id="' + esc(item.id) + '">Antrenmanı sil</button></main><div class="detail-action-bar"><button class="primary-btn" data-action="save-history" data-id="' + esc(item.id) + '">Değişiklikleri kaydet</button></div></div>';
  }
  function openHistorySheet(id) { var item = state.history.find(function (entry) { return entry.id === id; }); if (!item) return; ui.historyEditId = id; ui.historyDraft = JSON.parse(JSON.stringify(item)); ui.historyCollapsed = {}; renderHistoryEditor(); }
  function closeHistoryEditor() { ui.historyDraft = null; ui.historyEditId = ""; ui.historyCollapsed = {}; closeFlow(); }
  function toggleHistoryExercise(index) { ui.historyCollapsed[index] = !ui.historyCollapsed[index]; renderHistoryEditor(); }
  function addHistorySet(exerciseIndex) { var entry = ui.historyDraft && ui.historyDraft.exercises[exerciseIndex]; if (!entry || entry.sets.length >= 20) return showToast("Bir harekete en fazla 20 set eklenebilir."); entry.sets.push(normalizeSet({ weight: "", reps: "", completedAt: new Date().toISOString() }, entry.sets.length)); renderHistoryEditor(); }
  function removeHistorySet(exerciseIndex, setIndex) { var entry = ui.historyDraft && ui.historyDraft.exercises[exerciseIndex]; if (!entry) return; if (entry.sets.length <= 1) return showToast("Harekette en az bir set kalmalı."); entry.sets.splice(setIndex, 1); entry.sets.forEach(function (set, index) { set.number = index + 1; }); renderHistoryEditor(); showToast("Set kaldırıldı."); }
  function saveHistory(id) {
    var item = state.history.find(function (entry) { return entry.id === id; }); var draft = ui.historyDraft; if (!item || !draft) return;
    for (var exerciseIndex = 0; exerciseIndex < draft.exercises.length; exerciseIndex += 1) {
      var entry = draft.exercises[exerciseIndex];
      for (var setIndex = 0; setIndex < entry.sets.length; setIndex += 1) {
        var weightInput = document.querySelector('[data-history-exercise="' + exerciseIndex + '"][data-history-set="' + setIndex + '"][data-history-field="weight"]');
        var repsInput = document.querySelector('[data-history-exercise="' + exerciseIndex + '"][data-history-set="' + setIndex + '"][data-history-field="reps"]');
        var weightText = weightInput ? weightInput.value.trim() : ""; var repsText = repsInput ? repsInput.value.trim() : "";
        var weight = Number(weightText); var reps = Number(repsText);
        var historyMaxWeight = state.profile.units === "lb" ? 1100 : 500;
        if (weightText && (!Number.isFinite(weight) || weight <= 0 || weight > historyMaxWeight)) return showToast("Geçmişteki kilo 0–" + historyMaxWeight + " arasında veya boş olmalı.");
        if (repsText && (!Number.isInteger(reps) || reps < 1 || reps > 100)) return showToast("Geçmişteki tekrar 1–100 arasında tam sayı veya boş olmalı.");
        if (entry.requiresWeight && Boolean(weightText) !== Boolean(repsText)) return showToast("Ağırlık ve tekrarı birlikte gir veya ikisini de boş bırak.");
        entry.sets[setIndex].weight = weightText; entry.sets[setIndex].reps = repsText;
      }
    }
    item.exercises = draft.exercises; item.notes = String(document.getElementById("historyNotes").value || "").slice(0, 240);
    item.totalSets = historySetCount(item); item.volume = Math.round(historyVolume(item)); item.modifiedAt = new Date().toISOString(); item.cloudSyncedAt = ""; saveState(); closeSheet(); closeHistoryEditor(); render(); showToast("Setler ve not güncellendi; diğer cihazlara eşitlenecek.");
  }
  function askDeleteHistory(id) { var item = state.history.find(function (entry) { return entry.id === id; }); if (!item) return; openSheet('<div class="delete-confirm"><span>!</span><h2>Bu antrenman silinsin mi?</h2><p>' + esc(item.name) + ' kaydı ve içindeki bütün setler cihazdan kaldırılacak.</p><button class="danger-btn solid" data-action="delete-history" data-id="' + esc(id) + '">Evet, kalıcı olarak sil</button><button class="secondary-btn" data-action="history-detail" data-id="' + esc(id) + '">Vazgeç</button></div>'); }
  function deleteHistory(id) {
    var deleted = state.history.find(function (item) { return item.id === id; }); if (!deleted) return;
    if (state.deletedHistoryIds.indexOf(deleted.syncId) < 0) state.deletedHistoryIds.push(deleted.syncId);
    state.history = state.history.filter(function (item) { return item.id !== id; });
    if (state.currentWorkout && state.currentWorkout.syncId === deleted.syncId) { state.closedWorkoutIds[deleted.syncId] = new Date().toISOString(); state.currentWorkout = null; }
    saveState(); closeSheet(); closeHistoryEditor(); render(); showToast("Antrenman silindi.");
    if (state.cloud.userId && window.FitTrackCloud && window.FitTrackCloud.deleteWorkout) window.FitTrackCloud.deleteWorkout(deleted.syncId).catch(function () { showToast("Silme işlemi eşitlenmek üzere bekliyor."); });
  }

  function openProfileSheet() { openProfileWizard(1); }
  function profileDraftRecoveryKey() {
    var userId = state.cloud && state.cloud.userId || "local";
    var gymId = state.cloud && state.cloud.gymId || state.gym && state.gym.id || "none";
    return PROFILE_DRAFT_PREFIX + userId + ":" + gymId;
  }
  function profileDraftSnapshot(source) {
    source = source || {};
    function value(key, fallback, maximum) {
      var raw = source[key] == null ? fallback : source[key];
      return String(raw == null ? "" : raw).slice(0, maximum);
    }
    return {
      firstName: value("firstName", "", 28), lastName: value("lastName", "", 32),
      age: value("age", "", 5), height: value("height", "", 6),
      currentWeight: value("currentWeight", "", 8), targetWeight: value("targetWeight", "", 8),
      units: source.units === "lb" ? "lb" : "kg",
      goal: ["lose", "fit", "gain"].indexOf(source.goal) >= 0 ? source.goal : "fit"
    };
  }
  function saveProfileWizardRecovery() {
    if (!ui.onboardingDraft) return false;
    try {
      localStorage.setItem(profileDraftRecoveryKey(), JSON.stringify({ schema: SCHEMA, step: safeInteger(ui.onboardingStep, 1, 6, 1), savedAt: new Date().toISOString(), draft: profileDraftSnapshot(ui.onboardingDraft) }));
      return true;
    } catch (_) { return false; }
  }
  function clearProfileWizardRecovery() {
    try { localStorage.removeItem(profileDraftRecoveryKey()); } catch (_) { /* no-op */ }
  }
  function restoreProfileWizardRecovery() {
    var recovery;
    try { recovery = JSON.parse(localStorage.getItem(profileDraftRecoveryKey()) || "null"); } catch (_) { recovery = null; }
    if (!recovery || Number(recovery.schema) !== SCHEMA || !recovery.draft || typeof recovery.draft !== "object" || Array.isArray(recovery.draft)) return false;
    ui.onboardingDraft = Object.assign({}, state.profile, profileDraftSnapshot(recovery.draft));
    ui.onboardingStep = safeInteger(recovery.step, 1, 6, 1);
    return true;
  }
  function openProfileWizard(step) {
    var recovered = false;
    if (!ui.onboardingDraft) { recovered = restoreProfileWizardRecovery(); if (!recovered) ui.onboardingDraft = Object.assign({}, state.profile); }
    if (!recovered) ui.onboardingStep = safeInteger(step, 1, 6, 1);
    renderProfileWizard();
  }
  function profileWizardBody(step, draft) {
    if (step === 1) return '<h1>Sana nasıl hitap edelim?</h1><p>Profilinde ve antrenman ekranında kullanacağız.</p><div class="wizard-name-grid"><input data-profile-wizard="firstName" autocomplete="given-name" maxlength="28" placeholder="İsim" value="' + esc(draft.firstName === "Sporcu" ? "" : draft.firstName) + '" autofocus><input data-profile-wizard="lastName" autocomplete="family-name" maxlength="32" placeholder="Soyisim" value="' + esc(draft.lastName) + '"></div>';
    if (step === 2) return '<h1>Kaç yaşındasın?</h1><p>Antrenman yoğunluğunu sana göre düzenlemek için.</p><div class="wizard-number"><input data-profile-wizard="age" type="number" inputmode="numeric" min="14" max="100" value="' + esc(draft.age || "") + '" autofocus><span>yaş</span></div>';
    if (step === 3) return '<h1>Boyun kaç cm?</h1><p>Programını sana uygun hazırlayabilmemiz için.</p><div class="wizard-number"><input data-profile-wizard="height" type="number" inputmode="numeric" min="120" max="230" value="' + esc(draft.height || "") + '" autofocus><span>cm</span></div>';
    if (step === 4) return '<h1>Şu an kaç kilosun?</h1><p>Gelişimini doğru takip edebilmek için.</p><div class="wizard-number"><input data-profile-wizard="currentWeight" type="number" inputmode="decimal" min="30" max="660" step="0.1" value="' + esc(draft.currentWeight || "") + '" autofocus><span>' + esc(draft.units || "kg") + '</span></div><div class="wizard-unit"><button data-action="profile-unit" data-unit="kg" class="' + (draft.units !== "lb" ? "active" : "") + '">kg</button><button data-action="profile-unit" data-unit="lb" class="' + (draft.units === "lb" ? "active" : "") + '">lb</button></div>';
    if (step === 5) return '<h1>Hedef kilon kaç?</h1><p>İlerlemeni bu hedefe göre göstereceğiz.</p><div class="wizard-number"><input data-profile-wizard="targetWeight" type="number" inputmode="decimal" min="30" max="660" step="0.1" value="' + esc(draft.targetWeight || "") + '" autofocus><span>' + esc(draft.units || "kg") + '</span></div>';
    return '<h1>Ana hedefin ne?</h1><p>Önerileri ve motivasyon dilini buna göre ayarlayacağız.</p><div class="wizard-goals"><button data-action="profile-goal" data-goal="lose" class="' + (draft.goal === "lose" ? "active" : "") + '"><strong>Yağ yakmak</strong><small>Kilo verip daha hafif hissetmek</small></button><button data-action="profile-goal" data-goal="fit" class="' + (draft.goal === "fit" ? "active" : "") + '"><strong>Fit kalmak</strong><small>Kuvvet ve kondisyonu korumak</small></button><button data-action="profile-goal" data-goal="gain" class="' + (draft.goal === "gain" ? "active" : "") + '"><strong>Kas kazanmak</strong><small>Kuvvet ve kas kütlesini artırmak</small></button></div>';
  }
  function renderProfileWizard() {
    var step = ui.onboardingStep; var draft = ui.onboardingDraft || Object.assign({}, state.profile); flowLayer.classList.add("active");
    saveProfileWizardRecovery();
    updateWorkoutViewport();
    flowLayer.innerHTML = '<div class="full-flow profile-wizard"><header><button data-action="profile-wizard-back" ' + (step === 1 ? 'class="invisible" aria-hidden="true"' : '') + '>Geri</button><span class="wizard-brand"><span class="brand-mark">' + icons.bolt + '</span><strong>FitTrack</strong></span><em>' + step + ' / 6</em></header><div class="wizard-progress"><span style="width:' + (step / 6 * 100) + '%"></span></div><main>' + profileWizardBody(step, draft) + '</main><footer><button class="primary-btn" data-action="profile-wizard-next">' + (step === 6 ? "Profili tamamla" : "Devam et") + '</button>' + (state.profile.setupComplete ? '<button class="wizard-cancel" data-action="close-profile-wizard">Vazgeç</button>' : '') + '</footer></div>';
    var focus = flowLayer.querySelector("[autofocus]"); if (focus) window.setTimeout(function () { focus.focus(); focus.select(); }, 120);
  }
  function validateWizardStep() {
    var draft = ui.onboardingDraft; var step = ui.onboardingStep;
    if (step === 1 && (!clean(draft.firstName, "", 28) || !clean(draft.lastName, "", 32))) return showToast("İsim ve soyisim gerekli."), false;
    if (step === 2 && !Number.isFinite(Number(draft.age)) || step === 2 && (Number(draft.age) < 14 || Number(draft.age) > 100)) return showToast("Yaş 14–100 arasında olmalı."), false;
    if (step === 3 && (!Number.isFinite(Number(draft.height)) || Number(draft.height) < 120 || Number(draft.height) > 230)) return showToast("Boy 120–230 cm arasında olmalı."), false;
    if ((step === 4 || step === 5) && (!Number.isFinite(Number(step === 4 ? draft.currentWeight : draft.targetWeight)) || Number(step === 4 ? draft.currentWeight : draft.targetWeight) < 30 || Number(step === 4 ? draft.currentWeight : draft.targetWeight) > 660)) return showToast("Kilo geçerli aralıkta olmalı."), false;
    if (step === 6 && ["lose", "fit", "gain"].indexOf(draft.goal) === -1) return showToast("Bir hedef seç."), false;
    return true;
  }
  function finishProfileWizard() {
    var draft = ui.onboardingDraft; var previousUnits = state.profile.units; convertStoredWeights(previousUnits, draft.units === "lb" ? "lb" : "kg");
    state.profile = { firstName: clean(draft.firstName, "Sporcu", 28), lastName: clean(draft.lastName, "", 32), age: Number(draft.age), height: Number(draft.height), currentWeight: Number(draft.currentWeight), targetWeight: Number(draft.targetWeight), units: draft.units === "lb" ? "lb" : "kg", goal: draft.goal, setupComplete: true };
    var self = selfTrainerMember(); if (self) self.name = fullName(); clearProfileWizardRecovery(); ui.onboardingDraft = null; saveState(); syncProfileName(); closeFlow(); render(); showToast("Profilin hazır.");
  }
  function syncProfileName() { if (window.FitTrackCloud && typeof window.FitTrackCloud.updateProfile === "function") window.FitTrackCloud.updateProfile(fullName()).catch(function () { showToast("Profil cihazda kaydedildi; bulut güncellemesi bağlantı bekliyor."); }); }
  function nextProfileWizard() { if (!validateWizardStep()) return; if (ui.onboardingStep < 6) { ui.onboardingStep += 1; renderProfileWizard(); } else finishProfileWizard(); }
  function selectField(id, label, options, value) { return '<div class="field select-field"><label for="' + id + '">' + label + '</label><select id="' + id + '" data-current-unit="' + esc(value) + '">' + options.map(function (item) { return '<option ' + (item === value ? "selected" : "") + '>' + esc(item) + '</option>'; }).join("") + '</select></div>'; }
  function convertWeightNumber(value, from, to) { var number = Number(value); if (!Number.isFinite(number) || !value || from === to) return value; var converted = from === "kg" && to === "lb" ? number * 2.2046226218 : number / 2.2046226218; return String(Math.round(converted * 10) / 10); }
  function convertProfileUnitFields(select) { var from = select.dataset.currentUnit || state.profile.units; var to = select.value; if (from === to) return; ["currentWeight", "targetWeight"].forEach(function (id) { var input = document.getElementById(id); if (input) input.value = convertWeightNumber(input.value, from, to); }); select.dataset.currentUnit = to; showToast("Kilo değerleri " + to + " birimine çevrildi."); }
  function convertStoredWeights(from, to) {
    if (from === to) return;
    function convertHistory(items) { (items || []).forEach(function (item) { (item.exercises || []).forEach(function (entry) { (entry.sets || []).forEach(function (set) { if (String(set.weight || "").trim()) set.weight = convertWeightNumber(set.weight, from, to); }); }); item.volume = Math.round(historyVolume(item)); item.units = to; item.modifiedAt = new Date().toISOString(); }); }
    convertHistory(state.history); state.trainer.members.forEach(function (member) { if (!member.isSelf) convertHistory(member.history); });
    (state.customPrograms || []).forEach(function (program) { programDays(program).forEach(function (day) { day.exercises.forEach(function (item) { (item.setPlan || []).forEach(function (set) { if (String(set.targetWeight || "").trim()) set.targetWeight = convertWeightNumber(set.targetWeight, from, to); }); }); }); });
    if (state.currentWorkout) { state.currentWorkout.units = to; var frozen = state.currentWorkout.programSnapshot; if (frozen) programDays(frozen).forEach(function (day) { day.exercises.forEach(function (item) { item.setPlan.forEach(function (set) { if (String(set.targetWeight || "").trim()) set.targetWeight = convertWeightNumber(set.targetWeight, from, to); }); }); }); }
    if (state.currentWorkout) Object.keys(state.currentWorkout.logs || {}).forEach(function (exerciseIndex) { Object.keys(state.currentWorkout.logs[exerciseIndex] || {}).forEach(function (setIndex) { var log = state.currentWorkout.logs[exerciseIndex][setIndex]; if (String(log.weight || "").trim()) log.weight = convertWeightNumber(log.weight, from, to); }); });
  }

  function saveProfile() {
    var unitSelect = document.getElementById("units"); if (unitSelect.dataset.currentUnit !== unitSelect.value) convertProfileUnitFields(unitSelect);
    var units = unitSelect.value; var maxWeight = units === "lb" ? 660 : 300;
    var ranges = [["age", 14, 100, "Yaş 14–100 arasında olmalı."], ["height", 120, 230, "Boy 120–230 cm arasında olmalı."], ["currentWeight", 30, maxWeight, "Mevcut kilo geçerli aralıkta olmalı."], ["targetWeight", 30, maxWeight, "Hedef kilo geçerli aralıkta olmalı."]];
    for (var i = 0; i < ranges.length; i += 1) { var value = Number(document.getElementById(ranges[i][0]).value); if (!Number.isFinite(value) || value < ranges[i][1] || value > ranges[i][2]) return showToast(ranges[i][3]); }
    var first = clean(document.getElementById("firstName").value, "", 28); var last = clean(document.getElementById("lastName").value, "", 32); if (!first || !last) return showToast("İsim ve soyisim gerekli.");
    var previousUnits = state.profile.units; convertStoredWeights(previousUnits, units);
    state.profile = { firstName: first, lastName: last, age: Number(document.getElementById("age").value), height: Number(document.getElementById("height").value), currentWeight: Number(document.getElementById("currentWeight").value), targetWeight: Number(document.getElementById("targetWeight").value), units: units, goal: state.profile.goal || "fit", setupComplete: true };
    var self = selfTrainerMember(); if (self) self.name = fullName(); saveState(); syncProfileName(); closeSheet(); render(); showToast("Profil güncellendi.");
  }
  function openThemeSheet() { openSheet('<div class="sheet-head"><div><h2>Görünüm ve tema</h2><p>Uygulamanın tamamı seçtiğin renge uyum sağlar.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="theme-grid">' + Object.keys(themes).map(function (key) { var theme = themes[key]; return '<button class="theme-option ' + (state.theme === key ? "selected" : "") + '" data-action="select-theme" data-theme="' + key + '"><span class="theme-preview" style="--theme-color:' + theme.color + ';--theme-background:' + theme.background + ';--theme-surface:' + theme.surface + ';--theme-text:' + theme.text + '"><i></i><i></i><i></i></span><strong>' + theme.name + '</strong><small>' + theme.copy + '</small><b>' + (state.theme === key ? "✓" : "") + '</b></button>'; }).join("") + '</div>'); }
  function selectTheme(key) { if (!themes[key]) return; state.theme = key; saveState(); applyTheme(); closeSheet(); render(); showToast(themes[key].name + " teması uygulandı."); }

  function openPrivacySheet() { openSheet('<div class="sheet-head"><div><h2>Gizlilik ve veriler</h2><p>Yerel yedeğini ve RLS ile erişebildiğin bulut verilerini yönet.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="data-actions"><button data-action="save-data"><span>↓</span><div><strong>Yedeği cihaza kaydet</strong><small>Konumu ve dosya adını sen seç</small></div></button><button data-action="export-data"><span>↗</span><div><strong>Yedeği paylaş</strong><small>JSON dosyasını başka bir uygulamaya gönder</small></div></button>' + (state.cloud && state.cloud.userId ? '<button data-cloud-action="export-cloud"><span>☁</span><div><strong>Bulut verilerimi dışa aktar</strong><small>Hesabının erişebildiği kayıtlar</small></div></button>' : '') + '<button data-action="import-data"><span>↑</span><div><strong>Yedeği geri yükle</strong><small>Doğrulanan FitTrack JSON dosyasını aç</small></div></button><button data-action="confirm-clear-data" class="danger"><span>×</span><div><strong>Cihaz verilerini sil</strong><small>Buluttaki hesabı silmez</small></div></button></div><input id="backupInput" type="file" accept="application/json,.json" hidden><p class="sheet-note">Hatalı veya uyumsuz bir yedek mevcut verini değiştirmez. Hesabı kalıcı silme seçeneği Hesap ve bulut ekranındadır.</p>'); }
  function backupPayload() { return { format: "fittrack-backup", schema: SCHEMA, appVersion: VERSION, exportedAt: new Date().toISOString(), state: state }; }
  function nativePlugin(name) { return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] : null; }
  function backupFileParts() { return { json: JSON.stringify(backupPayload(), null, 2), name: "FitTrack-Yedek-" + todayKey() + ".json" }; }
  function saveDataToDevice() {
    var file = backupFileParts();
    saveJsonFile(file.name, file.json).then(function (result) {
      showToast(result && result.cancelled ? "Kaydetme iptal edildi." : "Yedek cihaza kaydedildi.");
    }).catch(function () { showToast("Yedek cihaza kaydedilemedi. Lütfen tekrar dene."); });
  }
  function exportData() { var file = backupFileParts(); exportJsonFile(file.name, file.json, "FitTrack veri yedeği").catch(function () { showToast("Yedek paylaşım ekranı açılamadı. Lütfen tekrar dene."); }); }
  function saveJsonFile(name, text) {
    var saver = nativePlugin("FitTrackFileSaver");
    var native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    if (native) {
      if (!saver || typeof saver.saveJson !== "function") return Promise.reject(new Error("NATIVE_SAVE_UNAVAILABLE"));
      return saver.saveJson({ fileName: name, content: text, mimeType: "application/json" });
    }
    browserDownload(name, text); return Promise.resolve({ saved: true });
  }
  function exportJsonFile(name, text, title) { var filesystem = nativePlugin("Filesystem"); var share = nativePlugin("Share"); var native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform(); if (native) { if (!filesystem || !share) return Promise.reject(new Error("NATIVE_SHARE_UNAVAILABLE")); return filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8", recursive: true }).then(function (result) { if (!result || !result.uri) throw new Error("BACKUP_WRITE_FAILED"); return share.share({ title: title || "FitTrack yedeği", text: "FitTrack Beta " + VERSION + " JSON dosyası", url: result.uri, dialogTitle: "Yedeği paylaş" }); }).then(function () { showToast("Paylaşım ekranı açıldı."); }); } browserDownload(name, text); return Promise.resolve(true); }
  function browserDownload(name, text) { var blob = new Blob([text], { type: "application/json" }); var url = URL.createObjectURL(blob); var anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000); showToast("Yedek indirme işlemi başlatıldı."); }
  function importBackupText(text) {
    var parsed = JSON.parse(text);
    if (!parsed || parsed.format !== "fittrack-backup" || !parsed.state || typeof parsed.state !== "object" || Array.isArray(parsed.state) || !Number.isInteger(Number(parsed.schema)) || Number(parsed.schema) < 1 || Number(parsed.schema) > SCHEMA) throw new Error("Uyumsuz yedek");
    var account = Object.assign({}, state.cloud), source = parsed.state.cloud || {};
    var currentGym = account.gymId || state.gym.id || "", sourceGym = source.gymId || parsed.state.gym && parsed.state.gym.id || "";
    if (String(source.userId || "") !== String(account.userId || "") || String(sourceGym) !== String(currentGym) ||
        (source.gymId && parsed.state.gym && parsed.state.gym.id && source.gymId !== parsed.state.gym.id)) {
      var mismatch = new Error("Yedek farklı hesaba veya salona ait. Bu hesabın ve salonun yedeğini seç."); mismatch.code = "BACKUP_ACCOUNT_MISMATCH"; throw mismatch;
    }
    var previousPrograms = programs, restored;
    try {
      restored = mergeKnown(defaultState(false), parsed.state);
      restored.cloud = account;
      if (account.userId) restored.gym = Object.assign({}, state.gym);
      restored.currentWorkout = normalizeCurrentWorkout(parsed.state.currentWorkout);
    } catch (error) { programs = previousPrograms; throw error; }
    state = restored; refreshPrograms(); saveState(); closeSheet(); closeFlow(); render();
    showToast("Yedek doğrulandı ve bu hesaba geri yüklendi.");
  }
  function confirmClearData() { openSheet('<div class="delete-confirm"><span>!</span><h2>Tüm veriler silinsin mi?</h2><p>Profil, geçmiş, aktif antrenman ve hatırlatmalar bu cihazdan kalıcı olarak kaldırılır.</p><button class="danger-btn solid" data-action="clear-data">Evet, tümünü sil</button><button class="secondary-btn" data-action="privacy">Vazgeç</button></div>'); }
  function clearAllData() { var account = Object.assign({}, state.cloud); [STORAGE_KEY].concat(LEGACY_KEYS).forEach(function (key) { localStorage.removeItem(key); }); if (account.userId) localStorage.removeItem(ACCOUNT_KEY_PREFIX + account.userId); cancelReminderNotifications(); state = defaultState(false); state.cloud = account; saveState(); closeSheet(); closeFlow(); render(); showToast("Bu hesaba ait cihaz verileri silindi; bulut verileri korunuyor."); }

  function openRemindersSheet() { var dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]; openSheet('<div class="sheet-head"><div><h2>Antrenman hatırlatması</h2><p>Seçtiğin gün ve saatte yerel bildirim gönderilir.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><label class="toggle-row"><span><strong>Hatırlatmayı aç</strong><small>Bildirim yalnız bu cihazda planlanır</small></span><input id="reminderEnabled" type="checkbox" ' + (state.reminder.enabled ? "checked" : "") + '><i></i></label><div class="field"><label for="reminderTime">BİLDİRİM SAATİ</label><input id="reminderTime" type="time" value="' + esc(state.reminder.time) + '"></div><div class="field"><label>GÜNLER</label><div class="day-picker">' + dayNames.map(function (name, index) { return '<button type="button" data-action="toggle-reminder-day" data-day="' + index + '" class="' + (state.reminder.days.indexOf(index) !== -1 ? "selected" : "") + '">' + name + '</button>'; }).join("") + '</div></div><button class="primary-btn" data-action="save-reminders">Hatırlatmayı kaydet</button><p class="sheet-note">Tam saatinde çalışması için Android “Alarmlar ve hatırlatıcılar” izni açık olmalıdır. FitTrack bu izin olmadan gecikebilecek bir alarm planlamaz.</p>'); }
  function toggleReminderDay(button) { button.classList.toggle("selected"); }
  function cancelReminderNotifications() { var plugin = nativePlugin("LocalNotifications"); if (!plugin || !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return Promise.resolve(); return plugin.cancel({ notifications: REMINDER_IDS.map(function (id) { return { id: id }; }) }).catch(function () {}); }
  function exactAlarmGranted(plugin) { if (!plugin || typeof plugin.checkExactNotificationSetting !== "function") return Promise.resolve(true); return plugin.checkExactNotificationSetting().then(function (setting) { return !setting || setting.exact_alarm === "granted"; }); }
  function scheduleReminderNotifications(showSuccess) {
    var plugin = nativePlugin("LocalNotifications");
    if (!state.reminder.enabled || !plugin || !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return Promise.resolve(false);
    var parts = state.reminder.time.split(":").map(Number); var expected = state.reminder.days.map(function (day) { return REMINDER_IDS[day]; });
    return exactAlarmGranted(plugin).then(function (granted) {
      if (!granted) return cancelReminderNotifications().then(function () { if (showSuccess) throw new Error("Tam saat için Alarmlar ve hatırlatıcılar izni gerekli."); return false; });
      return cancelReminderNotifications().then(function () { return plugin.schedule({ notifications: state.reminder.days.map(function (day) { return { id: REMINDER_IDS[day], title: "Antrenman zamanı", body: "Antrenörünün programı hazır. FitTrack'te kaldığın yerden başla.", schedule: { on: { weekday: day + 1, hour: parts[0], minute: parts[1], second: 0 }, repeats: true, allowWhileIdle: true } }; }) }); }).then(function () { return typeof plugin.getPending === "function" ? plugin.getPending() : { notifications: expected.map(function (id) { return { id: id }; }) }; }).then(function (pending) { var ids = (pending.notifications || []).map(function (item) { return Number(item.id); }); if (!expected.every(function (id) { return ids.indexOf(id) !== -1; })) throw new Error("Bildirim planı doğrulanamadı."); if (showSuccess) showToast("Hatırlatma tam dakikaya ve kesin alarm olarak planlandı."); return true; });
    });
  }
  function saveReminders() {
    var enabled = document.getElementById("reminderEnabled").checked; var time = document.getElementById("reminderTime").value; var days = Array.from(document.querySelectorAll('[data-action="toggle-reminder-day"].selected')).map(function (button) { return Number(button.dataset.day); });
    if (enabled && (!/^\d{2}:\d{2}$/.test(time) || !days.length)) return showToast("Saat ve en az bir gün seç.");
    state.reminder = { enabled: enabled, time: time || "18:00", days: days.length ? days : state.reminder.days }; saveState();
    var plugin = nativePlugin("LocalNotifications");
    if (!enabled) return cancelReminderNotifications().then(function () { closeSheet(); render(); showToast("Hatırlatma kapatıldı."); });
    if (!plugin || !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) { closeSheet(); render(); return showToast("Hatırlatma ayarı kaydedildi; APK'da bildirim olarak çalışır."); }
    plugin.requestPermissions().then(function (permission) {
      if (permission.display !== "granted") throw new Error("Bildirim izni verilmedi.");
      return exactAlarmGranted(plugin);
    }).then(function (granted) {
      if (granted) return scheduleReminderNotifications(true);
      if (typeof plugin.changeExactNotificationSetting !== "function") throw new Error("Kesin saat izni verilemedi.");
      return cancelReminderNotifications().then(function () { closeSheet(); render(); showToast("Alarmlar ve hatırlatıcılar iznini aç; FitTrack'e dönünce planlanacak."); return plugin.changeExactNotificationSetting(); }).then(function () { return false; });
    }).then(function (scheduled) { if (scheduled) { closeSheet(); render(); } }).catch(function (error) { showToast(error.message || "Bildirim planlanamadı."); });
  }

  function currentUserId() { if (state.cloud && state.cloud.userId) return state.cloud.userId; return ui.trainerMemberId || ui.chatInboxOpen ? "coach-demo" : "member-self"; }
  function chatMessages(partnerId) { var ownId = currentUserId(); return (state.messages || []).filter(function (item) { return item.senderId === ownId && item.recipientId === partnerId || item.senderId === partnerId && item.recipientId === ownId; }).sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); }); }
  function unreadFrom(partnerId) { var ownId = currentUserId(); return (state.messages || []).filter(function (item) { return item.senderId === partnerId && item.recipientId === ownId && !item.readAt; }).length; }
  function chatPartnerName(partnerId) { if (partnerId === state.gym.coachId || partnerId === "coach-demo") return state.gym.coach; var member = state.trainer.members.find(function (item) { return item.id === partnerId; }); return member ? memberName(member) : "Sohbet"; }
  function formatMessageTime(value) { var date = new Date(value); if (!Number.isFinite(date.getTime())) return ""; return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date); }
  function markChatRead(partnerId) {
    var ownId = currentUserId(); var changed = false; var now = new Date().toISOString();
    (state.messages || []).forEach(function (item) { if (item.senderId === partnerId && item.recipientId === ownId && !item.readAt) { item.readAt = now; changed = true; } });
    if (changed) saveState({ remote: true });
    if (state.cloud && state.cloud.userId && window.FitTrackCloud && typeof window.FitTrackCloud.markMessagesRead === "function") window.FitTrackCloud.markMessagesRead(partnerId).catch(function () {});
  }
  function messageNotificationKey(item) { return String(item && (item.clientMutationId || item.id) || ""); }
  function messageNotificationId(item) { var key = messageNotificationKey(item); var hash = 0; for (var index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0; return 200000 + hash % 700000; }
  function rememberMessageNotification(item) {
    var key = messageNotificationKey(item); if (!key || (state.notifiedMessageIds || []).indexOf(key) !== -1) return false;
    state.notifiedMessageIds = (state.notifiedMessageIds || []).concat([key]).slice(-300); saveState({ remote: true }); return true;
  }
  function notifyIncomingMessage(item) {
    if (!item || item.recipientId !== currentUserId() || item.readAt || !rememberMessageNotification(item)) return;
    var partnerName = chatPartnerName(item.senderId), notificationUser = currentUserId(), notificationGym = state.cloud.gymId || state.gym.id; renderHeader();
    if (ui.chatPartnerId === item.senderId && document.visibilityState === "visible") { showToast(partnerName + " yeni bir mesaj gönderdi."); return; }
    var plugin = nativePlugin("LocalNotifications");
    if (!plugin || !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) { showToast("Yeni mesajın var · " + partnerName); return; }
    Promise.resolve(typeof plugin.requestPermissions === "function" ? plugin.requestPermissions() : { display: "granted" }).then(function (permission) {
      if (permission && permission.display && permission.display !== "granted") return;
      if (currentUserId() !== notificationUser || (state.cloud.gymId || state.gym.id) !== notificationGym) return;
      return plugin.schedule({ notifications: [{ id: messageNotificationId(item), title: "Yeni mesajın var", body: partnerName + ": " + item.body.slice(0, 90), extra: { userId: notificationUser, gymId: notificationGym, partnerId: item.senderId, messageId: messageNotificationKey(item) } }] });
    }).catch(function () { showToast("Yeni mesajın var · " + partnerName); });
  }
  function messageNotificationContextMatches(extra) {
    if (!extra || !extra.userId || !extra.gymId || extra.userId !== currentUserId() || extra.gymId !== (state.cloud.gymId || state.gym.id)) return false;
    return isCloudStaff() ? staffMessagePartners().some(function (member) { return member.id === extra.partnerId; }) : Boolean(state.gym.coachId && state.gym.coachId === extra.partnerId);
  }
  function registerMessageNotificationActions() {
    var plugin = nativePlugin("LocalNotifications"); if (!plugin || typeof plugin.addListener !== "function" || ui.messageNotificationsRegistered) return;
    ui.messageNotificationsRegistered = true;
    plugin.addListener("localNotificationActionPerformed", function (event) { var notification = event && event.notification || {}; var extra = notification.extra || {}; if (!messageNotificationContextMatches(extra)) return;
      var tapKey = extra.userId + ":" + extra.gymId + ":" + (extra.messageId || extra.partnerId);
      if (ui.lastNotificationTap && ui.lastNotificationTap.key === tapKey && Date.now() - ui.lastNotificationTap.at < 1500) return;
      ui.lastNotificationTap = { key: tapKey, at: Date.now() };
      window.setTimeout(function () { if (messageNotificationContextMatches(extra)) openChat(extra.partnerId); }, 80); });
  }
  function renderChatInbox() {
    ui.chatInboxOpen = true; ui.chatPartnerId = ""; flowLayer.classList.add("active");
    var totalUnread = totalUnreadMessages();
    flowLayer.innerHTML = '<div class="full-flow trainer-flow message-inbox-flow trainer-inbox-revision">' + trainerHeader("Mesajlar", totalUnread ? totalUnread + " okunmamış mesaj" : staffMessagePartners().length + " üye", "close-chat-inbox") + '<main class="trainer-scroll chat-inbox-scroll"><label class="trainer-search">' + icons.search + '<input data-inbox-search type="search" aria-label="Üye veya mesaj ara" placeholder="Üye veya mesaj ara…" value="' + esc(ui.inboxQuery || "") + '"></label><div class="trainer-tabs"><button data-action="inbox-filter" data-filter="all" aria-pressed="' + (ui.inboxFilter !== "unread") + '">Tümü</button><button data-action="inbox-filter" data-filter="unread" aria-pressed="' + (ui.inboxFilter === "unread") + '">Okunmamış (' + totalUnread + ')</button></div><div id="chatInboxResults" class="chat-inbox-list">' + chatInboxResultsHTML() + '</div><button class="primary-btn trainer-new-message" data-action="new-message">+ Yeni mesaj</button></main>' + staffNavigation("messages", true) + '</div>';
  }
  function chatInboxEntries() {
    var query = String(ui.inboxQuery || "").trim().toLocaleLowerCase("tr-TR");
    return staffMessagePartners().map(function (member) { return { member: member, message: lastChatMessage(member.id), unread: unreadFrom(member.id) }; })
      .filter(function (entry) { return (ui.inboxFilter !== "unread" || entry.unread > 0) && (!query || memberName(entry.member).toLocaleLowerCase("tr-TR").indexOf(query) >= 0 || chatMessages(entry.member.id).some(function (message) { return message.body.toLocaleLowerCase("tr-TR").indexOf(query) >= 0; })); })
      .sort(function (a, b) { return String(b.message && b.message.createdAt || "").localeCompare(String(a.message && a.message.createdAt || "")); });
  }
  function chatInboxResultsHTML() {
    var partners = chatInboxEntries();
    return partners.length ? partners.map(function (entry) { var name = memberName(entry.member); return '<button data-action="open-chat" data-partner-id="' + esc(entry.member.id) + '" data-return-to="inbox"><span class="member-avatar">' + esc(initials(name)) + '</span><span><strong>' + esc(name) + '</strong><small>' + esc(shortMessagePreview(entry.message, "Henüz mesaj yok · Sohbeti başlat")) + '</small><em>' + (entry.message ? esc(formatMessageTime(entry.message.createdAt)) : "") + '</em></span>' + (entry.unread ? '<b class="unread-badge">' + entry.unread + '</b>' : '<i class="small-arrow">' + icons.arrow + '</i>') + '</button>'; }).join("") : '<article class="trainer-empty"><strong>Eşleşen sohbet yok.</strong><small>Aramayı veya filtreyi değiştir; yeni mesajla bir üyeye ulaş.</small></article>';
  }
  function openNewMessage() {
    if (!canUseTrainerPanel()) return;
    openSheet('<div class="sheet-head"><div><h2>Yeni mesaj</h2><p>Konuşmak istediğin üyeyi seç.</p></div><button class="close-btn" data-action="close-sheet">×</button></div><label class="trainer-search">' + icons.search + '<input data-message-member-search type="search" aria-label="Mesaj için üye ara" placeholder="Üye ara…"></label><div id="newMessageMembers" class="assignment-member-results">' + newMessageMembersHTML("") + '</div>');
  }
  function newMessageMembersHTML(query) {
    var list = staffMessagePartners().filter(function (member) { return memberName(member).toLocaleLowerCase("tr-TR").indexOf(String(query).trim().toLocaleLowerCase("tr-TR")) >= 0; });
    return list.length ? list.map(function (member) { var entries = memberProgramEntries(member); return '<button data-action="open-chat" data-partner-id="' + esc(member.id) + '" data-return-to="inbox"><span class="member-avatar">' + esc(initials(memberName(member))) + '</span><span><strong>' + esc(memberName(member)) + '</strong><small>' + esc(entries.length ? entries[0].program.name : "Henüz program atanmadı") + '</small></span>' + icons.arrow + '</button>'; }).join("") : '<p class="trainer-data-note">Eşleşen üye yok.</p>';
  }
  function openChatMemberInfo() {
    var member = trainerRoster().find(function (item) { return item.id === ui.chatPartnerId; }); if (!member || !canUseTrainerPanel()) return;
    var attention = memberAttention(member);
    openSheet('<div class="sheet-head"><div><h2>' + esc(memberName(member)) + '</h2><p>Üye bilgisi</p></div><button class="close-btn" data-action="close-sheet">×</button></div><div class="chat-member-info"><p><strong>Programlar</strong><span>' + esc(attention.entries.map(function (entry) { return entry.program.name; }).join(" · ") || "Henüz görünür program yok") + '</span></p><p><strong>Son kayıt</strong><span>' + (attention.last ? formatDate(attention.last.date) : "Henüz kayıt yok") + '</span></p><p><strong>Durum</strong><span>' + esc(attention.detail) + '</span></p></div>');
  }
  function renderChat() {
    var partnerId = ui.chatPartnerId; if (!partnerId) return closeFlow(); var partnerName = chatPartnerName(partnerId); var ownId = currentUserId(); var messages = chatMessages(partnerId);
    flowLayer.classList.add("active");
    flowLayer.innerHTML = '<div class="full-flow chat-flow"><header class="chat-head"><button class="back-btn" data-action="close-chat" aria-label="Geri">' + icons.back + '</button><span class="coach-avatar">' + esc(initials(partnerName)) + '</span><div><strong>' + esc(partnerName) + '</strong><small>' + esc(state.gym.name) + '</small></div>' + (isCloudStaff() ? '<button class="chat-info-btn" data-action="chat-member-info" aria-label="Üye bilgisi">ⓘ</button>' : '') + '</header><main class="chat-scroll"><div class="chat-day-label">GÜVENLİ SALON SOHBETİ</div><div class="chat-message-list">' + (messages.length ? messages.map(function (item) { var own = item.senderId === ownId; return '<article class="chat-bubble ' + (own ? "own" : "other") + '"><p>' + esc(item.body) + '</p><small>' + esc(formatMessageTime(item.createdAt)) + (own ? item.pending ? " · Gönderiliyor" : item.readAt ? " · Okundu" : " · Gönderildi" : "") + '</small></article>'; }).join("") : '<div class="chat-empty"><span>✦</span><strong>Sohbeti başlat.</strong><p>Antrenman, program veya form hakkında kısa bir mesaj yazabilirsin.</p></div>') + '</div></main><div class="chat-compose"><textarea id="chatInput" maxlength="1000" rows="1" placeholder="Mesaj yaz…" aria-label="Mesaj"></textarea><button data-action="send-message" aria-label="Mesajı gönder">' + icons.arrow + '</button></div></div>';
    markChatRead(partnerId); var scroll = flowLayer.querySelector(".chat-scroll"); if (scroll) window.setTimeout(function () { scroll.scrollTop = scroll.scrollHeight; }, 0);
  }
  function openChat(partnerId, returnTo) { partnerId = clean(partnerId, "", 80); if (!partnerId) return showToast("Mesajlaşılacak kişi bulunamadı."); closeSheet(); ui.chatInboxOpen = returnTo === "inbox"; ui.chatPartnerId = partnerId; renderChat(); }
  function closeChat() { ui.chatPartnerId = ""; if (ui.chatInboxOpen) renderChatInbox(); else if (ui.trainerMemberId) renderTrainerMember(ui.trainerMemberId); else closeFlow(); }
  function sendChatMessage() {
    var input = document.getElementById("chatInput"); var body = String(input && input.value || "").trim().slice(0, 1000); if (!body) return;
    var item = normalizeMessage({ id: "local-message-" + Date.now(), clientMutationId: newUuid(), senderId: currentUserId(), recipientId: ui.chatPartnerId, body: body, createdAt: new Date().toISOString(), pending: Boolean(state.cloud && state.cloud.userId) }, state.messages.length);
    state.messages = mergeMessages(state.messages, [item]); saveState({ remote: true }); renderChat();
    if (state.cloud && state.cloud.userId && window.FitTrackCloud && typeof window.FitTrackCloud.sendMessage === "function") window.FitTrackCloud.sendMessage(item).catch(function () { showToast("Mesaj bağlantı gelince gönderilecek."); });
    else { item.pending = false; state.messages = mergeMessages(state.messages, [item]); saveState({ remote: true }); renderChat(); }
  }
  function openCoachSheet() { var coachId = state.gym.coachId || "coach-demo"; var unread = unreadFrom(coachId); openSheet('<div class="sheet-head"><div><h2>' + esc(state.gym.coach) + '</h2><p>' + esc(state.gym.name) + ' · Antrenörün</p></div><button class="close-btn" data-action="close-sheet">×</button></div><article class="card coach-message"><span class="coach-avatar">' + esc(initials(state.gym.coach)) + '</span><span class="coach-copy"><small>BUGÜNKÜ NOT</small><h3>Programına odaklan.</h3><p>' + esc(currentCoachNote()) + '</p></span></article><button class="primary-btn" type="button" data-action="open-chat" data-partner-id="' + esc(coachId) + '">' + (unread ? unread + ' yeni mesajı aç' : 'Antrenörüne mesaj gönder') + '</button><p class="sheet-note">Mesajların yalnızca senin ve antrenörünün hesabında görünür.</p>'); }
  function openSheet(content) { sheetLayer.classList.add("active"); sheetLayer.innerHTML = '<div class="sheet-backdrop" data-action="close-sheet"><div class="bottom-sheet" data-sheet><div class="sheet-handle"></div>' + content + '</div></div>'; }
  function closeSheet() { ui.studioSelection = null; ui.pendingDelete = null; sheetLayer.classList.remove("active"); sheetLayer.innerHTML = ""; }

  function closeFlow() { ui.sessionProgramId = ""; ui.sessionDayId = ""; clearCountdown(); window.clearInterval(ui.workoutClockTimer); clearRestTimer(); ui.exerciseDetailId = ""; ui.exerciseDetailReturn = null; ui.programDetailId = ""; ui.staffProgramId = ""; ui.staffMemberReturn = ""; flowLayer.classList.remove("active"); flowLayer.innerHTML = ""; render(); }

  function handleBackNavigation() {
    if (sheetLayer.classList.contains("active")) { closeSheet(); return true; }
    if (!flowLayer.classList.contains("active")) return false;
    if (state.currentWorkout && flowLayer.querySelector(".workout-flow, .rest-overlay, .paused-flow")) { confirmCancel(); return true; }
    if (ui.historyDraft) { closeHistoryEditor(); return true; }
    if (ui.chatPartnerId) { closeChat(); return true; }
    if (ui.chatInboxOpen) { ui.chatInboxOpen = false; closeFlow(); return true; }
    if (flowLayer.querySelector(".profile-wizard")) { if (ui.onboardingStep > 1) { ui.onboardingStep -= 1; renderProfileWizard(); } else if (state.profile.setupComplete) { clearProfileWizardRecovery(); ui.onboardingDraft = null; closeFlow(); } return true; }
    if (ui.exerciseDetailId) { closeExerciseDetail(); return true; }
    if (ui.programDetailId) { ui.programDetailId = ""; closeFlow(); return true; }
    if (ui.editorDraft) { if (ui.studioStep > 1) { ui.studioStep -= 1; renderStudioEditor(); } else requestEditorExit(renderProgramStudio); return true; }
    if (ui.trainerMemberId) { ui.trainerMemberId = ""; if (ui.staffMemberReturn) { var returnProgramId = ui.staffMemberReturn; ui.staffMemberReturn = ""; renderStaffProgramDetail(returnProgramId, "members"); } else renderTrainerPanel(); return true; }
    if (ui.staffProgramId) { ui.staffProgramId = ""; renderProgramStudio(); return true; }
    if (flowLayer.querySelector(".studio-flow")) { renderTrainerPanel(); return true; }
    closeFlow(); return true;
  }
  window.FitTrackNativeBack = function () { return handleBackNavigation(); };

  function registerNativeBackButton() { var app = nativePlugin("App"); if (!app || typeof app.addListener !== "function" || ui.nativeBackRegistered) return; ui.nativeBackRegistered = true; app.addListener("backButton", function () { if (window.FitTrackNativeBack()) return; if (typeof app.exitApp === "function") app.exitApp(); }); app.addListener("appStateChange", function (event) { if (event && event.isActive) { registerMessageNotificationActions(); if (state.reminder.enabled) scheduleReminderNotifications(false).catch(function () {}); } }); }
  function formatDay(key) { return new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(new Date(key + "T12:00:00")); }
  function formatDate(key) { if (key === todayKey()) return "Bugün"; if (key === offsetDate(-1)) return "Dün"; return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(key + "T12:00:00")); }
  function formatShortDate(key) { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(key + "T12:00:00")); }
  function showToast(message) { window.clearTimeout(ui.toastTimer); toast.textContent = message; toast.classList.add("show"); ui.toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2800); }
  function vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) { /* no-op */ } }

  function splitDisplayName(name) {
    var parts = clean(name, "Sporcu", 80).split(/\s+/); return { firstName: parts.shift() || "Sporcu", lastName: parts.join(" ") || "Kullanıcı" };
  }
  function programByCloudId(id) { return programs.find(function (program) { return program.cloudId === id; }) || null; }
  function mergeHistoryLists(localItems, remoteItems) {
    var map = {};
    (localItems || []).concat(remoteItems || []).forEach(function (raw, index) {
      var item = normalizeHistoryItem(raw, index);
      if (item.units && state && state.profile && item.units !== state.profile.units) {
        item.exercises.forEach(function (entry) { entry.sets.forEach(function (set) { if (String(set.weight || "").trim()) set.weight = convertWeightNumber(set.weight, item.units, state.profile.units); }); });
        item.volume = Math.round(historyVolume(item)); item.units = state.profile.units;
      } var key = item.syncId || item.id; var existing = map[key];
      var itemTime = String(item.modifiedAt || item.cloudSyncedAt || item.finishedAt || "");
      var existingTime = String(existing && (existing.modifiedAt || existing.cloudSyncedAt || existing.finishedAt) || "");
      if (!existing || itemTime > existingTime || (itemTime === existingTime && item.cloudSyncedAt)) map[key] = item;
    });
    return Object.keys(map).map(function (key) { return map[key]; }).sort(function (a, b) { return String(b.finishedAt || b.date).localeCompare(String(a.finishedAt || a.date)); }).slice(0, 200);
  }

  function mergeProgramLists(localItems, remoteItems) {
    var map = {};
    (localItems || []).concat(remoteItems || []).forEach(function (raw, index) {
      var item = normalizeCustomProgram(raw, index); var key = item.cloudId || item.id; var existing = map[key];
      if (!existing || String(item.updatedAt) >= String(existing.updatedAt)) map[key] = item;
    });
    return Object.keys(map).map(function (key) { return map[key]; }).slice(0, 100);
  }
  function workoutRowToHistory(row) {
    var raw = row && row.payload && typeof row.payload === "object" ? row.payload : {};
    return normalizeHistoryItem(Object.assign({}, raw, {
      syncId: row.client_mutation_id,
      date: raw.date || String(row.finished_at || "").slice(0, 10),
      duration: row.duration_minutes,
      status: row.status,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      programCloudId: row.program_id || raw.programCloudId,
      assignmentCloudId: row.assignment_id || raw.assignmentCloudId,
      cloudRecordId: row.id,
      cloudSyncedAt: row.updated_at || row.created_at
    }));
  }
  function cloudProgramToLocal(row) {
    var raw = row && row.payload && typeof row.payload === "object" ? row.payload : {};
    var local = Object.assign({}, raw, { cloudId: row.id, cloudRootId: row.root_id, status: row.status, revision: row.version, name: row.name, description: row.description, generalNote: row.general_note, updatedAt: row.updated_at, createdAt: row.created_at, cloudSyncedAt: row.updated_at });
    var builtIn = builtInPrograms.find(function (item) { return item.id === raw.id || row.client_key === "builtin:" + item.id || row.client_key === item.id; });
    if (builtIn) { builtIn.cloudId = row.id; builtIn.cloudRootId = row.root_id; builtIn.cloudSyncedAt = row.updated_at; return builtIn; }
    return normalizeCustomProgram(local);
  }
  function applyRemoteSnapshot(remote) {
    if (!remote || typeof remote !== "object") return;
    var remoteTime = new Date(remote._cloudMeta && remote._cloudMeta.clientUpdatedAt || 0).getTime();
    var localTime = new Date(state.cloud && state.cloud.lastSyncedAt || 0).getTime();
    var remoteWins = remoteTime >= localTime;
    if (remoteWins && remote.profile) {
      var mergedProfile = mergeKnown(defaultState(false), { profile: remote.profile }).profile;
      state.profile = mergedProfile;
    }
    var remoteTheme = normalizeThemeKey(remote.theme, "");
    if (remoteWins && remoteTheme) state.theme = remoteTheme;
    if (remoteWins && remote.reminder) state.reminder = mergeKnown(defaultState(false), { reminder: remote.reminder }).reminder;
    state.customPrograms = mergeProgramLists(state.customPrograms, remote.customPrograms || []); refreshPrograms();
    if (remoteWins && Array.isArray(remote.assignments)) {
      state.assignments = remote.assignments.map(function (item, index) { return normalizeAssignment(item, index, state.gym.coach); }).filter(function (item, index, list) { return list.findIndex(function (other) { return other.programId === item.programId; }) === index; });
      state.selectedProgramId = remote.selectedProgramId && state.assignments.some(function (item) { return item.programId === remote.selectedProgramId; }) ? remote.selectedProgramId : state.selectedProgramId;
      var remoteSelected = selectedAssignment(); state.selectedProgramId = remoteSelected ? remoteSelected.programId : ""; state.assignment = remoteSelected ? Object.assign({}, remoteSelected) : null;
    }
    state.customExercises = (state.customExercises || []).concat(remote.customExercises || []).filter(function (item, index, list) { return list.findIndex(function (other) { return other.id === item.id; }) === index; }).slice(0, 100).map(normalizeCustomExercise);
    state.customPrograms = mergeProgramLists(state.customPrograms, remote.customPrograms || []);
    mergeProgramDeletionState(state, remote);
    state.customPrograms = state.customPrograms.filter(function (item) { return (state.deletedProgramIds || []).indexOf(item.id) === -1; });
    state.deletedHistoryIds = Array.from(new Set((state.deletedHistoryIds || []).concat(remote.deletedHistoryIds || [])));
    var remoteHistory = (remote.history || []).map(function (item) { return Object.assign({}, item, { units: item.units || remote.profile && remote.profile.units || state.profile.units }); });
    state.history = mergeHistoryLists(state.history, remoteHistory).filter(function (item) { return state.deletedHistoryIds.indexOf(item.syncId) < 0; });
    state.closedWorkoutIds = Object.assign({}, state.closedWorkoutIds || {}, remote.closedWorkoutIds || {});
    var localWorkout = state.currentWorkout; var incoming = remote.currentWorkout;
    if (localWorkout && state.closedWorkoutIds[localWorkout.syncId]) { state.currentWorkout = null; localWorkout = null; }
    if (incoming && !state.closedWorkoutIds[incoming.syncId]) {
      var localUpdated = localWorkout && (localWorkout.updatedAt || localWorkout.startedAt) || "";
      var incomingUpdated = incoming.updatedAt || remote.workoutUpdatedAt || remote._cloudMeta && remote._cloudMeta.clientUpdatedAt || incoming.startedAt || "";
      if (!localWorkout || (incoming.syncId === localWorkout.syncId && incomingUpdated > localUpdated) || (!incoming.syncId && incoming.startedAt === localWorkout.startedAt && incomingUpdated > localUpdated)) {
        state.currentWorkout = normalizeCurrentWorkout(Object.assign({}, incoming, { updatedAt: incomingUpdated }));
      }
    } else if (!incoming && localWorkout && !localWorkout.summarySaved && state.history.some(function (item) { return item.syncId === localWorkout.syncId; })) {
      // Legacy completion can identify its session; an unrelated idle snapshot cannot.
      state.closedWorkoutIds[localWorkout.syncId] = remote.workoutUpdatedAt || new Date().toISOString();
      state.currentWorkout = null;
    }
    state.workoutUpdatedAt = [state.workoutUpdatedAt || "", remote.workoutUpdatedAt || ""].sort().pop();
    refreshPrograms();
  }

  function getCloudSnapshot() {
    return {
      schema: SCHEMA,
      appVersion: VERSION,
      theme: state.theme,
      profile: state.profile,
      gym: { id: state.gym.id, name: state.gym.name },
      selectedProgramId: state.selectedProgramId,
      assignment: state.assignment,
      assignments: state.assignments,
      customExercises: state.customExercises,
      customPrograms: state.customPrograms,
      deletedProgramIds: state.deletedProgramIds,
      programDeletionState: state.programDeletionState, deletedHistoryIds: state.deletedHistoryIds, closedWorkoutIds: state.closedWorkoutIds, workoutUpdatedAt: state.workoutUpdatedAt,
      reminder: state.reminder,
      history: state.history.filter(function (item) { return !item.isDemo; }),
      currentWorkout: state.currentWorkout,
      _cloudMeta: { clientUpdatedAt: new Date().toISOString() }
    };
  }
  function resetTransientState() {
    if (ui.editorDraft && typeof saveEditorRecovery === "function") saveEditorRecovery();
    clearCountdown(); clearRestTimer(); window.clearInterval(ui.workoutClockTimer); window.clearTimeout(ui.toastTimer);
    [flowLayer, sheetLayer].forEach(function (layer) { if (layer) { layer.innerHTML = ""; layer.classList.remove("active"); } });
    Object.assign(ui, { programQuery: "", programFilter: "all", inboxQuery: "", inboxFilter: "all", staffProgramId: "", staffMemberReturn: "", assignPickerProgramId: "", tab: "home", tabHistory: [], editorDraft: null, editorBaseline: "", studioSelection: null, editorUndo: [], historyDraft: null, historyEditId: "", historyCollapsed: {}, onboardingDraft: null, trainerMemberId: "", chatPartnerId: "", chatInboxOpen: false, exerciseDetailId: "", exerciseDetailReturn: null, programDetailId: "", studioView: "", pendingDelete: null, editorExit: null, programUndo: null, workoutFingerprint: "", lastWorkoutSyncId: "" });
    if (toast) { toast.textContent = ""; toast.classList.remove("show"); }
    builtInPrograms.forEach(function (program) { delete program.cloudId; delete program.cloudRootId; delete program.cloudSyncedAt; });
  }
  function activateGym(gymId) {
    if (!state.cloud.userId || state.cloud.gymId === gymId) return;
    var userId = state.cloud.userId; var email = state.cloud.email;
    if (state.cloud.gymId) {
      saveState({ remote: true }); resetTransientState();
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(ACCOUNT_KEY_PREFIX + userId + "-gym-" + gymId) || "null"); } catch (_) {}
      state = cached ? mergeKnown(defaultState(false), cached) : defaultState(false);
    }
    state.cloud.userId = userId; state.cloud.email = email; state.cloud.gymId = gymId;
    saveState({ remote: true }); refreshPrograms();
  }

  function activateAccount(userId, email) {
    if (!userId) return;
    if (state.cloud && state.cloud.userId === userId) { state.cloud.email = email || state.cloud.email; saveState({ remote: true }); return; }
    if (state.cloud && state.cloud.userId) {
      try { localStorage.setItem(ACCOUNT_KEY_PREFIX + state.cloud.userId, JSON.stringify(state)); } catch (_) { /* no-op */ }
    }
    resetTransientState();
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(ACCOUNT_KEY_PREFIX + userId) || "null"); } catch (_) { stored = null; }
    var claimKey = "fittrack-beta-010-legacy-claimed-by";
    var canClaim = !localStorage.getItem(claimKey) && state.cloud && state.cloud.migrationSource;
    if (stored) state = mergeKnown(defaultState(false), stored);
    else if (canClaim) localStorage.setItem(claimKey, userId);
    else state = defaultState(false);
    state.cloud.userId = userId; state.cloud.email = email || ""; state.cloud.status = "syncing"; state.cloud.detail = "Hesap yükleniyor";
    saveState({ remote: true }); render();
  }
  function deactivateAccount() {
    if (state.cloud && state.cloud.userId) {
      try { localStorage.setItem(ACCOUNT_KEY_PREFIX + state.cloud.userId, JSON.stringify(state)); } catch (_) { /* no-op */ }
    }
    resetTransientState(); state = defaultState(false); state.cloud.status = "signed-out"; saveState({ remote: true }); render();
  }
  function applyCloudBootstrap(payload) {
    if (!payload || !payload.user) return;
    if (state.cloud.userId !== payload.user.id) activateAccount(payload.user.id, payload.user.email);
    activateGym(payload.gym.id);
    if (state.currentWorkout) workoutProgram(state.currentWorkout);
    var previousMessageSyncAt = state.cloud && state.cloud.lastSyncedAt || "";
    state.cloud.userId = payload.user.id; state.cloud.email = payload.user.email || ""; state.cloud.gymId = payload.gym.id; state.cloud.role = payload.membership.role; state.cloud.status = "synced"; state.cloud.detail = "Bulut güncel";
    if (payload.ownSnapshot && payload.ownSnapshot.state) { applyRemoteSnapshot(payload.ownSnapshot.state); state.cloud.snapshotVersion = Number(payload.ownSnapshot.state_version || 0); state.cloud.lastSyncedAt = payload.ownSnapshot.updated_at || ""; }
    var remotePrograms = [];
    (payload.programs || []).forEach(function (row) { var local = cloudProgramToLocal(row); if (builtInPrograms.indexOf(local) === -1 && (state.deletedProgramIds || []).indexOf(local.id) === -1) remotePrograms.push(local); });
    state.customPrograms = mergeProgramLists(state.customPrograms, remotePrograms); refreshPrograms();
    var relatedProfiles = {}; (payload.profiles || []).forEach(function (item) { relatedProfiles[item.id] = item; });
    var ownName = splitDisplayName(payload.pendingProfileName || payload.profile && payload.profile.display_name || fullName()); state.profile.firstName = ownName.firstName; state.profile.lastName = ownName.lastName;
    var coachId = payload.membership.trainer_id || payload.gym.created_by; var coachProfile = relatedProfiles[coachId]; var coachName = coachProfile && coachProfile.display_name || (isCloudStaff() ? payload.profile.display_name : "Antrenör");
    state.gym = { id: payload.gym.id, name: payload.gym.name, coach: coachName, coachId: coachId || "", connected: true };
    state.deletedHistoryIds = Array.from(new Set(state.deletedHistoryIds.concat((payload.workoutDeletions || []).filter(function (item) { return item.member_id === payload.user.id; }).map(function (item) { return item.client_mutation_id; }))));
    var ownWorkouts = (payload.workouts || []).filter(function (row) { return row.member_id === payload.user.id; }).map(workoutRowToHistory);
    state.history = mergeHistoryLists(state.history, ownWorkouts).filter(function (item) { return state.deletedHistoryIds.indexOf(item.syncId) < 0; });
    var ownCloudAssignments = (payload.assignments || []).filter(function (item) { return item.member_id === payload.user.id; }).slice().sort(function (a, b) { return String(b.assigned_at).localeCompare(String(a.assigned_at)); });
    var ownAssignment = ownCloudAssignments[0] || null;
    if (ownCloudAssignments.length) {
      state.assignments = ownCloudAssignments.map(function (row, index) { var ownProgram = programByCloudId(row.program_id); if (!ownProgram) return null; var previous = (state.assignments || []).find(function (item) { return item.cloudId === row.id || item.programId === ownProgram.id; }); return normalizeAssignment({ programId: ownProgram.id, dayId: previous && previous.dayId || "", cloudId: row.id, assignedAt: row.assigned_at, assignedBy: coachName, coachNote: row.coach_note || "" }, index, coachName); }).filter(Boolean);
      var ownSelected = selectedAssignment(); if (ownSelected) { state.selectedProgramId = ownSelected.programId; state.assignment = Object.assign({}, ownSelected); }
    } else {
      state.assignments = []; state.selectedProgramId = ""; state.assignment = null;
    }
    if (isCloudStaff()) {
      state.trainer = { enabled: true, members: (payload.members || []).map(function (member, memberIndex) {
        var memberProfile = relatedProfiles[member.user_id] || {}; var memberCloudAssignments = (payload.assignments || []).filter(function (item) { return item.member_id === member.user_id; }).sort(function (a, b) { return String(b.assigned_at).localeCompare(String(a.assigned_at)); });
        var memberAssignments = memberCloudAssignments.map(function (assignment, assignmentIndex) { var assignedProgram = programByCloudId(assignment.program_id); return assignedProgram ? normalizeAssignment({ programId: assignedProgram.id, cloudId: assignment.id, assignedAt: assignment.assigned_at, assignedBy: coachName, coachNote: assignment.coach_note || "" }, assignmentIndex, coachName) : null; }).filter(Boolean);
        var memberSnapshot = (payload.snapshots || []).find(function (item) { return item.user_id === member.user_id; }); var snapshotHistory = memberSnapshot && memberSnapshot.state && Array.isArray(memberSnapshot.state.history) ? memberSnapshot.state.history : [];
        var serverHistory = (payload.workouts || []).filter(function (row) { return row.member_id === member.user_id; }).map(workoutRowToHistory);
        return normalizeTrainerMember({ id: member.user_id, name: memberProfile.display_name || "Üye", assignments: memberAssignments, joinedAt: String(member.joined_at || todayKey()).slice(0, 10), note: member.coach_note == null ? memberCloudAssignments[0] && memberCloudAssignments[0].coach_note || "" : member.coach_note, isSelf: false, history: mergeHistoryLists(snapshotHistory, serverHistory).filter(function (history) { return !(payload.workoutDeletions || []).some(function (deleted) { return deleted.member_id === member.user_id && deleted.client_mutation_id === history.syncId; }); }) }, memberIndex);
      }) };
    } else {
      var self = normalizeTrainerMember({ id: payload.user.id, name: fullName(), assignments: state.assignments, joinedAt: String(payload.membership.joined_at || todayKey()).slice(0, 10), note: payload.membership.coach_note == null ? ownAssignment && ownAssignment.coach_note || "" : payload.membership.coach_note, isSelf: true, history: [] }, 0);
      state.trainer = { enabled: false, members: [self] };
    }
    var remoteMessages = (payload.messages || []).map(normalizeMessage);
    state.messages = mergeMessages(state.messages, remoteMessages);
    state.cloud.lastSyncedAt = new Date().toISOString();
    saveState({ remote: true }); render();
    var notificationCutoff = previousMessageSyncAt ? new Date(previousMessageSyncAt).getTime() : Date.now() - 300000;
    remoteMessages.filter(function (item) { return item.recipientId === currentUserId() && !item.readAt && new Date(item.createdAt).getTime() > notificationCutoff; }).forEach(notifyIncomingMessage);
    if (ui.chatPartnerId) renderChat();
    if (state.cloud.role === "member" && !state.profile.setupComplete) window.setTimeout(function () { if (!ui.onboardingDraft) openProfileWizard(1); }, 180);
  }
  function setCloudStatus(status, detail, pending) {
    state.cloud = state.cloud || defaultState(false).cloud; state.cloud.status = status; state.cloud.detail = detail || ""; state.cloud.pending = Number(pending) || 0;
    if (status === "synced") state.cloud.lastSyncedAt = new Date().toISOString();
    saveState({ remote: true }); renderHeader();
  }
  function mergeCloudSnapshot(remote, version) {
    applyRemoteSnapshot(remote); state.cloud.snapshotVersion = Number(version) || 0; saveState({ remote: true }); render(); return getCloudSnapshot();
  }
  function getWorkoutRecords() {
    return state.history.filter(function (item) { return !item.isDemo; }).map(function (item) {
      var needsSync = !item.cloudSyncedAt || String(item.modifiedAt || "") > String(item.cloudSyncedAt || "");
      return { syncId: item.syncId, status: item.status, duration: item.duration, startedAt: item.startedAt, finishedAt: item.finishedAt, programCloudId: item.programCloudId || "", assignmentCloudId: item.assignmentCloudId || "", cloudSyncedAt: item.cloudSyncedAt || "", modifiedAt: item.modifiedAt || item.finishedAt, needsSync: needsSync, payload: item };
    });
  }
  function markWorkoutSynced(syncId, cloudId, updatedAt) { var item = state.history.find(function (entry) { return entry.syncId === syncId; }); if (!item) return; item.cloudRecordId = cloudId; item.cloudSyncedAt = updatedAt || new Date().toISOString(); saveState({ remote: true }); }
  function bindCloudProgram(localId, cloudId, rootId, updatedAt) { var program = programs.find(function (item) { return item.id === localId; }); if (!program) return; program.cloudId = cloudId; program.cloudRootId = rootId; program.cloudSyncedAt = updatedAt || new Date().toISOString(); var custom = state.customPrograms.find(function (item) { return item.id === localId; }); if (custom) { custom.cloudId = cloudId; custom.cloudRootId = rootId; custom.cloudSyncedAt = program.cloudSyncedAt; } saveState({ remote: true }); }
  function bindCloudAssignment(memberId, localProgramId, assignment) { var member = state.trainer.members.find(function (item) { return item.id === memberId; }); if (member && assignment) { var local = (member.assignments || []).find(function (item) { return item.programId === localProgramId; }); if (local) local.cloudId = assignment.id; member.cloudAssignmentId = assignment.id; } saveState({ remote: true }); }
  function bindCloudMessage(clientMutationId, row) { if (!row) return; var local = (state.messages || []).find(function (item) { return item.clientMutationId === clientMutationId; }); var remote = normalizeMessage(row); if (local) remote.createdAt = remote.createdAt || local.createdAt; remote.pending = false; state.messages = mergeMessages(state.messages, [remote]); saveState({ remote: true }); if (ui.chatPartnerId) renderChat(); }
  function setSnapshotVersion(version, updatedAt) { state.cloud.snapshotVersion = Number(version) || 0; state.cloud.lastSyncedAt = updatedAt || new Date().toISOString(); if (!state.cloud.migrationCompletedAt) state.cloud.migrationCompletedAt = new Date().toISOString(); state.cloud.migrationSource = ""; saveState({ remote: true }); }
  function clearCurrentAccountData() {
    var userId = state.cloud && state.cloud.userId; resetTransientState();
    if (userId) {
      var keys = []; for (var i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
      keys.filter(function (key) { return key === ACCOUNT_KEY_PREFIX + userId || key.indexOf(ACCOUNT_KEY_PREFIX + userId + "-gym-") === 0 || key.indexOf("fittrack-beta-0114-editor-" + userId + "-") === 0 || key.indexOf("fittrack-deletion-acks:" + userId + ":") === 0; }).forEach(function (key) { localStorage.removeItem(key); });
    }
    localStorage.removeItem(STORAGE_KEY); state = defaultState(false); refreshPrograms(); saveState({ remote: true }); render();
  }
  function getCachedAccountContext() { if (!state.cloud || !state.cloud.userId) return null; return { userId: state.cloud.userId, email: state.cloud.email || "", gymId: state.cloud.gymId || state.gym.id || "", gymName: state.gym.name || "", role: state.cloud.role || "member" }; }

  window.FitTrackBridge = Object.freeze({
    activateAccount: activateAccount,
    activateGym: activateGym,
    deactivateAccount: deactivateAccount,
    applyCloudBootstrap: applyCloudBootstrap,
    getCloudSnapshot: getCloudSnapshot,
    mergeCloudSnapshot: mergeCloudSnapshot,
    getWorkoutRecords: getWorkoutRecords,
    markWorkoutSynced: markWorkoutSynced,
    bindCloudProgram: bindCloudProgram,
    bindCloudAssignment: bindCloudAssignment,
    bindCloudMessage: bindCloudMessage,
    setSnapshotVersion: setSnapshotVersion,
    setCloudStatus: setCloudStatus,
    getCachedAccountContext: getCachedAccountContext,
    clearCurrentAccountData: clearCurrentAccountData,
    exportJsonFile: exportJsonFile,
    notify: showToast
  });
  window.dispatchEvent(new CustomEvent("fittrack:bridge-ready"));

  document.addEventListener("input", function (event) {
    if (event.target.matches("[data-program-search]")) { ui.programQuery = event.target.value; renderTrainerProgramResults(); return; }
    if (event.target.matches("[data-inbox-search]")) { ui.inboxQuery = event.target.value; var inbox = document.getElementById("chatInboxResults"); if (inbox) inbox.innerHTML = chatInboxResultsHTML(); return; }
    if (event.target.matches("[data-assignment-search]")) { renderAssignmentMemberResults(event.target.value); return; }
    if (event.target.matches("[data-message-member-search]")) { var messageMembers = document.getElementById("newMessageMembers"); if (messageMembers) messageMembers.innerHTML = newMessageMembersHTML(event.target.value); return; }
    if (event.target.matches("[data-config-reps], [data-config-weight], [data-config-rest], #studioCoachNote") && ui.editorDraft) { captureStudioExerciseConfig(); saveEditorRecovery(); return; }
    if (event.target.matches("[data-profile-wizard]") && ui.onboardingDraft) { ui.onboardingDraft[event.target.dataset.profileWizard] = event.target.value; saveProfileWizardRecovery(); return; }
    if (event.target.matches("[data-library-search]")) { ui.libraryQuery = event.target.value; renderLibraryItems(); return; }
    if (event.target.matches("[data-history-field]") && ui.historyDraft) { var draftExercise = ui.historyDraft.exercises[Number(event.target.dataset.historyExercise)]; var draftSet = draftExercise && draftExercise.sets[Number(event.target.dataset.historySet)]; if (draftSet) draftSet[event.target.dataset.historyField] = event.target.value; return; }
    if (event.target.matches("[data-studio-field]") && ui.editorDraft) { ui.editorDraft[event.target.dataset.studioField] = event.target.value; saveEditorRecovery(); return; }
    if (event.target.matches("[data-studio-day-name]") && ui.editorDraft) { editorActiveDay().name = event.target.value.slice(0, 40); saveEditorRecovery(); return; }
    if (event.target.matches("[data-studio-catalog-search]")) { ui.studioQuery = event.target.value; renderStudioCatalogItems(); return; }
    if (event.target.matches("[data-trainer-search]")) { ui.trainerQuery = event.target.value; var list = document.querySelector(".trainer-member-list"); var filtered = trainerFilteredMembers(); if (list) list.innerHTML = filtered.length ? filtered.map(renderTrainerMemberCard).join("") : '<article class="trainer-empty"><span>⌁</span><strong>Eşleşen üye yok.</strong><small>Aramayı veya filtreyi değiştir.</small></article>'; return; }
    var input = event.target.closest("[data-log-field]"); if (!input || !state.currentWorkout) return; var log = getCurrentLog(); log[input.dataset.logField] = input.value; delete log.carried; saveState(); clearEntryError();
  });
  document.addEventListener("change", function (event) {
    if (event.target.matches("[data-config-type]") && ui.editorDraft) { captureStudioExerciseConfig(); saveEditorRecovery(); }
    if (event.target.matches("[data-progress-exercise]")) { ui.progressExercise = event.target.value; renderProgress(); }
    if (event.target.matches("[data-studio-muscle]")) { ui.studioMuscle = event.target.value; renderStudioCatalogItems(); }
    if (event.target.id === "units") convertProfileUnitFields(event.target);
    if (event.target.id === "backupInput" && event.target.files && event.target.files[0]) event.target.files[0].text().then(importBackupText).catch(function (error) { showToast(error && error.code === "BACKUP_ACCOUNT_MISMATCH" ? error.message : "Yedek okunamadı; mevcut veriler korunuyor."); });
  });
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]"); if (!button) return; var action = button.dataset.action;
    if (ui.editorDraft && ["nav", "studio-dashboard", "trainer-dashboard", "close-trainer", "program-studio", "trainer-panel", "close-flow"].indexOf(action) >= 0) {
      return requestEditorExit(function () { if (action === "nav") { closeFlow(); navigateToTab(button.dataset.tab, false); } else if (action === "close-trainer" || action === "close-flow") closeFlow(); else if (action === "studio-dashboard" || action === "program-studio") renderProgramStudio(); else renderTrainerPanel(); });
    }
    if (action === "editor-exit-keep") return finishEditorExit(true);
    if (action === "editor-exit-discard") return finishEditorExit(false);
    if (action === "editor-recover") return restoreEditorRecovery();
    if (action === "editor-discard-recovery") { discardEditorRecovery(); return renderProgramStudio(); }
    if (action === "editor-confirm-remove") return commitEditorRemoval();
    if (action === "editor-undo") return undoEditorChange();
    if (action === "program-undo-delete") return undoProgramDelete();
    if (action === "nav") navigateToTab(button.dataset.tab, false);
    else if (action === "choose-workout-session") { ui.sessionDayId = button.dataset.dayId; openSessionPicker(true); }
    else if (action === "begin-workout-session") beginWorkoutSession(false);
    else if (action === "repeat-workout-session") beginWorkoutSession(true);
    else if (action === "start") { closeSheet(); state.currentWorkout ? startWorkout() : openCountdown(); }
    else if (action === "library-exercise-detail") renderExerciseDetail(button.dataset.exerciseId);
    else if (action === "close-exercise-detail") closeExerciseDetail();
    else if (action === "assigned-exercise-detail") openAssignedExerciseDetail(button.dataset.programId, button.dataset.dayIndex, button.dataset.exerciseIndex);
    else if (action === "assigned-program-detail") renderAssignedProgramDetail(button.dataset.programId);
    else if (action === "close-program-detail") { ui.programDetailId = ""; closeFlow(); }
    else if (action === "start-assigned-program") { ui.programDetailId = ""; ui.exerciseDetailId = ""; ui.exerciseDetailReturn = null; if (state.currentWorkout) { startWorkout(); return showToast("Önce bu antrenmanı bitir veya menüden iptal et."); } if (!selectAssignment(button.dataset.programId)) return showToast("Antrenman ataması bulunamadı."); saveState(); closeSheet(); ui.programDetailId = ""; state.currentWorkout ? startWorkout() : openCountdown(); }
    else if (action === "library-filter") { ui.libraryMuscle = button.dataset.muscle || "all"; renderPrograms(); }
    else if (action === "close-flow") { closeSheet(); closeFlow(); }
    else if (action === "complete-set") completeSet();
    else if (action === "adjust-log") adjustLog(button.dataset.field, button.dataset.delta);
    else if (action === "skip-rest") applyNextPosition();
    else if (action === "add-rest") addRest(button.dataset.seconds);
    else if (action === "previous-set") goPreviousSet();
    else if (action === "use-previous") usePreviousValues();
    else if (action === "swap") openSwapSheet();
    else if (action === "choose-swap") chooseSwap(button.dataset.id);
    else if (action === "workout-menu") openWorkoutMenu();
    else if (action === "pause-workout") pauseWorkout();
    else if (action === "resume-workout") resumeWorkout();
    else if (action === "skip-exercise") skipExercise();
    else if (action === "confirm-finish-early") confirmFinishEarly();
    else if (action === "finish-early") finishWorkout(true);
    else if (action === "confirm-cancel") confirmCancel();
    else if (action === "dismiss-workout-cancel") closeSheet();
    else if (action === "cancel-workout") cancelWorkout();
    else if (action === "history-detail") openHistorySheet(button.dataset.id);
    else if (action === "close-history-editor") closeHistoryEditor();
    else if (action === "history-toggle-exercise") toggleHistoryExercise(Number(button.dataset.index));
    else if (action === "history-add-set") addHistorySet(Number(button.dataset.exerciseIndex));
    else if (action === "history-remove-set") removeHistorySet(Number(button.dataset.exerciseIndex), Number(button.dataset.setIndex));
    else if (action === "save-history") saveHistory(button.dataset.id);
    else if (action === "ask-delete-history") askDeleteHistory(button.dataset.id);
    else if (action === "delete-history") deleteHistory(button.dataset.id);
    else if (action === "trainer-panel") { if (!canUseTrainerPanel()) return showToast("Antrenör paneli yalnız antrenör ve salon yöneticisi hesaplarına açıktır."); ui.trainerMemberId = ""; ui.chatInboxOpen = false; ui.editorDraft = null; renderTrainerPanel(); }
    else if (action === "close-trainer") { ui.trainerMemberId = ""; ui.editorDraft = null; closeFlow(); }
    else if (action === "trainer-dashboard") { ui.trainerMemberId = ""; ui.editorDraft = null; if (ui.staffMemberReturn) { var returnProgramId = ui.staffMemberReturn; ui.staffMemberReturn = ""; renderStaffProgramDetail(returnProgramId, "members"); } else renderTrainerPanel(); }
    else if (action === "trainer-member") { if (ui.staffProgramId) { ui.staffMemberReturn = ui.staffProgramId; ui.staffProgramId = ""; } ui.trainerMemberId = button.dataset.memberId; renderTrainerPanel(); }
    else if (action === "trainer-filter") { ui.trainerFilter = button.dataset.filter; renderTrainerPanel(); }
    else if (action === "trainer-open-filter") { if (!canUseTrainerPanel()) return; ui.trainerMemberId = ""; ui.trainerQuery = ""; ui.trainerFilter = ["all", "priority", "no-program"].indexOf(button.dataset.filter) >= 0 ? button.dataset.filter : "all"; renderTrainerPanel(); }
    else if (action === "trainer-assign-shortcut") { if (!canUseTrainerPanel()) return; if (ui.staffProgramId) { ui.staffMemberReturn = ui.staffProgramId; ui.staffProgramId = ""; } ui.trainerMemberId = button.dataset.memberId; renderTrainerPanel(); var assignmentSelect = document.getElementById("trainerProgram"); if (assignmentSelect) assignmentSelect.scrollIntoView({ block: "center", behavior: "smooth" }); }
    else if (action === "assign-program") assignTrainerProgram(button.dataset.memberId);
    else if (action === "unassign-program") unassignTrainerProgram(button.dataset.memberId, button.dataset.programId);
    else if (action === "save-member-note") saveMemberNote(button.dataset.memberId);
    else if (action === "program-studio") { ui.trainerMemberId = ""; ui.editorDraft = null; renderProgramStudio(); }
    else if (action === "staff-nav") activateStaffSection(button.dataset.section);
    else if (action === "program-filter") { if (!canUseTrainerPanel()) return; ui.programFilter = ["all", "published", "draft"].indexOf(button.dataset.filter) >= 0 ? button.dataset.filter : "all"; renderProgramStudio(); }
    else if (action === "staff-program-detail") renderStaffProgramDetail(button.dataset.programId);
    else if (action === "staff-program-tab") renderStaffProgramDetail(ui.staffProgramId, button.dataset.tab === "members" ? "members" : "program");
    else if (action === "staff-programs-return") { ui.staffProgramId = ""; renderProgramStudio(); }
    else if (action === "staff-program-pick-member") openProgramMemberPicker(button.dataset.programId);
    else if (action === "staff-program-assign-member") {
      if (!canUseTrainerPanel()) return;
      var assignMember = trainerRoster().find(function (member) { return member.id === button.dataset.memberId; });
      var assignProgram = programs.find(function (program) { return program.id === button.dataset.programId && program.status === "published"; });
      if (!assignMember || !assignProgram) return showToast("Atama bilgisi değişti. Listeyi yeniden aç.");
      if (memberProgramEntries(assignMember).some(function (entry) { return entry.program.id === assignProgram.id; })) return showToast("Bu program zaten atanmış.");
      closeSheet(); ui.staffMemberReturn = assignProgram.id; ui.staffProgramId = ""; ui.trainerMemberId = assignMember.id;
      renderTrainerMember(assignMember.id); var programSelect = document.getElementById("trainerProgram"); if (programSelect) { programSelect.value = assignProgram.id; programSelect.scrollIntoView({ block: "center", behavior: "smooth" }); }
    }
    else if (action === "studio-dashboard") { ui.editorDraft = null; ui.studioStep = 1; closeSheet(); renderProgramStudio(); }
    else if (action === "studio-editor-back") { if (ui.studioStep > 1) setStudioStep(ui.studioStep - 1, true); else requestEditorExit(renderProgramStudio); }
    else if (action === "studio-training-weekday" && ui.editorDraft) { var weekday = Number(button.dataset.weekday); if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return; var trainingDays = programTrainingWeekdays(ui.editorDraft); ui.editorDraft.trainingWeekdays = trainingDays.indexOf(weekday) === -1 ? trainingDays.concat([weekday]) : trainingDays.filter(function (day) { return day !== weekday; }); renderStudioEditor(); }
    else if (action === "studio-new") { if (getEditorRecovery()) { restoreEditorRecovery(); showToast("Önce yarım kalan taslağını kaydet veya çıkarken sil."); } else { ui.editorDraft = emptyEditorDraft(); renderStudioEditor(); } }
    else if (action === "studio-edit") { ui.editorDraft = editorDraftFromProgram(programById(button.dataset.programId), false); renderStudioEditor(); }
    else if (action === "studio-copy") { ui.editorDraft = editorDraftFromProgram(programById(button.dataset.programId), true); renderStudioEditor(); }
    else if (action === "studio-preview") openProgramPreview(button.dataset.programId);
    else if (action === "studio-menu") openStudioProgramMenu(button.dataset.programId);
    else if (action === "studio-delete-confirm") confirmDeleteStudioProgram(button.dataset.programId);
    else if (action === "studio-delete") deleteStudioProgram(button.dataset.programId);
    else if (action === "studio-archive") archiveStudioProgram(button.dataset.programId);
    else if (action === "studio-day-select") selectEditorDay(Number(button.dataset.index));
    else if (action === "studio-name-suggestion") { if (ui.editorDraft) { ui.editorDraft.name = button.dataset.name || ""; renderStudioEditor(); } }
    else if (action === "studio-next-step") setStudioStep(ui.studioStep + 1, false);
    else if (action === "studio-previous-step") setStudioStep(ui.studioStep - 1, true);
    else if (action === "studio-jump-step") { var studioTargetStep = Number(button.dataset.step); setStudioStep(studioTargetStep, studioTargetStep < ui.studioStep); }
    else if (action === "studio-review-edit-day") { selectEditorDay(Number(button.dataset.index)); ui.studioStep = 3; renderStudioEditor(); }
    else if (action === "studio-add-day") addEditorDay();
    else if (action === "studio-remove-day") removeEditorDay();
    else if (action === "studio-add-move") openStudioCatalog();
    else if (action === "studio-add-exercise") addStudioExercise(button.dataset.exerciseId);
    else if (action === "studio-finish-selection") finishStudioExerciseSelection();
    else if (action === "studio-custom-exercise") openCustomExerciseEditor();
    else if (action === "save-custom-exercise") saveCustomExercise();
    else if (action === "studio-remove") removeStudioExercise(Number(button.dataset.index));
    else if (action === "studio-move") moveStudioExercise(Number(button.dataset.index), Number(button.dataset.delta));
    else if (action === "studio-config") openStudioExerciseConfig(Number(button.dataset.index));
    else if (action === "studio-add-set") changeStudioSetCount(1);
    else if (action === "studio-remove-set") changeStudioSetCount(-1);
    else if (action === "studio-save-config") { captureStudioExerciseConfig(); closeSheet(); renderStudioEditor(); showToast("Hareket ayarları güncellendi."); }
    else if (action === "studio-save-draft") persistEditorDraft("draft");
    else if (action === "studio-publish") persistEditorDraft("published");
    else if (action === "close-sheet") { if (!event.target.closest("[data-sheet]") || button.matches(".close-btn")) closeSheet(); }
    else if (action === "summary-home") { closeCurrentWorkout(); saveState(); ui.tab = "home"; ui.tabHistory = []; closeFlow(); showToast("Antrenmanın kaydedildi."); }
    else if (action === "coach") openCoachSheet();
    else if (action === "chat-inbox") renderChatInbox();
    else if (action === "inbox-filter") { ui.inboxFilter = button.dataset.filter === "unread" ? "unread" : "all"; renderChatInbox(); }
    else if (action === "new-message") openNewMessage();
    else if (action === "chat-member-info") openChatMemberInfo();
    else if (action === "close-chat-inbox") { ui.chatInboxOpen = false; closeFlow(); }
    else if (action === "open-chat") openChat(button.dataset.partnerId, button.dataset.returnTo);
    else if (action === "close-chat") closeChat();
    else if (action === "send-message") sendChatMessage();
    else if (action === "profile-edit") openProfileSheet();
    else if (action === "profile-wizard-next") nextProfileWizard();
    else if (action === "profile-wizard-back") { if (ui.onboardingStep > 1) { ui.onboardingStep -= 1; renderProfileWizard(); } }
    else if (action === "close-profile-wizard") { clearProfileWizardRecovery(); ui.onboardingDraft = null; closeFlow(); }
    else if (action === "profile-unit") {
      var previousWizardUnit = ui.onboardingDraft.units === "lb" ? "lb" : "kg";
      var nextWizardUnit = button.dataset.unit === "lb" ? "lb" : "kg";
      ui.onboardingDraft.currentWeight = convertWeightNumber(ui.onboardingDraft.currentWeight, previousWizardUnit, nextWizardUnit);
      ui.onboardingDraft.targetWeight = convertWeightNumber(ui.onboardingDraft.targetWeight, previousWizardUnit, nextWizardUnit);
      ui.onboardingDraft.units = nextWizardUnit;
      renderProfileWizard();
    }
    else if (action === "profile-goal") { ui.onboardingDraft.goal = button.dataset.goal; renderProfileWizard(); }
    else if (action === "save-profile") saveProfile();
    else if (action === "theme-edit") openThemeSheet();
    else if (action === "select-theme") selectTheme(button.dataset.theme);
    else if (action === "privacy") openPrivacySheet();
    else if (action === "save-data") saveDataToDevice();
    else if (action === "export-data") exportData();
    else if (action === "import-data") document.getElementById("backupInput").click();
    else if (action === "confirm-clear-data") confirmClearData();
    else if (action === "clear-data") clearAllData();
    else if (action === "reminders") openRemindersSheet();
    else if (action === "message-alerts") { if (totalUnreadMessages()) { if (isCloudStaff()) renderChatInbox(); else openChat(state.gym.coachId || "coach-demo"); } else openRemindersSheet(); }
    else if (action === "toggle-reminder-day") toggleReminderDay(button);
    else if (action === "save-reminders") saveReminders();
    else if (action === "about") showToast("FitTrack Beta " + VERSION + " · Senkronizasyon ve program günleri");
    else if (action === "notifications") openRemindersSheet();
    else if (action === "program-preview") openProgramPreview(button.dataset.programId);
    else if (action === "achievements") openAchievements();
    else if (action === "achievement-detail") openAchievements(button.dataset.id);
    else if (action === "progress-range") { ui.progressRange = button.dataset.range; renderProgress(); }
  });
  document.addEventListener("focusin", function (event) { if (event.target.matches("[data-log-field]")) window.setTimeout(function () { event.target.scrollIntoView({ behavior: "smooth", block: "center" }); }, 180); });
  document.addEventListener("error", function (event) { var image = event.target; if (!image || image.tagName !== "IMG" || !image.dataset.fallback || image.dataset.fallbackApplied) return; image.dataset.fallbackApplied = "true"; image.src = image.dataset.fallback; }, true);
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") handleBackNavigation(); if (event.key === "Enter" && !event.shiftKey && event.target && event.target.id === "chatInput") { event.preventDefault(); sendChatMessage(); } });
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0 && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) window.addEventListener("load", function () { navigator.serviceWorker.register("./sw.js").catch(function () {}); });
  window.addEventListener("pagehide", function () { saveEditorRecovery(); saveProfileWizardRecovery(); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState !== "visible") { saveEditorRecovery(); saveProfileWizardRecovery(); } });
  registerNativeBackButton(); registerMessageNotificationActions(); window.addEventListener("load", function () { registerNativeBackButton(); registerMessageNotificationActions(); }); var recoveredProfileWizard = restoreProfileWizardRecovery(); saveState(); render(); if (recoveredProfileWizard) window.setTimeout(renderProfileWizard, 0);
})();
