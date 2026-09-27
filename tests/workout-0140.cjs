'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const {fresh,runtime,setupWorkout,clone,root}=require('./review/harness.cjs');
const results=[];const dom=html=>parseHTML('<html><body>'+html+'</body></html>').document;
const samples={load_reps:{weight:'42.5',reps:'10'},reps:{reps:'12'},duration:{durationSeconds:'45'},distance_duration:{distanceMeters:'1250.5',durationSeconds:'360'},load_distance:{weight:'25',distanceMeters:'40'},completed:{}};
function fixture(profile='load_reps',count=3){const r=fresh(),a=r.app;const move=a.cloneExerciseDefinition(a.catalogExercises()[0]);Object.assign(move,a.normalizeMeasurement({measurementProfile:profile}));move.setPlan=Array.from({length:count},()=>({type:'normal',repsTarget:'10',targetWeight:'',targetDurationSeconds:'45',targetDistanceMeters:'40',rest:60}));move.sets=count;setupWorkout(r,{moves:[move]});return r;}
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
(async()=>{
 for(const [profile,values]of Object.entries(samples)){
 await test(profile+': program → snapshot → completed log → history → cloud → backup roundtrip',()=>{
   const r=fixture(profile),a=r.app,workout=a.state.currentWorkout;
   for(let i=0;i<3;i++){Object.assign(a.getLog(0,i,true),values);a.completeSet(i);assert.ok(a.getLog(0,i,false).completedAt);}
   assert.equal(workout.exerciseIndex,0);assert.equal(workout.next,null);assert.equal(workout.restEnd,null);
   a.finishWorkout();assert.equal(a.state.history.length,1);const h=a.state.history[0];assert.equal(h.exercises[0].measurementProfile,profile);
   for(const field of Object.keys(values))assert.equal(h.exercises[0].sets[0][field],values[field]);
   const cloud=a.workoutRowToHistory({payload:clone(h),client_mutation_id:h.syncId,status:h.status,started_at:h.startedAt,finished_at:h.finishedAt,duration_minutes:h.duration});
   assert.equal(cloud.exercises[0].measurementProfile,profile);for(const field of Object.keys(values))assert.equal(cloud.exercises[0].sets[0][field],values[field]);
   a.state.cloud={...a.state.cloud,userId:'qa-member',gymId:'qa-gym'};a.state.gym.id='qa-gym';
   a.importBackupText(JSON.stringify({format:'fittrack-backup',schema:15,state:clone(a.state)}));
   assert.equal(a.state.history[0].exercises[0].measurementProfile,profile);for(const field of Object.keys(values))assert.equal(a.state.history[0].exercises[0].sets[0][field],values[field]);
   assert.equal(a.state.customPrograms[0].days[0].exercises[0].measurementProfile,profile);
 });
 }
 await test('Legacy mapping is additive; ambiguous and unknown profiles are flagged, never guessed from movement names',()=>{
   const a=fresh().app;
   for(const [raw,key]of [[{},'load_reps'],[{requiresWeight:false},'reps'],[{requiresWeight:false,requiresReps:false},'completed']])assert.equal(a.normalizeMeasurement(raw).measurementProfile,key);
   const old=a.exercise({name:'Plank',requiresWeight:true,requiresReps:false});assert.equal(old.measurementReview,true);assert.deepEqual(clone(a.measurementFields(old)),['weight']);
   const unknown=a.cloneExerciseDefinition(a.exercise({name:'Unknown',measurementProfile:'future_metric',setPlan:[{targetDurationSeconds:'90',targetDistanceMeters:'25'}]}));
   assert.equal(unknown.measurementReview,true);assert.equal(unknown.legacyMeasurementProfile,'future_metric');assert.equal(unknown.setPlan[0].targetDurationSeconds,'90');
   assert.equal(a.normalizeMeasurement({name:'Plank'}).measurementProfile,'load_reps');
 });
 await test('All twelve coach-defined sets render together; GIF stays outside scroller; no timer or auto-advance',()=>{
   const r=fixture('load_reps',12),a=r.app;a.renderWorkout();const d=dom(r.elements.flowLayer.innerHTML);
   assert.equal(d.querySelectorAll('.workout-set-row').length,12);assert.equal(d.querySelectorAll('[data-log-field]').length,24);
   assert.ok(d.querySelector('.workout-pinned-media img').getAttribute('src').endsWith('.gif'));
   assert.equal(d.querySelector('.member-player-scroll .workout-pinned-media'),null);assert.equal(d.querySelector('details').hasAttribute('open'),false);
   assert.equal(d.querySelectorAll('[data-action="next-exercise"]').length,1);assert.equal(d.querySelectorAll('.rest-flow').length,0);
   a.completeSet(0);assert.equal(a.state.currentWorkout.exerciseIndex,0);assert.equal(a.state.currentWorkout.setIndex,0);assert.equal(a.state.currentWorkout.status,'active');
 });
 await test('Paired values, decimal comma, finite bounds and integer counts are enforced for all profiles',()=>{
   const a=fresh().app;
   for(const profile of Object.keys(samples))assert.equal(a.measurementError({measurementProfile:profile},samples[profile],'kg'),'');
   assert.equal(a.measurementError({measurementProfile:'load_reps'},{weight:'42,5',reps:'10'},'kg'),'');
   assert.ok(a.measurementError({measurementProfile:'load_reps'},{weight:'42',reps:''},'kg'));
   assert.ok(a.measurementError({measurementProfile:'distance_duration'},{distanceMeters:'100'},'kg'));
   for(const bad of ['-1','Infinity','NaN','1e3','0','2.5'])assert.ok(a.measurementError({measurementProfile:'reps'},{reps:bad},'kg'));
   assert.ok(a.measurementError({measurementProfile:'duration'},{durationSeconds:'86401'},'kg'));
   assert.equal(a.measurementError({measurementProfile:'load_reps'},{weight:'',reps:''},'kg'),'');
 });
 await test('Forward navigation validates every row; skipping does not silently complete sets; previous preserves inputs',()=>{
   const r=fixture(),a=r.app;const original=clone(a.currentExercise());a.closeCurrentWorkout();setupWorkout(r,{moves:[original,{...clone(original),id:'second',name:'Second'}]});
   Object.assign(a.getLog(0,1,true),{weight:'50',reps:''});a.moveWorkoutExercise(1,true);assert.equal(a.state.currentWorkout.exerciseIndex,0);
   a.getLog(0,1,true).reps='10';a.moveWorkoutExercise(1,false);assert.equal(a.state.currentWorkout.exerciseIndex,0);assert.match(r.elements.sheetLayer.innerHTML,/henüz işaretlenmedi/);
   a.moveWorkoutExercise(1,true);assert.equal(a.state.currentWorkout.exerciseIndex,1);assert.equal(a.completedSetCount(a.state.currentWorkout),0);
   a.moveWorkoutExercise(-1,true);assert.equal(a.getLog(0,1,false).weight,'50');assert.equal(Boolean(a.getLog(0,1,false).completedAt),false);
 });
 await test('Finish blocks a later invalid completed row atomically; double finish creates one record',()=>{
   const r=fixture(),a=r.app;Object.assign(a.getLog(0,0,true),{weight:'50',reps:'10',completedAt:new Date().toISOString()});Object.assign(a.getLog(0,2,true),{weight:'25',reps:'',completedAt:new Date().toISOString()});
   a.finishWorkout();assert.equal(a.state.history.length,0);assert.equal(a.state.currentWorkout.summarySaved,false);
   a.getLog(0,2,true).reps='8';a.finishWorkout();a.finishWorkout();assert.equal(a.state.history.length,1);assert.equal(a.state.history[0].status,'partial');
 });
 await test('Previous values require explicit action, preserve completion and convert only weight units',()=>{
   const r=fixture('load_distance'),a=r.app,item=a.currentExercise();a.state.currentWorkout.units='lb';
   a.state.history=[a.normalizeHistoryItem({id:'earlier',syncId:'earlier',date:'2026-09-20',units:'kg',exercises:[{id:item.id,name:item.name,measurementProfile:'load_distance',sets:[{weight:'25',distanceMeters:'40',completedAt:'2026-09-20T12:00:00Z'}]}]})];
   assert.equal(a.getLog(0,0,false).weight||'','');a.usePreviousValues(0,false);assert.ok(Math.abs(Number(a.getLog(0,0,false).weight)-55.1)<.15);assert.equal(a.getLog(0,0,false).distanceMeters,'40');assert.equal(Boolean(a.getLog(0,0,false).completedAt),false);
   a.getLog(0,1,true).weight='99';a.getLog(0,1,true).distanceMeters='80';a.usePreviousValues(0,true);assert.equal(a.getLog(0,1,false).weight,'99');assert.match(r.elements.sheetLayer.innerHTML,/Girilen değerler değişsin/);
   a.usePreviousValues(0,true,true);assert.equal(a.getLog(0,1,false).distanceMeters,'40');
 });
 await test('Only completed weight × repetition sets count as tonnage; duration/distance are not volume',()=>{
   const a=fresh().app;const h={exercises:[{measurementProfile:'load_reps',sets:[{weight:'50',reps:'10',completedAt:'yes'},{weight:'999',reps:'99',completedAt:null}]},{measurementProfile:'load_distance',sets:[{weight:'50',distanceMeters:'100',reps:'10',completedAt:'yes'}]},{measurementProfile:'duration',sets:[{durationSeconds:'60',completedAt:'yes'}]}]};assert.equal(a.historyVolume(h),500);
 });
 await test('History has all open still-image cards, one Save, atomic validation, and discard protection',()=>{
   const r=fixture(),a=r.app;a.completeSet(0);a.finishWorkout();const h=a.state.history[0];a.openHistorySheet(h.id);
   const d=dom(r.elements.flowLayer.innerHTML);assert.equal(d.querySelectorAll('[data-action="save-history"]').length,1);assert.equal(d.querySelectorAll('details').length,0);assert.ok(!d.querySelector('img').getAttribute('src').endsWith('.gif'));
   const before=JSON.stringify(h);a.ui.historyDraft.exercises[0].sets[0].weight='20';a.saveHistory(h.id);assert.equal(JSON.stringify(h),before);
   a.closeHistoryEditor();assert.ok(a.ui.historyDraft);assert.match(r.elements.sheetLayer.innerHTML,/kaydedilmedi/);a.closeHistoryEditor(true);assert.equal(JSON.stringify(h),before);
   a.openHistorySheet(h.id);a.ui.historyDraft.exercises[0].sets[0].weight='20';a.ui.historyDraft.exercises[0].sets[0].reps='10';a.saveHistory(h.id);assert.equal(h.exercises[0].sets[0].weight,'20');assert.equal(h.cloudSyncedAt,'');assert.ok(h.modifiedAt);
 });
 await test('Upgrade recovery keeps the chosen session and pending new metric data across reload',()=>{
   const r=fixture('distance_duration'),a=r.app;Object.assign(a.getLog(0,1,true),samples.distance_duration);a.state.currentWorkout.setIndex=1;const snapshot=clone(a.state.currentWorkout.programSnapshot);const saved=clone(a.state);saved.schema=14;
   const next=runtime(saved).app;assert.equal(next.state.currentWorkout.setIndex,1);assert.equal(next.state.currentWorkout.dayId,a.state.currentWorkout.dayId);assert.equal(next.getLog(0,1,false).distanceMeters,'1250.5');assert.deepEqual(clone(next.state.currentWorkout.programSnapshot),snapshot);
 });
 await test('Program/static poster pipeline and keyboard ruler CSS are explicit release inputs',()=>{
   const a=fresh().app,item=a.catalogExercises()[0];assert.match(a.exerciseImg(item,'',''),/assets\/posters\//);assert.match(a.exerciseImg(item,'','',true),/assets\/gifs\//);
   const css=fs.readFileSync(path.join(root,'design-system.css'),'utf8');assert.doesNotMatch(css,/weight-ruler\s*\{\s*display:\s*none/);assert.match(css,/wizard-name-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
   assert.match(fs.readFileSync(path.join(root,'scripts/stage_web.cjs'),'utf8'),/workout-ui\.css/);assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/workout-ui\.css/);
 });
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/workout-0140.json'),JSON.stringify({method:'Production functions in VM, parsed DOM, synthetic records; no live accounts',results},null,2));
 for(const r of results)console.log(r.status,r.name,r.error||'');if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})();
