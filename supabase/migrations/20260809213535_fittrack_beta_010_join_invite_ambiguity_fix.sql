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
  on conflict on constraint gym_memberships_pkey do update set
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

  update public.gym_invites gi set uses = gi.uses + 1 where gi.id = invite.id;
  select * into joined_gym from public.gyms g where g.id = invite.gym_id;
  return query select joined_gym.id, joined_gym.name, invite.role, invite.assigned_trainer_id;
end;
$$;

revoke all on function public.join_gym_by_invite(text) from public, anon;
grant execute on function public.join_gym_by_invite(text) to authenticated;
