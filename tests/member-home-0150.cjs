"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseHTML } = require("linkedom");
const { fresh, setupWorkout, clone } = require("./review/harness.cjs");

const root = path.resolve(__dirname, "..");
const results = [];
const dom = html => parseHTML("<html><body>" + html + "</body></html>").document;
function test(name, run) {
  try { run(); results.push({ name, status: "PASS" }); }
  catch (error) { results.push({ name, status: "FAIL", error: error.message.slice(0, 1100) }); }
}

function addSecondProgram(runtime, first) {
  const second = runtime.app.normalizeCustomProgram({ ...clone(first), id: "second-program", name: "İkinci program" });
  runtime.app.state.customPrograms.push(second);
  runtime.app.refreshPrograms();
  runtime.app.state.assignments.push(runtime.app.normalizeAssignment({ programId: second.id }, 1, "Antrenör"));
  return second;
}

test("All assigned programs render as equal carousel items with explicit choices", () => {
  const runtime = fresh();
  const first = setupWorkout(runtime);
  runtime.app.closeCurrentWorkout();
  const second = addSecondProgram(runtime, first);
  runtime.app.renderHome();
  const document = dom(runtime.elements.screen.innerHTML);
  const cards = [...document.querySelectorAll(".member-program-card")];
  assert.equal(cards.length, 2);
  assert.deepEqual(cards.map(card => card.dataset.programId), [first.id, second.id]);
  assert.deepEqual(cards.map(card => card.querySelector(".member-program-start").textContent.trim().startsWith("Antrenman seç")), [true, true]);
  assert.equal(document.querySelectorAll(".featured,.recommended,[aria-label*=önerilen i]").length, 0);
});

test("Program cards expose details and selection without changing the selected assignment during render", () => {
  const runtime = fresh();
  const first = setupWorkout(runtime);
  runtime.app.closeCurrentWorkout();
  addSecondProgram(runtime, first);
  const before = runtime.app.state.selectedProgramId;
  runtime.app.renderHome();
  const document = dom(runtime.elements.screen.innerHTML);
  for (const card of document.querySelectorAll(".member-program-card")) {
    assert.equal(card.querySelector("[data-action=assigned-program-detail]").dataset.programId, card.dataset.programId);
    assert.equal(card.querySelector("[data-action=start-assigned-program]").dataset.programId, card.dataset.programId);
  }
  assert.equal(runtime.app.state.selectedProgramId, before);
});

test("Home provides profile, messages, progress and all-program navigation", () => {
  const runtime = fresh();
  runtime.app.render();
  const document = dom(runtime.elements.screen.innerHTML);
  assert.ok(document.querySelector(".member-home-avatar[data-tab=profile]"));
  assert.ok(document.querySelector(".member-home-message[data-action=open-chat]"));
  assert.ok(document.querySelector(".member-section-head [data-tab=programs]"));
  assert.equal(document.querySelectorAll(".member-quick-stats [data-tab=progress]").length, 3);
});

test("Carousel is touch-scrollable, snapping and theme-token based", () => {
  const css = fs.readFileSync(path.join(root, "member-ui.css"), "utf8");
  assert.match(css, /\.member-program-carousel\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.member-program-carousel\s*\{[^}]*scroll-snap-type:\s*x mandatory/s);
  assert.match(css, /\.member-program-card\s*\{[^}]*scroll-snap-align:\s*start/s);
  assert.match(css, /\.member-program-start\s*\{[^}]*background:\s*var\(--mint\)/s);
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(css));
});

test("Staff home remains outside the member home contract", () => {
  const runtime = fresh();
  runtime.app.state.cloud.role = "trainer";
  runtime.app.render();
  const document = dom(runtime.elements.screen.innerHTML);
  assert.ok(document.querySelector(".trainer-home"));
  assert.equal(document.querySelector(".member-home"), null);
  assert.equal(runtime.elements.topbar.classList.contains("minimal-hidden"), false);
});

fs.mkdirSync(path.join(root, "test-results"), { recursive: true });
fs.writeFileSync(path.join(root, "test-results/member-home-0150.json"), JSON.stringify({
  method: "Node VM + Linkedom DOM + static CSS contract; not a rendered browser or physical phone test",
  results
}, null, 2));
for (const result of results) console.log(result.status, result.name, result.error || "");
console.log(JSON.stringify({ total: results.length, passed: results.filter(item => item.status === "PASS").length, failed: results.filter(item => item.status === "FAIL").length }));
if (results.some(item => item.status === "FAIL")) process.exitCode = 1;
