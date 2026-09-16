import { useEffect, useRef, useState } from "react";
import { PLAN, getDay, countExercises } from "./plan.js";
import { Confetti, playApplause } from "./Celebrate.jsx";
import ExerciseSheet from "./ExerciseSheet.jsx";
import Builder from "./Builder.jsx";

// ─── Storage ─────────────────────────────────────────────────────────────────

const KEY = "training_tracker_v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Day 1 is the day you first opened the app; it never runs past the plan.
function dayFromStart(startDate) {
  const diff = Math.floor((new Date(todayKey()) - new Date(startDate)) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), PLAN.length || 1);
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

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(load);
  const [dayNumber, setDayNumber] = useState(() => {
    const d = load();
    return dayFromStart(d.startDate || todayKey());
  });
  const [sheetItem, setSheetItem] = useState(null);
  const [building, setBuilding] = useState(false);
  const [rest, setRest] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const wasComplete = useRef(false);

  // Remember when the plan started so the day number can advance on its own.
  useEffect(() => {
    if (!data.startDate) {
      const next = { ...data, startDate: todayKey() };
      setData(next);
      save(next);
    }
  }, [data]);

  const workout = data.custom?.[dayNumber] || getDay(dayNumber);
  const done = data.progress?.[dayNumber] || {};
  const total = countExercises(workout);
  // Count only boxes that exist in the workout as it stands now — editing a day
  // shouldn't leave it looking finished.
  const doneCount = workout
    ? workout.blocks.reduce(
        (n, b, bi) => n + b.exercises.filter((_, ei) => done[`${bi}:${ei}`]).length,
        0
      )
    : 0;
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

  const persist = (next) => { setData(next); save(next); };

  const toggle = (bi, ei) => {
    const k = `${bi}:${ei}`;
    const dayDone = { ...done, [k]: !done[k] };
    if (!dayDone[k]) delete dayDone[k];
    persist({ ...data, progress: { ...(data.progress || {}), [dayNumber]: dayDone } });
  };

  const resetDay = () => {
    const progress = { ...(data.progress || {}) };
    delete progress[dayNumber];
    persist({ ...data, progress });
  };

  const saveWorkout = (draft) => {
    setBuilding(false);
    persist({ ...data, custom: { ...(data.custom || {}), [dayNumber]: draft } });
  };

  const clearCustom = () => {
    const custom = { ...(data.custom || {}) };
    delete custom[dayNumber];
    persist({ ...data, custom });
  };

  const maxDay = Math.max(PLAN.length, ...Object.keys(data.custom || {}).map(Number), 1);
  const isCustom = Boolean(data.custom?.[dayNumber]);

  const blankDay = { day: dayNumber, title: `Day ${dayNumber}`, focus: "", blocks: [] };

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
            >‹</button>
            <span className="day-label">
              DAY {dayNumber} <span className="of">/ {maxDay}</span>
            </span>
            <button
              className="day-arrow"
              onClick={() => setDayNumber((d) => d + 1)}
              disabled={dayNumber >= maxDay}
            >›</button>
          </div>
          <button className="build-btn" onClick={() => setBuilding(true)}>
            {workout ? "EDIT" : "BUILD"}
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
      </header>

      {!workout || workout.blocks.length === 0 ? (
        <p className="empty">
          Nothing planned for day {dayNumber} yet.<br />
          Hit <strong>Build</strong> to pick exercises from the database, or add the day to{" "}
          <code>plan.js</code>.
        </p>
      ) : (
        workout.blocks.map((block, bi) => (
          <section className="block" key={bi}>
            <div className="block-head">
              <span className="block-rounds">
                {block.rounds > 1
                  ? `${block.rounds} ROUNDS${block.rest ? ` · ${block.rest} SEC REST` : ""}`
                  : "WARM UP"}
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
          </section>
        ))
      )}

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
