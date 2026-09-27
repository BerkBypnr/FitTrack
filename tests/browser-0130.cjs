'use strict';
const {chromium}=require(process.env.FITTRACK_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const out=path.resolve(__dirname,'../test-results/browser-0130');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'ui-preview-0130.cjs')],{stdio:['ignore','pipe','inherit']});
let browser;const results=[],errors=[];
(async()=>{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('server exit '+c)));});
  let executablePath=process.env.FITTRACK_CHROME,args=[];
  if(process.env.FITTRACK_CHROMIUM_PACKAGE){const c=require(process.env.FITTRACK_CHROMIUM_PACKAGE);const engine=c.default||c;executablePath=await engine.executablePath();args=engine.args;}
  browser=await chromium.launch({executablePath,headless:true,args});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true});
  page.on('pageerror',e=>errors.push(e.message));
  // Fail closed: production URLs must never be accessed by synthetic UI tests.
  const blocked=[];await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():(blocked.push(route.request().url()),route.abort()));
  await page.goto('http://127.0.0.1:4178/');await page.waitForFunction(()=>window.__qaCloud&&window.__qa);
  await page.waitForTimeout(250);
  await page.evaluate(()=>{const a=window.__qa;a.state=a.defaultState(false);a.state.profile.setupComplete=true;a.state.profile.firstName='Deniz';a.state.profile.lastName='Test';a.render();});
  async function check(name,run){try{await run();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});await page.screenshot({path:path.join(out,'FAIL-'+results.length+'.png')});}}
  async function screen(name){await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}
  async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  const themes=['dark-red','plum-night','redline-editorial','rosewood-strength'];
  for(const theme of themes){
    await check(theme+' auth / profile / theme chooser',async()=>{
      await page.evaluate(t=>{window.__qa.state.theme=t;window.__qa.applyTheme();window.__qaCloud.renderWelcome();},theme);await noOverflow();await screen('welcome-'+theme);
      await page.locator('[data-cloud-action="auth-tab"][data-mode="login"]').click();await noOverflow();await screen('login-'+theme);
      await page.locator('#authPassword').fill('abcdef');await page.locator('.password-toggle').click();assert.equal(await page.locator('#authPassword').getAttribute('type'),'text');await page.locator('.password-toggle').click();
      await page.locator('[data-cloud-action="auth-tab"][data-mode="signup"]').click();await noOverflow();await screen('signup-'+theme);
      await page.evaluate(()=>{window.__qaCloud.hideLayer();window.__qa.openProfileWizard(1);});await noOverflow();await screen('profile-name-'+theme);
      await page.locator('[data-action="profile-gender"][data-gender="female"]').click();assert.equal(await page.locator('[data-gender="female"]').getAttribute('aria-pressed'),'true');
      await page.locator('[data-action="profile-wizard-next"]').click();await noOverflow();await screen('profile-age-'+theme);
      await page.evaluate(()=>{window.__qa.ui.onboardingDraft=null;window.__qa.clearProfileWizardRecovery();window.__qa.closeFlow();window.__qa.openThemeSheet();});await noOverflow();await screen('themes-'+theme);assert.equal(await page.locator('[data-action="select-theme"]').count(),4);await page.evaluate(()=>window.__qa.closeSheet());
    });
  }
  await check('Wheel keyboard and tap persist exact values; manual entry accepts Turkish decimal',async()=>{
    await page.evaluate(()=>{window.__qa.state.theme='dark-red';window.__qa.applyTheme();window.__qa.openProfileWizard(2);});
    const wheel=page.locator('[data-wheel="age"]');await wheel.focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(150);assert.equal(await page.locator('#profile-age').inputValue(),'29');
    await page.locator('[data-action="profile-wizard-next"]').click();await page.locator('#profile-height').fill('181');await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('#profile-currentWeight').fill('78,5');assert.equal(await page.evaluate(()=>window.__qa.ui.onboardingDraft.currentWeight),'78.5');await page.locator('[data-action="profile-wizard-next"]').click();await page.locator('[data-action="profile-skip-target"]').click();await screen('profile-goals');
    await page.locator('[data-goal="strength"]').click();await page.locator('[data-action="profile-wizard-next"]').click();assert.equal(await page.evaluate(()=>window.__qa.state.profile.targetWeight),null);assert.equal(await page.evaluate(()=>window.__qa.state.profile.currentWeight),78.5);
  });
  for(const size of [{width:320,height:568},{width:390,height:430},{width:740,height:360}]){
    await check('Small / keyboard / landscape '+size.width+'x'+size.height,async()=>{
      await page.setViewportSize(size);await page.evaluate(()=>window.__qaCloud.renderWelcome());await noOverflow();await page.locator('[data-mode="login"]').click();await page.locator('#authEmail').fill('deniz@example.invalid');await page.locator('#authPassword').fill('do-not-save-this');await noOverflow();await screen('login-'+size.width+'x'+size.height);
      await page.evaluate(()=>{window.__qaCloud.hideLayer();window.__qa.openProfileWizard(3);});await page.locator('#profile-height').fill('182');
      const box=await page.locator('[data-action="profile-wizard-next"]').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=size.height+1,JSON.stringify(box));await screen('height-'+size.width+'x'+size.height);
      await page.reload();await page.waitForFunction(()=>window.__qa&&window.__qa.ui.onboardingDraft);assert.equal(await page.locator('#profile-height').inputValue(),'182');await page.evaluate(()=>{window.__qa.ui.onboardingDraft=null;window.__qa.clearProfileWizardRecovery();window.__qa.closeFlow();});
    });
  }
  await page.setViewportSize({width:390,height:844});
  await check('Recovery sends only on explicit submit; OTP cooldown and retry are interactive',async()=>{
    await page.evaluate(()=>{window.__sent=[];window.__qaCloud.setClient({auth:{resetPasswordForEmail:async email=>{window.__sent.push(email);return{data:{},error:null};}}});window.__qaCloud.renderAuth('login');});
    await page.locator('[data-cloud-action="forgot-password"]').click();assert.equal(await page.evaluate(()=>window.__sent.length),0);await page.locator('#recoveryEmail').fill('deniz@example.invalid');await screen('recovery');await page.locator('button[type="submit"]').click();await page.locator('#authOtp').waitFor();assert.equal(await page.evaluate(()=>window.__sent.length),1);assert.equal(await page.locator('[data-cloud-action="resend-otp"]').isDisabled(),true);await screen('verification');await page.evaluate(()=>window.__qaCloud.renderPasswordUpdate());await screen('new-password');
  });
  await check('Role, gym, empty and error shells render without invented production data',async()=>{
    for(const [name,code] of [['role',()=>window.__qaCloud.renderProfileSetup({display_name:'Deniz Test'})],['gym',()=>window.__qaCloud.renderGymSetup('trainer')],['join',()=>window.__qaCloud.renderGymSetup('member')],['error',()=>window.__qaCloud.renderAuth('login','İnternet bağlantısı kurulamadı. Yerel verilerin güvende.')]]){await page.evaluate(code);await noOverflow();await screen(name);}
  });
  assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:await browser.version(),method:'Real headless Chromium, production UI + synthetic local data; all external requests blocked. Not Android or SMTP.',results,errors,blocked},null,2));
  console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.status==='PASS').length,results},null,2));
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.kill();});
