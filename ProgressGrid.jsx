// ─── 30-day map ──────────────────────────────────────────────────────────────
//
// The whole challenge at a glance: what's done, what's half-finished, and which
// days still need programming. Tap any day to jump to it.

export default function ProgressGrid({ days, current, streak, onPick, onClose }) {
  const complete = days.filter((d) => d.status === "complete").length;
  const programmed = days.filter((d) => d.total > 0).length;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="sheet-title">Your 30 days</div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="sheet-body">
          <div className="stats">
            <div className="stat">
              <div className="stat-n">{streak}</div>
              <div className="stat-l">day streak{streak > 0 ? " 🔥" : ""}</div>
            </div>
            <div className="stat">
              <div className="stat-n">{complete}<span className="stat-of">/30</span></div>
              <div className="stat-l">completed</div>
            </div>
            <div className="stat">
              <div className="stat-n">{programmed}<span className="stat-of">/30</span></div>
              <div className="stat-l">programmed</div>
            </div>
          </div>

          <div className="grid">
            {days.map((d) => (
              <button
                key={d.day}
                className={`cell is-${d.status} ${d.day === current ? "current" : ""}`}
                onClick={() => onPick(d.day)}
                aria-label={`Day ${d.day}, ${d.status}`}
              >
                <span className="cell-n">{d.day}</span>
                {d.status === "complete" && <span className="cell-tick">✓</span>}
                {d.status === "started" && <span className="cell-sub">{d.done}/{d.total}</span>}
              </button>
            ))}
          </div>

          <div className="legend">
            <span><i className="sw is-complete" /> done</span>
            <span><i className="sw is-started" /> in progress</span>
            <span><i className="sw is-ready" /> ready to train</span>
            <span><i className="sw is-empty" /> needs exercises</span>
          </div>
        </div>
      </div>
    </div>
  );
}
