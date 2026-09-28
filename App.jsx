import { useEffect, useRef, useState } from "react";
import { PLAN, TOTAL_DAYS, getDay, countExercises, countDone } from "./plan.js";
import { Confetti, playApplause } from "./Celebrate.jsx";
import ExerciseSheet from "./ExerciseSheet.jsx";
import Builder from "./Builder.jsx";
import ProgressGrid from "./ProgressGrid.jsx";
import { SignInScreen, AccountBar } from "./Auth.jsx";
import {
  supabase, googleEnabled, signInWithGoogle, signOut,
  pullRemote, mergeProgress, pushAll, pushDay, pushStart,
} from "./supabase.js";

// ─── Storage ─────────────────────────────────────────────────────────────────

const KEY = "training_tracker_v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

// Set once someone chooses "Continue without an account".
const SKIP_KEY = "training_tracker_skip_signin";
function skippedSignIn() {
  try { return localStorage.getItem(SKIP_KEY) === "1"; } catch { return false; }
}
function rememberSkip(on) {
  try { on ? localStorage.setItem(SKIP_KEY, "1") : localStorage.removeItem(SKIP_KEY); } catch {}
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Day 1 is the day you first opened the app; it never runs past the plan.
function dayFromStart(startDate) {
  const diff = Math.floor((new Date(todayKey()) - new Date(startDate)) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), TOTAL_DAYS);
}

// ─── Rest timer ──────────────────────────────────────────────────────────────

