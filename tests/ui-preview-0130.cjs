'use strict';
// Local browser QA only. Production SDK/config are never served into this page.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');res.setHeader('Cache-Control','no-store');
  if(url.pathname==='/'||url.pathname==='/index.html'){
    let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script src="\.\/(vendor\/supabase\.min|config)\.js[^>]*><\/script>/g,'');
    html=html.replace('<script src="./cloud.js','<script>window.FITTRACK_CONFIG={localPreviewOnDesktop:true,appVersion:"0.15.0",authRedirectTo:"com.fittracklabs.mobile://auth-callback"};</script><script src="./cloud.js');
    res.setHeader('Content-Type','text/html');return res.end(html);
  }
  const name=decodeURIComponent(url.pathname.slice(1));const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep)||/^(config\.js|vendor\/|supabase\/)/.test(name)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('Not found');}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  if(name==='app.js'||name==='cloud.js'){
    let js=fs.readFileSync(file,'utf8');const names=[...new Set([...js.matchAll(/^  (?:async )?function (\w+)\(/gm)].map(m=>m[1]))];
    const app=name==='app.js';const extra=app?'get state(){return state},set state(v){state=v},ui':'setContext(v){session=v.session;membership=v.membership;profile=v.profile;gym=v.gym},setClient(v){client=v},get pendingOtp(){return pendingOtp}';
    js=js.replace(/\}\)\(\);\s*$/,'window.'+(app?'__qa':'__qaCloud')+'={'+names.join(',')+','+extra+'};})();');return res.end(js);
  }
  fs.createReadStream(file).pipe(res);
}).listen(4178,'127.0.0.1',()=>console.log('0.13 synthetic UI http://127.0.0.1:4178'));
