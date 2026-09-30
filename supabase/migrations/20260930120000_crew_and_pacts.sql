-- Crew (accountability partners) and pacts (30 days together).
--
--   profiles       name, avatar, personal invite code, and the sharing switch
--   friendships    one row per direction; created only by accept_invite()
--   pacts          a shared Day 1; members each pick their own challenge
--   pact_members   who's in, what they're doing, whether they left
--   pact_invites   pending invitations to a pact
--   cheers         cheers and nudges, at most one of each per friend per day
--
-- Friends can read each other's challenge and day rows only while the owner
-- has sharing switched on. Pact members count as friends for this. Every
-- write that touches another person goes through a security definer function
-- that checks the relationship first. Additive: older clients keep working.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Someone' check (char_length(display_name) between 1 and 60),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  sharing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.profiles.sharing is 'When true, friends and pact members can see this person''s challenge progress.';

create table public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
create index friendships_friend_idx on public.friendships (friend_id);

create table public.pacts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  created_at timestamptz not null default now()
);
create index pacts_created_by_idx on public.pacts (created_by);

create table public.pact_members (
  pact_id uuid not null references public.pacts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  program text not null check (char_length(program) between 1 and 40),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (pact_id, user_id)
);
create index pact_members_user_idx on public.pact_members (user_id);
-- One pact at a time.
create unique index pact_members_one_active on public.pact_members (user_id) where left_at is null;

create table public.pact_invites (
  pact_id uuid not null references public.pacts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pact_id, user_id)
);
create index pact_invites_user_idx on public.pact_invites (user_id);
create index pact_invites_invited_by_idx on public.pact_invites (invited_by);

create table public.cheers (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('cheer', 'nudge')),
  sent_on date not null default current_date,
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  check (from_id <> to_id),
  unique (from_id, to_id, kind, sent_on)
);
create index cheers_to_idx on public.cheers (to_id, seen_at);

alter table public.challenges
  add column if not exists pact_id uuid references public.pacts (id) on delete set null;
create index if not exists challenges_pact_idx on public.challenges (pact_id);
comment on column public.challenges.pact_id is 'The pact this challenge is part of, if any.';

