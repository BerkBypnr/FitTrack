'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const { fresh, runtime, cloudRuntime } = require('./review/harness.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const dom = html => parseHTML('<html><body>' + html + '</body></html>').document;
const results = [];
async function test(name, run) {
  try { await run(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}
(async () => {
  await test('Approved three-piece FT logo is used by web, auth and Android icon', () => {
    const sources = [read('app.js'), read('cloud.js'), read('icon.svg'), read('android/app/src/main/res/drawable/fittrack_app_icon.xml')];
    for (const source of sources) {
      assert.match(source, /M10[ ,]43C13[ ,]27/);
      assert.match(source, /M11[ ,]44C12[ ,]39/);
      assert.match(source, /M49[ ,]49H70/);
    }
  });
  await test('Name and gender are present once in the single profile form', () => {
    const r = fresh();r.app.state.profile.setupComplete=false;r.app.openProfileWizard();const d = dom(r.elements.flowLayer.innerHTML);
    assert.equal(d.querySelectorAll('[data-edit-profile="name"]').length, 1);
    assert.equal(d.querySelectorAll('[data-edit-profile="gender"]').length, 1);
    assert.equal(d.querySelectorAll('[data-action="profile-gender"]').length, 0);
  });
  await test('Age and height use direct numeric fields without legacy wheels', () => {
    const r = fresh();r.app.state.profile.setupComplete=false;r.app.openProfileWizard();const d = dom(r.elements.flowLayer.innerHTML);
    assert.equal(d.querySelectorAll('[data-edit-profile="age"]').length,1);assert.equal(d.querySelectorAll('[data-edit-profile="height"]').length,1);
    assert.equal(d.querySelectorAll('[role="spinbutton"]').length,0);assert.equal(d.querySelectorAll('[data-profile-wizard]').length,0);
  });
  await test('Legacy six-step profile recovery maps to the new seven-step flow', () => {
    const r = fresh(); const key = r.app.profileDraftRecoveryKey();
    r.store.set(key, JSON.stringify({ schema: 14, step: 3, draft: { firstName: 'Ayşe', lastName: 'Demir', height: '168', age: '31', units: 'kg', goal: 'fit' } }));
    const next = runtime(null, new Map(r.store));
    assert.equal(next.app.ui.onboardingStep, 4);
    assert.equal(next.app.ui.onboardingDraft.height, '168');
  });
  await test('Four palettes keep stable keys and expose distinct Turkish names', () => {
    const r = fresh(); r.app.openThemeSheet(); const text = dom(r.elements.sheetLayer.innerHTML).body.textContent;
    for (const name of ['Kızıl Güç', 'Mürdüm Gece', 'Fildişi Enerji', 'Bordo Asalet']) assert.ok(text.includes(name));
    assert.equal(dom(r.elements.sheetLayer.innerHTML).querySelectorAll('[data-action="select-theme"]').length, 4);
  });
  await test('Password reuse and invalid OTP errors are explained in Turkish', async () => {
    const r = await cloudRuntime();
    assert.equal(r.c.authError({ message: 'New password should be different from the old password.' }), 'Yeni şifren eski şifrenle aynı olamaz. Farklı bir şifre belirle.');
    assert.match(r.c.authError({ code: 'otp_expired', message: 'Token has expired' }), /Kod hatalı veya süresi dolmuş/);
  });
  await test('Version advances without changing schema or package identity', () => {
    assert.match(read('app.js'), /var VERSION = "0\.14\.4"/);
    assert.match(read('app.js'), /var SCHEMA = 15/);
    assert.match(read('android/app/build.gradle'), /versionCode 36/);
    assert.match(read('android/app/build.gradle'), /versionName "0\.14\.4"/);
    assert.match(read('android/app/src/main/AndroidManifest.xml'), /com\.fittracklabs\.mobile/);
  });
  fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test-results/hotfix-0131.json'), JSON.stringify({ method: 'VM + parsed DOM + static native checks; no live accounts or SMTP.', results }, null, 2));
  for (const item of results) console.log(item.status, item.name, item.error || '');
  if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
})();
