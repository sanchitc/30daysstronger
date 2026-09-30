import { useId, useState } from "react";
import { PROGRAMS, TOTAL_DAYS, getProgram, newMoves, rankFor } from "./programs.js";
import { countExercises } from "./plan.js";
import ExerciseSheet from "./ExerciseSheet.jsx";

// ─── Shared bits ─────────────────────────────────────────────────────────────

export function themeVars(program) {
  if (!program) return undefined;
  return { "--accent": program.theme.a, "--accent-2": program.theme.b, "--on-accent": program.theme.on };
}

function Glyph({ kind }) {
  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M40 8C22 8 10 18 10 32c0 3 .6 5.6 1.6 8 3-9 9-16 18-20-7 5-12 12-14 21 2 .6 4 1 6 1 12 0 19-12 18-34z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "shoe") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M5 33c0-6 2-12 5-17 1-2 3-2 4-1l3 4c1 1 3 1 4 0l3-3c1-1 2-1 3 0 4 5 10 8 16 9 2 .5 3 2 3 4v4H5z" fill="currentColor" />
        <rect x="4" y="35" width="41" height="5" rx="2.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="17" width="6" height="14" rx="2" fill="currentColor" />
      <rect x="10" y="12" width="7" height="24" rx="2.5" fill="currentColor" />
      <rect x="17" y="21.5" width="14" height="5" rx="1.5" fill="currentColor" />
      <rect x="31" y="12" width="7" height="24" rx="2.5" fill="currentColor" />
      <rect x="38" y="17" width="6" height="14" rx="2" fill="currentColor" />
    </svg>
  );
}

// The coloured panel that stands for a program. `vt` gives it a view-transition
// name so it glides from the card into the preview and on into the workout.
export function ProgramArt({ program, size = "card", vt = false, children }) {
  return (
    <div
      className={`art art-${size}`}
      style={{
        background: `linear-gradient(135deg, ${program.theme.a}, ${program.theme.b})`,
        color: program.theme.on,
        viewTransitionName: vt ? `art-${program.id}` : undefined,
      }}
    >
      <span className="art-30">30</span>
      <span className="art-glyph"><Glyph kind={program.glyph} /></span>
      {children}
    </div>
  );
}

