'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {fresh,setupWorkout,clone,root}=require('./review/harness.cjs');
const {parseHTML}=require('linkedom');
const dom=html=>parseHTML('<html><body>'+html+'</body></html>').document;
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
function fixture(){const r=fresh(),program=setupWorkout(r);r.app.closeCurrentWorkout();r.app.state.cloud.userId='coach-A';r.app.state.cloud.role='trainer';r.app.state.trainer.members=[{id:'member-A',name:'İlker Test',isSelf:false,joinedAt:r.app.todayKey(),assignments:[],history:[],note:''}];return {r,program,member:r.app.state.trainer.members[0]};}
test('Staff navigation opens all five root sections while member navigation stays separate',()=>{
 const {r}=fixture();r.app.render();assert.equal(dom(r.elements.bottomNav.innerHTML).querySelectorAll('[data-action="staff-nav"]').length,5);
 for(const [section,selector]of [['members','.members-flow'],['programs','.trainer-programs-flow'],['messages','.message-inbox-flow']]){r.click('staff-nav',{section});assert.ok(dom(r.elements.flowLayer.innerHTML).querySelector(selector));assert.equal(dom(r.elements.flowLayer.innerHTML).querySelector('[aria-current="page"]').dataset.section,section);}
 r.click('staff-nav',{section:'home'});assert.equal(r.elements.flowLayer.classList.contains('active'),false);
 r.app.state.cloud.role='member';r.app.render();assert.equal(dom(r.elements.bottomNav.innerHTML).querySelectorAll('[data-action="staff-nav"]').length,0);
});
test('Program name and publication filters include drafts and preserve the archived distinction',()=>{
 const {r,program}=fixture();program.name='İleri Kuvvet';r.app.state.customPrograms.push(r.app.normalizeCustomProgram({...clone(program),id:'draft',name:'Taslak Program',status:'draft'}));
 r.app.ui.programQuery='ileri';assert.deepEqual(Array.from(r.app.trainerProgramList(),x=>x.id),[program.id]);
 r.app.ui.programQuery='';r.app.ui.programFilter='draft';assert.deepEqual(Array.from(r.app.trainerProgramList(),x=>x.id),['draft']);
 r.app.ui.programFilter='published';assert.deepEqual(Array.from(r.app.trainerProgramList(),x=>x.id),[program.id]);
});
test('Program detail shows real days and assigned members; member Back returns to its program',()=>{
 const {r,program,member}=fixture();member.assignments=[{programId:program.id}];
 r.app.renderStaffProgramDetail(program.id);assert.equal(dom(r.elements.flowLayer.innerHTML).querySelectorAll('.trainer-program-day').length,program.days.length);
 r.click('staff-program-tab',{tab:'members'});assert.equal(dom(r.elements.flowLayer.innerHTML).querySelectorAll('.trainer-member-card').length,1);
 r.click('trainer-member',{memberId:member.id});assert.equal(r.app.ui.trainerMemberId,member.id);
 r.app.handleBackNavigation();assert.equal(r.app.ui.staffProgramId,program.id);assert.equal(r.app.ui.staffProgramTab,'members');
});
test('Program picker preselects a real published program but never writes an assignment',()=>{
 const {r,program,member}=fixture();r.app.openProgramMemberPicker(program.id);
 r.click('staff-program-assign-member',{programId:program.id,memberId:member.id});
 assert.equal(r.elements.trainerProgram.value,program.id);assert.equal(member.assignments.length,0);
 member.assignments=[{programId:program.id}];r.click('staff-program-assign-member',{programId:program.id,memberId:member.id});assert.equal(member.assignments.length,1);
});
test('Assignment shortcut returns to the originating program; closing clears that return route',()=>{
 const {r,program,member}=fixture();r.app.renderStaffProgramDetail(program.id,'members');
 r.click('trainer-assign-shortcut',{memberId:member.id});assert.equal(r.app.ui.staffMemberReturn,program.id);
 r.app.handleBackNavigation();assert.equal(r.app.ui.staffProgramId,program.id);
 r.click('trainer-member',{memberId:member.id});r.click('close-trainer');assert.equal(r.app.ui.staffMemberReturn,'');
 r.click('trainer-member',{memberId:member.id});r.app.handleBackNavigation();assert.equal(r.app.ui.staffProgramId,'');
});
test('Inbox search includes conversation text and combines with unread state',()=>{
 const {r,member}=fixture();r.app.state.messages=[{id:'a',senderId:member.id,recipientId:'coach-A',body:'Omuz hareketi hakkında',createdAt:new Date().toISOString(),readAt:''}];
 r.app.ui.inboxQuery='omuz';r.app.ui.inboxFilter='unread';assert.equal(r.app.chatInboxEntries().length,1);
 r.app.state.messages[0].readAt=new Date().toISOString();assert.equal(r.app.chatInboxEntries().length,0);
 r.app.ui.inboxFilter='all';assert.equal(r.app.chatInboxEntries().length,1);r.app.ui.inboxQuery='başka';assert.equal(r.app.chatInboxEntries().length,0);
});
test('Chat member info overlays the conversation without losing typed composer text',()=>{
 const {r,member}=fixture();r.app.openChat(member.id,'inbox');r.elements.chatInput=r.document.getElementById('chatInput');r.elements.chatInput.value='Henüz gönderilmedi';
 r.click('chat-member-info');assert.match(r.elements.sheetLayer.innerHTML,/İlker Test/);r.click('close-sheet');assert.equal(r.elements.chatInput.value,'Henüz gönderilmedi');assert.equal(r.app.ui.chatPartnerId,member.id);
});
test('Staff tab transition protects a modified editor draft until the exit decision',()=>{
 const {r}=fixture();r.click('studio-new');r.app.ui.editorDraft.name='Korunacak taslak';r.click('staff-nav',{section:'messages'});
 assert.ok(r.app.ui.editorDraft);assert.ok(r.elements.sheetLayer.classList.contains('active'));assert.equal(r.app.ui.editorDraft.name,'Korunacak taslak');
});
async function bootstrap({workers=[],keys=[],fail=false}={}){
 const calls=[],data={auth:'token-placeholder',workout:'typed-values'};
 const window={};const context={window,navigator:{serviceWorker:{getRegistrations:async()=>workers.map(scope=>({scope,unregister:async()=>calls.push('unregister:'+scope)}))}},location:{origin:'https://localhost',reload:()=>calls.push('reload')},caches:{keys:async()=>{if(fail)throw Error('cache unavailable');return keys;},delete:async key=>calls.push('delete:'+key)},localStorage:{getItem:k=>data[k],setItem:()=>{throw Error('Must not modify user storage');},clear:()=>{throw Error('Must not clear user storage');}}};window.caches=context.caches;
 vm.runInNewContext(fs.readFileSync(path.join(root,'android/app/src/main/assets/native-bootstrap.js'),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));return {calls,data,window};
}
test('Native bootstrap removes only app caches/root worker, preserving Auth and workout storage',async()=>{
 const r=await bootstrap({workers:['https://localhost/','https://localhost/other/'],keys:['fittrack-v0119','unrelated']});
 assert.deepEqual(r.calls.sort(),['delete:fittrack-v0119','reload','unregister:https://localhost/'].sort());assert.equal(r.data.auth,'token-placeholder');assert.equal(r.data.workout,'typed-values');
});
test('Native bootstrap does not reload a clean app and retries safely after a cache error',async()=>{
 assert.deepEqual((await bootstrap()).calls,[]);const r=await bootstrap({fail:true});assert.equal(r.window.__fittrackNativeCacheChecked,false);assert.deepEqual(r.calls,[]);
});
test('Release identity and native controls match the upgrade contract',()=>{
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 assert.equal(JSON.parse(read('package.json')).version,'0.14.3');assert.match(read('android/app/build.gradle'),/versionCode 35/);assert.match(read('android/app/build.gradle'),/versionName "0.14.3"/);
 const config=JSON.parse(read('capacitor.config.json'));assert.equal(config.server.hostname,'localhost');assert.equal(config.plugins.App.disableBackButtonHandler,true);
 assert.match(read('styles.css'),/--safe-top: var\(--safe-area-inset-top, env\(safe-area-inset-top, 0px\)\)/);
 assert.match(read('android/gradle/wrapper/gradle-wrapper.properties'),/distributionSha256Sum=[0-9a-f]{64}/);
});
(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.stack);}}console.log(`${tests.length-failed}/${tests.length} release contracts passed. No browser/phone execution.`);process.exitCode=failed?1:0;})();
