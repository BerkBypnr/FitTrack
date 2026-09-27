'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const {fresh,setupWorkout,root}=require('./review/harness.cjs');
const dom=html=>parseHTML('<html><body>'+html+'</body></html>').document;
const results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
(async()=>{
  await test('0.14.3 identity advances without a schema change',()=>{
    assert.match(fs.readFileSync(path.join(root,'app.js'),'utf8'),/var VERSION = "0\.14\.3"/);
    assert.match(fs.readFileSync(path.join(root,'app.js'),'utf8'),/var SCHEMA = 15/);
    assert.match(fs.readFileSync(path.join(root,'android/app/build.gradle'),'utf8'),/versionCode 35/);
  });
  await test('Session picker uses compact radio rows and never recommends a session',()=>{
    const r=fresh(),a=r.app;a.state.profile.setupComplete=true;
    const p=a.normalizeCustomProgram({id:'multi',name:'Güç & Hacim',status:'published',days:[
      {id:'pull',name:'Çekiş',exercises:[a.catalogExercises()[0]]},
      {id:'push',name:'İtiş',exercises:[a.catalogExercises()[1]]},
      {id:'legs',name:'Bacak',exercises:[a.catalogExercises()[2]]}
    ]});
    a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:'pull'},0,'Berk')];a.state.assignment=a.state.assignments[0];a.state.selectedProgramId=p.id;a.state.currentWorkout=null;a.openSessionPicker(false);
    const d=dom(r.elements.flowLayer.innerHTML);
    assert.equal(d.querySelectorAll('.session-option').length,3);assert.equal(d.querySelectorAll('.session-radio').length,3);
    assert.equal(d.querySelectorAll('.session-number').length,0);assert.doesNotMatch(d.body.textContent,/önerilen|öneriyoruz/i);
    assert.equal(d.querySelector('[data-action="begin-workout-session"]').hasAttribute('disabled'),true);
  });
  await test('Active workout has one guidance card, all sets, and no rest flow',()=>{
    const r=fresh(),a=r.app;setupWorkout(r);a.currentExercise().coachNote='Kontrollü çalış.';a.renderWorkout();const d=dom(r.elements.flowLayer.innerHTML);
    assert.equal(d.querySelectorAll('.workout-instructions').length,1);assert.equal(d.querySelectorAll('.coach-instructions').length,0);
    assert.match(d.querySelector('.inline-coach-note').textContent,/Kontrollü çalış/);
    assert.equal(d.querySelectorAll('.workout-set-row').length,a.currentExercise().sets);assert.equal(d.querySelectorAll('.rest-flow').length,0);
  });
  await test('Completed and partial summaries remain visually distinct',()=>{
    const r=fresh(),a=r.app;setupWorkout(r);Object.assign(a.getLog(0,0,true),{weight:'40',reps:'10',completedAt:new Date().toISOString()});a.finishWorkout();
    let d=dom(r.elements.flowLayer.innerHTML);assert.equal(d.querySelectorAll('.summary-cover').length,0);assert.equal(d.querySelectorAll('.summary-partial-note').length,1);assert.equal(d.querySelectorAll('.summary-edit-button').length,1);
    a.closeCurrentWorkout();setupWorkout(r);for(let i=0;i<a.currentExercise().sets;i++)Object.assign(a.getLog(0,i,true),{weight:'40',reps:'10',completedAt:new Date().toISOString()});a.finishWorkout();
    d=dom(r.elements.flowLayer.innerHTML);assert.equal(d.querySelectorAll('.summary-cover').length,1);assert.equal(d.querySelectorAll('.summary-partial-note').length,0);
  });
  await test('Profile stays seven steps with stacked names, separate gender, and persistent weight ruler',()=>{
    const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),css=fs.readFileSync(path.join(root,'design-system.css'),'utf8');
    assert.match(app,/step === 1[\s\S]*wizard-name-grid/);assert.match(app,/step === 2[\s\S]*gender-picker/);
    assert.match(app,/keyboardWasOpen && !keyboardOpen/);assert.match(css,/profile-wizard \.weight-ruler \{ display: block/);
  });
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/hotfix-0142.json'),JSON.stringify({method:'Production functions in VM + parsed DOM + static Android identity; no phone',results},null,2));
  for(const item of results)console.log(item.status,item.name,item.error||'');if(results.some(item=>item.status==='FAIL'))process.exitCode=1;
})();
