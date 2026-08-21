begin;

-- Bir üyede yalnız tek aktif program bulunmasına neden olan 0.10 indeksini kaldır.
drop index if exists public.program_assignments_one_active_idx;

-- Aynı program aynı üyeye ikinci kez aktif atanamaz; farklı programlar için sayı sınırı yoktur.
create unique index if not exists program_assignments_one_active_program_idx
  on public.program_assignments (gym_id, member_id, program_id)
  where active;

create or replace function public.assign_program_to_member(
  p_gym_id uuid,
  p_member_id uuid,
  p_program_id uuid,
  p_coach_note text default ''::text
)
returns public.program_assignments
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
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

  insert into public.program_assignments (
    gym_id, member_id, program_id, trainer_id, coach_note, active, assigned_at, updated_at
  ) values (
    p_gym_id, p_member_id, p_program_id, auth.uid(), left(coalesce(p_coach_note, ''), 500), true, now(), now()
  )
  on conflict (gym_id, member_id, program_id) where active
  do update set
    trainer_id = excluded.trainer_id,
    coach_note = excluded.coach_note,
    assigned_at = now(),
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

revoke all on function public.assign_program_to_member(uuid, uuid, uuid, text) from public, anon;
grant execute on function public.assign_program_to_member(uuid, uuid, uuid, text) to authenticated;

create or replace function public.archive_program_assignment(
  p_gym_id uuid,
  p_member_id uuid,
  p_assignment_id uuid
)
returns public.program_assignments
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  result public.program_assignments;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_gym_role(p_gym_id, array['admin', 'trainer']) then raise exception 'NOT_GYM_STAFF'; end if;

  update public.program_assignments
  set active = false, updated_at = now()
  where id = p_assignment_id
    and gym_id = p_gym_id
    and member_id = p_member_id
    and active
  returning * into result;

  if result.id is null then raise exception 'ACTIVE_ASSIGNMENT_NOT_FOUND'; end if;
  return result;
end;
$$;

revoke all on function public.archive_program_assignment(uuid, uuid, uuid) from public, anon;
grant execute on function public.archive_program_assignment(uuid, uuid, uuid) to authenticated;

-- Eski tek-atama varsayımındaki çok satır hatasını önlemek için notu son atamaya yaz.
create or replace function public.update_member_coach_note(
  p_gym_id uuid,
  p_member_id uuid,
  p_coach_note text
)
returns public.program_assignments
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  target_id uuid;
  result public.program_assignments;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_gym_role(p_gym_id, array['admin', 'trainer']) then raise exception 'NOT_GYM_STAFF'; end if;

  select pa.id into target_id
  from public.program_assignments pa
  where pa.gym_id = p_gym_id and pa.member_id = p_member_id and pa.active
  order by pa.assigned_at desc, pa.id
  limit 1;

  if target_id is null then raise exception 'ACTIVE_ASSIGNMENT_NOT_FOUND'; end if;

  update public.program_assignments
  set coach_note = left(coalesce(p_coach_note, ''), 500), updated_at = now()
  where id = target_id
  returning * into result;
  return result;
end;
$$;

revoke all on function public.update_member_coach_note(uuid, uuid, text) from public, anon;
grant execute on function public.update_member_coach_note(uuid, uuid, text) to authenticated;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.can_chat_with(p_gym_id uuid, p_other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.gym_memberships me
    join public.gym_memberships other
      on other.gym_id = me.gym_id
     and other.user_id = p_other_user_id
     and other.active
    where me.gym_id = p_gym_id
      and me.user_id = auth.uid()
      and me.active
      and (
        (me.role = 'member' and other.role in ('admin', 'trainer'))
        or
        (me.role in ('admin', 'trainer') and other.role = 'member')
      )
  );
$$;

revoke all on function private.can_chat_with(uuid, uuid) from public, anon;
grant execute on function private.can_chat_with(uuid, uuid) to authenticated;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  client_mutation_id uuid not null,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chat_messages_distinct_people_check check (sender_id <> recipient_id),
  constraint chat_messages_sender_mutation_key unique (sender_id, client_mutation_id)
);

create index if not exists chat_messages_conversation_idx
  on public.chat_messages (gym_id, sender_id, recipient_id, created_at desc);
create index if not exists chat_messages_unread_idx
  on public.chat_messages (recipient_id, created_at desc)
  where read_at is null;

alter table public.chat_messages enable row level security;

drop policy if exists chat_messages_select_participants on public.chat_messages;
create policy chat_messages_select_participants
on public.chat_messages for select
to authenticated
using (
  (select auth.uid()) in (sender_id, recipient_id)
  and private.can_chat_with(
    gym_id,
    case when sender_id = (select auth.uid()) then recipient_id else sender_id end
  )
);

drop policy if exists chat_messages_insert_sender on public.chat_messages;
create policy chat_messages_insert_sender
on public.chat_messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and private.can_chat_with(gym_id, recipient_id)
);

drop policy if exists chat_messages_update_recipient on public.chat_messages;
create policy chat_messages_update_recipient
on public.chat_messages for update
to authenticated
using (
  recipient_id = (select auth.uid())
  and private.can_chat_with(gym_id, sender_id)
)
with check (
  recipient_id = (select auth.uid())
  and private.can_chat_with(gym_id, sender_id)
);

revoke all on table public.chat_messages from anon;
revoke all on table public.chat_messages from authenticated;
grant select, insert on table public.chat_messages to authenticated;
grant update (read_at) on table public.chat_messages to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;

commit;
