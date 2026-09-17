-- FitTrack Beta 0.10.0
alter table public.gyms
  drop constraint gyms_created_by_fkey,
  alter column created_by drop not null,
  add constraint gyms_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.gym_invites
  drop constraint gym_invites_created_by_fkey,
  alter column created_by drop not null,
  add constraint gym_invites_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.programs
  drop constraint programs_created_by_fkey,
  alter column created_by drop not null,
  add constraint programs_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.program_assignments
  drop constraint program_assignments_trainer_id_fkey,
  alter column trainer_id drop not null,
  add constraint program_assignments_trainer_id_fkey foreign key (trainer_id) references public.profiles(id) on delete set null;
comment on column public.gyms.created_by is 'Nullable after creator account deletion; shared gym data remains available to active memberships.';
comment on column public.programs.created_by is 'Nullable after trainer account deletion; published program content remains available to assigned members.';
comment on column public.program_assignments.trainer_id is 'Nullable after trainer account deletion; assignment history remains without personal attribution.';
