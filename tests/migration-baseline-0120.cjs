'use strict';
// Pre-migration contracts against the real 0.12.0 functions. Synthetic data only.
// A VM / in-memory storage / plugin double is NOT a WebView upgrade or device test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fresh, runtime, setupWorkout, cloudRuntime, clone } = require('./review/harness.cjs');
const root = path.resolve(__dirname, '..');
const results = [];
const equal = (a, b) => assert.deepEqual(clone(a), clone(b));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

async function test(name, run) {
  try { await run(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}
function member() {
  const r = fresh();
  r.app.activateAccount('migration-user-A', 'a@example.invalid');
  r.app.activateGym('migration-gym-A');
  const program = setupWorkout(r);
  r.app.state.profile.firstName = 'Migration';
  r.app.state.profile.setupComplete = true;
  r.app.getCurrentLog().weight = '42.5';
  r.app.getCurrentLog().reps = '9';
  r.app.saveState({ remote: true });
  return { r, program };
}
function draft(r, program) {
  r.app.ui.editorDraft = r.app.editorDraftFromProgram(program, false);
  r.app.ui.editorDraft.name = 'Unsaved migration draft';
  r.app.ui.editorDraft.days[0].exercises[0].coachNote = 'Keep my exact note';
  r.app.ui.studioStep = 3;
  r.app.saveEditorRecovery();
  return clone(r.app.ui.editorDraft);
}
function native(r, plugins) {
  r.window.Capacitor = { isNativePlatform: () => true, Plugins: plugins };
}
function restoredWorkout(actual, before) {
  // Existing reload normalizes missing/default fields (e.g. null restDuration -> 0).
  // Compare the full canonical workout, allowing only the save timestamp to advance.
  // Keep this oracle independent of the production normalizer so a future change
  // that drops a snapshot/log/identifier cannot normalize both sides into a pass.
  const expected = { ...clone(before), duration: before.duration ?? null,
    finishedAt: before.finishedAt ?? null, orphaned: before.orphaned ?? false,
    partial: before.partial ?? false, pauseRemaining: before.pauseRemaining ?? 0,
    restDuration: before.restDuration ?? 0 };
  for (const sets of Object.values(expected.logs)) {
    for (const [key, log] of Object.entries(sets)) {
      sets[key] = { weight: log.weight, reps: log.reps,
        completedAt: log.completedAt ?? null, carried: log.carried ?? false };
    }
  }
  const restored = clone(actual);
  assert.ok(restored.updatedAt >= expected.updatedAt, 'workout timestamp went backwards');
  delete expected.updatedAt; delete restored.updatedAt;
  equal(restored, expected);
}

(async () => {
  await test('State mirrors keep the existing global, account and account-gym keys', () => {
    const { r } = member();
    const state = r.store.get('fittrack-beta-010-state');
    assert.equal(r.store.get('fittrack-beta-010-user-migration-user-A'), state);
    assert.equal(r.store.get('fittrack-beta-010-user-migration-user-A-gym-migration-gym-A'), state);
  });
  await test('App reload preserves active snapshot, typed values, profile and selected theme', () => {
    const { r } = member();
    r.app.selectTheme('redline-editorial');
    assert.equal(r.app.state.theme, 'redline-editorial');
    const before = clone(r.app.state);
    const next = runtime(null, new Map(r.store));
    restoredWorkout(next.app.state.currentWorkout, before.currentWorkout);
    equal(next.app.state.profile, before.profile);
    assert.equal(next.app.state.theme, before.theme);
    assert.equal(next.app.getCurrentLog().weight, '42.5');
    assert.equal(next.app.getCurrentLog().reps, '9');
  });
  await test('Gym switching isolates state and restores the original active workout', () => {
    const { r } = member();
    const before = clone(r.app.state.currentWorkout);
    r.app.activateGym('migration-gym-B');
    assert.equal(r.app.state.currentWorkout, null);
    assert.equal(r.app.state.customPrograms.length, 0);
    r.app.activateGym('migration-gym-A');
    restoredWorkout(r.app.state.currentWorkout, before);
  });
  await test('Account switching cannot inherit another user workout and can restore its owner', () => {
    const { r } = member();
    const before = clone(r.app.state.currentWorkout);
    r.app.activateAccount('migration-user-B', 'b@example.invalid');
    assert.equal(r.app.state.currentWorkout, null);
    assert.equal(r.app.state.customPrograms.length, 0);
    r.app.activateAccount('migration-user-A', 'a@example.invalid');
    restoredWorkout(r.app.state.currentWorkout, before);
  });
  await test('Program editor recovery retains exact day/set/note data after reload', () => {
    const { r, program } = member(); const saved = draft(r, program);
    const next = runtime(null, new Map(r.store));
    next.app.restoreEditorRecovery();
    equal(next.app.ui.editorDraft.days, saved.days);
    assert.equal(next.app.ui.editorDraft.name, saved.name);
    assert.equal(next.app.ui.studioStep, 3);
  });
  await test('Editor recovery is scoped to both the account and gym', () => {
    const { r, program } = member(); draft(r, program);
    const key = 'fittrack-beta-0114-editor-migration-user-A-migration-gym-A';
    assert.ok(r.store.has(key));
    r.app.activateGym('migration-gym-B');
    assert.equal(r.app.getEditorRecovery(), null);
    r.app.activateAccount('migration-user-B', 'b@example.invalid');
    assert.equal(r.app.getEditorRecovery(), null);
    assert.ok(r.store.has(key));
  });
  await test('All eight supported legacy state keys still migrate readable profile data', () => {
    const keys = ['09', '08', '07', '06', '05', '04'].map(x => `fittrack-beta-${x}-state`)
      .concat(['fittrack-v4-state', 'fittrack-v3-state']);
    for (const key of keys) {
      const saved = fresh().app.defaultState(false); saved.profile.firstName = 'Legacy';
      const r = runtime(null, new Map([[key, JSON.stringify(saved)]]));
      assert.equal(r.app.state.profile.firstName, 'Legacy', key);
      assert.equal(r.app.state.cloud.migrationSource, key);
    }
  });
  await test('Legacy ownership can be claimed once and is not inherited by a second account', () => {
    const saved = fresh().app.defaultState(false); saved.profile.firstName = 'LegacyOwner';
    const r = runtime(null, new Map([['fittrack-beta-09-state', JSON.stringify(saved)]]));
    r.app.activateAccount('migration-user-A', 'a@example.invalid');
    assert.equal(r.store.get('fittrack-beta-010-legacy-claimed-by'), 'migration-user-A');
    assert.equal(r.app.state.profile.firstName, 'LegacyOwner');
    r.app.activateAccount('migration-user-B', 'b@example.invalid');
    assert.notEqual(r.app.state.profile.firstName, 'LegacyOwner');
  });
  await test('Workout cancellation tombstones survive reload and reject a stale snapshot', () => {
    const { r } = member(); const old = clone(r.app.getCloudSnapshot());
    const id = r.app.state.currentWorkout.syncId; r.app.cancelWorkout();
    const next = runtime(null, new Map(r.store)); next.app.applyRemoteSnapshot(old);
    assert.equal(next.app.state.currentWorkout, null);
    assert.ok(next.app.state.closedWorkoutIds[id]);
  });
  await test('History deletion tombstones remain after a restart', () => {
    const { r } = member();
    r.app.state.deletedHistoryIds = ['synthetic-deleted-workout'];
    r.app.saveState({ remote: true });
    const next = runtime(null, new Map(r.store));
    equal(next.app.state.deletedHistoryIds, ['synthetic-deleted-workout']);
  });
  await test('Application load does not rename or overwrite the stored Auth session', () => {
    const token = JSON.stringify({ marker: 'synthetic-session-not-a-token' });
    const store = new Map([['fittrack-beta-010-auth', token]]);
    runtime(null, store);
    assert.equal(store.get('fittrack-beta-010-auth'), token);
  });
  await test('Cloud SDK initialization keeps the explicit Auth storage key and refresh options', async () => {
    const r = await cloudRuntime();
    r.window.FITTRACK_CONFIG.localPreviewOnDesktop = false;
    let options;
    r.window.supabase = { createClient: (_url, _key, value) => {
      options = value; throw new Error('CAPTURE_ONLY_NO_NETWORK');
    } };
    await assert.rejects(r.c.boot(), /CAPTURE_ONLY_NO_NETWORK/);
    equal(options.auth, { persistSession: true, autoRefreshToken: true,
      detectSessionInUrl: true, storageKey: 'fittrack-beta-010-auth' });
  });
  await test('Queued mutations survive reload with gym, owner and revision intact', async () => {
    const r = await cloudRuntime();
    r.c.enqueue('note', { memberId: 'synthetic-member', note: 'Keep queued note' }, 'note:gym-A:synthetic-member');
    const saved = clone(r.c.queue());
    const next = await cloudRuntime();
    for (const [key, value] of r.store) next.store.set(key, value);
    equal(next.c.queue(), saved);
    assert.equal(saved[0].gymId, 'gym-A'); assert.ok(saved[0].userId && saved[0].revision);
  });
  await test('Queue separation and stale acknowledgement cannot discard newer work', async () => {
    const r = await cloudRuntime();
    const id = 'note:gym-A:synthetic-member';
    r.c.enqueue('note', { note: 'old' }, id); const old = clone(r.c.queue()[0]);
    r.c.enqueue('note', { note: 'new' }, id);
    r.c.removeQueueItem(old.id, old.revision);
    assert.equal(r.c.queue().length, 1); assert.equal(r.c.queue()[0].payload.note, 'new');
    r.c.setContext({ session: { user: { id: 'migration-user-B' } } });
    assert.equal(r.c.queue().length, 0);
  });
  await test('Device, gym, invite, snapshot and deletion keys retain their existing scopes', async () => {
    const r = await cloudRuntime(); const user = r.c.session.user.id;
    assert.equal(r.c.queueKey(), `fittrack-beta-010-queue-${user}`);
    assert.equal(r.c.snapshotKey(), `fittrack-beta-010-snapshot-version-${user}-gym-A`);
    assert.equal(r.c.activeGymKey(), `fittrack-beta-010-active-gym-${user}`);
    assert.equal(r.c.lastInviteKey(), `fittrack-beta-010-last-invite-${user}-gym-A`);
    assert.equal(r.c.deletionAckKey(r.c.captureContext()), `fittrack-deletion-acks:${user}:gym-A`);
    const id = r.c.deviceId(); assert.equal(r.c.deviceId(), id);
    assert.equal(r.store.get(`fittrack-beta-010-device-id-${user}`), id);
  });
  await test('Native JSON export writes UTF-8 to CACHE then shares the resulting URI', async () => {
    const r = fresh(), calls = [];
    native(r, {
      Filesystem: { writeFile: async v => { calls.push(['write', clone(v)]); return { uri: 'content://synthetic/file.json' }; } },
      Share: { share: async v => { calls.push(['share', clone(v)]); } }
    });
    await r.app.exportJsonFile('migration.json', '{"sentetik":"ş"}', 'Migration test');
    equal(calls[0], ['write', { path: 'migration.json', data: '{"sentetik":"ş"}', directory: 'CACHE', encoding: 'utf8', recursive: true }]);
    assert.equal(calls[1][0], 'share'); assert.equal(calls[1][1].url, 'content://synthetic/file.json');
  });
  await test('Missing native share plugin fails explicitly without pretending to download', async () => {
    const r = fresh(); native(r, {});
    await assert.rejects(r.app.exportJsonFile('test.json', '{}', 'Test'), /NATIVE_SHARE_UNAVAILABLE/);
  });
  await test('A failed native file write never opens the share sheet', async () => {
    const r = fresh(); let shares = 0;
    native(r, { Filesystem: { writeFile: async () => ({}) }, Share: { share: async () => { shares++; } } });
    await assert.rejects(r.app.exportJsonFile('test.json', '{}', 'Test'), /BACKUP_WRITE_FAILED/);
    assert.equal(shares, 0);
  });
  await test('Exact alarm denial cancels reminders and does not schedule an alarm', async () => {
    const r = fresh(); let scheduled = 0, cancelled = 0;
    r.app.state.reminder = { enabled: true, time: '18:30', days: [1, 3] };
    native(r, { LocalNotifications: {
      checkExactNotificationSetting: async () => ({ exact_alarm: 'denied' }),
      cancel: async () => { cancelled++; }, schedule: async () => { scheduled++; }
    } });
    assert.equal(await r.app.scheduleReminderNotifications(false), false);
    assert.equal(scheduled, 0); assert.equal(cancelled, 1);
  });
  await test('Reminder bridge preserves notification IDs, weekdays and time after permission', async () => {
    const r = fresh(); let schedule;
    r.app.state.reminder = { enabled: true, time: '18:30', days: [1, 3] };
    native(r, { LocalNotifications: {
      checkExactNotificationSetting: async () => ({ exact_alarm: 'granted' }),
      cancel: async () => {}, schedule: async v => { schedule = clone(v); },
      getPending: async () => ({ notifications: [{ id: 7102 }, { id: 7104 }] })
    } });
    assert.equal(await r.app.scheduleReminderNotifications(false), true);
    equal(schedule.notifications.map(x => x.id), [7102, 7104]);
    equal(schedule.notifications.map(x => x.schedule.on), [
      { weekday: 2, hour: 18, minute: 30, second: 0 }, { weekday: 4, hour: 18, minute: 30, second: 0 }
    ]);
  });
  await test('App listeners register once and a handled web Back does not exit', () => {
    const { r } = member(); const listeners = [], callbacks = {}; let exits = 0;
    native(r, { App: { addListener: (name, cb) => { listeners.push(name); callbacks[name] = cb; }, exitApp: () => { exits++; } } });
    r.app.registerNativeBackButton(); r.app.registerNativeBackButton();
    equal(listeners, ['backButton', 'appStateChange']);
    r.app.startWorkout(); callbacks.backButton();
    assert.equal(exits, 0); assert.ok(r.elements.sheetLayer.innerHTML.includes('dismiss-workout-cancel'));
  });
  await test('Auth deep link plugin registers once and checks cold launch URLs', async () => {
    const r = await cloudRuntime(); let listeners = 0, launches = 0;
    native(r, { App: { addListener: async (name) => { assert.equal(name, 'appUrlOpen'); listeners++; return { remove() {} }; },
      getLaunchUrl: async () => { launches++; return null; } } });
    assert.equal(await r.c.registerAuthDeepLinks(), false);
    assert.equal(await r.c.registerAuthDeepLinks(), false);
    assert.equal(listeners, 1); assert.equal(launches, 2);
  });
  await test('Native origin configuration retains HTTPS without a remote server override', () => {
    const config = JSON.parse(read('capacitor.config.json'));
    assert.equal(config.appId, 'com.fittracklabs.mobile');
    assert.equal(config.server.androidScheme, 'https');
    assert.equal(config.server.hostname || 'localhost', 'localhost');
    assert.ok(!config.server.url);
    assert.equal(config.android.allowMixedContent, false);
    assert.equal(config.android.webContentsDebuggingEnabled, false);
    assert.equal(config.server.hostname, 'localhost');
  });
  await test('Android plugin inventory and protected manifest contract remain unchanged', () => {
    equal(JSON.parse(read('android/app/src/main/assets/capacitor.plugins.json')).map(x => x.pkg).sort(),
      ['@capacitor/app', '@capacitor/filesystem', '@capacitor/local-notifications', '@capacitor/share']);
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    for (const value of ['android:allowBackup="false"', 'android:usesCleartextTraffic="false"', 'android:launchMode="singleTask"',
      'android:host="auth-callback"', 'android:scheme="com.fittracklabs.mobile"', '${applicationId}.fileprovider']) assert.ok(manifest.includes(value), value);
    assert.match(read('android/app/build.gradle'), /debuggable false/);
    assert.match(read('android/app/build.gradle'), /applicationId "com.fittracklabs.mobile"/);
    assert.match(read('android/app/src/main/res/xml/file_paths.xml'), /<cache-path name="fittrack_shared_cache" path="\."/);
  });
  await test('Original Android dispatcher delegates to the web handler and backgrounds at the root', () => {
    const source = read('android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java');
    assert.ok(source.includes('window.FitTrackNativeBack'));
    assert.ok(source.includes('handleOnBackPressed() { dispatchFitTrackBack(); }'));
    assert.ok(source.includes('if (!"true".equals(value)) moveTaskToBack(true)'));
  });

  const output = path.join(root, 'test-results/migration-baseline-0120.json');
  fs.writeFileSync(output, JSON.stringify({ phase: '0.12.0 B', applicationVersion: '0.12.0',
    method: 'Source functions in Node VM; synthetic localStorage; native plugin doubles and static Java/Gradle/XML checks. No Android upgrade, real browser, SMTP, live server or device execution.', results }, null, 2));
  for (const item of results) console.log(item.status, item.name, item.error || '');
  console.log(JSON.stringify({ total: results.length, passed: results.filter(x => x.status === 'PASS').length }));
  if (results.some(x => x.status === 'FAIL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
