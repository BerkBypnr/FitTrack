"use strict";
// Runs the uploaded functions in a VM with a minimal DOM, controlled timers,
// in-memory storage and injected cloud client. This is NOT a browser/phone test.
// No source file is changed. Only a test export is appended inside the IIFE.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(process.env.FITTRACK_SOURCE || path.join(__dirname, '../..'));
const clone = x => JSON.parse(JSON.stringify(x));
class Element {
  constructor(id='') {
    this.id=id; this.innerHTML=''; this.textContent=''; this.value=''; this.dataset={};
    this.classes=new Set(); this.style={setProperty(){}}; this.disabled=false;
    this.classList={add:(...a)=>a.forEach(x=>this.classes.add(x)),remove:(...a)=>a.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,f)=>{const yes=f==null?!this.classes.has(x):f;yes?this.classes.add(x):this.classes.delete(x);return yes;}};
  }
  querySelector(selector) {
    for (const part of selector.split(',')) {
      const cls=part.trim().match(/^\.([\w-]+)$/);
      if(cls && new RegExp('class="[^"]*\\b'+cls[1]+'\\b').test(this.innerHTML)) return new Element();
    }
    return null;
  }
  querySelectorAll(){return [];}
  matches(s){return s.split(',').some(x=>x.trim().startsWith('.')&&this.classes.has(x.trim().slice(1)));}
  closest(s){if(s==='[data-action]'&&this.dataset.action)return this;return null;}
  setAttribute(k,v){this[k]=v;} getAttribute(k){return this[k]??null;}
  addEventListener(){} scrollIntoView(){} focus(){} appendChild(){} remove(){} click(){}
}
function runtime(saved, storage) {
  const store=storage||new Map(); if(saved)store.set('fittrack-beta-010-state',JSON.stringify(saved));
  const elements={}; for(const id of ['screen','topbar','bottomNav','flowLayer','sheetLayer','toast','backupInput','authLayer'])elements[id]=new Element(id);
  const docEvents={},winEvents={},timeouts=new Map(),intervals=new Map(),selectors=new Map(),warnings=[];let tid=0;
  const add=(target,name,cb)=>(target[name]??=[]).push(cb);
  const document={documentElement:{dataset:{}},body:new Element('body'),visibilityState:'visible',
    getElementById(id){if(elements[id])return elements[id]; if(Object.values(elements).some(e=>e.innerHTML.includes('id="'+id+'"')))return elements[id]=new Element(id);return null;},
    querySelector(s){return selectors.get(s)?.[0]||null;},querySelectorAll(s){return selectors.get(s)||[];},
    addEventListener:(n,cb)=>add(docEvents,n,cb),createElement:()=>new Element()};
  const navigator={onLine:true}; const location={protocol:'http:',hostname:'127.0.0.1',href:'http://127.0.0.1:4173/'};
  const localStorage={get length(){return store.size},key:i=>[...store.keys()][i]??null,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
  const window={document,navigator,location,localStorage,crypto:crypto.webcrypto,scrollTo(){},
    addEventListener:(n,cb)=>add(winEvents,n,cb),dispatchEvent:e=>(winEvents[e.type]||[]).forEach(cb=>cb(e)),
    setTimeout:(cb,ms)=>{timeouts.set(++tid,{cb,ms});return tid;},clearTimeout:id=>timeouts.delete(id),
    setInterval:(cb,ms)=>{intervals.set(++tid,{cb,ms});return tid;},clearInterval:id=>intervals.delete(id),
    CustomEvent:class{constructor(type,opts={}){this.type=type;this.detail=opts.detail;}},
    console:{log(){},warn:(...args)=>warnings.push(args.map(String).join(' ')),error:(...args)=>warnings.push(args.map(String).join(' '))},
    URL,URLSearchParams,Blob,Date,Intl,Math,Uint8Array,TextEncoder};
  window.window=window;window.self=window;
  const context=vm.createContext({...window,window,self:window,globalThis:window});
  function load(name,extra='') {
    const original=fs.readFileSync(path.join(root,name+'.js'),'utf8');
    const names=[...new Set([...original.matchAll(/^  (?:async )?function (\w+)\(/gm)].map(x=>x[1]))];
    const tail='\nwindow.__audit_'+name+'={'+names.join(',')+','+extra+'};\n})();';
    const code=original.replace(/\}\)\(\);\s*$/,tail);
    if(code===original)throw new Error('IIFE test export not installed');
    vm.runInContext(code,context,{filename:name+'.js',timeout:5000});
    return window['__audit_'+name];
  }
  const app=load('app','get state(){return state},set state(v){state=v},ui,get programs(){return programs},exerciseCatalog');
  function clickElement(target){for(const cb of docEvents.click||[])cb({target,preventDefault(){}});}
  function click(action,data={}){const target=new Element();target.dataset={action,...data};clickElement(target);}
  function timer(ms){const entries=[...timeouts].filter(([,x])=>x.ms===ms);for(const [id,t] of entries){timeouts.delete(id);t.cb();}return entries.length;}
  return {app,window,document,elements,store,selectors,warnings,timeouts,intervals,click,clickElement,timer,load,context};
}
function fresh(){const r=runtime();r.app.state=r.app.defaultState(false);r.app.refreshPrograms();return r;}
function setupWorkout(r,opts={}) {
  const a=r.app;const moves=opts.moves||[a.cloneExerciseDefinition(a.catalogExercises()[0])];
  const p=a.normalizeCustomProgram({id:opts.id||'audit-program',name:'Audit program',status:'published',days:[{id:'audit-day',name:'Audit day',weekday:null,exercises:moves}]});
  a.state.customPrograms=[p];a.refreshPrograms();a.state.assignments=[a.normalizeAssignment({programId:p.id,dayId:p.days[0].id},0,'Audit coach')];a.state.selectedProgramId=p.id;a.state.assignment=a.state.assignments[0];a.state.currentWorkout=a.newWorkout();return p;
}
async function cloudRuntime(client={}) {
  const r=fresh();const updates=[];
  r.window.FITTRACK_CONFIG={localPreviewOnDesktop:true,appVersion:'0.11.9',authRedirectTo:'com.fittracklabs.mobile://auth-callback'};
  r.window.FitTrackBridge={setCloudStatus:(...args)=>updates.push(args)};
  const c=r.load('cloud','setContext(v){if("client"in v)client=v.client;if("session"in v)session=v.session;if("membership"in v)membership=v.membership;if("gym"in v)gym=v.gym;if("profile"in v)profile=v.profile;if("bridge"in v)bridge=v.bridge;},get session(){return session},get gym(){return gym}');
  for(let i=0;i<5;i++)await Promise.resolve();
  c.setContext({client,session:{user:{id:'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',email:'audit@example.invalid'}},gym:{id:'gym-A',name:'Audit gym'},membership:{role:'trainer'},bridge:r.window.FitTrackBridge});
  return {...r,c,updates};
}
module.exports={root,clone,Element,runtime,fresh,setupWorkout,cloudRuntime};
