'use strict';
const {chromium}=require(process.env.FITTRACK_PLAYWRIGHT || 'playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../test-results/browser-0121');fs.mkdirSync(out,{recursive:true});
const {spawn}=require('node:child_process');
const preview=spawn(process.execPath,[path.join(__dirname,'ui-preview-0121.cjs')],{stdio:['ignore','pipe','pipe']});
const previewReady=new Promise((resolve,reject)=>{preview.stdout.once('data',resolve);preview.once('error',reject);preview.once('exit',code=>reject(new Error('Preview server exited '+code)));});
(async()=>{
 await previewReady;
 const browser=await chromium.launch({executablePath:process.env.FITTRACK_CHROME || undefined,headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){await fn();results.push({name,status:'PASS'});}
 async function open(scene,theme='redline-editorial'){await page.goto('http://127.0.0.1:4177/app/?scenario='+scene+'&theme='+theme);await page.waitForFunction(()=>!!window.__qa);await page.evaluate(()=>{window.__qa.state.profile.setupComplete=true});}
 async function seedStaff(){await page.evaluate(()=>{
 const a=window.__qa;a.closeCurrentWorkout();a.state.cloud.userId='coach-test';a.state.cloud.role='trainer';a.state.gym.id='gym-test';a.state.cloud.gymId='gym-test';
 const p=a.state.customPrograms[0];p.name='Full Body Dengeli';p.days.push({...JSON.parse(JSON.stringify(p.days[0])),id:'push',name:'İtiş'}, {...JSON.parse(JSON.stringify(p.days[0])),id:'legs',name:'Bacak'});p.trainingWeekdays=[1,3,5];
 a.state.trainer.members=[
 {id:'member-A',name:'Ayşe Yılmaz',isSelf:false,joinedAt:a.addDays(a.todayKey(),-40),assignments:[a.normalizeAssignment({programId:p.id},0,'Alper')],history:[],note:''},
 {id:'member-B',name:'Mert Kaya',isSelf:false,joinedAt:a.todayKey(),assignments:[],history:[],note:''},
 {id:'member-C',name:'Deniz Arslan',isSelf:false,joinedAt:a.todayKey(),assignments:[a.normalizeAssignment({programId:p.id},0,'Alper')],history:[a.normalizeHistoryItem({id:'recent',date:a.todayKey(),name:p.name,status:'completed'})],note:''}];
 a.state.messages=[a.normalizeMessage({id:'msg-A',senderId:'member-A',recipientId:'coach-test',body:'Hocam programı görüşebilir miyiz?',createdAt:new Date().toISOString()})];a.render();
 });}
 async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 for(const theme of ['volt-discipline','crimson-graphite','plum-night','redline-editorial','rosewood-strength','sage-motion']){
 await check('Trainer home / '+theme,async()=>{await open('staff',theme);await seedStaff();await noOverflow();assert.equal(await page.locator('#bottomNav [data-action="staff-nav"]').count(),5);await page.evaluate(()=>Promise.allSettled([...document.images].map(im=>im.decode())));await page.screenshot({animations:'disabled',path:path.join(out,'home-'+theme+'.png')});});
 
 await check('Theme '+theme+' / member list, editor and chat draft',async()=>{
 await page.locator('#bottomNav [data-section="members"]').click();await noOverflow();
 await page.locator('#flowLayer [data-section="programs"]').click();await noOverflow();
 await page.evaluate(()=>{const a=window.__qa;a.ui.editorDraft=a.editorDraftFromProgram(a.state.customPrograms[0],true);a.ui.studioStep=2;a.renderStudioEditor();});await noOverflow();
 assert.equal(await page.locator('[data-action="studio-training-weekday"]').count(),7);
 await page.evaluate(()=>{const a=window.__qa;a.ui.editorDraft=null;a.openChat('member-A');});await noOverflow();
 await page.locator('#chatInput').fill('Gönderilmemiş test taslağı');
 await page.evaluate(()=>window.__qa.openChatMemberInfo());assert.equal(await page.getByText('Sohbete dön',{exact:true}).count(),0);
 await page.locator('#sheetLayer [data-action="close-sheet"]').last().click();assert.equal(await page.locator('#chatInput').inputValue(),'Gönderilmemiş test taslağı');
 await page.evaluate(()=>{const a=window.__qa;a.closeChat();a.closeFlow();a.ui.tab='home';a.render();});
 });
 }
 await check('Members, programs and settings; separate row controls',async()=>{
 await page.locator('#bottomNav [data-section="members"]').click();await noOverflow();await page.screenshot({animations:'disabled',path:path.join(out,'members.png')});
 await page.locator('#flowLayer [data-section="programs"]').click();await noOverflow();
 const geometry=await page.locator('.trainer-program-row').evaluateAll(rows=>rows.map(row=>{const buttons=row.querySelectorAll(':scope > button');const a=buttons[0].getBoundingClientRect(),b=buttons[1].getBoundingClientRect();return {gap:b.left-a.right,width:b.width};}));
 assert.ok(geometry.length);for(const row of geometry){assert.ok(row.gap>=4,JSON.stringify(row));assert.ok(row.width>=43);}
 await page.screenshot({animations:'disabled',path:path.join(out,'programs.png')});await page.locator('#flowLayer [data-section="settings"]').click();await noOverflow();
 assert.equal(await page.locator('#bottomNav [aria-current="page"]').getAttribute('data-section'),'settings');await page.screenshot({animations:'disabled',path:path.join(out,'settings.png')});
 });
 await check('Three-session choice and explicit third day start',async()=>{
 await open('empty');await page.evaluate(()=>{const a=window.__qa,p=a.state.customPrograms[0];p.days.push({...JSON.parse(JSON.stringify(p.days[0])),id:'push',name:'İtiş'},{...JSON.parse(JSON.stringify(p.days[0])),id:'legs',name:'Bacak'});a.state.assignments=[a.normalizeAssignment({programId:p.id})];a.state.selectedProgramId=p.id;a.state.assignment=a.state.assignments[0];a.render();});
 await page.locator('[data-action="start-assigned-program"]').first().click();assert.equal(await page.locator('.session-option').count(),3);assert.equal(await page.locator('.session-option[aria-pressed="true"]').count(),0);assert.ok(await page.locator('[data-action="begin-workout-session"]').isDisabled());
 await page.screenshot({animations:'disabled',path:path.join(out,'session-picker.png')});await page.locator('[data-day-id="legs"]').click();await page.locator('[data-action="begin-workout-session"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.currentWorkout.dayId),'legs');
 });
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:568},{width:740,height:360}]){
 await check('Workout viewport '+viewport.width+'x'+viewport.height,async()=>{
 await page.setViewportSize(viewport);await open('active','crimson-graphite');await noOverflow();
 const b=await page.locator('[data-action="complete-set"]').boundingBox();assert.ok(b.y>=0&&b.y+b.height<=viewport.height+1,JSON.stringify(b));
 const screen=await page.locator('.member-workout').boundingBox();assert.ok(screen.x>=0&&screen.y>=0&&screen.x+screen.width<=viewport.width+1,JSON.stringify(screen));
 await page.screenshot({animations:'disabled',path:path.join(out,'workout-'+viewport.width+'x'+viewport.height+'.png')});
 await page.locator('[data-log-field="weight"]').fill('');await page.locator('[data-action="complete-set"]').click();assert.ok((await page.locator('#entryWarning').textContent()).includes('birlikte'));
 });
 }
 await check('Profile wizard responds to reduced visual viewport',async()=>{
 await page.setViewportSize({width:390,height:430});await open('empty');await page.evaluate(()=>window.__qa.openProfileWizard());await noOverflow();
 await page.locator('[data-profile-wizard="firstName"]').fill('Alper');
 const b=await page.locator('[data-action="profile-wizard-next"]').boundingBox();assert.ok(b.y>=0&&b.y+b.height<=430,JSON.stringify(b));
 await page.screenshot({animations:'disabled',path:path.join(out,'profile-reduced-viewport.png')});
 });
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:await browser.version(),method:'Headless desktop Chrome; synthetic local accounts; viewport emulation, not Android keyboard',results,errors},null,2));
 console.log(results);await browser.close();preview.kill();
})().catch(e=>{preview.kill();console.error(e);process.exit(1)});
