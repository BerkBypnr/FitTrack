'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const {fresh,setupWorkout,clone}=require('./review/harness.cjs');
const root=path.resolve(__dirname,'..'),results=[];
function test(name,run){try{run();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack.slice(0,1600)});}}
// Keep DOM nodes alive between calls so a canceled dialog must preserve the real
// input/scroll nodes. Layout, Android gestures and the native keyboard are not simulated.
function runtime(){
  const r=fresh();
  for(const layer of [r.elements.flowLayer,r.elements.sheetLayer]){
    const host=parseHTML('<html><body><div></div></body></html>').document.querySelector('div');
    Object.defineProperty(layer,'innerHTML',{get:()=>host.innerHTML,set:v=>{host.innerHTML=v;}});
    layer.querySelector=s=>host.querySelector(s);layer.querySelectorAll=s=>host.querySelectorAll(s);
  }
  r.tap=(selector,layer=r.elements.flowLayer)=>{const el=layer.querySelector(selector);assert.ok(el,'Missing action: '+selector);r.clickElement(el);};
  r.reject=()=>r.tap('[data-action="dismiss-workout-cancel"]',r.elements.sheetLayer);
  return r;
}
function player(){const r=runtime();setupWorkout(r);r.app.startWorkout();return r;}
function preview(active=false){
  const r=runtime(),p=setupWorkout(r,{moves:[r.app.cloneExerciseDefinition(r.app.catalogExercises()[0]),r.app.cloneExerciseDefinition(r.app.catalogExercises()[1])]});
  const repeated=r.app.cloneExerciseDefinition(p.days[0].exercises[0]);repeated.cues=['İkinci gün için farklı anlatım.'];
  const custom=r.app.cloneExerciseDefinition({...clone(repeated),id:'assigned-only-move',name:'Özel salon hareketi',cues:['Salona özel hareket anlatımı.']});
  p.days.push({id:'second-day',name:'İkinci gün',weekday:null,exercises:[repeated,custom]});
  r.app.refreshPrograms();if(!active)r.app.closeCurrentWorkout();
  r.app.ui.tab='programs';r.app.renderAssignedProgramDetail(p.id);
  return {r,p};
}
test('Native Back then No returns directly to the same workout DOM and preserves typed values and scroll',()=>{
  const r=player(),flow=r.elements.flowLayer,scroll=flow.querySelector('.member-player-scroll'),input=flow.querySelector('[data-log-field="weight"]');
  scroll.scrollTop=380;input.value='67.5';r.app.getCurrentLog().weight='67.5';r.app.getCurrentLog().reps='9';
  const before=clone(r.app.state.currentWorkout),clock=r.app.ui.workoutClockTimer;
  assert.equal(r.window.FitTrackNativeBack(),true);r.reject();
  assert.equal(r.elements.sheetLayer.classList.contains('active'),false);assert.equal(r.elements.sheetLayer.innerHTML,'');
  assert.equal(flow.querySelector('.member-player-scroll'),scroll);assert.equal(scroll.scrollTop,380);
  assert.equal(flow.querySelector('[data-log-field="weight"]'),input);assert.equal(input.value,'67.5');
  assert.deepEqual(clone(r.app.state.currentWorkout),before);assert.equal(r.app.ui.workoutClockTimer,clock);
});
test('On-screen workout Back also asks for confirmation and No returns to the workout',()=>{
  const r=player();r.tap('.member-player-top .back-btn');assert.ok(r.elements.sheetLayer.querySelector('[data-action="cancel-workout"]'));r.reject();
  assert.ok(r.elements.flowLayer.querySelector('.member-workout'));assert.ok(r.app.state.currentWorkout);
});
test('Cancel opened from the three-dot menu can be rejected without reopening the menu',()=>{
  const r=player();r.tap('[data-action="workout-menu"]');r.tap('[data-action="confirm-cancel"]',r.elements.sheetLayer);r.reject();
  assert.equal(r.elements.sheetLayer.innerHTML,'');assert.ok(r.elements.flowLayer.querySelector('.member-workout'));
});
test('A second native Back dismisses the cancellation sheet without canceling the session',()=>{
  const r=player(),before=clone(r.app.state.currentWorkout);r.window.FitTrackNativeBack();r.window.FitTrackNativeBack();
  assert.equal(r.elements.sheetLayer.classList.contains('active'),false);assert.deepEqual(clone(r.app.state.currentWorkout),before);
});
test('Rejecting cancellation during rest preserves the rest deadline, next set and timer',()=>{
  const r=player();r.app.completeSet();const rest=r.elements.flowLayer.querySelector('.rest-overlay');assert.ok(rest);
  const before=clone(r.app.state.currentWorkout),timer=r.app.ui.restInterval;r.window.FitTrackNativeBack();r.reject();
  assert.equal(r.elements.flowLayer.querySelector('.rest-overlay'),rest);assert.deepEqual(clone(r.app.state.currentWorkout),before);assert.equal(r.app.ui.restInterval,timer);
});
test('Rejecting cancellation while paused stays paused',()=>{
  const r=player();r.app.pauseWorkout();const before=clone(r.app.state.currentWorkout);r.window.FitTrackNativeBack();r.reject();
  assert.equal(r.app.state.currentWorkout.status,'paused');assert.deepEqual(clone(r.app.state.currentWorkout),before);assert.ok(r.elements.flowLayer.querySelector('.paused-flow'));
});
test('Explicit Yes still cancels the workout without saving a history entry',()=>{
  const r=player(),count=r.app.state.history.length;r.window.FitTrackNativeBack();r.tap('[data-action="cancel-workout"]',r.elements.sheetLayer);
  assert.equal(r.app.state.currentWorkout,null);assert.equal(r.app.state.history.length,count);assert.equal(r.elements.flowLayer.classList.contains('active'),false);
});
test('Every preview row is a keyboard-accessible button and its arrow opens the corresponding exercise',()=>{
  const {r,p}=preview();assert.equal(r.elements.flowLayer.querySelectorAll('button.assigned-exercise-item').length,4);
  for(let day=0;day<p.days.length;day++)for(let move=0;move<p.days[day].exercises.length;move++){
    const row='[data-day-index="'+day+'"][data-exercise-index="'+move+'"]';
    r.tap(row+' b svg');const item=p.days[day].exercises[move];
    assert.equal(r.elements.flowLayer.querySelector('h1').textContent,item.name);
    assert.deepEqual([...r.elements.flowLayer.querySelectorAll('.exercise-detail-cues li')].map(x=>x.textContent),Array.from(item.cues));
    assert.equal(r.app.state.currentWorkout,null);r.tap('[data-action="close-exercise-detail"]');
  }
});
test('On-screen detail Back restores the same program and its scroll position',()=>{
  const {r,p}=preview();r.elements.flowLayer.querySelector('.assigned-detail-scroll').scrollTop=620;
  r.tap('[data-day-index="1"][data-exercise-index="1"]');r.tap('[data-action="close-exercise-detail"]');
  assert.equal(r.app.ui.programDetailId,p.id);assert.equal(r.elements.flowLayer.querySelector('.assigned-detail-scroll').scrollTop,620);
  assert.equal(r.app.ui.exerciseDetailId,'');assert.equal(r.app.ui.exerciseDetailReturn,null);
});
test('Native detail Back returns to preview first, then a second Back returns to the original tab',()=>{
  const {r,p}=preview();r.tap('.assigned-exercise-item');r.window.FitTrackNativeBack();
  assert.ok(r.elements.flowLayer.querySelector('.assigned-detail-flow'));assert.equal(r.app.ui.programDetailId,p.id);
  r.window.FitTrackNativeBack();assert.equal(r.elements.flowLayer.classList.contains('active'),false);assert.equal(r.app.ui.tab,'programs');
});
test('Catalog detail still closes to the library without inheriting a program return target',()=>{
  const {r}=preview();r.tap('.assigned-exercise-item');r.app.closeFlow();r.app.ui.libraryQuery='Bench';r.app.ui.libraryMuscle='Göğüs';
  r.app.renderExerciseDetail(r.app.catalogExercises()[0].id);assert.equal(r.app.ui.exerciseDetailReturn,null);r.window.FitTrackNativeBack();
  assert.equal(r.elements.flowLayer.classList.contains('active'),false);assert.equal(r.app.ui.tab,'programs');assert.equal(r.app.ui.libraryQuery,'Bench');assert.equal(r.app.ui.libraryMuscle,'Göğüs');
});
test('An assignment removed while reading its exercise closes safely without exposing the removed program',()=>{
  const {r}=preview();r.tap('.assigned-exercise-item');r.app.state.assignments=[];r.app.state.assignment=null;r.window.FitTrackNativeBack();
  assert.equal(r.elements.flowLayer.classList.contains('active'),false);assert.equal(r.app.ui.programDetailId,'');assert.equal(r.app.ui.exerciseDetailReturn,null);
});
test('Account reset clears the pending detail return path',()=>{
  const {r}=preview();r.tap('.assigned-exercise-item');r.app.activateAccount('different-account','other@example.invalid');
  assert.equal(r.app.ui.exerciseDetailId,'');assert.equal(r.app.ui.programDetailId,'');assert.equal(r.app.ui.exerciseDetailReturn,null);
});
test('Preview uses assigned exercise cues including custom definitions, without interpreting authored HTML',()=>{
  const {r,p}=preview();p.days[1].exercises[1].cues=['<script>alert(1)</script>'];r.tap('[data-day-index="1"][data-exercise-index="1"]');
  assert.equal(r.elements.flowLayer.querySelector('script,[onerror]'),null);assert.equal(r.elements.flowLayer.querySelector('li').textContent,'<script>alert(1)</script>');
});
test('Missing or invalid exercise positions preserve the current preview',()=>{
  const {r,p}=preview(),before=r.elements.flowLayer.innerHTML;
  for(const indices of [[-1,0],[0,99],[1.5,0],['invalid',0]])r.click('assigned-exercise-detail',{programId:p.id,dayIndex:String(indices[0]),exerciseIndex:String(indices[1])});
  assert.equal(r.elements.flowLayer.innerHTML,before);assert.equal(r.app.ui.exerciseDetailId,'');
});
test('Reading a program during an existing session cannot change its logs or selected workout',()=>{
  const {r}=preview(true),before=clone(r.app.state.currentWorkout),selected=r.app.state.selectedProgramId;
  r.tap('[data-day-index="1"][data-exercise-index="1"]');r.window.FitTrackNativeBack();
  assert.deepEqual(clone(r.app.state.currentWorkout),before);assert.equal(r.app.state.selectedProgramId,selected);
  r.tap('[data-action="start-assigned-program"]');assert.ok(r.elements.flowLayer.querySelector('.member-workout'));assert.equal(r.app.ui.programDetailId,'');
});
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/navigation-0118.json'),JSON.stringify({method:'Node VM with persistent Linkedom nodes and actual delegated click targets; no browser layout or physical Android gestures',results},null,2));
for(const item of results)console.log(item.status,item.name,item.error||'');
console.log(JSON.stringify({total:results.length,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length}));
if(results.some(x=>x.status==='FAIL'))process.exitCode=1;
