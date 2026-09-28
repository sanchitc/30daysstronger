-- Which 30-day challenge is active, and the badges earned. Applied to the
-- project on 2026-09-28. Additive: older clients keep working.

alter table public.challenges
  add column if not exists program text,
  add column if not exists completions jsonb not null default '[]'::jsonb;

comment on column public.challenges.program is 'Active 30-day program id (e.g. stronger, ageless). null = none chosen yet.';
comment on column public.challenges.completions is 'Finished challenges: [{program, startDate, finishedAt}]';
