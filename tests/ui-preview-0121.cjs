// Local, synthetic UI fixture. No Auth, network client or production data.
// Run: node tests/ui-preview-0121.cjs — open http://127.0.0.1:4177
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const themes = ['dark-red','plum-night','redline-editorial','rosewood-strength'];
const scenarios = ['active','home','progress','empty','removed','long','bodyweight','staff'];
const panel = `<!doctype html><html lang="tr"><meta charset="utf-8"><title>FitTrack 0.12.1 yerel test</title><style>body{font:15px system-ui;margin:18px;background:#ececec;color:#222}label{margin-right:18px}select,button{padding:10px}iframe{display:block;border:0;margin-top:16px;background:#000}pre{max-width:700px;white-space:pre-wrap}</style><h1>FitTrack 0.12.1 — sentetik test</h1><p>Bu sayfa canlı hesaba bağlanmaz.</p><label>Senaryo <select id="scene">${scenarios.map(s=>`<option>${s}</option>`).join('')}</select></label><label>Tema <select id="theme">${themes.map(t=>`<option>${t}</option>`).join('')}</select></label><label>Ekran <select id="size">${['390x844','320x568','360x740','430x932','740x360','390x430','320x340'].map(t=>`<option>${t}</option>`).join('')}</select></label><button id="run">Göster</button><iframe id="preview" title="Uygulama önizlemesi"></iframe><pre id="report">Hazırlanıyor</pre><script>function show(){var wh=size.value.split('x');preview.width=wh[0];preview.height=wh[1];preview.src='/app/?scenario='+scene.value+'&theme='+theme.value;report.textContent='Yükleniyor';}run.onclick=show;window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===preview.contentWindow&&e.data.qa)report.textContent=JSON.stringify(e.data.qa,null,2)});show();</script></html>`;
const fixture = `
(function(){
 var a=window.__qa,q=new URLSearchParams(location.search),scene=q.get('scenario')||'active';
 a.state=a.defaultState(false);a.state.profile.setupComplete=true;a.state.profile.firstName='Deniz';a.state.profile.lastName='Test';a.state.theme=q.get('theme')||'volt-discipline';
 a.state.gym.coach='Emre Hoca';a.state.gym.coachId='coach-demo';a.state.cloud.role=scene==='staff'?'trainer':'member';
 var move=a.cloneExerciseDefinition(a.catalogExercises()[0]);
 move.setPlan.forEach(s=>{s.rest=0;});
 if(scene==='long'){move.cues=Array.from({length:15},(_,i)=>(i+1)+'. yönerge: Kontrollü çalış. '+ 'Hareket adımını dikkatlice incele. '.repeat(5));move.coachNote='Antrenör notu. '.repeat(100);}
 if(scene==='bodyweight'){move=a.cloneExerciseDefinition(a.catalogExercises()[3]);}
 var second=a.cloneExerciseDefinition(a.catalogExercises()[1]);second.setPlan.forEach(s=>{s.rest=0;});
 var p=a.normalizeCustomProgram({id:'qa-plan',name:scene==='long'?'Çok Uzun Program Adı · Göğüs Sırt ve Diğer Hareketler':'Göğüs & Triceps',status:'published',days:[{id:'qa-day',name:'Birinci gün',weekday:null,exercises:[move,second]}]});
 a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:p.days[0].id},0,'Emre Hoca')];a.state.selectedProgramId=p.id;a.state.assignment=a.state.assignments[0];
 a.state.history=Array.from({length:10},(_,i)=>a.normalizeHistoryItem({id:'qa-history-'+i,date:a.addDays(a.todayKey(),-i*3),name:'Göğüs & Triceps',duration:24,status:'completed',exercises:[{id:move.id,name:move.name,requiresWeight:move.requiresWeight,sets:[{weight:'60',reps:'10',completedAt:new Date().toISOString()}]}]}));
 if(scene==='empty'){a.state.assignments=[];a.state.assignment=null;a.state.history=[];}
 if(['active','home','removed','long','bodyweight'].includes(scene)){a.state.currentWorkout=a.newWorkout();a.state.currentWorkout.startedAt=new Date(Date.now()-1122000).toISOString();a.getCurrentLog().weight=move.requiresWeight?'62.5':'';a.getCurrentLog().reps='10';}
 if(scene==='removed'){a.state.assignments=[];a.state.assignment=null;a.state.customPrograms=[];a.refreshPrograms();}
 a.ui.tab=scene==='progress'?'progress':'home';a.render();
 if(['active','long','bodyweight'].includes(scene))a.renderWorkout();
 function report(){var player=document.querySelector('.member-workout'),button=document.querySelector('[data-action="complete-set"]');var b=button&&button.getBoundingClientRect();var dock=document.querySelector('.member-player-dock'),d=dock&&dock.getBoundingClientRect();var pos=document.querySelector('.member-player-position strong');var data={scenario:scene,theme:a.state.theme,width:innerWidth,height:innerHeight,documentOverflow:document.documentElement.scrollWidth>innerWidth,button:!b?null:{top:b.top,bottom:b.bottom,width:b.width,height:b.height,visible:b.top>=0&&b.bottom<=innerHeight},dock:!d?null:{top:d.top,bottom:d.bottom},positionFont:pos?getComputedStyle(pos).fontSize:null,background:player?getComputedStyle(player).backgroundColor:getComputedStyle(document.body).backgroundColor,images:[...document.querySelectorAll('img')].map(im=>({loaded:im.complete&&im.naturalWidth>0,src:im.getAttribute('src')?.slice(0,80)}))};parent.postMessage({qa:data},location.origin);}
 addEventListener('click',()=>setTimeout(report,150));addEventListener('input',()=>setTimeout(report,150));addEventListener('resize',report);setTimeout(report,500);setTimeout(report,1800);
})();`;
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.gif':'image/gif','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');res.setHeader('Cache-Control','no-store');
 if(url.pathname==='/'){res.setHeader('Content-Type','text/html');return res.end(panel);}
 if(url.pathname==='/fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(fixture);}
 if(url.pathname==='/app/'||url.pathname==='/app/index.html'){
  let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script src="\.\/(vendor\/supabase\.min|config|cloud)\.js[^>]*><\/script>/g,'').replace('</body>','<script src="/fixture.js"></script></body>');
  res.setHeader('Content-Type','text/html');return res.end(html);
 }
 const name=decodeURIComponent(url.pathname.replace(/^\/app\//,''));const file=path.resolve(root,name);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('Not found');}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
 if(name==='app.js'){
  let js=fs.readFileSync(file,'utf8'),names=[...new Set([...js.matchAll(/^  (?:async )?function (\w+)\(/gm)].map(m=>m[1]))];
  js=js.replace(/\}\)\(\);\s*$/, 'window.__qa={'+names.join(',')+',get state(){return state},set state(v){state=v},ui};})();');
  return res.end(js);
 }
 fs.createReadStream(file).pipe(res);
}).listen(4177,'127.0.0.1',()=>console.log('Synthetic FitTrack UI: http://127.0.0.1:4177'));
