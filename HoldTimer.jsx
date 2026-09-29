import { useEffect, useRef, useState } from "react";
import { formatClock, tick, go, finish, beep } from "./timer.js";

// ─── Hold timer ──────────────────────────────────────────────────────────────
//
// Full-screen countdown for timed moves: planks, stretches, balance holds,
// foam rolling, strides. Big enough to read from the floor. Counts you in,
// switches sides for "(Each Leg)", beeps the last three seconds of every phase,
// and ticks the move off when it's done (single-round blocks only; in a
// multi-round block one hold is one round, not the whole box).
//
// Timing runs off timestamps rather than counting intervals, so a locked
// phone or a background tab doesn't make it drift.

const R = 104;
const C = 2 * Math.PI * R;

export default function HoldTimer({ exercise, plan, autoTick, onComplete, onClose }) {
  const { phases } = plan;
  const [index, setIndex] = useState(0);
  const [endAt, setEndAt] = useState(() => Date.now() + phases[0].secs * 1000);
  const [pausedLeft, setPausedLeft] = useState(null);
  const [now, setNow] = useState(Date.now);
  const [done, setDone] = useState(false);
  const lastPip = useRef(null);

  const phase = phases[index];
  const paused = pausedLeft !== null;
  const leftMs = done ? 0 : paused ? pausedLeft : Math.max(0, endAt - now);
  const left = leftMs / 1000;
  const progress = done ? 1 : 1 - leftMs / (phase.secs * 1000);

  // Keep the screen on while the timer is up.
  useEffect(() => {
    let lock = null;
    const grab = async () => {
      try { lock = await navigator.wakeLock?.request("screen"); } catch {}
    };
    const onVisible = () => { if (document.visibilityState === "visible") grab(); };
    grab();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      try { lock?.release(); } catch {}
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") { e.preventDefault(); togglePause(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (done || paused) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [done, paused]);

  // Advance through phases (more than one if the phone slept through them).
  useEffect(() => {
    if (done || paused) return;
    const msLeft = endAt - now;
    const whole = Math.ceil(msLeft / 1000);
    if (msLeft > 0) {
      if (whole <= 3 && lastPip.current !== `${index}:${whole}`) {
        lastPip.current = `${index}:${whole}`;
        tick();
      }
      return;
    }
    let i = index;
    let end = endAt;
    while (end <= now && i < phases.length - 1) {
      i += 1;
      end += phases[i].secs * 1000;
    }
    if (end <= now) {
      setDone(true);
      finish();
      if (autoTick) onComplete();
      return;
    }
    setIndex(i);
    setEndAt(end);
    phases[i].kind === "work" ? go() : beep(520, 200);
  }, [now, done, paused]);

  // Close a moment after finishing, so the tick lands where you can see it.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [done]);

  function togglePause() {
    if (done) return;
    if (paused) {
      setEndAt(Date.now() + pausedLeft);
      setNow(Date.now());
      setPausedLeft(null);
    } else {
      setPausedLeft(Math.max(0, endAt - Date.now()));
    }
  }

  const skip = () => {
    if (done) return;
    const t = Date.now();
    setPausedLeft(null);
    setEndAt(t);
    setNow(t);
  };

  const heading = done
    ? autoTick ? "Done" : "Round done"
    : phase.kind === "work" ? phase.label || "Hold" : phase.label;

  const works = phases.map((p, i) => ({ ...p, i })).filter((p) => p.kind === "work");

  return (
    <div className={`hold hold-${done ? "done" : phase.kind}`} role="dialog" aria-label={`${exercise.name} timer`}>
      <div className="hold-top">
        <div className="hold-kicker">{exercise.reps}</div>
        <button className="hold-x" onClick={onClose} aria-label="Close timer">×</button>
      </div>

      <h2 className="hold-name">{exercise.name}</h2>
      {exercise.note && <p className="hold-note">{exercise.note}</p>}

      <div className="hold-ring-wrap">
        <svg className="hold-ring" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <linearGradient id="hold-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
              <stop offset="100%" style={{ stopColor: "var(--accent-2)" }} />
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r={R} className="hold-track" />
          <circle
            cx="120" cy="120" r={R}
            className="hold-arc"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - Math.min(1, Math.max(0, progress)))}
            transform="rotate(-90 120 120)"
          />
        </svg>
        <div className="hold-center">
          <div className="hold-phase">{heading}</div>
          <div className="hold-time" aria-live="off">
            {done ? "✓" : formatClock(left)}
          </div>
          {paused && <div className="hold-paused">Paused</div>}
        </div>
      </div>

      {works.length > 1 && (
        <div className="hold-steps" aria-hidden="true">
          {works.map((w) => (
            <span
              key={w.i}
              className={`hold-step${done || w.i < index ? " is-done" : w.i === index ? " is-now" : ""}`}
            />
          ))}
        </div>
      )}

      <div className="hold-actions">
        {done ? (
          <button className="hold-main" onClick={onClose}>{autoTick ? "Ticked off ✓" : "Close"}</button>
        ) : (
          <>
            <button className="hold-ghost" onClick={skip}>
              {phase.kind === "work" ? "Skip" : "Start now"}
            </button>
            <button className="hold-main" onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
          </>
        )}
      </div>
    </div>
  );
}