-- ── Relationship checks (security definer so policies can use them without
--    recursing through each other's RLS) ───────────────────────────────────

create function public.is_friend(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.friendships f where f.user_id = a and f.friend_id = b);
$$;

-- Both still in the same pact (leaving ends the view of each other's progress).
create function public.in_same_pact(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.pact_members x
    join public.pact_members y on y.pact_id = x.pact_id
    where x.user_id = a and y.user_id = b and x.left_at is null and y.left_at is null
  );
$$;

-- Ever in the same pact, left or not — enough to see each other's name.
create function public.shared_a_pact(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.pact_members x
    join public.pact_members y on y.pact_id = x.pact_id
    where x.user_id = a and y.user_id = b
  );
$$;

-- Someone you're connected to: a friend, a fellow pact member, or someone
-- who has invited you to a pact / you've invited.
create function public.is_connected(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select a = b
    or public.is_friend(a, b)
    or public.shared_a_pact(a, b)
    or exists (
      select 1 from public.pact_invites i
      join public.pact_members m on m.pact_id = i.pact_id
      where (i.user_id = a and m.user_id = b) or (i.user_id = b and m.user_id = a)
    );
$$;

create function public.can_view_progress(owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select owner = auth.uid()
    or (
      exists (select 1 from public.profiles p where p.user_id = owner and p.sharing)
      and (public.is_friend(auth.uid(), owner) or public.in_same_pact(auth.uid(), owner))
    );
$$;

create function public.is_pact_member(p uuid, u uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pact_members m where m.pact_id = p and m.user_id = u);
$$;

create function public.is_pact_invitee(p uuid, u uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pact_invites i where i.pact_id = p and i.user_id = u);
$$;

-- ── Row-level security ──────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.pacts enable row level security;
alter table public.pact_members enable row level security;
alter table public.pact_invites enable row level security;
alter table public.cheers enable row level security;

create policy "Profiles: self and connections can read" on public.profiles
  for select to authenticated using (public.is_connected((select auth.uid()), user_id));
-- Profiles are created by ensure_profile(); the only column people change
-- directly is their sharing switch.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (sharing) on public.profiles to authenticated;
create policy "Profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Friendships: read own" on public.friendships
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Pacts: members and invitees can read" on public.pacts
  for select to authenticated using (
    public.is_pact_member(id, (select auth.uid())) or public.is_pact_invitee(id, (select auth.uid()))
  );

create policy "Pact members: members and invitees can read" on public.pact_members
  for select to authenticated using (
    public.is_pact_member(pact_id, (select auth.uid())) or public.is_pact_invitee(pact_id, (select auth.uid()))
  );

create policy "Pact invites: invitee and members can read" on public.pact_invites
  for select to authenticated using (
    (select auth.uid()) = user_id or public.is_pact_member(pact_id, (select auth.uid()))
  );

create policy "Cheers: sender and recipient can read" on public.cheers
  for select to authenticated using ((select auth.uid()) in (from_id, to_id));

-- Friends see shared progress. (The owner-only policies stay as they are;
-- permissive policies are OR'ed.)
create policy "Challenges: shared with crew" on public.challenges
  for select to authenticated using (public.can_view_progress(user_id));
create policy "Progress: shared with crew" on public.day_progress
  for select to authenticated using (public.can_view_progress(user_id));

-- ── Actions ─────────────────────────────────────────────────────────────────

-- Profile from the sign-in, created on first use. Keeps the chosen sharing.
create function public.ensure_profile(p_name text, p_avatar text)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  row public.profiles;
begin
  if me is null then raise exception 'Sign in first'; end if;
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    me,
    coalesce(nullif(left(trim(p_name), 60), ''), 'Someone'),
    case when p_avatar ~ '^https://' then p_avatar end
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        updated_at = now()
  returning * into row;
  return row;
end;
$$;

-- Who's behind an invite link, and the pact they'd like you in (if one is
-- still open to join).
create function public.invite_preview(p_code text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'user_id', p.user_id,
    'name', p.display_name,
    'avatar', p.avatar_url,
    'pact', (
      select jsonb_build_object('id', k.id, 'start_date', k.start_date, 'program', m.program)
      from public.pact_members m join public.pacts k on k.id = m.pact_id
      where m.user_id = p.user_id and m.left_at is null and k.start_date >= current_date - 3
      limit 1
    )
  )
  from public.profiles p
  where p.invite_code = p_code and auth.uid() is not null;
$$;

-- Accept someone's invite link: you become each other's crew. If they have a
-- pact that's still open, you're invited to it too.
create function public.accept_invite(p_code text, p_share boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  inviter uuid;
  open_pact uuid;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select user_id into inviter from public.profiles where invite_code = p_code;
  if inviter is null then raise exception 'This invite link isn''t valid any more'; end if;
  if inviter = me then raise exception 'That''s your own invite link'; end if;

  insert into public.friendships (user_id, friend_id) values (me, inviter), (inviter, me)
  on conflict do nothing;
  if p_share then
    update public.profiles set sharing = true, updated_at = now() where user_id = me;
  end if;

  select m.pact_id into open_pact
  from public.pact_members m join public.pacts k on k.id = m.pact_id
  where m.user_id = inviter and m.left_at is null and k.start_date >= current_date - 3
  limit 1;
  if open_pact is not null and not public.is_pact_member(open_pact, me) then
    insert into public.pact_invites (pact_id, user_id, invited_by)
    values (open_pact, me, inviter) on conflict do nothing;
  end if;
  return inviter;
end;
$$;

create function public.regenerate_invite_code()
returns text language plpgsql security definer set search_path = '' as $$
declare
  code text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
begin
  update public.profiles set invite_code = code, updated_at = now() where user_id = auth.uid();
  return code;
end;
$$;

create function public.remove_friend(p_friend uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  delete from public.friendships
  where (user_id = me and friend_id = p_friend) or (user_id = p_friend and friend_id = me);
  delete from public.pact_invites
  where (user_id = me and invited_by = p_friend) or (user_id = p_friend and invited_by = me);
end;
$$;

-- Leave whatever pact you're in (switching or ending your challenge does this).
create function public.leave_pact()
returns void language sql security definer set search_path = '' as $$
  update public.pact_members set left_at = now() where user_id = auth.uid() and left_at is null;
$$;

-- Invite crew members to your current pact while it's open to join.
create function public.invite_to_pact(p_friends uuid[])
returns int language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  my_pact uuid;
  n int;
begin
  select m.pact_id into my_pact
  from public.pact_members m join public.pacts k on k.id = m.pact_id
  where m.user_id = me and m.left_at is null and k.start_date >= current_date - 3;
  if my_pact is null then raise exception 'Your pact isn''t open to new members'; end if;
  insert into public.pact_invites (pact_id, user_id, invited_by)
  select my_pact, f, me from unnest(p_friends) f
  where public.is_friend(me, f) and not public.is_pact_member(my_pact, f)
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Start a pact: a shared Day 1 up to two weeks out. You're its first member.
create function public.create_pact(p_start date, p_program text, p_friends uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  new_id uuid;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if p_start < current_date - 1 or p_start > current_date + 14 then
    raise exception 'Pick a start date in the next two weeks';
  end if;
  perform public.leave_pact();
  insert into public.pacts (created_by, start_date) values (me, p_start) returning id into new_id;
  insert into public.pact_members (pact_id, user_id, program) values (new_id, me, p_program);
  update public.profiles set sharing = true, updated_at = now() where user_id = me;
  delete from public.pact_invites where user_id = me;
  insert into public.pact_invites (pact_id, user_id, invited_by)
  select new_id, f, me from unnest(coalesce(p_friends, '{}')) f
  where public.is_friend(me, f)
  on conflict do nothing;
  return new_id;
end;
$$;

-- Join a pact you were invited to, with the challenge you picked. Open until
-- three days after its Day 1.
create function public.join_pact(p_pact uuid, p_program text)
returns date language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  start date;
begin
  if not public.is_pact_invitee(p_pact, me) then raise exception 'That invite isn''t there any more'; end if;
  select start_date into start from public.pacts where id = p_pact;
  if start < current_date - 3 then raise exception 'This pact started more than 3 days ago'; end if;
  perform public.leave_pact();
  insert into public.pact_members (pact_id, user_id, program) values (p_pact, me, p_program)
  on conflict (pact_id, user_id) do update set program = excluded.program, left_at = null, joined_at = now();
  delete from public.pact_invites where user_id = me;
  update public.profiles set sharing = true, updated_at = now() where user_id = me;
  return start;
end;
$$;

create function public.decline_pact(p_pact uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.pact_invites where pact_id = p_pact and user_id = auth.uid();
$$;

-- A cheer (any day) or a nudge, once of each per friend per day.
create function public.send_cheer(p_to uuid, p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if not public.is_connected(me, p_to) or me = p_to then raise exception 'You can only cheer your crew'; end if;
  insert into public.cheers (from_id, to_id, kind) values (me, p_to, p_kind)
  on conflict do nothing;
  return found;
end;
$$;

create function public.mark_cheers_seen()
returns void language sql security definer set search_path = '' as $$
  update public.cheers set seen_at = now() where to_id = auth.uid() and seen_at is null;
$$;

-- Only signed-in people may call any of this.
do $$
declare f text;
begin
  foreach f in array array[
    'is_friend(uuid, uuid)', 'in_same_pact(uuid, uuid)', 'shared_a_pact(uuid, uuid)', 'is_connected(uuid, uuid)',
    'can_view_progress(uuid)', 'is_pact_member(uuid, uuid)', 'is_pact_invitee(uuid, uuid)',
    'ensure_profile(text, text)', 'invite_preview(text)', 'accept_invite(text, boolean)',
    'regenerate_invite_code()', 'remove_friend(uuid)', 'leave_pact()', 'invite_to_pact(uuid[])',
    'create_pact(date, text, uuid[])', 'join_pact(uuid, text)', 'decline_pact(uuid)',
    'send_cheer(uuid, text)', 'mark_cheers_seen()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
