// ─── Supabase ────────────────────────────────────────────────────────────────
//
// Google sign-in plus a per-user copy of the progress in localStorage. The
// publishable key is meant to ship to the browser — row-level security on the
// tables is what keeps each user to their own rows. Override either value with
// VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.

import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://timoqfdzinioppmgxefz.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_p_kCFAJ_GVJtRYDOdZLSVw_T7TLTM9j";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true },
});

// Whether Google is switched on for the project, so the button can say so
// instead of sending people to an error page. null = couldn't tell.
export async function googleEnabled() {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } });
    if (!r.ok) return null;
    const s = await r.json();
    return Boolean(s.external?.google);
  } catch {
    return null;
  }
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

export function signOut() {
  return supabase.auth.signOut();
}

// ─── Progress sync ───────────────────────────────────────────────────────────
//
// Local shape (unchanged from the offline app):
//   { startDate, progress: { [day]: { "bi:ei": true } }, custom: { [day]: workout }, owner }
// Tables:
//   challenges    (user_id, start_date)
//   day_progress  (user_id, day, done, custom)

export async function pullRemote(userId) {
  const [challenge, days] = await Promise.all([
    supabase.from("challenges").select("start_date").eq("user_id", userId).maybeSingle(),
    supabase.from("day_progress").select("day, done, custom").eq("user_id", userId),
  ]);
  if (challenge.error) throw challenge.error;
  if (days.error) throw days.error;

  const progress = {};
  const custom = {};
  for (const row of days.data) {
    if (row.done && Object.keys(row.done).length) progress[row.day] = row.done;
    if (row.custom) custom[row.day] = row.custom;
  }
  return { startDate: challenge.data?.start_date || null, progress, custom };
}

// Fold the device's copy into the account's.
//  - Device already belongs to this user: the account wins for every day it
//    has; days only on the device (a save that never made it) are kept.
//  - Anonymous device progress: ticks are unioned, so nothing done before
//    signing in is lost.
//  - Device belongs to someone else: ignored.
export function mergeProgress(local, remote, userId) {
  const mine = local.owner === userId;
  const anon = !local.owner;
  const base = mine || anon ? local : {};

  const startDate = [base.startDate, remote.startDate].filter(Boolean).sort()[0] || null;

  const progress = { ...(base.progress || {}) };
  for (const [day, done] of Object.entries(remote.progress)) {
    progress[day] = anon ? { ...(progress[day] || {}), ...done } : done;
  }
  const custom = { ...(base.custom || {}), ...remote.custom };

  return { startDate, progress, custom, owner: userId };
}

function dayRow(userId, data, day) {
  return {
    user_id: userId,
    day: Number(day),
    done: data.progress?.[day] || {},
    custom: data.custom?.[day] || null,
  };
}

export async function pushStart(userId, startDate) {
  const { error } = await supabase
    .from("challenges")
    .upsert({ user_id: userId, start_date: startDate }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function pushDay(userId, data, day) {
  const { error } = await supabase
    .from("day_progress")
    .upsert(dayRow(userId, data, day), { onConflict: "user_id,day" });
  if (error) throw error;
}

export async function pushAll(userId, data) {
  if (data.startDate) await pushStart(userId, data.startDate);
  const days = new Set([...Object.keys(data.progress || {}), ...Object.keys(data.custom || {})]);
  if (!days.size) return;
  const { error } = await supabase
    .from("day_progress")
    .upsert([...days].map((d) => dayRow(userId, data, d)), { onConflict: "user_id,day" });
  if (error) throw error;
}
