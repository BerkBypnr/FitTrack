'use strict';
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const suites=['fixes-01031','fixes-01032','fixes-0110','fixes-0111','fixes-0112','fixes-0113','regression-0102','runtime-0110','review/review','hotfix-0114','auth-0116','database-0114','themes-0116','member-ui-0117','navigation-0118','migration-baseline-0120','trainer-ui-0120','release-0120','phone-fixes-0121','hotfix-0122'];
const results=[];
for(const suite of suites){const result=spawnSync(process.execPath,[path.join(root,'tests',suite+'.cjs')],{cwd:root,encoding:'utf8',timeout:120000});const passed=result.status===0;results.push({suite,status:passed?'PASS':'FAIL',error:result.error?.message||null});fs.writeFileSync(path.join(root,'test-results',suite.replaceAll('/','-')+'.log'),result.stdout+result.stderr);console.log(passed?'PASS':'FAIL',suite);if(!passed)console.error((result.stdout+result.stderr).slice(0,2000));}
fs.writeFileSync(path.join(root,'test-results/suites.json'),JSON.stringify({node:process.version,method:'Local VM, DOM model, static native checks and PGlite PostgreSQL; no real browser/phone/SMTP',results},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
