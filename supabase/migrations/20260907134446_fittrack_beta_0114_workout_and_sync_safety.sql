-- FitTrack 0.11.4. Additive, compatible with 0.11.3 RPC signatures.
begin;

alter table public.gym_memberships add column if not exists coach_note text;
update public.gym_memberships gm
set coach_note = coalesce((
  select pa.coach_note from public.program_assignments pa
  where pa.gym_id = gm.gym_id and pa.member_id = gm.user_id
  order by pa.active desc, pa.assigned_at desc, pa.id limit 1
), '')
where gm.coach_note is null;
alter table public.gym_memberships alter column coach_note set default '';
alter table public.gym_memberships alter column coach_note set not null;
alter table public.gym_memberships add constraint memberships_coach_note_length check (char_length(coach_note) <= 500);

-- General member note is shared with that member, as in 0.11.3. It is not a private staff note.
create or replace function public.update_member_coach_note(p_gym_id uuid, p_member_id uuid, p_coach_note text)
returns public.program_assignments
language plpgsql security definer set search_path = public, pg_temp
as $$
declare result public.program_assignments;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_gym_role(p_gym_id, array['admin','trainer']) then raise exception 'NOT_GYM_STAFF'; end if;
  update public.gym_memberships set coach_note = left(coalesce(p_coach_note,''),500), updated_at = now()
  where gym_id = p_gym_id and user_id = p_member_id and active and role = 'member';
  if not found then raise exception 'MEMBER_NOT_IN_GYM'; end if;
  select * into result from public.program_assignments
  where gym_id = p_gym_id and member_id = p_member_id and active order by assigned_at desc, id limit 1;
  result.gym_id := p_gym_id; result.member_id := p_member_id; result.coach_note := left(coalesce(p_coach_note,''),500);
  return result;
end;
$$;
revoke all on function public.update_member_coach_note(uuid,uuid,text) from public, anon;
grant execute on function public.update_member_coach_note(uuid,uuid,text) to authenticated;

-- An assigned archived revision stays readable; unassigned drafts remain restricted.
alter policy programs_select_gym on public.programs using (
  public.is_gym_member(gym_id) and (
    status = 'published' or public.has_gym_role(gym_id, array['admin','trainer']) or
    (status = 'archived' and exists (
      select 1 from public.program_assignments pa
      where pa.program_id = programs.id and pa.gym_id = programs.gym_id
        and pa.member_id = (select auth.uid()) and pa.active
    ))
  )
);

create table public.workout_deletions (
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  client_mutation_id uuid not null,
  deleted_at timestamptz not null default now(),
  primary key (gym_id, member_id, client_mutation_id)
);
create index workout_deletions_member_idx on public.workout_deletions(member_id, gym_id);
alter table public.workout_deletions enable row level security;
revoke all on public.workout_deletions from public, anon, authenticated;
grant select on public.workout_deletions to authenticated;
create policy workout_deletions_select on public.workout_deletions for select to authenticated
using (public.is_gym_member(gym_id) and (member_id = (select auth.uid()) or public.has_gym_role(gym_id,array['admin','trainer'])));

create schema if not exists fittrack_private;
revoke all on schema fittrack_private from public, anon, authenticated;

-- Shares a lock with delete_workout_record; late offline writes cannot recreate a deleted session.
create function fittrack_private.guard_workout_record() returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.gym_id::text || ':' || new.member_id::text || ':' || new.client_mutation_id::text, 0));
  if exists(select 1 from public.workout_deletions d where d.gym_id=new.gym_id and d.member_id=new.member_id and d.client_mutation_id=new.client_mutation_id) then
    raise exception 'WORKOUT_DELETED';
  end if;
  if new.program_id is not null and not exists(select 1 from public.programs p where p.id=new.program_id and p.gym_id=new.gym_id) then raise exception 'PROGRAM_GYM_MISMATCH'; end if;
  if new.assignment_id is not null and not exists(
    select 1 from public.program_assignments pa where pa.id=new.assignment_id and pa.gym_id=new.gym_id
      and pa.member_id=new.member_id and (new.program_id is null or pa.program_id=new.program_id)
  ) then raise exception 'ASSIGNMENT_CONTEXT_MISMATCH'; end if;
  return new;