function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  useEffect(() => {
    if (left > 0) return;
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const mm = Math.max(0, Math.floor(left / 60));
  const ss = String(Math.max(0, left % 60)).padStart(2, "0");

  return (
    <div className="timer-bar">
      <span className="timer-time">{mm}:{ss}</span>
      <span className="timer-label">{left > 0 ? "Rest — next round coming up" : "Go!"}</span>
      <button className="timer-x" onClick={onDone}>×</button>
    </div>
  );
}

// A block's heading: its own label if it has one, otherwise the rounds it runs.
function blockHeading(block) {
  const rounds =
    block.rounds > 1
      ? `${block.rounds} ROUNDS${block.rest ? ` · ${block.rest} SEC REST` : ""}`
      : "";
  if (block.label) return rounds ? `${block.label} · ${rounds}` : block.label;
  return rounds || "WARM UP";
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(load);
  const [dayNumber, setDayNumber] = useState(() => {
    const d = load();
    return dayFromStart(d.startDate || todayKey());
  });
  const [sheetItem, setSheetItem] = useState(null);
  const [building, setBuilding] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [rest, setRest] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const wasComplete = useRef(false);

  // ── Account ──
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [googleOn, setGoogleOn] = useState(null);
  const [skipped, setSkipped] = useState(skippedSignIn);
  const [sync, setSync] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const syncedFor = useRef(null);
  const userId = session?.user?.id || null;

  // Pull the account's progress, fold in this device's, and push the result.
  const syncFrom = async (uid) => {
    if (syncedFor.current === uid) return;
    syncedFor.current = uid;
    setSync("syncing");
    try {
      const merged = mergeProgress(load(), await pullRemote(uid), uid);
      if (!merged.startDate) merged.startDate = todayKey();
      save(merged);
      setData(merged);
      setDayNumber(dayFromStart(merged.startDate));
      await pushAll(uid, merged);
      setSync("synced");
    } catch (err) {
      console.error("Sync failed", err);
      syncedFor.current = null;
      setSync("error");
    }
  };

  useEffect(() => {
    googleEnabled().then(setGoogleOn);
    // If Supabase can't be reached, don't hold the app back.
    const fallback = setTimeout(() => setAuthReady(true), 3000);
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setAuthReady(true);
      // Supabase calls can't be awaited inside this callback — defer them.
      if (s) setTimeout(() => syncFrom(s.user.id), 0);
    });
    return () => { clearTimeout(fallback); sub.subscription.unsubscribe(); };
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error.message);
      setSigningIn(false);
    }
  };

  const handleSkip = () => { rememberSkip(true); setSkipped(true); };

  // Signing out leaves the account's progress in the cloud and clears this
  // device, so the next person to sign in here starts clean.
  const handleSignOut = async () => {
    await signOut();
    try { localStorage.removeItem(KEY); } catch {}
    rememberSkip(false);
    syncedFor.current = null;
    setSkipped(false);
    setSync(null);
    setData({});
    setDayNumber(1);
  };

  const pushSafely = (task) => {
    setSync("syncing");
    task.then(
      () => setSync("synced"),
      (err) => { console.error("Sync failed", err); setSync("error"); }
    );
  };

  // Remember when the plan started so the day number can advance on its own.
  useEffect(() => {
    if (!data.startDate) {
      const next = { ...data, startDate: todayKey() };
      setData(next);
      save(next);
      if (userId && data.owner === userId) pushSafely(pushStart(userId, next.startDate));
    }
  }, [data]);

  const workout = data.custom?.[dayNumber] || getDay(dayNumber);
  const done = data.progress?.[dayNumber] || {};
  const total = countExercises(workout);
  // Count only boxes that exist in the workout as it stands now — editing a day
  // shouldn't leave it looking finished.
  const doneCount = countDone(workout, done);
  const complete = total > 0 && doneCount >= total;

  // Celebrate the moment the last box is ticked — but not on reload.
  useEffect(() => {
    if (complete && !wasComplete.current) {
      setCelebrate(true);
      playApplause();
      setTimeout(() => setCelebrate(false), 4000);
    }
    wasComplete.current = complete;
  }, [complete]);

  // Save locally, then — when signed in — push the day that changed.
  const persist = (next, day) => {
    setData(next);
    save(next);
    if (userId && next.owner === userId) pushSafely(pushDay(userId, next, day));
  };

  const toggle = (bi, ei) => {
    const k = `${bi}:${ei}`;
    const dayDone = { ...done, [k]: !done[k] };
    if (!dayDone[k]) delete dayDone[k];
    persist({ ...data, progress: { ...(data.progress || {}), [dayNumber]: dayDone } }, dayNumber);
  };

  const resetDay = () => {
    const progress = { ...(data.progress || {}) };
    delete progress[dayNumber];
    persist({ ...data, progress }, dayNumber);
  };

  const saveWorkout = (draft) => {
    setBuilding(false);
    persist({ ...data, custom: { ...(data.custom || {}), [dayNumber]: draft } }, dayNumber);
  };

  const clearCustom = () => {
    const custom = { ...(data.custom || {}) };
    delete custom[dayNumber];
    persist({ ...data, custom }, dayNumber);
  };

  const isCustom = Boolean(data.custom?.[dayNumber]);

  // Every day, summarised for the 30-day map.
  const dayStats = PLAN.map((planDay) => {
    const n = planDay.day;
    const w = data.custom?.[n] || planDay;
    const t = countExercises(w);
    const d = countDone(w, data.progress?.[n]);
    const status = t === 0 ? "empty" : d >= t ? "complete" : d > 0 ? "started" : "ready";
    return { day: n, total: t, done: d, status };
  });

  // Consecutive finished days ending at today (or at yesterday, if today is
  // still in progress).
  const isDone = (n) => dayStats[n - 1]?.status === "complete";
  let streak = 0;
  for (let n = isDone(dayNumber) ? dayNumber : dayNumber - 1; n >= 1 && isDone(n); n--) streak++;

  const blankDay = { day: dayNumber, title: `Day ${dayNumber}`, focus: "", blocks: [] };

  // Hold the first paint until we know whether someone is signed in, so the
  // sign-in screen doesn't flash for people who already are.
  if (!authReady) return <div className="app" />;

  // No point asking people to sign in while Google isn't switched on.
  if (!session && !skipped && googleOn !== false) {
    return (
      <div className="app">
        <SignInScreen
          googleOn={googleOn}
          busy={signingIn}
          error={authError}
          onGoogle={handleSignIn}
          onSkip={handleSkip}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Confetti active={celebrate} />

      <header className="header">
        <div className="header-top">
          <div className="day-nav">
            <button
              className="day-arrow"
              onClick={() => setDayNumber((d) => d - 1)}
              disabled={dayNumber <= 1}
              aria-label="Previous day"
            >‹</button>
            <button className="day-label" onClick={() => setShowGrid(true)}>
              DAY {dayNumber} <span className="of">/ {TOTAL_DAYS}</span>
              <span className="day-caret">▾</span>
            </button>
            <button
              className="day-arrow"
              onClick={() => setDayNumber((d) => d + 1)}
              disabled={dayNumber >= TOTAL_DAYS}
              aria-label="Next day"
            >›</button>
          </div>
          <button className="build-btn" onClick={() => setBuilding(true)}>
            {total === 0 ? "BUILD" : "EDIT"}
          </button>
        </div>

        <h1 className="workout-title">{workout ? workout.title : "Rest day"}</h1>
        {workout?.focus && <p className="workout-focus">{workout.focus}</p>}

        {total > 0 && (
          <div className="progress-row">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
            </div>
            <span className="progress-count">{doneCount}/{total}</span>
          </div>
        )}
        {streak > 1 && <p className="streak-line">🔥 {streak} days in a row</p>}
        <AccountBar
          session={session}
          sync={sync}
          googleOn={googleOn}
          busy={signingIn}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
      </header>

      {total === 0 && (
        <p className="empty">
          Day {dayNumber} isn't programmed yet.<br />
          Hit <strong>BUILD</strong> to pick exercises from the database.
        </p>
      )}

      {workout &&
        workout.blocks.map((block, bi) => (
          <section className="block" key={bi}>
            <div className="block-head">
              <span className="block-rounds">
                {blockHeading(block)}
              </span>
              {block.rest > 0 && (
                <button className="rest-btn" onClick={() => setRest({ seconds: block.rest, id: Date.now() })}>
                  ⏱ START REST
                </button>
              )}
            </div>

            {block.exercises.map((ex, ei) => {
              const isDone = Boolean(done[`${bi}:${ei}`]);
              return (
                <div className={`ex-row ${isDone ? "done" : ""}`} key={ei}>
                  <button
                    className={`check ${isDone ? "on" : ""}`}
                    onClick={() => toggle(bi, ei)}
                    aria-label={`Mark ${ex.name} done`}
                  >
                    {isDone ? "✓" : ""}
                  </button>
                  <button className="ex-main" onClick={() => setSheetItem(ex)}>
                    <div className="ex-name">
                      {ex.name}
                      {ex.id && <span className="ex-info">▸ how-to</span>}
                    </div>
                    {ex.note && <div className="ex-note">{ex.note}</div>}
                  </button>
                  {ex.reps && <span className="ex-reps">{ex.reps}</span>}
                </div>
              );
            })}

            {block.exercises.length === 0 && (
              <p className="block-empty">No exercises yet</p>
            )}
          </section>
        ))}

      {total > 0 && (
        <div className="footer">
          {complete && (
            <div className="finish-banner">
              <h2>DAY {dayNumber} DONE 🎉</h2>
              <p>Every box ticked. Go eat something.</p>
            </div>
          )}
          <button className="ghost-btn" onClick={resetDay}>Reset today's checkmarks</button>
          {isCustom && (
            <button className="ghost-btn" onClick={clearCustom}>
              Revert this day to plan.js
            </button>
          )}
        </div>
      )}

      {showGrid && (
        <ProgressGrid
          days={dayStats}
          current={dayNumber}
          streak={streak}
          onPick={(n) => { setDayNumber(n); setShowGrid(false); }}
          onClose={() => setShowGrid(false)}
        />
      )}
      {rest && <RestTimer key={rest.id} seconds={rest.seconds} onDone={() => setRest(null)} />}
      {sheetItem && <ExerciseSheet item={sheetItem} onClose={() => setSheetItem(null)} />}
      {building && (
        <Builder
          workout={workout || blankDay}
          onSave={saveWorkout}
          onCancel={() => setBuilding(false)}
        />
      )}
    </div>
  );
}
