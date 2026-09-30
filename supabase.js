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
// Local shape:
//   { owner, program, startDate, pactId, progress: { [day]: { "bi:ei": true } },
//     custom: { [day]: workout }, completions: [{ program, startDate, finishedAt }] }
// Tables:
//   challenges    (user_id, program, start_date, pact_id, completions)
//   day_progress  (user_id, day, done, custom) — always for the active program

// Before the catalog there was only one program; progress with no program
// belongs to it.
export const LEGACY_PROGRAM = "stronger";

export function normalize(data) {
  if (!data) return {};
  const hasWork =
    Object.keys(data.progress || {}).length > 0 || Object.keys(data.custom || {}).length > 0;
  const program = data.program !== undefined ? data.program : hasWork ? LEGACY_PROGRAM : null;
  return {
    ...data,
    program,
    startDate: program ? data.startDate || null : null,
    pactId: program ? data.pactId || null : null,
    completions: data.completions || [],
  };
}

export async function pullRemote(userId) {
  const [challenge, days] = await Promise.all([
    supabase.from("challenges").select("start_date, program, pact_id, completions").eq("user_id", userId).maybeSingle(),
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
  const hasWork = Object.keys(progress).length > 0 || Object.keys(custom).length > 0;
  const program = challenge.data?.program || (hasWork ? LEGACY_PROGRAM : null);
  return {
    program,
    startDate: program ? challenge.data?.start_date || null : null,
    pactId: program ? challenge.data?.pact_id || null : null,
    progress,
    custom,
    completions: challenge.data?.completions || [],
  };
}

const completionKey = (c) => `${c.program}|${c.startDate}`;

export function unionCompletions(a = [], b = []) {
  const byKey = new Map();
  for (const c of [...a, ...b]) if (!byKey.has(completionKey(c))) byKey.set(completionKey(c), c);
  return [...byKey.values()].sort((x, y) => String(x.finishedAt).localeCompare(String(y.finishedAt)));
}

// Fold the device's copy into the account's. Returns the merged data and
// whether the account's day rows belong to a different program and have to go.
//  - Device belongs to someone else: ignored.
//  - Same program on both: as before — the account wins per day for its own
//    device, anonymous ticks are unioned, and the earliest start date wins.
//  - Different programs: the one started most recently wins (a switch made on
//    this device that never reached the account, or a fresh start before
//    signing in). Ties go to the account.
//  - Badges are always unioned — they're never lost.
export function mergeProgress(local, remote, userId) {
  const mine = local.owner === userId;
  const anon = !local.owner;
  const base = mine || anon ? normalize(local) : normalize({});
  const completions = unionCompletions(remote.completions, base.completions);

  let pick;
  if (!base.program) pick = "remote";
  else if (!remote.program) pick = "local";
  else if (base.program === remote.program) pick = "both";
  else pick = (base.startDate || "") > (remote.startDate || "") ? "local" : "remote";

  if (pick === "remote") {
    const { program, startDate, pactId, progress, custom } = remote;
    return { merged: { owner: userId, program, startDate, pactId, progress, custom, completions }, wipe: false };
  }
  if (pick === "local") {
    const { program, startDate, pactId = null, progress = {}, custom = {} } = base;
    return {
      merged: { owner: userId, program, startDate, pactId, progress, custom, completions },
      wipe: Boolean(remote.program),
    };
  }

  // A pact fixes Day 1, so its date wins over "earliest".
  const pactId = remote.pactId || base.pactId || null;
  const startDate = pactId && remote.pactId
    ? remote.startDate
    : [base.startDate, remote.startDate].filter(Boolean).sort()[0] || null;
  const progress = { ...(base.progress || {}) };
  for (const [day, done] of Object.entries(remote.progress)) {
    progress[day] = anon ? { ...(progress[day] || {}), ...done } : done;
  }
  const custom = { ...(base.custom || {}), ...remote.custom };
  return {
    merged: { owner: userId, program: base.program, startDate, pactId, progress, custom, completions },
    wipe: false,
  };
}

function dayRow(userId, data, day) {
  return {
    user_id: userId,
    day: Number(day),
    done: data.progress?.[day] || {},
    custom: data.custom?.[day] || null,
  };
}

// The challenge row: which program, when it started, and the badges earned.
export async function pushChallenge(userId, data) {
  const row = {
    user_id: userId,
    program: data.program || null,
    pact_id: data.pactId || null,
    completions: data.completions || [],
  };
  if (data.startDate) row.start_date = data.startDate;
  const { error } = await supabase.from("challenges").upsert(row, { onConflict: "user_id" });
  if (error) throw error;
}

// Starting or ending a challenge clears every day of the old one.
export async function clearDays(userId) {
  const { error } = await supabase.from("day_progress").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function pushDay(userId, data, day) {
  const { error } = await supabase
    .from("day_progress")
    .upsert(dayRow(userId, data, day), { onConflict: "user_id,day" });
  if (error) throw error;
}

export async function pushAll(userId, data, { wipe = false } = {}) {
  if (wipe) await clearDays(userId);
  await pushChallenge(userId, data);
  const days = new Set([...Object.keys(data.progress || {}), ...Object.keys(data.custom || {})]);
  if (!days.size) return;
  const { error } = await supabase
    .from("day_progress")
    .upsert([...days].map((d) => dayRow(userId, data, d)), { onConflict: "user_id,day" });
  if (error) throw error;
}
