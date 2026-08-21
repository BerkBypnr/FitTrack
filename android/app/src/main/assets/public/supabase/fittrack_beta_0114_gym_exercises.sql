begin;

create table if not exists public.gym_exercises (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  client_key text not null,
  name text not null,
  muscles text[] not null default '{}'::text[],
  equipment text not null default 'Diğer',
  requires_weight boolean not null default true,
  cues jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gym_exercises_client_key_length check (char_length(client_key) between 1 and 120),
  constraint gym_exercises_name_length check (char_length(name) between 1 and 80),
  constraint gym_exercises_equipment_length check (char_length(equipment) between 1 and 40),
  constraint gym_exercises_gym_client_unique unique (gym_id, client_key)
);

create index if not exists gym_exercises_gym_active_name_idx
  on public.gym_exercises (gym_id, active, name);

alter table public.gym_exercises enable row level security;

drop policy if exists gym_exercises_select_gym_members on public.gym_exercises;
create policy gym_exercises_select_gym_members
  on public.gym_exercises
  for select
  to authenticated
  using (public.has_gym_role(gym_id, array['admin', 'trainer', 'member']));

drop policy if exists gym_exercises_insert_admin on public.gym_exercises;
create policy gym_exercises_insert_admin
  on public.gym_exercises
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.has_gym_role(gym_id, array['admin'])
  );

drop policy if exists gym_exercises_update_admin on public.gym_exercises;
create policy gym_exercises_update_admin
  on public.gym_exercises
  for update
  to authenticated
  using (public.has_gym_role(gym_id, array['admin']))
  with check (public.has_gym_role(gym_id, array['admin']));

drop policy if exists gym_exercises_delete_admin on public.gym_exercises;
create policy gym_exercises_delete_admin
  on public.gym_exercises
  for delete
  to authenticated
  using (public.has_gym_role(gym_id, array['admin']));

revoke all on public.gym_exercises from public, anon;
grant select, insert, update, delete on public.gym_exercises to authenticated;

-- Üyenin genel takip notu, program atamasındaki coach_note alanından ayrıdır.
create table if not exists public.member_coach_notes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  note text not null default '',
  updated_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_coach_notes_length check (char_length(note) <= 180),
  constraint member_coach_notes_gym_member_unique unique (gym_id, member_id)
);

create index if not exists member_coach_notes_gym_member_idx
  on public.member_coach_notes (gym_id, member_id);

alter table public.member_coach_notes enable row level security;

drop policy if exists member_coach_notes_select_staff on public.member_coach_notes;
create policy member_coach_notes_select_staff
  on public.member_coach_notes
  for select
  to authenticated
  using (public.has_gym_role(gym_id, array['admin', 'trainer']));

drop policy if exists member_coach_notes_insert_staff on public.member_coach_notes;
create policy member_coach_notes_insert_staff
  on public.member_coach_notes
  for insert
  to authenticated
  with check (
    updated_by = auth.uid()
    and public.has_gym_role(gym_id, array['admin', 'trainer'])
    and exists (
      select 1 from public.gym_memberships gm
      where gm.gym_id = member_coach_notes.gym_id
        and gm.user_id = member_coach_notes.member_id
        and gm.role = 'member'
        and gm.active = true
    )
  );

drop policy if exists member_coach_notes_update_staff on public.member_coach_notes;
create policy member_coach_notes_update_staff
  on public.member_coach_notes
  for update
  to authenticated
  using (public.has_gym_role(gym_id, array['admin', 'trainer']))
  with check (
    updated_by = auth.uid()
    and public.has_gym_role(gym_id, array['admin', 'trainer'])
  );

drop policy if exists member_coach_notes_delete_admin on public.member_coach_notes;
create policy member_coach_notes_delete_admin
  on public.member_coach_notes
  for delete
  to authenticated
  using (public.has_gym_role(gym_id, array['admin']));

revoke all on public.member_coach_notes from public, anon;
grant select, insert, update, delete on public.member_coach_notes to authenticated;

commit;
