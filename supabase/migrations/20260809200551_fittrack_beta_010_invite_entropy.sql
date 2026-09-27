create or replace function public.new_invite_code()
returns text language sql volatile
set search_path = public, extensions, pg_temp
as $$ select 'FT-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 12)); $$;
revoke all on function public.new_invite_code() from public, anon, authenticated;
