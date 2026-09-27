'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fresh,runtime,setupWorkout,root,clone}=require('./review/harness.cjs');
const results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
(async()=>{
 await test('Measurement dates and values reject invalid data without inventing missing fields',()=>{
  const a=fresh().app;
  const rows=a.normalizeBodyMeasurements([{id:'good',date:'2026-09-20',waist:82,neck:''},{id:'bad',date:'2026-02-30',waist:80},{id:'invalid',date:'2026-09-20',arm:-2,hip:'bad'}]);
  assert.equal(rows.length,2);assert.equal(rows.find(x=>x.id==='good').waist,82);assert.equal(rows.find(x=>x.id==='good').neck,undefined);assert.equal(rows.find(x=>x.id==='invalid').arm,undefined);
 });
 await test('Snapshot conflict merge preserves both devices and newest edit, including removal of a field',()=>{
  const a=fresh().app;a.state.bodyMeasurements=[{id:'same',date:'2026-09-20',modifiedAt:'2026-09-20T12:00:00Z',waist:82,neck:38},{id:'local',date:'2026-09-21',arm:34}];
  a.applyRemoteSnapshot({bodyMeasurements:[{id:'same',date:'2026-09-20',modifiedAt:'2026-09-21T12:00:00Z',waist:81},{id:'remote',date:'2026-09-21',hip:96}]});
  assert.equal(a.state.bodyMeasurements.length,3);const row=a.state.bodyMeasurements.find(x=>x.id==='same');assert.equal(row.waist,81);assert.equal(row.neck,undefined);
  assert.deepEqual(clone(a.getCloudSnapshot().bodyMeasurements),clone(a.state.bodyMeasurements));
  a.applyRemoteSnapshot({});assert.equal(a.state.bodyMeasurements.length,3);
 });
 await test('Measurement history survives reload and remains isolated between accounts',()=>{
  const r=fresh(),a=r.app;a.activateAccount('user-a','a@example.invalid');a.state.bodyMeasurements=[{id:'a',date:'2026-09-20',waist:82}];a.saveState();
  const reloaded=runtime(a.state);assert.equal(reloaded.app.state.bodyMeasurements[0].waist,82);
  a.activateAccount('user-b','b@example.invalid');assert.equal(a.state.bodyMeasurements.length,0);a.activateAccount('user-a','a@example.invalid');assert.equal(a.state.bodyMeasurements[0].waist,82);
 });
 await test('Failed-message callback cannot change a different signed-in account',async()=>{
  const r=fresh(),a=r.app;a.state.cloud.userId='a';a.state.cloud.gymId='gym-a';let reject;
  r.window.FitTrackCloud={sendMessage:()=>new Promise((_,no)=>reject=no)};
  const message=a.normalizeMessage({senderId:'a',recipientId:'coach',body:'test',pending:true,clientMutationId:'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'});a.state.messages=[message];const promise=a.deliverChatMessage(message);
  a.state.cloud.userId='b';a.state.cloud.gymId='gym-b';a.state.messages=[];reject(Error('offline'));await promise;assert.equal(a.state.messages.length,0);
 });
 await test('Acknowledged message clears failure and deduplicates by client mutation ID',()=>{
  const a=fresh().app,id='aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';const local={id:'local',clientMutationId:id,senderId:'a',recipientId:'b',body:'hello',pending:true,failed:true};
  const merged=a.mergeMessages([local],[{...local,id:'server',pending:false}]);assert.equal(merged.length,1);assert.equal(merged[0].id,'server');assert.equal(merged[0].failed,false);
 });
 await test('Unsynced local data guard offers sync and backup without deletion',()=>{
  const r=fresh();r.app.state.cloud.pending=2;r.app.confirmClearData();assert.match(r.elements.sheetLayer.innerHTML,/sync-before-clear/);assert.match(r.elements.sheetLayer.innerHTML,/save-data/);assert.doesNotMatch(r.elements.sheetLayer.innerHTML,/data-action="clear-data"/);
 });
 await test('Countdown starts only after explicit session selection and cancellation clears timers',()=>{
  const r=fresh(),a=r.app;setupWorkout(r);a.state.currentWorkout=null;a.openSessionPicker(false);assert.equal(a.state.currentWorkout,null);a.ui.sessionDayId=a.currentProgram().days[0].id;a.beginWorkoutSession();assert.match(r.elements.flowLayer.innerHTML,/countdown-flow/);assert.ok(a.state.currentWorkout);a.pauseWorkout();assert.equal(a.state.currentWorkout.status,'paused');assert.equal(a.ui.countdownTimer,null);
 });
 await test('Production bundles ship the new stylesheet and contain no QA exports',()=>{
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/reference-ui.css\?v=0.14.3/);assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/reference-ui.css/);
  for(const name of ['app.js','cloud.js'])assert.doesNotMatch(fs.readFileSync(path.join(root,name),'utf8'),/window\.__qa/);
 });
 await test('Finishing a duration workout stops the stopwatch before history is captured',()=>{
  const r=fresh(),a=r.app;const move=a.cloneExerciseDefinition(a.catalogExercises()[0]);Object.assign(move,a.normalizeMeasurement({measurementProfile:'duration'}));setupWorkout(r,{moves:[move]});
  Object.assign(a.getLog(0,0,true),{durationSeconds:'1',completedAt:new Date().toISOString()});
  a.ui.measurementTimer={id:a.state.currentWorkout.syncId,exercise:0,set:0,seconds:1,startedAt:Date.now()-31000,interval:123};
  a.finishWorkout(true);assert.equal(a.ui.measurementTimer,null);assert.ok(Number(a.state.history[0].exercises[0].sets[0].durationSeconds)>=32);
 });
 fs.writeFileSync(path.join(root,'test-results/reference-0143.json'),JSON.stringify({method:'Local VM with controlled timers and storage; no live server',results},null,2));
 for(const r of results)console.log(r.status,r.name,r.error||'');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})();
