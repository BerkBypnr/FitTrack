begin;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.capture_audit_event() from public, anon, authenticated;
revoke all on function public.new_invite_code() from public, anon, authenticated;

create index gyms_created_by_idx on public.gyms (created_by);
create index gym_memberships_trainer_idx on public.gym_memberships (trainer_id) where trainer_id is not null;
create index gym_invites_assigned_trainer_idx on public.gym_invites (assigned_trainer_id) where assigned_trainer_id is not null;
create index gym_invites_created_by_idx on public.gym_invites (created_by);
create index programs_created_by_idx on public.programs (created_by);
create index program_assignments_program_idx on public.program_assignments (program_id);
create index program_assignments_trainer_idx on public.program_assignments (trainer_id);
create index workout_sessions_assignment_idx on public.workout_sessions (assignment_id) where assignment_id is not null;
create index workout_sessions_program_idx on public.workout_sessions (program_id) where program_id is not null;
create index audit_events_actor_idx on public.audit_events (actor_id) where actor_id is not null;

drop policy profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy memberships_select_allowed on public.gym_memberships;
create policy memberships_select_allowed on public.gym_memberships
for select to authenticated using (
  user_id = (select auth.uid()) or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

drop policy programs_insert_staff on public.programs;
create policy programs_insert_staff on public.programs
for insert to authenticated with check (
  created_by = (select auth.uid()) and public.has_gym_role(gym_id, array['admin', 'trainer'])
);

drop policy assignments_select_allowed on public.program_assignments;
create policy assignments_select_allowed on public.program_assignments
for select to authenticated using (
  member_id = (select auth.uid()) or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

drop policy workouts_select_allowed on public.workout_sessions;
create policy workouts_select_allowed on public.workout_sessions
for select to authenticated using (
  member_id = (select auth.uid()) or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

drop policy workouts_insert_self on public.workout_sessions;
create policy workouts_insert_self on public.workout_sessions
for insert to authenticated with check (
  member_id = (select auth.uid()) and public.is_gym_member(gym_id)
);

drop policy workouts_update_self on public.workout_sessions;
create policy workouts_update_self on public.workout_sessions
for update to authenticated
using (member_id = (select auth.uid()))
with check (member_id = (select auth.uid()) and public.is_gym_member(gym_id));

drop policy snapshots_select_allowed on public.member_snapshots;
create policy snapshots_select_allowed on public.member_snapshots
for select to authenticated using (
  user_id = (select auth.uid()) or public.has_gym_role(gym_id, array['admin', 'trainer'])
);

drop policy devices_all_self on public.user_devices;
create policy devices_all_self on public.user_devices
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy consents_select_self on public.consent_records;
create policy consents_select_self on public.consent_records
for select to authenticated using (user_id = (select auth.uid()));

drop policy consents_insert_self on public.consent_records;
create policy consents_insert_self on public.consent_records
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy deletion_requests_select_self on public.account_deletion_requests;
create policy deletion_requests_select_self on public.account_deletion_requests
for select to authenticated using (user_id = (select auth.uid()));

drop policy deletion_requests_insert_self on public.account_deletion_requests;
create policy deletion_requests_insert_self on public.account_deletion_requests
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy audit_select_allowed on public.audit_events;
create policy audit_select_allowed on public.audit_events
for select to authenticated using (
  actor_id = (select auth.uid())
  or (gym_id is not null and public.has_gym_role(gym_id, array['admin', 'trainer']))
);

commit;

