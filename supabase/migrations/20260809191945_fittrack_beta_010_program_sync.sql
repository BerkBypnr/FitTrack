begin;

alter table public.programs
  add column client_key text not null check (char_length(client_key) between 1 and 140),
  add column root_key text not null check (char_length(root_key) between 1 and 140);

create unique index programs_gym_client_key_idx on public.programs (gym_id, client_key);
create index programs_gym_root_key_idx on public.programs (gym_id, root_key, version desc);

create or replace function public.update_member_coach_note(
  p_gym_id uuid,
  p_member_id uuid,
  p_coach_note text
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

  update public.program_assignments
  set coach_note = left(coalesce(p_coach_note, ''), 500), updated_at = now()
  where gym_id = p_gym_id and member_id = p_member_id and active
  returning * into result;

  if result.id is null then raise exception 'ACTIVE_ASSIGNMENT_NOT_FOUND'; end if;
  return result;
end;
$$;

revoke all on function public.update_member_coach_note(uuid, uuid, text) from public, anon;
grant execute on function public.update_member_coach_note(uuid, uuid, text) to authenticated;

commit;

