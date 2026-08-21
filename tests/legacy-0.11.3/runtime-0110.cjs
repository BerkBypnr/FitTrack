"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "..", "app.js"), "utf8");

class ClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    if (force === true || (force == null && !this.contains(name))) { this.add(name); return true; }
    this.remove(name); return false;
  }
}

class Element {
  constructor(id) {
    this.id = id;
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.dataset = {};
    this.classList = new ClassList();
    this.matchWorkout = false;
  }
  addEventListener() {}
  querySelector(selector) { return this.matchWorkout && selector.includes(".workout-flow") ? {} : null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  setAttribute() {}
  matches() { return false; }
  closest() { return null; }
}

function runApp(savedState) {
  const store = new Map([["fittrack-beta-010-state", JSON.stringify(savedState)]]);
  const elements = {};
  ["topbar", "screen", "bottomNav", "flowLayer", "sheetLayer", "toast", "backupInput"].forEach((id) => { elements[id] = new Element(id); });
  const nativeListeners = {};
  let exitCalls = 0;
  const document = {
    documentElement: { dataset: {} },
    body: new Element("body"),
    getElementById(id) { return elements[id] || (elements[id] = new Element(id)); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return new Element("created"); }
  };
  const window = {
    document,
    navigator: {},
    location: { protocol: "file:", href: "file:///fittrack/index.html" },
    localStorage: {
      getItem(key) { return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(key, String(value)); },
      removeItem(key) { store.delete(key); },
      clear() { store.clear(); }
    },
    crypto: globalThis.crypto,
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options && options.detail; } },
    addEventListener() {},
    dispatchEvent() {},
    scrollTo() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Intl,
    Date,
    Math,
    URL,
    Blob,
    console,
    Capacitor: {
      isNativePlatform() { return true; },
      Plugins: {
        App: {
          addListener(name, callback) { nativeListeners[name] = callback; },
          exitApp() { exitCalls += 1; }
        }
      }
    }
  };
  window.window = window;
  window.self = window;
  const context = vm.createContext(Object.assign({}, window, {
    window,
    self: window,
    globalThis: window,
    document,
    navigator: window.navigator,
    location: window.location,
    localStorage: window.localStorage
  }));
  vm.runInContext(source, context, { filename: "app.js" });
  return {
    state() { return JSON.parse(store.get("fittrack-beta-010-state")); },
    elements,
    back() { nativeListeners.backButton(); },
    exitCalls() { return exitCalls; }
  };
}

const base = {
  version: 13,
  profile: { firstName: "Test", lastName: "Üye", setupComplete: true },
  assignments: [],
  assignment: null,
  selectedProgramId: "",
  trainer: { enabled: false, members: [] },
  messages: [],
  history: [],
  currentWorkout: null
};

const empty = runApp(base);
assert.deepEqual(empty.state().assignments, [], "Sıfır antrenman durumu yeniden yüklenince varsayılan program ekleniyor.");
assert.equal(empty.state().selectedProgramId, "", "Sıfır antrenmanda hayali seçili program oluşuyor.");
empty.back();
assert.equal(empty.exitCalls(), 1, "Kök sekmede Android geri tuşu uygulamadan çıkmıyor.");

const sheet = runApp(base);
sheet.elements.sheetLayer.classList.add("active");
sheet.back();
assert.equal(sheet.exitCalls(), 0, "Açık alt sayfada geri tuşu uygulamadan çıktı.");
assert.equal(sheet.elements.sheetLayer.classList.contains("active"), false, "Geri tuşu açık alt sayfayı kapatmadı.");

const workout = runApp(Object.assign({}, base, {
  assignments: [{ programId: "starter", dayId: "day-1", assignedBy: "Antrenör" }],
  selectedProgramId: "starter",
  currentWorkout: {
    id: "runtime-workout",
    programId: "starter",
    dayId: "day-1",
    exerciseIndex: 0,
    setIndex: 0,
    startedAt: new Date().toISOString(),
    logs: {},
    swaps: {},
    skipped: [],
    status: "active"
  }
}));
workout.elements.flowLayer.classList.add("active");
workout.elements.flowLayer.matchWorkout = true;
workout.back();
assert.equal(workout.exitCalls(), 0, "Antrenman sırasında geri tuşu uygulamadan çıktı.");
assert.equal(workout.elements.sheetLayer.classList.contains("active"), true, "Antrenman geri tuşu iptal onayını açmadı.");
assert.match(workout.elements.sheetLayer.innerHTML, /Antrenman iptal edilsin mi\?/, "İptal onayı içeriği yanlış.");

console.log("FitTrack Beta 0.11.3 tarayıcısız çalışma zamanı ve Android geri testi: PASS");
