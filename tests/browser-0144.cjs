'use strict';
const {chromium}=require(process.env.FITTRACK_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const out=path.resolve(__dirname,'../test-results/browser-0144');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'ui-preview-0130.cjs')],{stdio:['ignore','pipe','inherit']});
let browser;const results=[],errors=[];
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('server exit '+c)));});
 browser=await chromium.launch({executablePath:process.env.FITTRACK_CHROME,headless:true});
 const page=await browser.newPage({viewport:{width:360,height:800},deviceScaleFactor:1,hasTouch:true,reducedMotion:'reduce'});
 page.setDefaultTimeout(4000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:4178/');await page.waitForFunction(()=>window.__qa&&window.__qaCloud);await page.waitForTimeout(250);
 await page.evaluate(()=>{window.__qaCloud.hideLayer();const a=window.__qa;a.state=a.defaultState(false);a.state.profile.setupComplete=true;a.state.profile.firstName='Deniz';a.state.profile.lastName='Test';a.render();document.documentElement.style.setProperty('--safe-area-inset-top','28px');document.documentElement.style.setProperty('--safe-area-inset-bottom','16px');});
 async function shot(name){await page.waitForTimeout(350);await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}
 async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});await shot('FAIL-'+results.length);}}
 async function fixture(active=true){await page.evaluate(active=>{
  const a=window.__qa;a.closeSheet();a.closeFlow();a.state.currentWorkout=null;a.state.history=[];a.state.theme='dark-red';a.ui.onboardingDraft=null;a.clearProfileWizardRecovery();
  const move=a.cloneExerciseDefinition(a.catalogExercises()[0]);move.sets=3;move.coachNote='Hareketi kontrollü ve tam tekrar aralığında yap.';
  const p=a.normalizeCustomProgram({id:'qa144',name:'Güç & Hacim',status:'published',days:['Çekiş','İtiş','Bacak'].map((name,i)=>({id:'day-'+i,name,exercises:[move]}))});
  a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:p.days[0].id},0,'Berk')];a.state.assignment=a.state.assignments[0];a.state.selectedProgramId=p.id;a.ui.tab='programs';a.render();
  if(active){a.state.currentWorkout=a.newWorkout();a.renderWorkout();}
 },active);}
 await check('Session picker: compact heading, three horizontal rows, disabled neutral CTA',async()=>{
  await fixture(false);await page.evaluate(()=>window.__qa.openSessionPicker());
  const title=await page.locator('.session-picker-scroll h1').boundingBox();assert.ok(title.height<100,JSON.stringify(title));
  assert.equal(await page.locator('.session-option').count(),3);
  const row=await page.locator('.session-option').first().boundingBox(),date=await page.locator('.session-last').first().boundingBox(),name=await page.locator('.session-copy').first().boundingBox();
  assert.ok(row.height<110);assert.ok(date.x>=name.x+name.width-1);assert.ok(Math.abs(date.y-name.y)<25);
  assert.ok(await page.locator('.session-picker-footer button').isDisabled());assert.equal(await page.locator('.session-picker-footer button').evaluate(e=>getComputedStyle(e).backgroundImage),'none');await shot('01-seans');
 });
 await check('Active workout safe top; completed set retained after previous-set navigation',async()=>{
  await fixture();await page.waitForTimeout(350);const title=await page.locator('.member-player-top h1').boundingBox();assert.ok(title.y>=40,JSON.stringify(title));
  await page.locator('[data-log-set="0"][data-log-field="weight"]').fill('40');await page.locator('[data-log-set="0"][data-log-field="reps"]').fill('10');await page.locator('[data-action="complete-set"][data-set-index="0"]').click();
  await page.evaluate(()=>{const a=window.__qa;a.state.currentWorkout.setIndex=1;a.openWorkoutMenu();});
  const rows=page.locator('.workout-menu-list>button');assert.equal(await rows.count(),5);assert.equal(await rows.locator('svg').count(),5);assert.ok((await rows.first().boundingBox()).height<75);await shot('02-kontrol');
  await page.locator('[data-action="previous-workout-set"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.currentWorkout.setIndex),0);assert.ok(await page.evaluate(()=>window.__qa.getLog(0,0,false).completedAt));await shot('03-aktif');
 });
 await check('Exercise detail: full-width cue text, muscle labels, coach icon',async()=>{
  await page.evaluate(()=>{const a=window.__qa;a.renderExerciseDetail(a.currentExercise().id,{exercise:a.currentExercise()});});
  const cue=await page.locator('.exercise-detail-cues li>span').first().boundingBox();assert.ok(cue.width>250,JSON.stringify(cue));
  assert.equal(await page.locator('.coach-note svg').count(),1);assert.match(await page.locator('.exercise-detail-meta').innerText(),/Göğüs/);await shot('04-hareket');
 });
 await check('Single registration form: draft survives reload, invalid data rejected, valid data saved',async()=>{
  await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.closeFlow();a.state.profile.setupComplete=false;a.openProfileWizard();});
  assert.equal(await page.locator('[data-edit-profile]').count(),7);await page.locator('[data-edit-profile="name"]').fill('Aylin Ay');await page.locator('[data-edit-profile="age"]').fill('13');
  await page.locator('[data-action="save-profile-details"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.profile.setupComplete),false);
  await page.locator('[data-edit-profile="age"]').fill('28');await page.locator('[data-edit-profile="height"]').fill('170');await page.locator('[data-edit-profile="currentWeight"]').fill('78,5');await page.locator('[data-edit-profile="gender"]').selectOption('female');await page.reload();await page.waitForFunction(()=>document.querySelector('[data-edit-profile="name"]'));
  await page.evaluate(()=>window.__qaCloud.hideLayer());assert.equal(await page.locator('[data-edit-profile="name"]').inputValue(),'Aylin Ay');assert.equal(await page.locator('[data-edit-profile="currentWeight"]').inputValue(),'78,5');await shot('05-profil-formu');
  await page.locator('[data-action="save-profile-details"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.profile.setupComplete),true);assert.equal(await page.evaluate(()=>window.__qa.state.profile.currentWeight),78.5);
 });
 await check('OTP explanatory footer removed',async()=>{await page.evaluate(()=>window.__qaCloud.renderConfirmation('qa@example.com'));assert.equal(await page.locator('.auth-otp .auth-security').count(),0);await shot('06-kod');await page.evaluate(()=>window.__qaCloud.hideLayer());});
 await check('Programs restored to prior horizontal buttons; measurement icons distinct and latest date visible',async()=>{
  await fixture(false);const buttons=page.locator('.assigned-program-actions').first();assert.equal(await buttons.evaluate(e=>getComputedStyle(e).gridColumn),'1 / -1');await shot('07-programlar');
  await page.evaluate(()=>{const a=window.__qa;a.state.bodyMeasurements=[{id:'m1',date:a.todayKey(),modifiedAt:new Date().toISOString(),waist:82,neck:38,arm:34,hip:96}];a.ui.tab='progress';a.ui.progressSection='measurements';a.render();});
  const svgs=await page.locator('.body-grid svg').evaluateAll(es=>es.map(e=>e.innerHTML));assert.equal(new Set(svgs).size,4);assert.equal(await page.locator('.body-card-head small').count(),1);assert.equal(await page.locator('.body-history-row button svg').count(),1);await shot('08-olcumler');
 });
 await check('Four themes retained; cancellation uses theme CTA and trash icon; early finish uses warning',async()=>{
  await fixture();for(const theme of ['dark-red','plum-night','redline-editorial','rosewood-strength']){
   await page.evaluate(t=>{const a=window.__qa;a.state.theme=t;a.applyTheme();a.confirmCancel();},theme);
   assert.equal(await page.locator('.dialog-symbol svg').count(),1);const gradient=await page.locator('.delete-confirm .primary-btn').evaluate(e=>getComputedStyle(e).backgroundImage);assert.match(gradient,/linear-gradient/);assert.equal(await page.locator('.delete-confirm .danger-btn').count(),0);await shot('09-iptal-'+theme);
  }
  await page.evaluate(()=>{const a=window.__qa;a.state.theme='dark-red';a.applyTheme();a.confirmFinishEarly();});assert.equal(await page.locator('.dialog-symbol.warning svg').count(),1);await shot('10-erken');await page.evaluate(()=>window.__qa.closeSheet());
 });
 await check('Pause, resume, partial summary, deletion and orphan recovery',async()=>{
  await fixture();await page.locator('[data-log-set="0"][data-log-field="weight"]').fill('40');await page.locator('[data-log-set="0"][data-log-field="reps"]').fill('10');await page.locator('[data-action="complete-set"][data-set-index="0"]').click();
  await page.evaluate(()=>window.__qa.pauseWorkout());assert.match(await page.locator('.paused-stat').innerText(),/Tahmini kalori/);await shot('11-duraklat');await page.locator('[data-action="resume-workout"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.currentWorkout.status),'active');
  await page.evaluate(()=>window.__qa.finishWorkout(true));assert.equal(await page.locator('.summary-partial-note svg').count(),1);assert.equal(await page.evaluate(()=>window.__qa.state.history[0].status),'partial');await shot('12-yarim-ozet');
  await page.evaluate(()=>window.__qa.askDeleteHistory(window.__qa.state.history[0].id));assert.equal(await page.locator('.dialog-symbol svg').count(),1);await shot('13-silme');
  await page.evaluate(()=>{const a=window.__qa;a.closeSheet();a.state.currentWorkout.summarySaved=false;a.state.currentWorkout.programId='missing';a.state.currentWorkout.programSnapshot=null;a.renderOrphanedWorkout();});assert.equal(await page.locator('.recovery-cancel svg').count(),1);await shot('14-kurtarma');
 });
 await check('Viewport checks: 320/390 portrait and 740 landscape',async()=>{
  for(const size of [{width:320,height:640},{width:390,height:844},{width:740,height:360}]){await page.setViewportSize(size);await fixture();await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const footer=await page.locator('.member-player-dock').boundingBox();assert.ok(footer.y+footer.height<=size.height+1,JSON.stringify(footer));await shot('15-'+size.width);}
 });
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results,null,2));assert.deepEqual(errors,[]);if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.kill();});
