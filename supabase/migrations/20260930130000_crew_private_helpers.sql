-- Keep the relationship checks out of the public API. Policies still use
-- them, but nobody can call /rpc/is_friend to ask about two other people.
-- The action functions that use them are recreated to point at the new home.

create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.is_friend(uuid, uuid) set schema private;
alter function public.in_same_pact(uuid, uuid) set schema private;
alter function public.shared_a_pact(uuid, uuid) set schema private;
alter function public.is_connected(uuid, uuid) set schema private;
alter function public.can_view_progress(uuid) set schema private;
alter function public.is_pact_member(uuid, uuid) set schema private;
alter function public.is_pact_invitee(uuid, uuid) set schema private;

create or replace function private.is_connected(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select a = b
    or private.is_friend(a, b)
    or private.shared_a_pact(a, b)
    or exists (
      select 1 from public.pact_invites i
      join public.pact_members m on m.pact_id = i.pact_id
      where (i.user_id = a and m.user_id = b) or (i.user_id = b and m.user_id = a)
    );
$$;

create or replace function private.can_view_progress(owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select owner = auth.uid()
    or (
      exists (select 1 from public.profiles p where p.user_id = owner and p.sharing)
      and (private.is_friend(auth.uid(), owner) or private.in_same_pact(auth.uid(), owner))
    );
$$;

create or replace function public.accept_invite(p_code text, p_share boolean)
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
  if open_pact is not null and not private.is_pact_member(open_pact, me) then
    insert into public.pact_invites (pact_id, user_id, invited_by)
    values (open_pact, me, inviter) on conflict do nothing;
  end if;
  return inviter;
end;
$$;

create or replace function public.invite_to_pact(p_friends uuid[])
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
  where private.is_friend(me, f) and not private.is_pact_member(my_pact, f)
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.create_pact(p_start date, p_program text, p_friends uuid[])
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
  where private.is_friend(me, f)
  on conflict do nothing;
  return new_id;
end;
$$;

create or replace function public.join_pact(p_pact uuid, p_program text)
returns date language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  start date;
begin
  if not private.is_pact_invitee(p_pact, me) then raise exception 'That invite isn''t there any more'; end if;
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

create or replace function public.send_cheer(p_to uuid, p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if not private.is_connected(me, p_to) or me = p_to then raise exception 'You can only cheer your crew'; end if;
  insert into public.cheers (from_id, to_id, kind) values (me, p_to, p_kind)
  on conflict do nothing;
  return found;
end;
$$;
