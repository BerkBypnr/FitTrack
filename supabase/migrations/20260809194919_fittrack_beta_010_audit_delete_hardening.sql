create or replace function public.capture_audit_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  row_data jsonb;
  event_gym uuid;
  event_id text;
  event_actor uuid;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  event_gym := nullif(row_data ->> 'gym_id', '')::uuid;
  event_id := coalesce(row_data ->> 'id', row_data ->> 'user_id', 'unknown');
  event_actor := auth.uid();
  if event_actor is not null and not exists (select 1 from public.profiles where id = event_actor) then
    event_actor := null;
  end if;
  insert into public.audit_events (gym_id, actor_id, entity_type, entity_id, action, metadata)
  values (event_gym, event_actor, tg_table_name, left(event_id, 100), tg_op, jsonb_build_object('recorded_at', now()));
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
revoke all on function public.capture_audit_event() from public, anon, authenticated;
