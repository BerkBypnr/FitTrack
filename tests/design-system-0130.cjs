'use strict';
// Real production functions in VM + parsed DOM; no live accounts or email.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const { fresh, runtime, cloudRuntime, clone } = require('./review/harness.cjs');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const dom = html => parseHTML('<html><body>' + html + '</body></html>').document;
const results = [];
async function test(name, run) { try { await run(); results.push({name, status:'PASS'}); } catch (e) { results.push({name,status:'FAIL',error:e.message}); } }
(async () => {
  await test('Every previous theme has a deterministic dark/light-preserving migration', () => {
    const mapping = {'volt-discipline':'dark-red','crimson-graphite':'dark-red','sage-motion':'redline-editorial','plum-night':'plum-night','redline-editorial':'redline-editorial','rosewood-strength':'rosewood-strength',midnight:'dark-red',light:'redline-editorial',ocean:'redline-editorial',rose:'rosewood-strength',amber:'redline-editorial'};
    for (const [old, next] of Object.entries(mapping)) { const r = runtime({theme:old}); assert.equal(r.app.state.theme,next); r.app.saveState(); assert.equal(runtime(null,new Map(r.store)).app.state.theme,next); }
  });
  await test('Theme chooser exposes only the four approved choices', () => {
    const r=fresh(); r.app.openThemeSheet(); const d=dom(r.elements.sheetLayer.innerHTML);
    assert.equal(d.querySelectorAll('[data-action="select-theme"]').length,4);
    assert.ok(!d.body.textContent.includes('Volt Discipline')); assert.ok(!d.body.textContent.includes('Crimson Graphite'));
  });
  await test('Current profile draft resumes at the same step without converting values', () => {
    const r=fresh(); r.app.ui.onboardingDraft={firstName:'Ayşe',lastName:'Demir',age:'31',height:'168',currentWeight:'64.5',targetWeight:'60',units:'kg',goal:'fit'};r.app.ui.onboardingStep=4;r.app.saveProfileWizardRecovery();
    const next=runtime(null,new Map(r.store));assert.equal(next.app.ui.onboardingStep,4);assert.equal(next.app.ui.onboardingDraft.height,'168');assert.equal(next.app.ui.onboardingDraft.gender,'unspecified');
  });
  await test('Gender, strength goal and optional weight survive draft and final state reload', () => {
    const r=fresh();r.app.openProfileWizard(1);Object.assign(r.app.ui.onboardingDraft,{firstName:'Deniz',lastName:'Test',gender:'female',goal:'strength',targetWeight:''});r.app.ui.onboardingStep=7;r.app.saveProfileWizardRecovery();
    const next=runtime(null,new Map(r.store));assert.equal(next.app.ui.onboardingDraft.gender,'female');assert.equal(next.app.ui.onboardingDraft.goal,'strength');assert.equal(next.app.ui.onboardingDraft.targetWeight,'');
    next.app.finishProfileWizard(); const last=runtime(null,new Map(next.store));assert.equal(last.app.state.profile.targetWeight,null);assert.equal(last.app.state.profile.gender,'female');assert.equal(last.app.state.profile.goal,'strength');
  });
  await test('Age and height use one accessible wheel without a duplicate value field', () => {
    const r=fresh();for(const step of [3,4]){r.app.openProfileWizard(step);const d=dom(r.elements.flowLayer.innerHTML);assert.equal(d.querySelectorAll('[role="spinbutton"]').length,1);assert.equal(d.querySelectorAll('[data-profile-wizard]').length,0);assert.equal(d.querySelector('[autofocus]'),null);}
  });
  await test('Weight ruler and manual decimal input share a field key; target offers skip', () => {
    const r=fresh();r.app.openProfileWizard(5);let d=dom(r.elements.flowLayer.innerHTML);assert.equal(d.querySelector('[type="range"]').dataset.profileRange,'currentWeight');assert.equal(d.querySelector('[data-profile-wizard]').getAttribute('inputmode'),'decimal');r.app.openProfileWizard(6);d=dom(r.elements.flowLayer.innerHTML);assert.ok(d.querySelector('[data-action="profile-skip-target"]'));r.click('profile-skip-target');assert.equal(r.app.ui.onboardingStep,7);assert.equal(r.app.ui.onboardingDraft.targetWeight,'');
  });
  await test('Invalid age, out of range kilograms and nonnumeric values never advance', () => {
    const r=fresh();r.app.openProfileWizard(3);for(const value of ['13','101','22.5','oops']){r.app.ui.onboardingDraft.age=value;assert.equal(r.app.validateWizardStep(),false);}r.app.openProfileWizard(5);for(const value of ['','301','NaN','-1']){r.app.ui.onboardingDraft.currentWeight=value;assert.equal(r.app.validateWizardStep(),false);}r.app.ui.onboardingDraft.currentWeight='78.5';assert.equal(r.app.validateWizardStep(),true);
  });
  await test('Unit switches convert both draft values without modifying history before save', () => {
    const r=fresh();r.app.openProfileWizard(5);r.app.ui.onboardingDraft.currentWeight='80';r.app.ui.onboardingDraft.targetWeight='';const before=clone(r.app.state);r.click('profile-unit',{unit:'lb'});assert.equal(r.app.ui.onboardingDraft.currentWeight,'176.4');assert.equal(r.app.ui.onboardingDraft.targetWeight,'');assert.deepEqual(clone(r.app.state),before);r.click('profile-unit',{unit:'kg'});assert.equal(r.app.ui.onboardingDraft.currentWeight,'80');
  });
  await test('Profile names are escaped in new cards and cannot inject markup', () => {
    const r=fresh();r.app.openProfileWizard(1);r.app.ui.onboardingDraft.firstName='"><img src=x onerror=alert(1)>';r.app.renderProfileWizard();assert.equal(dom(r.elements.flowLayer.innerHTML).querySelector('img'),null);
  });
  await test('Welcome shows only real account actions, no demo user or exercise recommendation', async () => {
    const r=await cloudRuntime();r.c.renderWelcome();const d=dom(r.elements.authLayer.innerHTML);assert.ok(d.querySelector('.welcome-screen'));assert.equal(d.querySelectorAll('[data-cloud-action="auth-tab"]').length,2);assert.equal(d.querySelector('input'),null);assert.match(d.body.textContent,/Hoş geldin/);
  });
  await test('Login accepts old short passwords; signup and recovery enforce eight characters', async () => {
    const r=await cloudRuntime();r.c.renderAuth('login');let d=dom(r.elements.authLayer.innerHTML);assert.equal(d.querySelector('#authPassword').getAttribute('minlength'),null);assert.equal(d.querySelectorAll('.password-toggle').length,1);r.c.renderAuth('signup');d=dom(r.elements.authLayer.innerHTML);assert.equal(d.querySelectorAll('.password-toggle').length,2);assert.equal(d.querySelector('#authPassword').getAttribute('minlength'),'8');r.c.renderPasswordUpdate();assert.equal(dom(r.elements.authLayer.innerHTML).querySelector('#newPassword').getAttribute('minlength'),'8');
  });
  await test('Forgot-password opens an email form without sending a request', async () => {
    let count=0;const r=await cloudRuntime({auth:{resetPasswordForEmail:async()=>{count++;return{data:{},error:null};}}});r.c.renderAuth('login');await r.c.handleClick({dataset:{cloudAction:'forgot-password'}});assert.equal(count,0);assert.ok(dom(r.elements.authLayer.innerHTML).querySelector('[data-cloud-form="request-recovery"]'));
  });
  await test('Email code remains a single pasteable numeric input and timers are cleaned', async () => {
    const r=await cloudRuntime();const initial=r.intervals.size;r.c.renderConfirmation('deniz@example.invalid');const d=dom(r.elements.authLayer.innerHTML);assert.equal(d.querySelectorAll('#authOtp').length,1);assert.equal(d.querySelector('#authOtp').getAttribute('autocomplete'),'one-time-code');r.c.renderAuth('login');assert.equal(r.intervals.size,initial);
  });
  await test('New assets and stylesheet are staged and cached, no zoom lock remains', () => {
    assert.ok(!read('index.html').includes('user-scalable=no'));for(const name of ['design-system.css','assets/brand/welcome-dumbbell.png']){assert.ok(read('sw.js').includes(name));assert.ok(fs.existsSync(path.join(root,name)));}assert.ok(read('scripts/stage_web.cjs').includes('design-system.css'));assert.match(read('design-system.css'),/prefers-reduced-motion/);
  });
  await test('Native identity and schema stay fixed; version and FT branding advance intentionally', () => {
    assert.match(read('app.js'),/var SCHEMA = 15/);assert.match(read('android/app/build.gradle'),/versionCode 35/);assert.match(read('android/app/src/main/AndroidManifest.xml'),/com.fittracklabs.mobile/);assert.match(read('android/app/src/main/res/drawable/fittrack_app_icon.xml'),/M10,43C13,27/);assert.match(read('icon.svg'),/M10 43C13 27/);
  });
  fs.writeFileSync(path.join(root,'test-results/design-system-0130.json'),JSON.stringify({method:'VM + parsed DOM + static assets. No real Android/SMTP.',results},null,2));
  for(const r of results)console.log(r.status,r.name,r.error||'');
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})();
