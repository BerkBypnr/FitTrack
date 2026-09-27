'use strict';
// Local VM + parsed DOM checks. No browser, phone, server or live account.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseHTML} = require('linkedom');
const {fresh, setupWorkout, root} = require('./review/harness.cjs');
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const dom = html => parseHTML('<html><body>' + html + '</body></html>').document;
function fixture() {
  const r = fresh();
  const program = setupWorkout(r);
  r.app.closeCurrentWorkout();
  r.app.state.cloud.role = 'trainer';
  r.app.state.cloud.userId = 'coach-test';
  r.app.state.trainer.members = [];
  function member(id, overrides = {}) {
    const value = {id, name: id, isSelf: false, joinedAt: r.app.todayKey(), assignments: [{programId: program.id}], history: [], note: '', ...overrides};
    r.app.state.trainer.members.push(value);
    return value;
  }
  return {r, member, program};
}
test('Home shows at most three priorities and the full filter retains every match', () => {
  const {r, member} = fixture();
  for (let i = 0; i < 5; i++) member('Üye ' + i, {assignments: []});
  member('Antrenör', {isSelf: true, assignments: []});
  r.app.renderHome();
  let d = dom(r.elements.screen.innerHTML);
  assert.equal(d.querySelectorAll('.priority-member-list .trainer-member-card').length, 3);
  assert.equal(d.querySelector('.trainer-count').textContent, '5');
  r.app.ui.trainerQuery = 'old search';
  r.click('trainer-open-filter', {filter: 'priority'});
  assert.equal(r.app.ui.trainerQuery, '');
  d = dom(r.elements.flowLayer.innerHTML);
  assert.equal(d.querySelectorAll('.trainer-member-card').length, 5);
  assert.deepEqual([...d.querySelectorAll('.trainer-filters button')].map(x => x.textContent), ['Tümü', 'Öncelikli', 'Programsız']);
});
test('No-program filter distinguishes missing program details from missing assignment', () => {
  const {r, member} = fixture();
  member('Empty', {assignments: []});
  const unresolved = member('Unresolved', {assignments: [{programId: 'not-loaded'}]});
  r.app.ui.trainerFilter = 'no-program';
  assert.deepEqual(Array.from(r.app.trainerFilteredMembers(), x => x.id), ['Empty']);
  assert.match(r.app.renderTrainerMemberCard(unresolved), /Program bilgisi bekleniyor/);
});
test('Fresh partial session counts as activity; future records cannot make a member current', () => {
  const {r, member} = fixture();
  const partial = member('Partial', {joinedAt: r.app.addDays(r.app.todayKey(), -20), history: [{date: r.app.todayKey(), status: 'partial', name: 'A'}]});
  const future = member('Future', {joinedAt: r.app.addDays(r.app.todayKey(), -20), history: [{date: r.app.addDays(r.app.todayKey(), 1), status: 'completed', name: 'B'}]});
  assert.equal(r.app.memberAttention(partial).score, 0);
  assert.ok(r.app.memberAttention(future).score > 0);
  r.app.renderHome();
  assert.equal(dom(r.elements.screen.innerHTML).querySelectorAll('.trainer-recent-list > button').length, 1);
});
test('Unread priority uses incoming, unread messages addressed to this coach', () => {
  const {r, member} = fixture();
  const a = member('A'), b = member('B');
  r.app.state.messages = [
    {id: '1', senderId: 'A', recipientId: 'coach-test', body: 'Help', readAt: ''},
    {id: '2', senderId: 'B', recipientId: 'another-coach', body: 'Private', readAt: ''},
    {id: '3', senderId: 'B', recipientId: 'coach-test', body: 'Old', readAt: new Date().toISOString()}
  ];
  assert.equal(r.app.memberAttention(a).unread, 1);
  assert.equal(r.app.memberAttention(b).unread, 0);
  assert.deepEqual(Array.from(r.app.trainerPriorityMembers(), x => x.member.id), ['A']);
  assert.match(r.app.renderTrainerMemberCard(a), /Yanıtla/);
});
test('Programsiz and Turkish name search combine without mutating roster or assignments', () => {
  const {r, member} = fixture();
  member('i', {name: 'İlker', assignments: []});
  member('a', {name: 'Alper', assignments: []});
  const before = JSON.stringify(r.app.state.trainer);
  r.app.ui.trainerFilter = 'no-program';
  r.app.ui.trainerQuery = 'ilker';
  assert.deepEqual(Array.from(r.app.trainerFilteredMembers(), x => x.id), ['i']);
  r.app.renderTrainerPanel();
  assert.equal(JSON.stringify(r.app.state.trainer), before);
});
test('Program assignment shortcut only opens the existing form; it does not assign', () => {
  const {r, member} = fixture();
  const a = member('A', {assignments: []});
  r.click('trainer-assign-shortcut', {memberId: a.id});
  assert.equal(r.app.ui.trainerMemberId, a.id);
  assert.ok(dom(r.elements.flowLayer.innerHTML).querySelector('#trainerProgram'));
  assert.equal(a.assignments.length, 0);
});
test('Empty staff roster shows explicit empty states and no invented workouts', () => {
  const {r} = fixture();
  r.app.renderHome();
  const d = dom(r.elements.screen.innerHTML);
  assert.equal(d.querySelectorAll('.trainer-member-card').length, 0);
  assert.match(d.body.textContent, /Öncelikli işlem görünmüyor/);
  assert.equal(d.querySelector('[data-action="start-assigned-program"]'), null);
  assert.equal(d.querySelector('.trainer-count').textContent, '0');
});
test('Untrusted member and program names render as text, without injected elements', () => {
  const {r, member, program} = fixture();
  program.name = '<script>bad()</script>';
  const a = member('A', {name: '<img src=x onerror=bad()>'});
  const d = dom(r.app.renderTrainerMemberCard(a));
  assert.equal(d.querySelector('img, script'), null);
  assert.ok(d.body.textContent.includes('<img src=x onerror=bad()>'));
});
test('Member role keeps workout home and cannot invoke new trainer shortcuts', () => {
  const {r, member} = fixture();
  const a = member('A', {assignments: []});
  r.app.state.cloud.role = 'member';
  r.app.renderHome();
  assert.ok(dom(r.elements.screen.innerHTML).querySelector('.member-home'));
  assert.equal(dom(r.elements.screen.innerHTML).querySelector('.trainer-home'), null);
  r.click('trainer-assign-shortcut', {memberId: a.id});
  assert.equal(r.app.ui.trainerMemberId, '');
});
test('Shared Redline palette matches the reference and all themes retain staff/member separation', () => {
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const block = css.match(/html\[data-theme="redline-editorial"\] \{([\s\S]*?)\n\}/)[1];
  for (const [token, color] of Object.entries({'--mint': '#d9362b', '--mint-strong': '#b92520', '--mint-soft': '#f8ddd8', '--primary-start': '#d9362b', '--primary-end': '#b92520', '--on-accent': '#ffffff'})) {
    assert.ok(block.includes(token + ': ' + color + ';'));
  }
  assert.ok(!/#f15a32|#e84a25/i.test(block));
  assert.doesNotThrow(() => require('cssom').parse(css));
  for (const theme of ['dark-red', 'plum-night', 'redline-editorial', 'rosewood-strength']) {
    const {r} = fixture(); r.app.state.theme = theme; r.app.render();
    assert.equal(r.document.documentElement.dataset.theme, theme);
    assert.ok(dom(r.elements.screen.innerHTML).querySelector('.trainer-home'));
    r.app.state.cloud.role = 'member'; r.app.render();
    assert.equal(r.document.documentElement.dataset.theme, theme);
    assert.ok(dom(r.elements.screen.innerHTML).querySelector('.member-home'));
  }
});
let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('PASS', name); }
  catch (error) { failed++; console.error('FAIL', name, error.stack); }
}
console.log(`${tests.length - failed}/${tests.length} local trainer UI checks passed. Browser and phone verification pending.`);
process.exitCode = failed ? 1 : 0;
