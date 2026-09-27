"use strict";
// Real PostgreSQL (PGlite/WASM), synthetic users only. No production writes or email.
const {PGlite}=require('@electric-sql/pglite');
const {pgcrypto}=require('@electric-sql/pglite/contrib/pgcrypto');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const results=[];
const ids={coach:'10000000-0000-4000-8000-000000000001',a:'10000000-0000-4000-8000-000000000002',b:'10000000-0000-4000-8000-000000000003',other:'10000000-0000-4000-8000-000000000004',g:'20000000-0000-4000-8000-000000000001',h:'20000000-0000-4000-8000-000000000002',p:'30000000-0000-4000-8000-000000000001',q:'30000000-0000-4000-8000-000000000002',assignment:'40000000-0000-4000-8000-000000000001',session:'50000000-0000-4000-8000-000000000001',device:'60000000-0000-4000-8000-000000000001'};
(async()=>{
 const db=await PGlite.create({extensions:{pgcrypto}});
 await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
 create schema auth; create schema storage; create schema extensions;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select current_user::text$$;
 grant usage on schema auth,storage to authenticated,anon;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text,metadata jsonb default '{}');
 alter table storage.objects enable row level security;
 grant select,insert,update,delete on storage.objects to authenticated;
 create function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]$$;
 create publication supabase_realtime;`);
 for(const name of fs.readdirSync(path.join(root,'supabase/migrations')).filter(x=>x.endsWith('.sql') && !x.includes('0114')).sort()){
   await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',name),'utf8'));results.push({name:'Baseline migration '+name,status:'PASS'});
 }
 // Upgrade fixture, created before the new migration.
 for(const [role,id] of Object.entries(ids).filter(([k])=>['coach','a','b','other'].includes(k))) await db.query(`insert into auth.users(id,email) values($1,$2)`,[id,role+'@example.invalid']);
 await db.query(`insert into public.gyms(id,name,created_by) values($1,'Test gym A',$3),($2,'Test gym B',$4)`,[ids.g,ids.h,ids.coach,ids.other]);
 await db.query(`insert into public.gym_memberships(gym_id,user_id,role) values($1,$3,'trainer'),($1,$4,'member'),($1,$5,'member'),($2,$6,'trainer')`,[ids.g,ids.h,ids.coach,ids.a,ids.b,ids.other]);
 await db.query(`insert into public.programs(id,root_id,client_key,root_key,gym_id,name,status,payload,created_by) values($1,$1,'test-a','test-a',$3,'Old plan','published','{}',$5),($2,$2,'test-b','test-b',$4,'Other plan','published','{}',$6)`,[ids.p,ids.q,ids.g,ids.h,ids.coach,ids.other]);
 await db.query(`insert into public.program_assignments(id,gym_id,member_id,program_id,trainer_id,coach_note) values($1,$2,$3,$4,$5,'Keep original note')`,[ids.assignment,ids.g,ids.a,ids.p,ids.coach]);
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/20260907134446_fittrack_beta_0114_workout_and_sync_safety.sql'),'utf8'));
 results.push({name:'0.11.3 → 0.11.4 upgrade migration',status:'PASS'});
 const one=async(sql,args=[])=>(await db.query(sql,args)).rows[0];
 const as=async(id,fn,role='authenticated')=>{await db.exec('begin; set local role '+role+';');await db.query(`select set_config('request.jwt.claim.sub',$1,true)`,[id||'']);try{return await fn();}finally{await db.exec('rollback');}};
 async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});}}
 await test('Existing member note survives additive migration',async()=>assert.equal((await one('select coach_note from gym_memberships where user_id=$1',[ids.a])).coach_note,'Keep original note'));
 await test('Trainer saves general note with zero active assignments',()=>as(ids.coach,async()=>{await db.query('select archive_program_assignment($1,$2,$3)',[ids.g,ids.a,ids.assignment]);await db.query('select update_member_coach_note($1,$2,$3)',[ids.g,ids.a,'Persistent note']);assert.equal((await one('select coach_note from gym_memberships where user_id=$1',[ids.a])).coach_note,'Persistent note');assert.equal((await one('select coach_note from program_assignments where id=$1',[ids.assignment])).coach_note,'Keep original note');}));
 await test('Member cannot edit member/coach notes',()=>as(ids.a,async()=>assert.rejects(db.query('select update_member_coach_note($1,$2,$3)',[ids.g,ids.a,'forbidden']),/NOT_GYM_STAFF/)));
 await test('Other gym trainer cannot edit notes',()=>as(ids.other,async()=>assert.rejects(db.query('select update_member_coach_note($1,$2,$3)',[ids.g,ids.a,'forbidden']),/NOT_GYM_STAFF/)));
 const recordSQL=`insert into workout_sessions(gym_id,member_id,program_id,assignment_id,client_mutation_id,status,started_at,finished_at,duration_minutes,payload) values($1,$2,$3,$4,$5,'partial',now()-interval '5 minutes',now(),5,$6)`;
 const recordArgs=[ids.g,ids.a,ids.p,ids.assignment,ids.session,{syncId:ids.session,exercises:[{name:'Bench press',sets:[{weight:'20',reps:'10'}]}]}];
 await test('Unassigned member can finish their already-started session',()=>as(ids.a,async()=>{await db.exec('reset role');await db.query('update program_assignments set active=false where id=$1',[ids.assignment]);await db.exec('set local role authenticated');await db.query(recordSQL,recordArgs);assert.equal(Number((await one('select count(*) n from workout_sessions')).n),1);}));
 await test('Workouts reject another gym program',()=>as(ids.a,()=>assert.rejects(db.query(recordSQL,[ids.g,ids.a,ids.q,null,ids.session,{}]),/PROGRAM_GYM_MISMATCH/)));
 await test('Workouts reject another member assignment',()=>as(ids.b,()=>assert.rejects(db.query(recordSQL,[ids.g,ids.b,ids.p,ids.assignment,ids.session,{}]),/ASSIGNMENT_CONTEXT_MISMATCH/)));
 await test('Delete is idempotent and stale upload cannot resurrect history',()=>as(ids.a,async()=>{await db.query(recordSQL,recordArgs);await db.query('select delete_workout_record($1,$2)',[ids.g,ids.session]);await db.query('select delete_workout_record($1,$2)',[ids.g,ids.session]);assert.equal(Number((await one('select count(*) n from workout_sessions')).n),0);assert.equal(Number((await one('select count(*) n from workout_deletions')).n),1);await assert.rejects(db.query(recordSQL,recordArgs),/WORKOUT_DELETED/);}));
 await test('Deleted history is removed from subsequent stale snapshots',()=>as(ids.a,async()=>{await db.query('select delete_workout_record($1,$2)',[ids.g,ids.session]);const payload={gym:{id:ids.g},history:[{syncId:ids.session}],currentWorkout:{syncId:ids.session}};await db.query('select apply_member_snapshot($1,$2,0,$3,now())',[ids.g,ids.device,payload]);const row=await one('select state from member_snapshots');assert.deepEqual(row.state.history,[]);assert.equal(row.state.currentWorkout,null);assert.ok(row.state.deletedHistoryIds.includes(ids.session));}));
 await test('Member cannot delete another gym workout',()=>as(ids.a,()=>assert.rejects(db.query('select delete_workout_record($1,$2)',[ids.h,ids.session]),/NOT_GYM_MEMBER/)));
 await test('Anonymous cannot call deletion RPC',()=>as(null,()=>assert.rejects(db.query('select delete_workout_record($1,$2)',[ids.g,ids.session]),/permission denied/),'anon'));
 await test('Snapshots reject mismatched embedded gym',()=>as(ids.a,()=>assert.rejects(db.query('select apply_member_snapshot($1,$2,0,$3,now())',[ids.g,ids.device,{gym:{id:ids.h},history:[]}]),/SNAPSHOT_GYM_MISMATCH/)));
 await test('Archived assigned revision readable only in appropriate gym',()=>as(ids.a,async()=>{await db.exec('reset role');await db.query("update programs set status='archived' where id=$1",[ids.p]);await db.exec('set local role authenticated');assert.equal(Number((await one('select count(*) n from programs where id=$1',[ids.p])).n),1);assert.equal(Number((await one('select count(*) n from programs where id=$1',[ids.q])).n),0);}));
 await test('Active staff may update their media; inactive staff may not',()=>as(ids.coach,async()=>{const file=ids.g+'/'+ids.coach+'/exercise.png';await db.query(`insert into storage.objects(bucket_id,name,owner_id) values('exercise-media',$1,$2)`,[file,ids.coach]);assert.equal((await db.query(`update storage.objects set metadata='{"ok":true}' returning id`)).rows.length,1);await db.exec('reset role');await db.query('update gym_memberships set active=false where user_id=$1',[ids.coach]);await db.exec('set local role authenticated');assert.equal((await db.query('update storage.objects set metadata=\'{}\' returning id')).rows.length,0);assert.equal((await db.query('delete from storage.objects returning id')).rows.length,0);}));
 await test('Storage owner cannot move media into another gym',()=>as(ids.coach,async()=>{await db.query(`insert into storage.objects(bucket_id,name,owner_id) values('exercise-media',$1,$2)`,[ids.g+'/'+ids.coach+'/exercise.png',ids.coach]);await assert.rejects(db.query('update storage.objects set name=$1',[ids.h+'/'+ids.coach+'/exercise.png']),/row-level security/);}));
 await test('New table RLS and public RPC grants are restrictive',async()=>{assert.equal((await one("select relrowsecurity from pg_class where oid='public.workout_deletions'::regclass")).relrowsecurity,true);assert.equal((await one("select has_table_privilege('anon','public.workout_deletions','SELECT') x")).x,false);assert.equal((await one("select has_function_privilege('anon','public.delete_workout_record(uuid,uuid)','EXECUTE') x")).x,false);});
 await test('0.14 metric JSON payload survives workout and snapshot storage with existing RLS',()=>as(ids.a,async()=>{
   const movement={id:'qa-carry',measurementVersion:1,measurementProfile:'load_distance',sets:[{weight:'25.5',distanceMeters:'40.25',completedAt:'2026-09-21T10:00:00Z'}]};
   const history={syncId:ids.session,exercises:[movement,{id:'qa-run',measurementProfile:'distance_duration',sets:[{distanceMeters:'1250',durationSeconds:'360'}]}]};
   await db.query(recordSQL,[...recordArgs.slice(0,5),history]);assert.deepEqual((await one('select payload from workout_sessions')).payload,history);
   const snapshot={schema:15,gym:{id:ids.g},history:[history],currentWorkout:{programSnapshot:{days:[{exercises:[movement]}]}}};
   await db.query('select apply_member_snapshot($1,$2,0,$3,now())',[ids.g,ids.device,snapshot]);const stored=(await one('select state from member_snapshots')).state;assert.deepEqual(stored.history,[history]);assert.equal(stored.schema,15);
 }));
 await test('0.14 metric targets survive trainer program JSON storage; other gym remains unreadable',()=>as(ids.coach,async()=>{
   const payload={measurementVersion:1,days:[{id:'day',exercises:[{id:'qa-duration',measurementProfile:'duration',setPlan:[{targetDurationSeconds:'45',targetDistanceMeters:'',targetWeight:''}]}]}]};
   await db.query('update programs set payload=$1 where id=$2',[payload,ids.p]);assert.deepEqual((await one('select payload from programs where id=$1',[ids.p])).payload,payload);assert.equal(Number((await one('select count(*) n from programs where id=$1',[ids.q])).n),0);
 }));
 await db.close();fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/database-0114.json'),JSON.stringify({engine:'PGlite PostgreSQL; stub Auth and Storage platform schemas; synthetic fixtures, no production writes',results},null,2));
 for(const r of results)console.log(r.status,r.name,r.error||'');if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e.message,e.where||'');process.exitCode=2});
