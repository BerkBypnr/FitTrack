'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fresh, runtime, clone } = require('./review/harness.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const results = [];

async function test(name, run) {
  try { await run(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}

(async () => {
  await test('Unsaved profile fields and current step survive a WebView reload', () => {
    const first = fresh();
    first.app.activateAccount('profile-user-A', 'profile-a@example.invalid');
    first.app.activateGym('profile-gym-A');
    first.app.ui.onboardingDraft = { firstName: 'Aylin', lastName: 'Ay', age: '31', height: '168', currentWeight: '64.5', targetWeight: '60', units: 'kg', goal: 'fit' };
    first.app.ui.onboardingStep = 3;
    assert.equal(first.app.saveProfileWizardRecovery(), true);

    const next = runtime(null, new Map(first.store));
    assert.equal(next.app.ui.onboardingStep, 3);
    assert.equal(next.app.ui.onboardingDraft.firstName, 'Aylin');
    assert.equal(next.app.ui.onboardingDraft.lastName, 'Ay');
    assert.equal(next.app.ui.onboardingDraft.height, '168');
  });

  await test('Profile recovery is isolated by account and gym', () => {
    const r = fresh();
    r.app.activateAccount('profile-user-A', 'profile-a@example.invalid');
    r.app.activateGym('profile-gym-A');
    r.app.ui.onboardingDraft = { firstName: 'A', lastName: 'User', age: '30', height: '175', currentWeight: '80', targetWeight: '75', units: 'kg', goal: 'fit' };
    r.app.saveProfileWizardRecovery();
    const keyA = r.app.profileDraftRecoveryKey();
    r.app.activateAccount('profile-user-B', 'profile-b@example.invalid');
    assert.notEqual(r.app.profileDraftRecoveryKey(), keyA);
    assert.equal(r.app.restoreProfileWizardRecovery(), false);
  });

  await test('Native save uses the dedicated document saver and not the share sheet', async () => {
    const r = fresh(); const calls = [];
    r.window.Capacitor = { isNativePlatform: () => true, Plugins: {
      FitTrackFileSaver: { saveJson: async options => { calls.push(clone(options)); return { saved: true, uri: 'content://documents/backup.json' }; } }
    } };
    const result = await r.app.saveJsonFile('FitTrack-Yedek.json', '{"ok":true}');
    assert.equal(result.saved, true);
    assert.deepEqual(calls, [{ fileName: 'FitTrack-Yedek.json', content: '{"ok":true}', mimeType: 'application/json' }]);
  });

  await test('Privacy UI separates save-to-device from share', () => {
    const r = fresh(); r.app.openPrivacySheet();
    const html = r.elements.sheetLayer.innerHTML;
    assert.match(html, /data-action="save-data"/);
    assert.match(html, /Yedeği cihaza kaydet/);
    assert.match(html, /data-action="export-data"/);
    assert.match(html, /Yedeği paylaş/);
  });

  await test('Android saver uses ACTION_CREATE_DOCUMENT without storage permission', () => {
    const plugin = read('android/app/src/main/java/com/fittracklabs/mobile/FitTrackFileSaverPlugin.java');
    const activity = read('android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java');
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    assert.match(plugin, /Intent\.ACTION_CREATE_DOCUMENT/);
    assert.match(plugin, /application\/json/);
    assert.match(plugin, /StandardCharsets\.UTF_8/);
    assert.match(activity, /registerPlugin\(FitTrackFileSaverPlugin\.class\)/);
    assert.doesNotMatch(manifest, /WRITE_EXTERNAL_STORAGE|MANAGE_EXTERNAL_STORAGE/);
  });

  await test('Landscape keyboard layout keeps the focused profile field usable', () => {
    const css = read('styles.css');
    assert.match(css, /html\.fittrack-keyboard-open \.profile-wizard/);
    assert.match(css, /grid-template-rows: 0 0 minmax\(0, 1fr\) auto/);
    assert.match(read('app.js'), /scrollIntoView\(\{ block: "center" \}\)/);
  });

  const failed = results.filter(item => item.status === 'FAIL');
  console.log(JSON.stringify({ suite: 'hotfix-0122', results }, null, 2));
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
