'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fresh,setupWorkout,clone,cloudRuntime,root}=require('./review/harness.cjs');
const {parseHTML}=require('linkedom');
const dom=html=>parseHTML('<html><body>'+html+'</body></html>').document;
const tests=[],test=(n,f)=>tests.push([n,f]);
function multi(){const r=fresh(),a=r.app,p=setupWorkout(r);a.closeCurrentWorkout();p.days.push({...clone(p.days[0]),id:'push',name:'İtiş',weekday:2},{...clone(p.days[0]),id:'legs',name:'Bacak',weekday:3});p.trainingWeekdays=[1,2,3];a.refreshPrograms();return {r,a,p};}
test('Every multi-day start route asks for a session without default selection',()=>{
 for(const action of ['start','start-assigned-program']){
 const {r,a,p}=multi();r.click(action,{programId:p.id});const d=dom(r.elements.flowLayer.innerHTML);
 assert.equal(a.state.currentWorkout,null);assert.equal(d.querySelectorAll('.session-option').length,3);assert.equal(d.querySelectorAll('[aria-pressed="true"]').length,0);
 assert.ok(d.querySelector('[data-action="begin-workout-session"]').hasAttribute('disabled'));
 }
});
test('Explicit third session starts its exercises; resume never returns to picker',()=>{
 const {r,a,p}=multi();a.openCountdown();r.click('choose-workout-session',{dayId:'legs'});assert.equal(a.state.currentWorkout,null);
 r.click('begin-workout-session');assert.equal(a.state.currentWorkout.dayId,'legs');assert.equal(a.currentProgramDay().name,'Bacak');
 a.closeFlow();r.click('start');assert.ok(!r.elements.flowLayer.innerHTML.includes('Hangi antrenmanı'));assert.equal(a.state.currentWorkout.dayId,'legs');
 const normalized=a.normalizeCurrentWorkout(clone(a.state.currentWorkout));assert.equal(normalized.dayId,'legs');
});
test('Repeated completed session prompts once, can cancel or explicitly repeat',()=>{
 const {r,a,p}=multi();a.state.history=[a.normalizeHistoryItem({id:'done',programId:p.id,dayId:'push',date:a.todayKey(),status:'completed'})];
 a.openSessionPicker();r.click('choose-workout-session',{dayId:'push'});r.click('begin-workout-session');
 assert.equal(a.state.currentWorkout,null);assert.match(r.elements.sheetLayer.innerHTML,/bu hafta tamamladın/);
 r.click('close-sheet');assert.equal(a.state.currentWorkout,null);r.click('begin-workout-session');r.click('repeat-workout-session');assert.equal(a.state.currentWorkout.dayId,'push');
 const id=a.state.currentWorkout.id;r.click('repeat-workout-session');assert.equal(a.state.currentWorkout.id,id);
});
test('Partial, demo, previous week, other program and unidentified legacy records never fake repeat history',()=>{
 const {a,p}=multi();const day=p.days[1];a.state.history=[
 {programId:p.id,dayId:day.id,status:'partial',date:a.todayKey()},
 {programId:p.id,dayId:day.id,status:'completed',isDemo:true,date:a.todayKey()},
 {programId:'other',dayId:day.id,status:'completed',date:a.todayKey()},
 {name:p.name+' · '+day.name,status:'completed',date:a.todayKey()},
 {programId:p.id,dayId:day.id,status:'completed',date:a.addDays(a.mondayFor(a.todayKey()),-1)}
 ];assert.equal(a.sessionDoneThisWeek(p,day),false);assert.equal(a.sessionHistory(p,day).length,1);
});
test('Removed assignment between picker and confirm cannot start; cancellation starts nothing',()=>{
 const {a,r}=multi();a.openSessionPicker();r.click('choose-workout-session',{dayId:'legs'});a.state.assignments=[];a.state.assignment=null;r.click('begin-workout-session');assert.equal(a.state.currentWorkout,null);
});
test('Session identity and flexible weekdays survive program snapshot, history and cloud roundtrip',()=>{
 const {a,r,p}=multi();a.openSessionPicker();r.click('choose-workout-session',{dayId:'legs'});r.click('begin-workout-session');
 a.getCurrentLog().weight='50';a.getCurrentLog().reps='10';a.getCurrentLog().completedAt=new Date().toISOString();
 const h=a.workoutHistoryItem(a.state.currentWorkout,false);assert.equal(h.dayId,'legs');assert.equal(h.programId,p.id);
 const back=a.workoutRowToHistory({payload:h,client_mutation_id:h.syncId,status:h.status,finished_at:h.finishedAt,started_at:h.startedAt,duration_minutes:h.duration});assert.equal(back.dayId,'legs');
 assert.deepEqual(clone(a.snapshotProgram(p).trainingWeekdays),[1,2,3]);assert.equal(a.activeProgramDay(p,'legs').id,'legs');
});
test('Weighted sets require paired weight/reps or both blank; bodyweight remains reps-only',()=>{
 const r=fresh(),a=r.app;setupWorkout(r);const log=a.getCurrentLog();
 for(const [weight,reps,ok] of [['50','',false],['','10',false],['50','10',true],['','',true],['-1','10',false],['50','2.5',false]]){log.weight=weight;log.reps=reps;assert.equal(a.validateCurrentLog(),ok,weight+'/'+reps);}
 a.currentExercise().requiresWeight=false;log.weight='';log.reps='10';assert.equal(a.validateCurrentLog(),true);
});
test('Settings is a fifth trainer destination, no redundant home buttons or salon group',()=>{
 const {r,a}=multi();a.state.cloud.userId='coach';a.state.cloud.role='trainer';a.render();
 const nav=dom(r.elements.bottomNav.innerHTML);assert.equal(nav.querySelectorAll('[data-action="staff-nav"]').length,5);
 assert.equal(dom(r.elements.screen.innerHTML).querySelector('.trainer-home-quick-actions'),null);
 r.click('staff-nav',{section:'settings'});assert.equal(a.ui.tab,'profile');assert.doesNotMatch(r.elements.screen.innerHTML,/>SALON</);
 assert.equal(dom(r.elements.bottomNav.innerHTML).querySelector('[aria-current="page"]').dataset.section,'settings');
});
test('Foreign and unidentified backups are rejected before changing state, programs or storage',()=>{
 const r=fresh(),a=r.app;setupWorkout(r);a.state.cloud={...a.state.cloud,userId:'user-A',gymId:'gym-A'};a.state.gym.id='gym-A';
 const before=JSON.stringify(a.state),storage=JSON.stringify([...r.store]),programs=JSON.stringify(a.programs);
 for(const patch of [{userId:'user-B',gymId:'gym-A'},{userId:'user-A',gymId:'gym-B'},{userId:'',gymId:''}]){
 const backup=clone(a.state);backup.cloud={...backup.cloud,...patch};backup.gym.id=patch.gymId;
 assert.throws(()=>a.importBackupText(JSON.stringify({format:'fittrack-backup',schema:14,state:backup})),/farklı/);
 assert.equal(JSON.stringify(a.state),before);assert.equal(JSON.stringify([...r.store]),storage);assert.equal(JSON.stringify(a.programs),programs);
 }
});
test('Same-account backup imports data but cannot replace active cloud role or gym',()=>{
 const r=fresh(),a=r.app;setupWorkout(r);a.state.cloud={...a.state.cloud,userId:'user-A',gymId:'gym-A',role:'member'};a.state.gym.id='gym-A';
 const backup=clone(a.state);backup.cloud.role='admin';backup.profile.firstName='Restored';backup.gym.name='Old';
 a.importBackupText(JSON.stringify({format:'fittrack-backup',schema:14,state:backup}));
 assert.equal(a.state.profile.firstName,'Restored');assert.equal(a.state.cloud.role,'member');assert.notEqual(a.state.gym.name,'Old');
});
test('Notification tap is bound to account, gym and existing partner, including delayed account switch',()=>{
 const r=fresh(),a=r.app;a.state.cloud={...a.state.cloud,userId:'user-A',gymId:'gym-A',role:'member'};a.state.gym={...a.state.gym,id:'gym-A',coachId:'coach-A'};
 const extra={userId:'user-A',gymId:'gym-A',partnerId:'coach-A'};
 assert.equal(a.messageNotificationContextMatches(extra),true);
 for(const patch of [{userId:'user-B'},{gymId:'gym-B'},{partnerId:'removed'}]) assert.equal(a.messageNotificationContextMatches({...extra,...patch}),false);
 let listener;r.window.Capacitor={Plugins:{LocalNotifications:{addListener:(name,fn)=>{listener=fn;}}}};
 a.registerMessageNotificationActions();listener({notification:{extra}});a.state.cloud.userId='user-B';r.timer(80);assert.equal(a.ui.chatPartnerId,'');
});
test('Auth callback requires exact destination and credentials even with an existing session',async()=>{
 let called=0;const r=await cloudRuntime({auth:{getSession:async()=>{called++;return {data:{session:{user:{id:'existing'}}}}}}});
 for(const url of ['com.fittracklabs.mobile://auth-callback.evil?code=x','com.fittracklabs.mobile://auth-callback/path?code=x','com.fittracklabs.mobile://user@auth-callback?code=x'])assert.equal(await r.c.handleAuthCallbackUrl(url),false);
 await assert.rejects(r.c.handleAuthCallbackUrl('com.fittracklabs.mobile://auth-callback?type=recovery'),/eksik/);assert.equal(called,0);
});
test('Verified PKCE recovery is deduplicated in-flight and after success',async()=>{
 let count=0,resolve;const gate=new Promise(r=>resolve=r);const r=await cloudRuntime({auth:{exchangeCodeForSession:async()=>{count++;await gate;return {data:{session:{user:{id:'verified'}},redirectType:'recovery'}}}}});
 const url='com.fittracklabs.mobile://auth-callback?code=once',one=r.c.handleAuthCallbackUrl(url),two=r.c.handleAuthCallbackUrl(url);resolve();await Promise.all([one,two]);await r.c.handleAuthCallbackUrl(url);assert.equal(count,1);assert.match(r.elements.authLayer.innerHTML,/Şifre|şifre/);
});
test('Untrusted recovery type cannot open password-update form after ordinary token validation',async()=>{
 const r=await cloudRuntime({auth:{setSession:async()=>({data:{session:{user:{id:'ordinary'}}}})}});
 await assert.rejects(r.c.handleAuthCallbackUrl('com.fittracklabs.mobile://auth-callback#access_token=x&refresh_token=y&type=recovery'),/doğrulama kodunu/);
 assert.doesNotMatch(r.elements.authLayer.innerHTML,/data-cloud-form="update-password"/);
});
(async()=>{const results=[];for(const[name,fn]of tests){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}}
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/phone-fixes-0121.json'),JSON.stringify({method:'Node VM / parsed DOM / mocked native and auth; no real phone or remote service',results},null,2));
for(const r of results)console.log(r.status,r.name,r.error||'');if(results.some(r=>r.status==='FAIL'))process.exitCode=1;})();