end;
$$;
revoke all on function fittrack_private.guard_workout_record() from public, anon, authenticated;
create trigger fittrack_guard_workout before insert or update on public.workout_sessions
for each row execute function fittrack_private.guard_workout_record();

-- Sanitize both old and new client snapshots with server-owned deletion records.
create function fittrack_private.filter_deleted_workout_history() returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare filtered jsonb; tombstones jsonb;
begin
  if nullif(new.state#>>'{gym,id}','') is not null and new.state#>>'{gym,id}' <> new.gym_id::text then raise exception 'SNAPSHOT_GYM_MISMATCH'; end if;
  if jsonb_typeof(new.state->'history') = 'array' then
    select coalesce(jsonb_agg(entry order by position),'[]'::jsonb) into filtered
    from jsonb_array_elements(new.state->'history') with ordinality as h(entry,position)
    where not exists(select 1 from public.workout_deletions d where d.gym_id=new.gym_id and d.member_id=new.user_id and d.client_mutation_id::text=entry->>'syncId');
    new.state := jsonb_set(new.state,'{history}',filtered,true);
  end if;
  select coalesce(jsonb_agg(distinct id),'[]'::jsonb) into tombstones from (
    select d.client_mutation_id::text id from public.workout_deletions d where d.gym_id=new.gym_id and d.member_id=new.user_id
    union select value from jsonb_array_elements_text(case when jsonb_typeof(new.state->'deletedHistoryIds')='array' then new.state->'deletedHistoryIds' else '[]'::jsonb end)
  ) all_ids;
  new.state := jsonb_set(new.state,'{deletedHistoryIds}',tombstones,true);
  if exists(select 1 from public.workout_deletions d where d.gym_id=new.gym_id and d.member_id=new.user_id and d.client_mutation_id::text=new.state#>>'{currentWorkout,syncId}') then
    new.state := jsonb_set(new.state,'{currentWorkout}','null'::jsonb,true);
  end if;
  return new;
end;
$$;
revoke all on function fittrack_private.filter_deleted_workout_history() from public, anon, authenticated;
create trigger fittrack_filter_deleted_history before insert or update of state on public.member_snapshots
for each row execute function fittrack_private.filter_deleted_workout_history();

create function public.delete_workout_record(p_gym_id uuid, p_sync_id uuid) returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.is_gym_member(p_gym_id) then raise exception 'NOT_GYM_MEMBER'; end if;
  if p_sync_id is null then raise exception 'INVALID_SYNC_ID'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_gym_id::text || ':' || actor::text || ':' || p_sync_id::text, 0));
  insert into public.workout_deletions(gym_id,member_id,client_mutation_id) values(p_gym_id,actor,p_sync_id) on conflict do nothing;
  if not found then return true; end if;
  delete from public.workout_sessions where gym_id=p_gym_id and member_id=actor and client_mutation_id=p_sync_id;
  update public.member_snapshots set state=state, state_version=state_version+1, updated_at=now()
  where gym_id=p_gym_id and user_id=actor;
  return true;
end;
$$;
revoke all on function public.delete_workout_record(uuid,uuid) from public, anon;
grant execute on function public.delete_workout_record(uuid,uuid) to authenticated;
alter publication supabase_realtime add table public.workout_deletions;

-- Owners must still be active staff of the tenant encoded in the object path.
alter policy exercise_media_update_owner on storage.objects using (
  bucket_id='exercise-media' and owner_id=(select auth.uid())::text
  and exists(select 1 from public.gym_memberships gm where gm.user_id=(select auth.uid()) and gm.active and gm.role in ('admin','trainer') and gm.gym_id::text=(storage.foldername(name))[1])
) with check (
  bucket_id='exercise-media' and owner_id=(select auth.uid())::text and (storage.foldername(name))[2]=(select auth.uid())::text
  and exists(select 1 from public.gym_memberships gm where gm.user_id=(select auth.uid()) and gm.active and gm.role in ('admin','trainer') and gm.gym_id::text=(storage.foldername(name))[1])
);
alter policy exercise_media_delete_owner on storage.objects using (
  bucket_id='exercise-media' and owner_id=(select auth.uid())::text
  and exists(select 1 from public.gym_memberships gm where gm.user_id=(select auth.uid()) and gm.active and gm.role in ('admin','trainer') and gm.gym_id::text=(storage.foldername(name))[1])
);

commit;
