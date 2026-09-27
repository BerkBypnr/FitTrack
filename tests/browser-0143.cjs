'use strict';
const {chromium}=require(process.env.FITTRACK_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const out=path.resolve(__dirname,'../test-results/browser-0143');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'ui-preview-0130.cjs')],{stdio:['ignore','pipe','inherit']});
let browser;const results=[],errors=[],blocked=[];
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('server exit '+c)));});
 let executablePath=process.env.FITTRACK_CHROME,args=[];
 if(process.env.FITTRACK_CHROMIUM_PACKAGE){const c=require(process.env.FITTRACK_CHROMIUM_PACKAGE),engine=c.default||c;executablePath=await engine.executablePath();args=engine.args;}
 browser=await chromium.launch({executablePath,headless:true,args});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,reducedMotion:'reduce'});
 page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():(blocked.push(route.request().url()),route.abort()));
 await page.goto('http://127.0.0.1:4178/');await page.waitForFunction(()=>window.__qa&&window.__qaCloud);await page.waitForTimeout(250);
 await page.evaluate(()=>{window.__qaCloud.hideLayer();const a=window.__qa;a.state=a.defaultState(false);a.state.profile.setupComplete=true;a.state.profile.firstName='Deniz';a.state.profile.lastName='Test';a.render();});
 async function screen(name){await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}
 async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});await screen('FAIL-'+results.length);}}
 async function fixture(profiles=['load_reps','duration'],sets=3){await page.evaluate(({profiles,sets})=>{
   const a=window.__qa;a.closeSheet();a.closeFlow();a.ui.onboardingDraft=null;a.clearProfileWizardRecovery();a.state.currentWorkout=null;a.state.history=[];
   const moves=profiles.map((profile,i)=>{const m=a.cloneExerciseDefinition(a.catalogExercises()[i]);Object.assign(m,a.normalizeMeasurement({measurementProfile:profile}));m.setPlan=Array.from({length:sets},()=>({type:'normal',repsTarget:'10–12',targetWeight:'',targetDurationSeconds:'45',targetDistanceMeters:'40',rest:60}));m.sets=sets;return m;});
   const p=a.normalizeCustomProgram({id:'browser-plan',name:'Full Body',status:'published',days:[{id:'browser-day',name:'İtiş',exercises:moves}]});
   a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:p.days[0].id},0,'Berk')];a.state.assignment=a.state.assignments[0];a.state.selectedProgramId=p.id;a.state.currentWorkout=a.newWorkout();a.renderWorkout();
 },{profiles,sets});}
 for(const theme of ['dark-red','plum-night','redline-editorial','rosewood-strength']){
 await check(theme+': stacked name fields, separate gender, correct FT branding',async()=>{
   await page.setViewportSize({width:390,height:844});await page.evaluate(t=>{const a=window.__qa;a.closeSheet();a.state.theme=t;a.applyTheme();a.openProfileWizard(1);},theme);
   await page.waitForTimeout(350);const first=await page.locator('[data-profile-wizard="firstName"]').boundingBox(),last=await page.locator('[data-profile-wizard="lastName"]').boundingBox();assert.ok(last.y>=first.y+first.height,JSON.stringify({first,last}));assert.ok(Math.abs(first.x-last.x)<1,JSON.stringify({first,last}));
   await page.locator('[data-profile-wizard="firstName"]').fill('Deniz');await page.locator('[data-profile-wizard="lastName"]').fill('Yılmaz');await noOverflow();await screen('name-'+theme);
   await page.locator('[data-action="profile-wizard-next"]').click();assert.equal(await page.locator('[data-action="profile-gender"]').count(),3);assert.equal(await page.locator('[data-profile-wizard="firstName"]').count(),0);
 });
 await check(theme+': pinned GIF, all sets, collapsed instructions, footer stays on screen',async()=>{
   await fixture();await noOverflow();assert.equal(await page.locator('.workout-set-row').count(),3);assert.equal(await page.locator('.workout-instructions').first().getAttribute('open'),null);
   const before=await page.locator('.workout-pinned-media').boundingBox();await page.locator('.member-player-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);const after=await page.locator('.workout-pinned-media').boundingBox();assert.equal(before.y,after.y);
   await page.locator('.member-player-scroll').evaluate(e=>e.scrollTop=0);const footer=await page.locator('[data-action="next-exercise"]').boundingBox();assert.ok(footer.y+footer.height<=845);await screen('workout-'+theme);
 });
 }
 for(const [step,key]of [[5,'currentWeight'],[6,'targetWeight']]){
 await check(key+': ruler survives focused keyboard-sized viewport and closing keyboard without blur',async()=>{
   await page.setViewportSize({width:390,height:844});await page.evaluate(step=>{const a=window.__qa;a.closeCurrentWorkout();a.state.theme='dark-red';a.applyTheme();a.openProfileWizard(step);},step);
   await page.locator('#profile-'+key).fill('78,5');await page.setViewportSize({width:390,height:430});await page.waitForTimeout(220);
   assert.equal(await page.locator('.weight-ruler').isVisible(),true);assert.equal(await page.locator('.weight-ruler').evaluate(e=>getComputedStyle(e).display),'block');await screen(key+'-keyboard');
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(160);assert.equal(await page.locator('.weight-ruler').isVisible(),true);
   assert.equal(await page.locator('#profile-'+key).inputValue(),'78,5');assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('fittrack-keyboard-open')),false);
   await page.locator('[data-profile-range]').fill('80.2');assert.equal(await page.locator('#profile-'+key).inputValue(),'80.2');
   await page.setViewportSize({width:740,height:360});await noOverflow();assert.equal(await page.locator('.weight-ruler').isVisible(),true);await screen(key+'-landscape');
   await page.reload();await page.waitForFunction(()=>window.__qa&&window.__qa.ui.onboardingDraft);assert.equal(await page.locator('#profile-'+key).inputValue(),'80.2');
 });
 }
 await check('Active values persist, row completion never reloads GIF or advances; partial warning and previous movement work',async()=>{
   await page.setViewportSize({width:390,height:844});await fixture();await page.evaluate(()=>window.__gif=document.querySelector('.workout-pinned-media img'));
   await page.locator('[data-log-set="0"][data-log-field="weight"]').fill('42,5');await page.locator('[data-log-set="0"][data-log-field="reps"]').fill('10');await page.locator('[data-action="complete-set"][data-set-index="0"]').click();
   assert.equal(await page.evaluate(()=>window.__gif===document.querySelector('.workout-pinned-media img')),true);assert.equal(await page.evaluate(()=>window.__qa.state.currentWorkout.exerciseIndex),0);
   assert.equal(await page.locator('[data-action="complete-set"][data-set-index="0"]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-action="next-exercise"]').click();assert.match(await page.locator('#sheetLayer').innerText(),/henüz işaretlenmedi/);await page.locator('[data-action="next-exercise-incomplete"]').click();
   assert.equal(await page.locator('[data-log-field="durationSeconds"]').count(),3);await page.locator('[data-action="previous-exercise"]').click();assert.equal(await page.locator('[data-log-set="0"][data-log-field="weight"]').inputValue(),'42.5');
 });
 for(const size of [{width:320,height:568},{width:390,height:430},{width:740,height:360}]){
 await check('All fields reachable at '+size.width+'x'+size.height+'; history has still images and one save',async()=>{
   await page.setViewportSize(size);await fixture(['load_reps','distance_duration'],4);await noOverflow();
   const input=page.locator('[data-log-set="3"][data-log-field="reps"]');await input.fill('9');await page.waitForTimeout(220);const box=await input.boundingBox(),scroll=await page.locator('.member-player-scroll').boundingBox();assert.ok(box.y>=scroll.y-1&&box.y+box.height<=scroll.y+scroll.height+1,JSON.stringify({box,scroll}));
   const gif=await page.locator('.workout-pinned-media img').boundingBox();assert.ok(gif.height>=60);await screen('active-'+size.width+'x'+size.height);
   await page.evaluate(()=>{const a=window.__qa;a.getLog(0,3,true).weight='25';a.getLog(0,3,true).completedAt=new Date().toISOString();a.captureWorkoutInputs();a.getLog(0,3,true).weight='25';document.querySelector('[data-log-set="3"][data-log-field="weight"]').value='25';Object.assign(a.getLog(1,0,true),{distanceMeters:'400',durationSeconds:'120',completedAt:new Date().toISOString()});a.finishWorkout();a.openHistorySheet(a.state.history[0].id);});
   assert.equal(await page.locator('[data-action="save-history"]').count(),1);assert.equal(await page.locator('.history-card-v14').count(),2);assert.equal(await page.locator('.history-card-v14 img[src$=".gif"]').count(),0);await noOverflow();await screen('history-'+size.width+'x'+size.height);
 });
 }
 await check('All six measurement profiles expose exactly their own field controls',async()=>{
   await page.setViewportSize({width:390,height:844});
   const profiles={load_reps:['weight','reps'],reps:['reps'],duration:['durationSeconds'],distance_duration:['distanceMeters','durationSeconds'],load_distance:['weight','distanceMeters'],completed:[]};
   for(const [profile,fields]of Object.entries(profiles)){await fixture([profile],2);assert.deepEqual(await page.locator('[data-set-row="0"] [data-log-field]').evaluateAll(nodes=>nodes.map(n=>n.dataset.logField)),fields);await screen('measurement-'+profile);}
 });
 await check('History rejects incomplete pair without mutating original and asks before discarding',async()=>{
   await fixture(['load_reps'],1);await page.locator('[data-action="complete-set"]').click();await page.locator('[data-action="next-exercise"]').click();await screen('summary');
   await page.evaluate(()=>window.__qa.openHistorySheet(window.__qa.state.history[0].id));await page.locator('[data-history-field="weight"]').fill('45');await page.locator('[data-action="save-history"]').click();assert.equal(await page.locator('.history-v14').count(),1);assert.equal(await page.evaluate(()=>window.__qa.state.history[0].exercises[0].sets[0].weight),'');
   await page.locator('[data-action="close-history-editor"]').click();assert.match(await page.locator('#sheetLayer').innerText(),/kaydedilmedi/);await page.locator('button[data-action="close-sheet"]').click();await page.locator('[data-history-field="reps"]').fill('12');await page.locator('[data-action="save-history"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.history[0].exercises[0].sets[0].weight),'45');
 });
 await check('Program editor persists the selected profile and SI targets',async()=>{
   await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.state.cloud.userId='qa-coach';a.state.cloud.role='trainer';a.ui.editorDraft=a.editorDraftFromProgram(a.programById('browser-plan'),false);a.renderStudioEditor();a.openStudioExerciseConfig(0);});
   await page.locator('[data-config-measurement]').selectOption('distance_duration');await screen('program-measurement');
   assert.equal(await page.locator('[data-config-metric="distanceMeters"]').count(),1);assert.equal(await page.locator('[data-config-rest]').count(),0);
   await noOverflow();
 });

 for (const theme of ['dark-red','plum-night','redline-editorial','rosewood-strength']) {
 await check(theme+': final active table, larger type and genuine unobscured GIF',async()=>{
   await page.setViewportSize({width:390,height:844});await fixture(['load_reps','load_reps','load_reps'],3);
   await page.evaluate(t=>{const a=window.__qa;a.state.theme=t;a.applyTheme();a.state.history=[];Object.assign(a.getLog(0,0,true),{weight:'40',reps:'10',completedAt:new Date().toISOString()});a.renderWorkout();},theme);
   await page.waitForTimeout(350);
   assert.equal(await page.locator('.workout-set-list .metric-table-head').count(),1);
   assert.equal(await page.locator('.set-row-fields label').count(),0);
   const layout=await page.evaluate(()=>{
     const box=s=>document.querySelector(s).getBoundingClientRect(),px=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
     return {headingBottom:box('.member-exercise-heading').bottom,gifTop:box('.exercise-visual').top,gifHeight:box('.exercise-visual').height,badgeHeight:box('.gif-badge').height,rowBottom:box('[data-set-row="2"]').bottom,footerTop:box('.member-player-dock').top,headFont:px('.metric-table-head'),inputFont:px('[data-log-field]'),helpFont:px('.set-help'),buttonHeight:box('.set-done').height};
   });
   assert.ok(layout.headingBottom<=layout.gifTop);assert.ok(layout.gifHeight>=195&&layout.badgeHeight<40,JSON.stringify(layout));
   assert.ok(layout.rowBottom<=layout.footerTop,JSON.stringify(layout));assert.ok(layout.headFont>=13&&layout.inputFont>=18&&layout.helpFont>=14&&layout.buttonHeight>=44);
   assert.equal(await page.locator('[data-movement-count]').innerText(),'1/3 set tamamlandı');await noOverflow();await screen('final-active-'+theme);
   await page.locator('[data-action="complete-set"][data-set-index="0"]').click();assert.equal(await page.locator('[data-movement-count]').innerText(),'0/3 set tamamlandı');
 });
 await check(theme+': open history cards, shared labels, one save and no animated media',async()=>{
   await page.evaluate(()=>{const a=window.__qa;for(let e=0;e<3;e++)for(let i=0;i<3;i++)Object.assign(a.getLog(e,i,true),{weight:String(40+e*5),reps:'10',completedAt:new Date().toISOString()});a.renderWorkout();a.finishWorkout();a.openHistorySheet(a.state.history[0].id);});
   await page.waitForTimeout(350);assert.equal(await page.locator('.history-card-v14').count(),3);
   assert.equal(await page.locator('.history-card-v14 .metric-table-head').count(),3);assert.equal(await page.locator('.history-card-v14 details').count(),0);
   assert.equal(await page.locator('.history-card-v14 img[src$=".gif"]').count(),0);assert.equal(await page.locator('[data-action="save-history"]').count(),1);
   const card=await page.locator('.history-card-v14').first().boundingBox();assert.ok(card.height<350,JSON.stringify(card));await noOverflow();await screen('final-history-'+theme);
   await page.evaluate(()=>{const a=window.__qa;a.closeHistoryEditor(true);a.renderSummary();});await screen('final-summary-'+theme);
   assert.equal(await page.locator('.summary-stat').count(),4);assert.match(await page.locator('.summary-grid').innerText(),/4.050/);
 });
 }
 await check('Blank prior values never offer Apply; older valid data still available, malformed pairs excluded',async()=>{
   await fixture(['load_reps'],3);await page.evaluate(()=>{const a=window.__qa;const item=a.workoutHistoryItem(a.state.currentWorkout,false);item.syncId='different-session';item.exercises=[Object.assign({},a.currentExercise(),{sets:[a.normalizeSet({weight:'',reps:'',completedAt:new Date().toISOString()},0)]})];a.state.history=[item];a.renderWorkout();});
   assert.equal(await page.locator('[data-action="use-previous"]').count(),0);assert.equal(await page.locator('[data-action="use-previous-all"]').count(),0);
   await page.evaluate(()=>{const a=window.__qa;a.state.history[0].exercises[0].sets[0].weight='20';a.renderWorkout();});assert.equal(await page.locator('[data-action="use-previous"]').count(),0);
   await page.evaluate(()=>{const a=window.__qa;a.state.history[0].exercises[0].sets[0].reps='12';a.renderWorkout();});assert.equal(await page.locator('[data-action="use-previous"]').count(),3);
   await page.locator('.previous-values summary').click();await page.locator('[data-action="use-previous-all"]').click();assert.equal(await page.locator('[data-log-field="weight"][data-log-set="2"]').inputValue(),'20');assert.equal(await page.locator('[data-action="complete-set"][data-set-index="2"]').getAttribute('aria-pressed'),'false');
 });
 await check('Summary edit returns to saved summary, updates actual volume and survives cancel',async()=>{
   await fixture(['load_reps'],1);await page.locator('[data-log-field="weight"]').fill('40');await page.locator('[data-log-field="reps"]').fill('10');await page.locator('[data-action="complete-set"]').click();await page.locator('[data-action="next-exercise"]').click();
   await page.locator('[data-action="summary-edit"]').click();await page.locator('[data-history-field="weight"]').fill('50');await page.locator('[data-action="save-history"]').click();
   assert.equal(await page.locator('.summary-v14').count(),1);assert.match(await page.locator('.summary-grid').innerText(),/500/);assert.equal(await page.evaluate(()=>window.__qa.state.history.length),1);
   await page.locator('[data-action="summary-edit"]').click();await page.locator('[data-history-field="weight"]').fill('70');await page.locator('[data-action="close-history-editor"]').click();await page.locator('[data-action="discard-history"]').click();assert.match(await page.locator('.summary-grid').innerText(),/500/);
 });
 await check('Large text, many sets and coach note remain reachable on a narrow viewport',async()=>{
   await page.setViewportSize({width:320,height:568});await fixture(['load_reps'],12);
   await page.evaluate(()=>{const a=window.__qa;a.currentExercise().coachNote='Omuzlarını geride tut; kontrollü çalış.';a.state.currentWorkout.setIndex=11;a.renderWorkout();});
   const style=await page.addStyleTag({content:'.workout-v14 .member-exercise-heading h2{font-size:30px}.workout-v14 .metric-table-head,.workout-v14 .set-plan,.workout-v14 .workout-instructions summary{font-size:18px}.set-row-fields input{font-size:26px}'});
   await page.locator('[data-log-set="11"][data-log-field="weight"]').fill('25');await page.locator('[data-log-set="11"][data-log-field="reps"]').fill('12');await page.waitForTimeout(200);await noOverflow();
   const box=await page.locator('[data-log-set="11"][data-log-field="reps"]').boundingBox(),scroll=await page.locator('.member-player-scroll').boundingBox();assert.ok(box.y>=scroll.y-1&&box.y+box.height<=scroll.y+scroll.height+1);
   await screen('large-text-320x568');await style.evaluate(e=>e.remove());
 });
 await check('0.14.3 session picker is compact, unnumbered and has no recommendation',async()=>{
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();const p=a.normalizeCustomProgram({id:'multi-browser',name:'Güç & Hacim',status:'published',days:[{id:'pull',name:'Çekiş',exercises:[a.catalogExercises()[0]]},{id:'push',name:'İtiş',exercises:[a.catalogExercises()[1]]},{id:'legs',name:'Bacak',exercises:[a.catalogExercises()[2]]}]});a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:'pull'},0,'Berk')];a.state.assignment=a.state.assignments[0];a.state.selectedProgramId=p.id;a.openSessionPicker(false);});
   assert.equal(await page.locator('.session-option').count(),3);assert.equal(await page.locator('.session-number').count(),0);assert.equal(await page.locator('.session-radio').count(),3);assert.doesNotMatch(await page.locator('.session-picker').innerText(),/önerilen|öneriyoruz/i);await noOverflow();await screen('session-picker-0142');
 });
 await check('0.14.3 coach note lives inside the single guidance card',async()=>{
   await page.setViewportSize({width:390,height:844});await fixture(['load_reps'],3);await page.evaluate(()=>{const a=window.__qa;a.currentExercise().coachNote='Kontrollü çalış.';a.renderWorkout();});
   assert.equal(await page.locator('.workout-instructions').count(),1);assert.equal(await page.locator('.coach-instructions').count(),0);await page.locator('.workout-instructions summary').click();assert.match(await page.locator('.inline-coach-note').innerText(),/Kontrollü çalış/);await screen('active-guidance-0142');
 });
 await check('Profile labels and supporting copy grew; four theme choices and current selection preserved',async()=>{
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.state.theme='redline-editorial';a.applyTheme();a.openProfileWizard(1);});
   await page.waitForTimeout(350);assert.ok(await page.locator('.wizard-name-grid label').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=14));await screen('final-profile-name-light');
   assert.equal(await page.evaluate(()=>window.__qa.state.theme),'redline-editorial');await noOverflow();
 });

 await check('0.14.3 reference profile steps and manual age have one value source',async()=>{
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const a=window.__qa;a.closeSheet();a.closeCurrentWorkout();a.state.cloud.userId='';a.state.theme='dark-red';a.applyTheme();a.openProfileWizard(2);});
  await screen('reference-gender');await page.evaluate(()=>window.__qa.openProfileWizard(3));await screen('reference-age');
  await page.locator('[data-action="profile-manual-open"]').click();await page.locator('#profileManualValue').fill('24');await page.locator('[data-action="profile-manual-save"]').click();assert.equal(await page.evaluate(()=>window.__qa.ui.onboardingDraft.age),'24');
  for(const step of [4,5,6,7]){await page.evaluate(step=>window.__qa.openProfileWizard(step),step);await noOverflow();await screen('reference-profile-'+step);}
 });
 await check('Measurement focus converts km and min:sec into SI, rejects malformed duration',async()=>{
  await fixture(['distance_duration'],2);await page.locator('[data-focus-metric="distanceMeters"]').fill('2,5');await page.locator('[data-focus-metric="durationSeconds"]').fill('18:30');
  assert.equal(await page.evaluate(()=>window.__qa.getCurrentLog().distanceMeters),'2500');assert.equal(await page.evaluate(()=>window.__qa.getCurrentLog().durationSeconds),'1110');
  await screen('reference-distance-duration');await page.locator('[data-action="complete-focus-set"]').click();assert.ok(await page.evaluate(()=>window.__qa.getLog(0,0,false).completedAt));
  await page.locator('[data-focus-metric="durationSeconds"]').fill('1:99');await page.locator('[data-action="complete-focus-set"]').click();assert.equal(await page.evaluate(()=>Boolean(window.__qa.getLog(0,1,false).completedAt)),false);
 });
 await check('Duration ring records seconds, pause stops elapsed input and reload retains value',async()=>{
  await fixture(['duration'],2);await page.locator('[data-action="toggle-measurement-timer"]').click();await page.waitForTimeout(1250);await page.locator('[data-action="toggle-measurement-timer"]').click();
  const seconds=await page.evaluate(()=>window.__qa.getCurrentLog().durationSeconds);assert.ok(Number(seconds)>=1);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.__qa.getCurrentLog().durationSeconds),seconds);await screen('reference-duration');
  await page.reload();await page.waitForFunction(()=>window.__qa);await page.evaluate(()=>{window.__qaCloud.hideLayer();window.__qa.startWorkout();});assert.equal(await page.evaluate(()=>window.__qa.getCurrentLog().durationSeconds),seconds);
 });
 await check('Body measurements persist, edit without duplicates, and profile weight enters kg history',async()=>{
  await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.closeFlow();a.state.bodyMeasurements=[];a.state.cloud.role='member';a.openBodyMeasurement();});await page.locator('[data-body-field="waist"]').fill('82');await page.locator('[data-body-field="neck"]').fill('38');await page.locator('[data-body-field="arm"]').fill('34');await page.locator('[data-body-field="hip"]').fill('96');await screen('reference-measurement-form');await page.locator('[data-action="save-body-measurement"]').click();
  assert.equal(await page.evaluate(()=>window.__qa.state.bodyMeasurements.length),1);await screen('reference-measurement-history');await page.locator('[data-action="body-measurement-edit"][data-id]').click();await page.locator('[data-body-field="waist"]').fill('81,5');await page.locator('[data-action="save-body-measurement"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.bodyMeasurements.length),1);
  await page.evaluate(()=>window.__qa.openProfileDetails());await page.locator('[data-edit-profile="currentWeight"]').fill('80');await screen('reference-profile-edit');await page.locator('[data-action="save-profile-details"]').click();assert.ok(await page.evaluate(()=>window.__qa.state.bodyMeasurements.some(x=>x.weightKg===80)));
  await page.reload();await page.waitForFunction(()=>window.__qa);assert.ok(await page.evaluate(()=>window.__qa.state.bodyMeasurements.some(x=>x.waist===81.5)));
 });
 await check('Program cards, movement detail, countdown, paused and recovery reference screens',async()=>{
  await page.evaluate(()=>window.__qaCloud.hideLayer());await fixture(['load_reps','reps'],3);await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.closeFlow();a.ui.tab='programs';a.render();});assert.equal(await page.locator('#flowLayer.active').count(),0);const programButtons=page.locator('.assigned-program-actions button');const reviewBox=await programButtons.nth(0).boundingBox(),startBox=await programButtons.nth(1).boundingBox();assert.ok(startBox.y>=reviewBox.y+reviewBox.height);assert.ok((await page.locator('.assigned-program-thumb').first().boundingBox()).height>=190);await screen('reference-programs');await noOverflow();
  await page.evaluate(()=>window.__qa.renderExerciseDetail('bench-press'));await screen('reference-exercise-detail');await page.evaluate(()=>{const a=window.__qa;a.closeFlow();a.openSessionPicker(false);});await page.locator('.session-option').first().click();await page.locator('[data-action="begin-workout-session"]').click();assert.equal(await page.locator('.countdown-flow').count(),1);await screen('reference-countdown');await page.waitForTimeout(3200);assert.equal(await page.locator('.workout-flow').count(),1);
  await page.evaluate(()=>window.__qa.pauseWorkout());await screen('reference-paused');await page.evaluate(()=>{const a=window.__qa;a.state.currentWorkout.orphaned=true;a.renderOrphanedWorkout();});await screen('reference-orphan');
 });
 await check('Failed message retries with same mutation ID and ignores old-account completion',async()=>{
  await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.state.cloud.userId='qa-member';a.state.cloud.gymId='qa-gym';a.state.cloud.role='member';a.state.gym.coachId='qa-coach';a.state.messages=[];window.__messages=[];window.FitTrackCloud=Object.assign({},window.FitTrackCloud,{sendMessage:async item=>{window.__messages.push(item.clientMutationId);throw Error('offline');}});a.openChat('qa-coach');});
  await page.locator('#chatInput').fill('Hocam, programı gördüm.');await page.locator('[data-action="send-message"]').click();await page.locator('[data-action="retry-message"]').waitFor();await screen('reference-message-retry');await page.locator('[data-action="retry-message"]').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>new Set(window.__messages).size),1);assert.equal(await page.evaluate(()=>window.__qa.state.messages.length),1);
 });
 await check('Media failure can retry and unsynced data cannot be cleared accidentally',async()=>{
  await fixture(['load_reps'],1);await page.locator('.exercise-visual img').evaluate(img=>{img.src='./missing-qa-image.gif';});await page.locator('[data-action="retry-media"]').waitFor();await screen('reference-media-error');await page.locator('[data-action="retry-media"]').click();await page.locator('[data-action="retry-media"]').waitFor();assert.equal(await page.locator('[data-log-field]').count(),2);
  await page.evaluate(()=>{const a=window.__qa;a.closeCurrentWorkout();a.state.cloud.pending=2;a.confirmClearData();});assert.equal(await page.locator('[data-action="clear-data"]').count(),0);await screen('reference-unsynced-clear');await page.evaluate(()=>window.__qa.closeSheet());
 });
 await check('Auth, role, gym, invite and account screens render without network',async()=>{
  await page.evaluate(()=>{window.__qa.state.theme='dark-red';window.__qa.applyTheme();});
  for(const view of ['login','otp','recovery','role','gym-member','gym-trainer','gym-ready','account','invite']){
   await page.evaluate(view=>{const c=window.__qaCloud;c.setContext({session:{user:{id:'qa-user',email:'berk@example.com'}},membership:{role:'trainer'},gym:{id:'qa-gym',name:'Berdony Spor Salonu'},profile:{display_name:'Berk Baypınar'}});
    if(view==='login')c.renderAuth('login');if(view==='otp')c.renderConfirmation('berk@example.com',Date.now(),'Kodun süresi doldu.');if(view==='recovery')c.renderRecovery('berk@example.com');if(view==='role')c.renderProfileSetup({display_name:'Berk Baypınar'});if(view==='gym-member')c.renderGymSetup('member');if(view==='gym-trainer')c.renderGymSetup('trainer');if(view==='gym-ready')c.renderInviteResult('FT-DEMO2026','Berdony Spor Salonu');if(view==='account')c.renderAccountManager();if(view==='invite')c.renderInviteManager();
   },view);await noOverflow();await screen('reference-auth-'+view);
  }await page.evaluate(()=>window.__qaCloud.hideLayer());
 });

 results.push({name:'No uncaught browser errors or external network access',status:errors.length||blocked.length?'FAIL':'PASS',errors,blocked});
 const report={browser:await browser.version(),method:'Real headless Chromium with production JS/CSS, synthetic local fixtures, blocked external network. Viewport keyboard simulation is NOT physical Android IME testing.',results};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.status==='PASS').length,results},null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.kill();});