export function Badge({ program, number, size = 56, muted = false }) {
  const gid = useId().replace(/:/g, "");
  const a = program?.theme.a || "#3a3a48";
  const b = program?.theme.b || "#262633";
  return (
    <svg
      className={`badge ${muted ? "muted" : ""}`}
      width={size}
      height={size * 1.2}
      viewBox="0 0 64 77"
      role="img"
      aria-label={program ? `${program.name} badge${number ? ` number ${number}` : ""}` : "Badge not yet earned"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path d="M18 46 L10 75 L22 69 L28 77 L32 52Z" fill={b} opacity="0.85" />
      <path d="M46 46 L54 75 L42 69 L36 77 L32 52Z" fill={a} opacity="0.85" />
      <circle cx="32" cy="30" r="27" fill={`url(#${gid})`} />
      <circle cx="32" cy="30" r="21.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="2 3" />
      <text x="32" y="38" textAnchor="middle" className="badge-30" fill={program?.theme.on || "#7a7a90"}>30</text>
    </svg>
  );
}

// ─── Home ────────────────────────────────────────────────────────────────────

function TrophyShelf({ completions }) {
  const count = completions.length;
  const rank = rankFor(count);
  return (
    <section className="shelf">
      <div className="shelf-head">
        <div>
          <div className="shelf-n">{count}</div>
          <div className="shelf-l">
            challenge{count === 1 ? "" : "s"} completed{rank ? <> · <strong>{rank}</strong></> : null}
          </div>
        </div>
      </div>
      {count === 0 ? (
        <div className="shelf-empty">
          <Badge muted size={40} />
          <p>Finish every day of a challenge to earn your first badge.</p>
        </div>
      ) : (
        <div className="shelf-row">
          {completions.map((c, i) => {
            const p = getProgram(c.program);
            return (
              <div className="shelf-item" key={`${c.program}|${c.startDate}`}>
                <Badge program={p} number={i + 1} size={48} />
                <span className="shelf-name">{p?.short || c.program}</span>
                <span className="shelf-date">{formatDate(c.finishedAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

function ProgramCard({ program, onOpen }) {
  return (
    <button className="p-card" onClick={() => onOpen(program.id)} style={themeVars(program)}>
      <ProgramArt program={program} vt />
      <div className="p-card-body">
        <div className="p-card-title">{program.name}</div>
        <div className="p-card-tag">{program.tagline}</div>
        <div className="chips">
          <span className="chip">{program.level}</span>
          <span className="chip">{program.minutes}</span>
          <span className="chip">{program.equipment}</span>
        </div>
        <span className="p-card-cta">Preview the 30 days →</span>
      </div>
    </button>
  );
}

export function HomeScreen({ active, dayNumber, daysDone, completions, onOpen, onContinue, footer }) {
  const done = daysDone >= TOTAL_DAYS;
  const others = PROGRAMS.filter((p) => p.id !== active?.id);
  return (
    <div className="home">
      <header className="home-head">
        <p className="kicker">30 DAYS</p>
        <h1 className="home-title">{active ? "Your challenges" : "Pick your 30 days"}</h1>
        {!active && (
          <p className="home-sub">
            One challenge at a time. Preview any of them day by day, then start the one that fits you.
          </p>
        )}
      </header>

      {active && (
        <section className="active-card" style={themeVars(active)}>
          <button className="active-main" onClick={onContinue}>
            <ProgramArt program={active} size="wide" vt>
              <span className="art-status">{done ? "COMPLETE ✓" : "IN PROGRESS"}</span>
            </ProgramArt>
            <div className="active-body">
              <div className="active-title">{active.name}</div>
              <div className="active-day">
                Day {dayNumber} <span>of {TOTAL_DAYS}</span>
              </div>
              <div className="progress-row">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(daysDone / TOTAL_DAYS) * 100}%` }} />
                </div>
                <span className="progress-count">{daysDone}/{TOTAL_DAYS} days</span>
              </div>
              <span className="btn primary btn-block">
                {done ? "Look back at your 30 days →" : `Continue Day ${dayNumber} →`}
              </span>
            </div>
          </button>
          <button className="active-link" onClick={() => onOpen(active.id)}>View the full plan</button>
        </section>
      )}

      <TrophyShelf completions={completions} />

      <h2 className="section-h">{active ? "Other challenges" : "Challenges"}</h2>
      <div className="p-list">
        {others.map((p) => <ProgramCard key={p.id} program={p} onOpen={onOpen} />)}
      </div>

      {footer}
    </div>
  );
}

// ─── Preview ─────────────────────────────────────────────────────────────────

function blockHeading(block) {
  const rounds =
    block.rounds > 1 ? `${block.rounds} ROUNDS${block.rest ? ` · ${block.rest} SEC REST` : ""}` : "";
  if (block.label) return rounds ? `${block.label} · ${rounds}` : block.label;
  return rounds || "WARM UP";
}

// Read-only look at one day of any program.
export function DayPreviewSheet({ program, day, onClose }) {
  const [sheetItem, setSheetItem] = useState(null);
  const fresh = newMoves(program)[day.day] || new Set();
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={themeVars(program)}>
        <div className="sheet-head">
          <div>
            <div className="kicker small">DAY {day.day} · {program.short.toUpperCase()}</div>
            <div className="sheet-title">{day.title}</div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sheet-body">
          {day.focus && <p className="dp-focus">{day.focus}</p>}
          {day.blocks.map((b, bi) => (
            <div className="dp-block" key={bi}>
              <div className="block-rounds">{blockHeading(b)}</div>
              {b.exercises.map((ex, ei) => (
                <button className="dp-row" key={ei} onClick={() => setSheetItem(ex)}>
                  <span className="dp-name">
                    {ex.name}
                    {fresh.has(`${bi}:${ei}`) && <span className="new-pill">NEW</span>}
                  </span>
                  <span className="dp-reps">{ex.reps}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {sheetItem && (
        <div onClick={(e) => e.stopPropagation()}>
          <ExerciseSheet item={sheetItem} onClose={() => setSheetItem(null)} />
        </div>
      )}
    </div>
  );
}

export function ProgramPreview({
  program, activeId, dayNumber, dayStats, completedCount, onBack, onStart, onContinue, onEnd,
}) {
  const [openDay, setOpenDay] = useState(null);
  const isActive = activeId === program.id;
  const hasOther = Boolean(activeId) && !isActive;
  const daysDone = isActive ? dayStats.filter((d) => d.status === "complete").length : 0;
  const finished = isActive && daysDone >= TOTAL_DAYS;
  const statusFor = (n) => (isActive ? dayStats[n - 1]?.status : null);

  return (
    <div className={`preview ${program.largeType ? "large-type" : ""}`} style={themeVars(program)}>
      <div className="preview-top">
        <button className="back-btn" onClick={onBack}>‹ Challenges</button>
        {completedCount > 0 && (
          <span className="preview-earned">
            <Badge program={program} size={20} /> ×{completedCount}
          </span>
        )}
      </div>

      <ProgramArt program={program} size="hero" vt />

      <div className="preview-body">
        <p className="kicker">{isActive ? `ACTIVE · DAY ${dayNumber} OF ${TOTAL_DAYS}` : "PREVIEW"}</p>
        <h1 className="preview-title">{program.name}</h1>
        <p className="preview-tag">{program.tagline}</p>

        <div className="facts">
          <div className="fact"><span className="fact-n">30</span><span className="fact-l">days</span></div>
          <div className="fact"><span className="fact-n">{program.minutes.replace(" min", "")}</span><span className="fact-l">min a day</span></div>
          <div className="fact"><span className="fact-n small">{program.level}</span><span className="fact-l">level</span></div>
        </div>

        <p className="preview-desc">{program.description}</p>
        <p className="preview-aud"><strong>Equipment:</strong> {program.equipment}. {program.audience}</p>

        <h2 className="section-h">The month</h2>
        <div className="weeks">
          {program.weeks.map((w) => (
            <div className="week" key={w.title}>
              <div className="week-t">{w.title}</div>
              <div className="week-x">{w.text}</div>
            </div>
          ))}
        </div>

        <h2 className="section-h">All 30 days <span className="section-note">tap a day to look inside</span></h2>
        <div className="day-list">
          {program.days.map((d) => {
            const st = statusFor(d.day);
            return (
              <button
                key={d.day}
                className={`day-row ${st ? `is-${st}` : ""} ${isActive && d.day === dayNumber ? "is-today" : ""}`}
                onClick={() => setOpenDay(d)}
              >
                <span className="day-n">{d.day}</span>
                <span className="day-t">
                  {d.title}
                  <span className="day-sub">{countExercises(d)} moves</span>
                </span>
                <span className="day-st">
                  {st === "complete" ? "✓" : isActive && d.day === dayNumber ? "TODAY" : "›"}
                </span>
              </button>
            );
          })}
        </div>

        {isActive && (
          <button className="danger-link" onClick={onEnd}>End this challenge</button>
        )}
      </div>

      <div className="cta-bar">
        {isActive && !finished && (
          <button className="btn primary" onClick={onContinue}>Continue Day {dayNumber} →</button>
        )}
        {isActive && finished && (
          <button className="btn primary" onClick={() => onStart(program.id)}>Start again from Day 1</button>
        )}
        {!isActive && (
          <button className="btn primary" onClick={() => onStart(program.id)}>
            {hasOther ? "Switch to this challenge" : "Start Day 1 today"}
          </button>
        )}
      </div>

      {openDay && <DayPreviewSheet program={program} day={openDay} onClose={() => setOpenDay(null)} />}
    </div>
  );
}

// ─── Dialogs ─────────────────────────────────────────────────────────────────

export function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon">{danger ? "!" : "↻"}</div>
        <h2 className="dialog-title">{title}</h2>
        <div className="dialog-text">{children}</div>
        <div className="dialog-actions">
          <button className={`btn ${danger ? "danger" : "primary"}`} onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn" onClick={onCancel} autoFocus>Keep going</button>
        </div>
      </div>
    </div>
  );
}

export function ChallengeComplete({ program, number, onNext, onClose }) {
  const rank = rankFor(number);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog complete" style={themeVars(program)} onClick={(e) => e.stopPropagation()}>
        <div className="complete-badge"><Badge program={program} number={number} size={120} /></div>
        <p className="kicker">CHALLENGE COMPLETE</p>
        <h2 className="dialog-title big">All 30 days of {program.name}</h2>
        <p className="dialog-text">
          Badge #{number} is on your shelf{rank ? <> — you're now <strong>{rank}</strong></> : null}.
          Take a bow, then pick what's next.
        </p>
        <div className="dialog-actions">
          <button className="btn primary" onClick={onNext}>Choose your next challenge</button>
          <button className="btn" onClick={onClose}>Stay here</button>
        </div>
      </div>
    </div>
  );
}
