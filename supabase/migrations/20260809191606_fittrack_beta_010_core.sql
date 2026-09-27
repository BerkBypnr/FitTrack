begin;

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'FitTrack Kullanıcısı' check (char_length(display_name) between 1 and 80),
  role_preference text not null default 'member' check (role_preference in ('member', 'trainer')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_memberships (
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'trainer', 'member')),
  trainer_id uuid references public.profiles(id) on delete set null,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (gym_id, user_id),
  check (trainer_id is null or trainer_id <> user_id)
);

create index gym_memberships_user_active_idx on public.gym_memberships (user_id, active);
create index gym_memberships_gym_role_idx on public.gym_memberships (gym_id, role, active);

create table public.gym_invites (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  code_hash text not null unique check (char_length(code_hash) = 64),
  role text not null check (role in ('trainer', 'member')),
  assigned_trainer_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null,
  max_uses integer not null default 1 check (max_uses between 1 and 500),
  uses integer not null default 0 check (uses >= 0),
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  check (uses <= max_uses)
);

create index gym_invites_gym_active_idx on public.gym_invites (gym_id, revoked, expires_at);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  root_id uuid not null,
  version integer not null default 1 check (version between 1 and 9999),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  general_note text not null default '' check (char_length(general_note) <= 1000),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id, root_id, version),
  check (jsonb_typeof(payload) = 'object'),
  check (octet_length(payload::text) <= 1048576)
);

create index programs_gym_status_idx on public.programs (gym_id, status, updated_at desc);

create table public.program_assignments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  trainer_id uuid not null references public.profiles(id) on delete restrict,
  coach_note text not null default '' check (char_length(coach_note) <= 500),
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index program_assignments_one_active_idx
  on public.program_assignments (gym_id, member_id) where active;
create index program_assignments_member_idx on public.program_assignments (member_id, active, assigned_at desc);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id uuid references public.program_assignments(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  client_mutation_id uuid not null,
  status text not null check (status in ('completed', 'partial')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, client_mutation_id),
  check (finished_at >= started_at),
  check (jsonb_typeof(payload) = 'object'),
  check (octet_length(payload::text) <= 1048576)
);

create index workout_sessions_gym_member_finished_idx
  on public.workout_sessions (gym_id, member_id, finished_at desc);

create table public.member_snapshots (
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  state_version bigint not null default 1 check (state_version >= 1),
  client_updated_at timestamptz not null,
  device_id uuid not null,
  updated_at timestamptz not null default now(),
  primary key (gym_id, user_id),
  check (jsonb_typeof(state) = 'object'),
  check (octet_length(state::text) <= 2097152)
);

create table public.user_devices (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null default 'web' check (char_length(platform) between 1 and 30),
  app_version text not null check (char_length(app_version) between 1 and 20),
  device_name text not null default 'Bilinmeyen cihaz' check (char_length(device_name) between 1 and 100),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index user_devices_user_seen_idx on public.user_devices (user_id, last_seen_at desc);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('privacy', 'terms', 'health_data')),
  document_version text not null check (char_length(document_version) between 1 and 30),
  accepted boolean not null,
  recorded_at timestamptz not null default now()
);

create index consent_records_user_idx on public.consent_records (user_id, recorded_at desc);

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '' check (char_length(reason) <= 500),
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index account_deletion_one_open_idx
  on public.account_deletion_requests (user_id) where status in ('requested', 'processing');

create table public.audit_events (
  id bigint generated always as identity primary key,
  gym_id uuid references public.gyms(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null check (char_length(entity_type) between 1 and 50),
  entity_id text not null check (char_length(entity_id) between 1 and 100),
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_gym_created_idx on public.audit_events (gym_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger gyms_set_updated_at before update on public.gyms
for each row execute function public.set_updated_at();
create trigger gym_memberships_set_updated_at before update on public.gym_memberships
for each row execute function public.set_updated_at();
create trigger programs_set_updated_at before update on public.programs
for each row execute function public.set_updated_at();
create trigger program_assignments_set_updated_at before update on public.program_assignments
for each row execute function public.set_updated_at();
create trigger workout_sessions_set_updated_at before update on public.workout_sessions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, role_preference)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'FitTrack Kullanıcısı'), '@', 1)), 80),
    case when new.raw_user_meta_data ->> 'role' = 'trainer' then 'trainer' else 'member' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_gym_member(p_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.gym_memberships gm
    where gm.gym_id = p_gym_id and gm.user_id = auth.uid() and gm.active
  );
