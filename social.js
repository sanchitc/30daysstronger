// ─── Crew & pacts ────────────────────────────────────────────────────────────
//
// Accountability partners ("crew") and 30 days together ("pacts"), on top of
// the Supabase tables in supabase/migrations/20260930120000_crew_and_pacts.sql.
//
//  - You add people with your personal invite link. Opening it and accepting
//    makes you each other's crew.
//  - Your progress is visible to your crew only while your sharing switch is
//    on. Starting or joining a pact turns it on (it's the point of a pact).
//  - A pact is a shared Day 1. Everyone picks their own challenge, the same or
//    different. You're in at most one, and switching or ending your challenge
//    leaves it.
//  - Cheers (any day) and nudges (for a day not done yet), once each per friend
//    per day.
//
// Row-level security decides what comes back; this file only asks.

import { supabase } from "./supabase.js";

const INVITE_KEY = "training_tracker_pending_invite";

// ── Invite links ────────────────────────────────────────────────────────────

export function inviteLink(code) {
  return `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}`;
}

// An invite in the address bar is kept until it's dealt with, so it survives
// the round trip through Google sign-in.
export function capturePendingInvite() {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("invite");
    if (code) {
      localStorage.setItem(INVITE_KEY, code);
      url.searchParams.delete("invite");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    return localStorage.getItem(INVITE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingInvite() {
  try { localStorage.removeItem(INVITE_KEY); } catch {}
}

// ── Reading ─────────────────────────────────────────────────────────────────

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export function ensureProfile(session) {
  const meta = session?.user?.user_metadata || {};
  const name = meta.full_name || meta.name || (session?.user?.email || "").split("@")[0] || "Someone";
  return rpc("ensure_profile", { p_name: name, p_avatar: meta.avatar_url || meta.picture || null });
}

export function invitePreview(code) {
  return rpc("invite_preview", { p_code: code });
}

// Everyone this person can see, with their challenge and ticks where shared.
async function loadPeople(ids) {
  if (!ids.length) return {};
  const [profiles, challenges, days] = await Promise.all([
    supabase.from("profiles").select("user_id, display_name, avatar_url, sharing").in("user_id", ids),
    supabase.from("challenges").select("user_id, program, start_date, pact_id").in("user_id", ids),
    supabase.from("day_progress").select("user_id, day, done, custom").in("user_id", ids),
  ]);
  for (const r of [profiles, challenges, days]) if (r.error) throw r.error;

  const people = {};
  for (const p of profiles.data) {
    people[p.user_id] = {
      id: p.user_id,
      name: p.display_name,
      avatar: p.avatar_url,
      sharing: p.sharing,
      challenge: null,
      progress: {},
      custom: {},
    };
  }
  for (const c of challenges.data) {
    if (people[c.user_id] && c.program) {
      people[c.user_id].challenge = { program: c.program, startDate: c.start_date, pactId: c.pact_id };
    }
  }
  for (const d of days.data) {
    const who = people[d.user_id];
    if (!who) continue;
    if (d.done && Object.keys(d.done).length) who.progress[d.day] = d.done;
    if (d.custom) who.custom[d.day] = d.custom;
  }
  return people;
}

export async function loadCrew(uid) {
  const [me, friendRows, myMember, invites, cheersIn, sentToday] = await Promise.all([
    supabase.from("profiles").select("user_id, display_name, avatar_url, invite_code, sharing").eq("user_id", uid).maybeSingle(),
    supabase.from("friendships").select("friend_id, created_at").eq("user_id", uid),
    supabase.from("pact_members").select("pact_id").eq("user_id", uid).is("left_at", null).maybeSingle(),
    supabase.from("pact_invites").select("pact_id, invited_by, created_at").eq("user_id", uid),
    supabase.from("cheers").select("id, from_id, kind, created_at").eq("to_id", uid).is("seen_at", null)
      .order("created_at", { ascending: false }).limit(20),
    supabase.from("cheers").select("to_id, kind").eq("from_id", uid).eq("sent_on", new Date().toISOString().slice(0, 10)),
  ]);
  for (const r of [me, friendRows, myMember, invites, cheersIn, sentToday]) if (r.error) throw r.error;

  const pactIds = [...new Set([myMember.data?.pact_id, ...invites.data.map((i) => i.pact_id)].filter(Boolean))];
  let pacts = [];
  let members = [];
  let waiting = [];
  if (pactIds.length) {
    const myPact = myMember.data?.pact_id;
    const [p, m, w] = await Promise.all([
      supabase.from("pacts").select("id, created_by, start_date").in("id", pactIds),
      supabase.from("pact_members").select("pact_id, user_id, program, joined_at, left_at").in("pact_id", pactIds),
      myPact
        ? supabase.from("pact_invites").select("user_id").eq("pact_id", myPact)
        : Promise.resolve({ data: [], error: null }),
    ]);
    for (const r of [p, m, w]) if (r.error) throw r.error;
    pacts = p.data;
    members = m.data;
    waiting = w.data.map((i) => i.user_id);
  }

  const friendIds = friendRows.data.map((f) => f.friend_id);
  const ids = [...new Set([
    ...friendIds,
    ...members.map((m) => m.user_id),
    ...waiting,
    ...invites.data.map((i) => i.invited_by),
    ...cheersIn.data.map((c) => c.from_id),
  ])].filter((id) => id !== uid);
  const people = await loadPeople(ids);

  const pactOf = (id) => {
    const p = pacts.find((x) => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      createdBy: p.created_by,
      startDate: p.start_date,
      members: members
        .filter((m) => m.pact_id === id)
        .sort((a, b) => String(a.joined_at).localeCompare(String(b.joined_at)))
        .map((m) => ({ id: m.user_id, program: m.program, joinedAt: m.joined_at, leftAt: m.left_at })),
    };
  };

  return {
    me: me.data
      ? { id: uid, name: me.data.display_name, avatar: me.data.avatar_url, inviteCode: me.data.invite_code, sharing: me.data.sharing }
      : null,
    people,
    friends: friendRows.data
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
      .map((f) => f.friend_id),
    pact: myMember.data ? { ...pactOf(myMember.data.pact_id), waiting } : null,
    invites: invites.data
      .map((i) => ({ pact: pactOf(i.pact_id), invitedBy: i.invited_by }))
      .filter((i) => i.pact),
    cheers: cheersIn.data.map((c) => ({ id: c.id, from: c.from_id, kind: c.kind, at: c.created_at })),
    sent: new Set(sentToday.data.map((c) => `${c.to_id}|${c.kind}`)),
  };
}

// ── Actions ─────────────────────────────────────────────────────────────────

export async function setSharing(uid, on) {
  const { error } = await supabase.from("profiles").update({ sharing: on }).eq("user_id", uid);
  if (error) throw new Error(error.message);
}

export const acceptInvite = (code, share) => rpc("accept_invite", { p_code: code, p_share: share });
export const regenerateInviteCode = () => rpc("regenerate_invite_code");
export const removeFriend = (id) => rpc("remove_friend", { p_friend: id });
export const createPact = (startDate, program, friends) =>
  rpc("create_pact", { p_start: startDate, p_program: program, p_friends: friends });
export const joinPact = (pactId, program) => rpc("join_pact", { p_pact: pactId, p_program: program });
export const declinePact = (pactId) => rpc("decline_pact", { p_pact: pactId });
export const leavePact = () => rpc("leave_pact");
export const inviteToPact = (ids) => rpc("invite_to_pact", { p_friends: ids });
export const sendCheer = (to, kind) => rpc("send_cheer", { p_to: to, p_kind: kind });
export const markCheersSeen = () => rpc("mark_cheers_seen");
