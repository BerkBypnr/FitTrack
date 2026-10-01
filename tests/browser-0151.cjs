'use strict';
// Regression for the recorded 0.15.0 whole-page horizontal overflow.
const {chromium}=require(process.env.FITTRACK_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const out=path.resolve(__dirname,'../test-results/browser-0151');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'ui-preview-0130.cjs')],{stdio:['ignore','pipe','inherit']});
let browser;const results=[],errors=[];
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 browser=await chromium.launch({headless:true,executablePath:process.env.FITTRACK_CHROME});
 const page=await browser.newPage({viewport:{width:392,height:850},hasTouch:true,reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:4178/');await page.waitForFunction(()=>window.__qa&&window.__qaCloud);
 async function fixture(count,theme='dark-red'){
  await page.evaluate(({count,theme})=>{
   const a=window.__qa;window.__qaCloud.hideLayer();a.closeFlow();a.closeSheet();a.state=a.defaultState(false);a.state.profile.setupComplete=true;
   a.state.profile.name='Aylin Test';a.state.theme=theme;a.state.gym.name='Berdony';a.state.gym.coach='Berk';
   const move=a.cloneExerciseDefinition(a.catalogExercises()[0]);
   a.state.customPrograms=Array.from({length:count},(_,i)=>a.normalizeCustomProgram({id:'home-qa-'+i,name:i===4?'Uzun program adı ile kuvvet ve dayanıklılık antrenmanı':'Program '+(i+1),status:'published',days:[{id:'day-'+i,name:'Çekiş',exercises:[move]}]}));
   a.refreshPrograms();a.state.assignments=a.state.customPrograms.map((p,i)=>a.normalizeAssignment({programId:p.id},i,'Berk'));a.state.assignment=a.state.assignments[0]||null;a.ui.tab='home';a.applyTheme();a.render();
  },{count,theme});
  await page.waitForTimeout(100);
 }
 async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});await page.screenshot({path:path.join(out,'FAIL-'+results.length+'.png')});}}
 async function bounds(){return page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,carousel:(()=>{const e=document.querySelector('.member-program-carousel');return e?{client:e.clientWidth,scroll:e.scrollWidth,left:e.scrollLeft}:null})()}));}
 // Toggle only the old sizing rules in the real browser to demonstrate this test detects the regression.
 await fixture(5);
 const old=await page.addStyleTag({content:'.member-home{grid-template-columns:none;min-width:auto;width:auto}.member-home>*{min-width:revert}.member-program-carousel{min-width:auto;max-width:none;grid-auto-columns:clamp(218px,72vw,270px)}'});
 const before=await bounds();assert.ok(before.doc>before.width,'Expected reproduction of 0.15.0 overflow');
 fs.writeFileSync(path.join(out,'before-metrics.json'),JSON.stringify(before,null,2));
 await page.screenshot({path:path.join(out,'before-overflow.png')});await old.evaluate(e=>e.remove());
 for(const width of [320,360,392,740]) for(const theme of ['dark-red','plum-night','redline-editorial','rosewood-strength']){
  await check(width+'px / '+theme+' / page fits and carousel scrolls',async()=>{
   await page.setViewportSize({width,height:width===740?360:850});await fixture(5,theme);
   const b=await bounds();assert.ok(b.doc<=width+1,JSON.stringify(b));assert.ok(b.body<=width+1,JSON.stringify(b));assert.ok(b.carousel.scroll>b.carousel.client);
   await page.locator('.member-program-carousel').evaluate(e=>e.scrollTo({left:e.scrollWidth,behavior:'instant'}));await page.waitForTimeout(150);
   assert.ok((await bounds()).carousel.left>0);assert.equal(await page.evaluate(()=>scrollX),0);
   await page.locator('.member-program-carousel').evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));
   if(width===392) await page.screenshot({path:path.join(out,'home-'+theme+'.png')});
  });
 }
 await check('Real touch gesture scrolls cards but not document',async()=>{
  await page.setViewportSize({width:392,height:850});await fixture(5);
  const box=await page.locator('.member-program-media').first().boundingBox();const cdp=await page.context().newCDPSession(page);
  const x=box.x+box.width-20,y=box.y+60;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*24,y}]});await page.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(450);
  assert.ok((await bounds()).carousel.left>100);assert.equal(await page.evaluate(()=>scrollX),0);await cdp.detach();
 });
 await check('Dark red uses one shared primary red; other themes retain their own palettes',async()=>{
  await fixture(5);const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return ['--mint','--mint-strong','--primary-start','--primary-end'].map(k=>s.getPropertyValue(k).trim());});
  assert.deepEqual(colors,['#e52332','#e52332','#e52332','#e52332']);
  assert.equal(await page.locator('.member-program-start').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(229, 35, 50)');
  for(const [theme,color] of [['plum-night','#f0aec2'],['redline-editorial','#d9362b'],['rosewood-strength','#8e2f50']]){
   await fixture(2,theme);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--mint').trim()),color);
  }
 });
 for(const count of [0,1]) await check('Empty/single program layout '+count,async()=>{await fixture(count);assert.ok((await bounds()).doc<=393);assert.equal(await page.locator('.member-program-card').count(),count);});
 await check('Large text stays within viewport',async()=>{await page.setViewportSize({width:320,height:850});await fixture(5);const style=await page.addStyleTag({content:'.member-home h1,.member-home h2,.member-home strong,.member-home button{font-size:24px!important}'});const b=await bounds();assert.ok(b.doc<=321,JSON.stringify(b));await style.evaluate(e=>e.remove());});
 await check('Multi-session card opens its session picker',async()=>{await page.setViewportSize({width:392,height:850});await fixture(5);await page.evaluate(()=>{const a=window.__qa,p=a.state.customPrograms[0];p.days.push({...p.days[0],id:'second-day',name:'İtiş'});a.refreshPrograms();a.render();});await page.locator('.member-program-start').first().click();assert.equal(await page.locator('[data-action="choose-workout-session"]').count(),2);assert.equal(await page.evaluate(()=>window.__qa.state.currentWorkout),null);});
 await check('Reference home structure, completed green and partial yellow in all themes',async()=>{
  for(const theme of ['dark-red','plum-night','redline-editorial','rosewood-strength']) {
   await page.setViewportSize({width:392,height:950});await fixture(5,theme);
   await page.evaluate(()=>{
    const a=window.__qa,m=a.mondayFor(a.todayKey());
    const make=(id,date,status)=>a.normalizeHistoryItem({id,date,name:'Çekiş',status,duration:30,exercises:[{id:'bench-press',name:'Bench Press',sets:[{weight:'60',reps:'10',completedAt:new Date().toISOString()}]}]});
    a.state.history=[make('complete',m,'completed'),make('partial',a.addDays(m,1),'partial'),make('same-day',m,'partial')];a.render();
   });
   assert.equal(await page.locator('.member-week-day.done').count(),1);
   assert.equal(await page.locator('.member-week-day.partial').count(),1);
   assert.equal(await page.locator('.member-week-day.done > span').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(57, 207, 133)');
   assert.equal(await page.locator('.member-week-day.partial > span').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(243, 204, 82)');
   assert.deepEqual(await page.locator('.member-quick-stats strong').allTextContents(),['1','30 dk','1']);
   assert.equal(await page.locator('.member-last-workout').getAttribute('data-id'),'partial');
   assert.equal(await page.locator('.member-home-week h2').innerText(),'Bu haftaki antrenmanların');
   assert.ok((await page.locator('.member-program-media').first().boundingBox()).height<=127);
   assert.ok((await bounds()).doc<=393);
   await page.waitForTimeout(500);
   await page.screenshot({path:path.join(out,'final-'+theme+'.png'),fullPage:true});
  }
  await page.locator('.member-last-workout').click();assert.equal(await page.evaluate(()=>window.__qa.ui.historyDraft.id),'partial');
 });
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({method:'Real Chromium rendering and CDP touch input with synthetic local fixture; no live account or phone',results,errors},null,2));
 console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.kill();});