$$;

create or replace function public.has_gym_role(p_gym_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.gym_memberships gm
    where gm.gym_id = p_gym_id and gm.user_id = auth.uid() and gm.active and gm.role = any(p_roles)
  );
$$;

create or replace function public.can_view_profile(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() = p_user_id or exists (
    select 1
    from public.gym_memberships mine
    join public.gym_memberships target on target.gym_id = mine.gym_id and target.active
    where mine.user_id = auth.uid()
      and mine.active
      and target.user_id = p_user_id
      and (mine.role in ('admin', 'trainer') or target.role in ('admin', 'trainer'))
  );
$$;

revoke all on function public.is_gym_member(uuid) from public, anon;
revoke all on function public.has_gym_role(uuid, text[]) from public, anon;
revoke all on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.is_gym_member(uuid) to authenticated;
grant execute on function public.has_gym_role(uuid, text[]) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_memberships enable row level security;
alter table public.gym_invites enable row level security;
alter table public.programs enable row level security;
alter table public.program_assignments enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.member_snapshots enable row level security;
alter table public.user_devices enable row level security;
alter table public.consent_records enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_allowed on public.profiles
for select to authenticated using (public.can_view_profile(id));
create policy profiles_update_self on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy gyms_select_member on public.gyms
for select to authenticated using (public.is_gym_member(id));
create policy gyms_update_admin on public.gyms
for update to authenticated using (public.has_gym_role(id, array['admin']))
with check (public.has_gym_role(id, array['admin']));

create policy memberships_select_allowed on public.gym_memberships
for select to authenticated using (
  user_id = auth.uid() or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

create policy invites_select_staff on public.gym_invites
for select to authenticated using (public.has_gym_role(gym_id, array['admin', 'trainer']));

create policy programs_select_gym on public.programs
for select to authenticated using (
  public.is_gym_member(gym_id)
  and (status = 'published' or public.has_gym_role(gym_id, array['admin', 'trainer']))
);
create policy programs_insert_staff on public.programs
for insert to authenticated with check (
  created_by = auth.uid() and public.has_gym_role(gym_id, array['admin', 'trainer'])
);
create policy programs_update_staff on public.programs
for update to authenticated using (public.has_gym_role(gym_id, array['admin', 'trainer']))
with check (public.has_gym_role(gym_id, array['admin', 'trainer']));

create policy assignments_select_allowed on public.program_assignments
for select to authenticated using (
  member_id = auth.uid() or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

create policy workouts_select_allowed on public.workout_sessions
for select to authenticated using (
  member_id = auth.uid() or public.has_gym_role(gym_id, array['admin', 'trainer'])
);
create policy workouts_insert_self on public.workout_sessions
for insert to authenticated with check (
  member_id = auth.uid() and public.is_gym_member(gym_id)
);
create policy workouts_update_self on public.workout_sessions
for update to authenticated using (member_id = auth.uid())
with check (member_id = auth.uid() and public.is_gym_member(gym_id));

create policy snapshots_select_allowed on public.member_snapshots
for select to authenticated using (
  user_id = auth.uid() or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

create policy devices_all_self on public.user_devices
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy consents_select_self on public.consent_records
for select to authenticated using (user_id = auth.uid());
create policy consents_insert_self on public.consent_records
for insert to authenticated with check (user_id = auth.uid());

create policy deletion_requests_select_self on public.account_deletion_requests
for select to authenticated using (user_id = auth.uid());
create policy deletion_requests_insert_self on public.account_deletion_requests
for insert to authenticated with check (user_id = auth.uid());

create policy audit_select_allowed on public.audit_events
for select to authenticated using (
  actor_id = auth.uid() or (gym_id is not null and public.has_gym_role(gym_id, array['admin', 'trainer']))
);

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select, update on public.profiles to authenticated;
grant select, update on public.gyms to authenticated;
grant select on public.gym_memberships to authenticated;
grant select on public.gym_invites to authenticated;
grant select, insert, update on public.programs to authenticated;
grant select on public.program_assignments to authenticated;
grant select, insert, update on public.workout_sessions to authenticated;
grant select on public.member_snapshots to authenticated;
grant select, insert, update, delete on public.user_devices to authenticated;
grant select, insert on public.consent_records to authenticated;
grant select, insert on public.account_deletion_requests to authenticated;
grant select on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;

create or replace function public.set_profile(
  p_display_name text,
  p_role_preference text,
  p_consent_version text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 80 then raise exception 'INVALID_DISPLAY_NAME'; end if;
  if p_role_preference not in ('member', 'trainer') then raise exception 'INVALID_ROLE'; end if;

  insert into public.profiles (id, display_name, role_preference, onboarding_complete)
  values (auth.uid(), trim(p_display_name), p_role_preference, true)
  on conflict (id) do update set
    display_name = excluded.display_name,
    role_preference = excluded.role_preference,
    onboarding_complete = true,
    updated_at = now()
  returning * into result;

  if p_consent_version is not null and char_length(p_consent_version) between 1 and 30 then
    insert into public.consent_records (user_id, consent_type, document_version, accepted)
    values
      (auth.uid(), 'privacy', p_consent_version, true),
      (auth.uid(), 'terms', p_consent_version, true),
      (auth.uid(), 'health_data', p_consent_version, true);
  end if;

  return result;
end;
$$;

create or replace function public.new_invite_code()
returns text
language sql
volatile
set search_path = public, extensions, pg_temp
as $$
  select 'FT-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
$$;

create or replace function public.create_gym(p_name text)
returns table (gym_id uuid, gym_name text, invite_code text, membership_role text)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  created_gym public.gyms;
  plain_code text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 80 then raise exception 'INVALID_GYM_NAME'; end if;
  insert into public.profiles (id) values (auth.uid()) on conflict (id) do nothing;
  insert into public.gyms (name, created_by) values (trim(p_name), auth.uid()) returning * into created_gym;
  insert into public.gym_memberships (gym_id, user_id, role)
  values (created_gym.id, auth.uid(), 'admin');

  loop
    plain_code := public.new_invite_code();
    begin
      insert into public.gym_invites (
        gym_id, code_hash, role, assigned_trainer_id, created_by, expires_at, max_uses
      ) values (
        created_gym.id,
        encode(digest(upper(trim(plain_code)), 'sha256'), 'hex'),
        'member', auth.uid(), auth.uid(), now() + interval '30 days', 50
      );
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  return query select created_gym.id, created_gym.name, plain_code, 'admin'::text;
end;
$$;

create or replace function public.create_gym_invite(
  p_gym_id uuid,
  p_role text default 'member',
  p_expires_hours integer default 168,
  p_max_uses integer default 1,
  p_assigned_trainer_id uuid default null
)
returns table (invite_id uuid, invite_code text, expires_at timestamptz, max_uses integer)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  plain_code text;
  created_invite public.gym_invites;
  trainer uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_gym_role(p_gym_id, array['admin', 'trainer']) then raise exception 'NOT_GYM_STAFF'; end if;
  if p_role not in ('member', 'trainer') then raise exception 'INVALID_INVITE_ROLE'; end if;
  if p_role = 'trainer' and not public.has_gym_role(p_gym_id, array['admin']) then raise exception 'ADMIN_REQUIRED'; end if;
  if p_expires_hours not between 1 and 2160 then raise exception 'INVALID_EXPIRY'; end if;
  if p_max_uses not between 1 and 500 then raise exception 'INVALID_MAX_USES'; end if;

  trainer := case when p_role = 'member' then coalesce(p_assigned_trainer_id, auth.uid()) else null end;
  if trainer is not null and not exists (
    select 1 from public.gym_memberships gm
    where gm.gym_id = p_gym_id and gm.user_id = trainer and gm.active and gm.role in ('admin', 'trainer')
  ) then raise exception 'INVALID_TRAINER'; end if;

  loop
    plain_code := public.new_invite_code();
    begin
      insert into public.gym_invites (
        gym_id, code_hash, role, assigned_trainer_id, created_by, expires_at, max_uses
      ) values (
        p_gym_id,
        encode(digest(upper(trim(plain_code)), 'sha256'), 'hex'),
        p_role, trainer, auth.uid(), now() + make_interval(hours => p_expires_hours), p_max_uses
      ) returning * into created_invite;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  return query select created_invite.id, plain_code, created_invite.expires_at, created_invite.max_uses;
end;
$$;

create or replace function public.join_gym_by_invite(p_code text)
returns table (gym_id uuid, gym_name text, membership_role text, trainer_id uuid)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  invite public.gym_invites;
  joined_gym public.gyms;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(coalesce(p_code, ''))) not between 6 and 30 then raise exception 'INVALID_INVITE'; end if;
  insert into public.profiles (id) values (auth.uid()) on conflict (id) do nothing;

  select * into invite
  from public.gym_invites gi
  where gi.code_hash = encode(digest(upper(trim(p_code)), 'sha256'), 'hex')
  for update;

  if invite.id is null or invite.revoked or invite.expires_at <= now() or invite.uses >= invite.max_uses then
    raise exception 'INVITE_NOT_AVAILABLE';
  end if;

  insert into public.gym_memberships (gym_id, user_id, role, trainer_id, active)
  values (invite.gym_id, auth.uid(), invite.role, invite.assigned_trainer_id, true)
  on conflict (gym_id, user_id) do update set
    active = true,
    role = case
      when public.gym_memberships.role in ('admin', 'trainer') then public.gym_memberships.role
      else excluded.role
    end,
    trainer_id = case
      when public.gym_memberships.role in ('admin', 'trainer') then public.gym_memberships.trainer_id
      else excluded.trainer_id
    end,
    updated_at = now();

  update public.gym_invites set uses = uses + 1 where id = invite.id;
  select * into joined_gym from public.gyms where id = invite.gym_id;
  return query select joined_gym.id, joined_gym.name, invite.role, invite.assigned_trainer_id;
end;
$$;

create or replace function public.assign_program_to_member(
  p_gym_id uuid,
  p_member_id uuid,
  p_program_id uuid,
  p_coach_note text default ''
)
returns public.program_assignments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.program_assignments;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_gym_role(p_gym_id, array['admin', 'trainer']) then raise exception 'NOT_GYM_STAFF'; end if;
  if not exists (
    select 1 from public.gym_memberships gm
    where gm.gym_id = p_gym_id and gm.user_id = p_member_id and gm.active and gm.role = 'member'
  ) then raise exception 'MEMBER_NOT_IN_GYM'; end if;
  if not exists (
    select 1 from public.programs p
    where p.id = p_program_id and p.gym_id = p_gym_id and p.status = 'published'
  ) then raise exception 'PROGRAM_NOT_PUBLISHED'; end if;

  update public.program_assignments
  set active = false, updated_at = now()
  where gym_id = p_gym_id and member_id = p_member_id and active;

  insert into public.program_assignments (
    gym_id, member_id, program_id, trainer_id, coach_note
  ) values (
    p_gym_id, p_member_id, p_program_id, auth.uid(), left(coalesce(p_coach_note, ''), 500)
  ) returning * into result;
  return result;
end;
$$;

create or replace function public.apply_member_snapshot(
  p_gym_id uuid,
  p_device_id uuid,
  p_base_version bigint,
  p_state jsonb,
  p_client_updated_at timestamptz
)
returns table (
  applied boolean,
  conflict boolean,
  snapshot_version bigint,
  server_state jsonb,
  server_updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.member_snapshots;
  next_row public.member_snapshots;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.is_gym_member(p_gym_id) then raise exception 'NOT_GYM_MEMBER'; end if;
  if jsonb_typeof(p_state) <> 'object' or octet_length(p_state::text) > 2097152 then raise exception 'INVALID_SNAPSHOT'; end if;

  select * into current_row
  from public.member_snapshots ms
  where ms.gym_id = p_gym_id and ms.user_id = auth.uid()
  for update;

  if current_row.user_id is null then
    insert into public.member_snapshots (
      gym_id, user_id, state, state_version, client_updated_at, device_id
    ) values (
      p_gym_id, auth.uid(), p_state, 1, p_client_updated_at, p_device_id
    ) returning * into next_row;
    return query select true, false, next_row.state_version, next_row.state, next_row.updated_at;
    return;
  end if;

  if current_row.state_version <> greatest(coalesce(p_base_version, 0), 0) then
    return query select false, true, current_row.state_version, current_row.state, current_row.updated_at;
    return;
  end if;

  update public.member_snapshots
  set state = p_state,
      state_version = current_row.state_version + 1,
      client_updated_at = p_client_updated_at,
      device_id = p_device_id,
      updated_at = now()
  where gym_id = p_gym_id and user_id = auth.uid()
  returning * into next_row;

  return query select true, false, next_row.state_version, next_row.state, next_row.updated_at;
end;
$$;

create or replace function public.request_account_deletion(p_reason text default '')
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  request_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  insert into public.account_deletion_requests (user_id, reason)
  values (auth.uid(), left(coalesce(p_reason, ''), 500))
  on conflict (user_id) where status in ('requested', 'processing')
  do update set reason = excluded.reason, requested_at = now()
  returning id into request_id;
  return request_id;
end;
$$;

revoke all on function public.set_profile(text, text, text) from public, anon;
revoke all on function public.create_gym(text) from public, anon;
revoke all on function public.create_gym_invite(uuid, text, integer, integer, uuid) from public, anon;
revoke all on function public.join_gym_by_invite(text) from public, anon;
revoke all on function public.assign_program_to_member(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.apply_member_snapshot(uuid, uuid, bigint, jsonb, timestamptz) from public, anon;
revoke all on function public.request_account_deletion(text) from public, anon;
grant execute on function public.set_profile(text, text, text) to authenticated;
grant execute on function public.create_gym(text) to authenticated;
grant execute on function public.create_gym_invite(uuid, text, integer, integer, uuid) to authenticated;
grant execute on function public.join_gym_by_invite(text) to authenticated;
grant execute on function public.assign_program_to_member(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.apply_member_snapshot(uuid, uuid, bigint, jsonb, timestamptz) to authenticated;
grant execute on function public.request_account_deletion(text) to authenticated;

create or replace function public.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row_data jsonb;
  event_gym uuid;
  event_id text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  event_gym := nullif(row_data ->> 'gym_id', '')::uuid;
  event_id := coalesce(row_data ->> 'id', row_data ->> 'user_id', 'unknown');
  insert into public.audit_events (gym_id, actor_id, entity_type, entity_id, action, metadata)
  values (
    event_gym,
    auth.uid(),
    tg_table_name,
    left(event_id, 100),
    tg_op,
    jsonb_build_object('recorded_at', now())
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger programs_audit after insert or update or delete on public.programs
for each row execute function public.capture_audit_event();
create trigger assignments_audit after insert or update or delete on public.program_assignments
for each row execute function public.capture_audit_event();
create trigger workouts_audit after insert or update or delete on public.workout_sessions
for each row execute function public.capture_audit_event();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-media',
  'exercise-media',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy exercise_media_select_gym on storage.objects
for select to authenticated using (
  bucket_id = 'exercise-media'
  and exists (
    select 1 from public.gym_memberships gm
    where gm.user_id = auth.uid()
      and gm.active
      and gm.gym_id::text = (storage.foldername(name))[1]
  )
);

create policy exercise_media_insert_staff on storage.objects
for insert to authenticated with check (
  bucket_id = 'exercise-media'
  and (storage.foldername(name))[2] = auth.uid()::text
  and exists (
    select 1 from public.gym_memberships gm
    where gm.user_id = auth.uid()
      and gm.active
      and gm.role in ('admin', 'trainer')
      and gm.gym_id::text = (storage.foldername(name))[1]
  )
);

create policy exercise_media_update_owner on storage.objects
for update to authenticated using (
  bucket_id = 'exercise-media' and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'exercise-media' and owner_id = auth.uid()::text
);

create policy exercise_media_delete_owner on storage.objects
for delete to authenticated using (
  bucket_id = 'exercise-media' and owner_id = auth.uid()::text
);

alter publication supabase_realtime add table public.programs;
alter publication supabase_realtime add table public.program_assignments;
alter publication supabase_realtime add table public.workout_sessions;
alter publication supabase_realtime add table public.member_snapshots;

commit;

