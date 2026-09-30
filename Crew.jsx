import { useState } from "react";
import {
  PROGRAMS, TOTAL_DAYS, getProgram, todayKey, daysUntil, dayFromStart, summarize, streakAt,
} from "./programs.js";
import { ProgramArt, themeVars } from "./Catalog.jsx";

// ─── Crew ────────────────────────────────────────────────────────────────────
//
// Accountability partners and 30 days together. Everything here is display:
// the data comes from social.js via App, and every action is a callback.

// ── Helpers ─────────────────────────────────────────────────────────────────

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatDay(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

const firstName = (name) => String(name || "Someone").split(" ")[0];

// Where someone is in their challenge, worked out the same way as your own.
export function standing(person) {
  const ch = person?.challenge;
  const program = getProgram(ch?.program);
  if (!program || !ch.startDate) return { program: null };
  const startsIn = daysUntil(ch.startDate);
  const stats = summarize(program, person.progress, person.custom);
  const day = dayFromStart(ch.startDate);
  const daysDone = stats.filter((d) => d.status === "complete").length;
  const st = stats[day - 1]?.status;
  const today = startsIn > 0 ? "upcoming" : daysDone >= TOTAL_DAYS ? "finished" : st === "complete" ? "done" : st === "started" ? "started" : "not";
  return { program, stats, day, daysDone, startsIn, streak: streakAt(stats, day), today };
}

const TODAY_LABEL = {
  done: "Trained today ✓",
  started: "Training now",
  not: "Not yet today",
  finished: "Finished all 30 🏅",
};

// ── Small pieces ────────────────────────────────────────────────────────────

export function Avatar({ person, size = 36 }) {
  const name = person?.name || "?";
  const hue = [...String(person?.id || name)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return person?.avatar ? (
    <img className="avatar" src={person.avatar} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  ) : (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 45% 32%)` }}
      aria-hidden="true"
    >
      {name.trim()[0]?.toUpperCase() || "?"}
    </span>
  );
}

function AvatarStack({ people, size = 26 }) {
  return (
    <span className="avatar-stack">
      {people.slice(0, 4).map((p) => <Avatar key={p.id} person={p} size={size} />)}
    </span>
  );
}

// The 30 days as a thin strip, in the person's program colours.
function Strip({ s }) {
  return (
    <div className="strip" style={themeVars(s.program)} aria-label={`${s.daysDone} of 30 days done`}>
      {s.stats.map((d) => (
        <i key={d.day} className={`strip-cell is-${d.status}${d.day === s.day && s.startsIn <= 0 ? " is-today" : ""}`} />
      ))}
    </div>
  );
}

function CheerButtons({ person, s, sent, onCheer }) {
  const cheered = sent.has(`${person.id}|cheer`);
  const nudged = sent.has(`${person.id}|nudge`);
  const canNudge = s?.program && (s.today === "not" || s.today === "started");
  return (
    <div className="cheer-row">
      <button className={`cheer-btn${cheered ? " sent" : ""}`} disabled={cheered} onClick={() => onCheer(person, "cheer")}>
        {cheered ? "Cheered ✓" : "👏 Cheer"}
      </button>
      {canNudge && (
        <button className={`cheer-btn${nudged ? " sent" : ""}`} disabled={nudged} onClick={() => onCheer(person, "nudge")}>
          {nudged ? "Nudged ✓" : "⏰ Nudge"}
        </button>
      )}
    </div>
  );
}

// One person's progress: name, where they are, today, the strip.
function PersonRow({ person, you, program, leftAt, sent, onCheer, onRemove }) {
  const s = standing(person);
  const visible = you || person.sharing;
  const shownProgram = s.program || getProgram(program);
  return (
    <div className="person">
      <div className="person-top">
        <Avatar person={person} size={40} />
        <div className="person-main">
          <div className="person-name">
            {you ? "You" : person.name}
            {shownProgram && (
              <span className="person-prog" style={themeVars(shownProgram)}>
                <ProgramArt program={shownProgram} size="dot" />
                {shownProgram.short}
              </span>
            )}
          </div>
          <div className="person-sub">
            {leftAt ? "Left the pact"
              : !visible ? "Keeps their progress private"
              : !s.program ? "No challenge right now"
              : s.today === "upcoming" ? `Starts ${formatDay(person.challenge.startDate)}`
              : <>
                  Day {s.day} · {s.daysDone}/30 done{s.streak > 1 ? <> · 🔥 {s.streak}</> : null}
                </>}
          </div>
        </div>
        {visible && s.program && !leftAt && s.today !== "upcoming" && (
          <span className={`today-pill is-${s.today}`}>{TODAY_LABEL[s.today]}</span>
        )}
      </div>
      {visible && s.program && !leftAt && <Strip s={s} />}
      {!you && !leftAt && (
        <div className="person-actions">
          <CheerButtons person={person} s={visible ? s : null} sent={sent} onCheer={onCheer} />
          {onRemove && <button className="person-remove" onClick={() => onRemove(person)}>Remove</button>}
        </div>
      )}
    </div>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button className={`switch${on ? " on" : ""}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

// ── Banners used outside the crew screen ────────────────────────────────────

export function CheerBanner({ cheers, people, onOpen, onDismiss }) {
  if (!cheers.length) return null;
  const first = cheers[0];
  const who = firstName(people[first.from]?.name);
  const others = new Set(cheers.map((c) => c.from)).size - 1;
  const text = first.kind === "nudge"
    ? <><strong>{who}</strong> nudged you: today's workout is waiting ⏰</>
    : <><strong>{who}</strong> is cheering you on 👏</>;
  return (
    <div className="cheer-banner" role="status">
      <button className="cheer-banner-main" onClick={onOpen}>
        <AvatarStack people={[...new Set(cheers.map((c) => c.from))].map((id) => people[id] || { id, name: "?" })} size={24} />
        <span>
          {text}
          {others > 0 && <span className="cheer-more"> +{others} more</span>}
        </span>
      </button>
      <button className="cheer-banner-x" onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

// "Pact · 2 of 3 trained today" under the workout header.
export function CrewPeek({ crew, me, onOpen }) {
  if (!crew) return null;
  const pact = crew.pact;
  let members;
  if (pact) {
    members = pact.members.filter((m) => !m.leftAt).map((m) => (m.id === me.id ? me : crew.people[m.id])).filter(Boolean);
  } else {
    members = crew.friends.map((id) => crew.people[id]).filter((p) => p?.sharing);
    if (!members.length) return null;
  }
  const trained = members.filter((p) => ["done", "finished"].includes(standing(p).today)).length;
  const upcoming = pact && daysUntil(pact.startDate) > 0;
  return (
    <button className="crew-peek" onClick={onOpen}>
      <AvatarStack people={members} size={22} />
      <span>
        {pact ? <strong>Pact</strong> : <strong>Crew</strong>}
        {" · "}
        {upcoming ? `Day 1 is ${formatDay(pact.startDate)}` : `${trained} of ${members.length} trained today`}
      </span>
      <span className="crew-peek-go">›</span>
    </button>
  );
}

// ── Accept an invite link ───────────────────────────────────────────────────

export function AcceptInviteDialog({ preview, error, busy, onAccept, onClose }) {
  const [share, setShare] = useState(true);
  const inviter = preview ? { id: preview.user_id, name: preview.name, avatar: preview.avatar } : null;
  const pactProgram = getProgram(preview?.pact?.program);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog invite-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {!preview && !error && <p className="dialog-text">Opening the invite…</p>}
        {error && (
          <>
            <h2 className="dialog-title">That invite didn't work</h2>
            <p className="dialog-text">{error}</p>
            <div className="dialog-actions"><button className="btn" onClick={onClose}>OK</button></div>
          </>
        )}
        {preview && !error && (
          <>
            <div className="invite-avatar"><Avatar person={inviter} size={72} /></div>
            <p className="kicker">CREW INVITE</p>
            <h2 className="dialog-title">{preview.name} wants you as an accountability partner</h2>
            {pactProgram && (
              <p className="dialog-text">
                {firstName(preview.name)} is doing <strong>{pactProgram.name}</strong> with Day 1 on{" "}
                <strong>{formatDay(preview.pact.start_date)}</strong>. Accept and you can join them, with the same
                challenge or a different one.
              </p>
            )}
            <label className="check-line">
              <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
              <span>Share my progress with my crew</span>
            </label>
            <div className="dialog-actions">
              <button className="btn primary" disabled={busy} onClick={() => onAccept(share)}>
                {busy ? "Joining…" : "Accept"}
              </button>
              <button className="btn" onClick={onClose}>Not now</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pick a challenge (used by both start and join) ──────────────────────────

function ProgramChoice({ value, onChange, tags = {} }) {
  return (
    <div className="choice-list">
      {PROGRAMS.map((p) => (
        <button
          key={p.id}
          className={`choice${value === p.id ? " on" : ""}`}
          style={themeVars(p)}
          onClick={() => onChange(p.id)}
          aria-pressed={value === p.id}
        >
          <ProgramArt program={p} size="dot" />
          <span className="choice-main">
            <span className="choice-name">{p.name}</span>
            <span className="choice-sub">{tags[p.id] || `${p.level} · ${p.minutes}`}</span>
          </span>
          <span className="choice-tick">{value === p.id ? "✓" : ""}</span>
        </button>
      ))}
    </div>
  );
}

function nextMonday(iso) {
  const dow = new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat
  return addDays(iso, ((8 - dow) % 7) || 7);
}

export function StartPactSheet({ crew, currentProgram, busy, onStart, onClose }) {
  const today = todayKey();
  const starts = [
    { id: "today", label: "Today", date: today },
    { id: "tomorrow", label: "Tomorrow", date: addDays(today, 1) },
    { id: "monday", label: "Next Monday", date: nextMonday(today) },
  ];
  const [start, setStart] = useState("tomorrow");
  const [program, setProgram] = useState(currentProgram || PROGRAMS[0].id);
  const friends = crew.friends.map((id) => crew.people[id]).filter(Boolean);
  const [picked, setPicked] = useState(() => new Set(friends.length === 1 ? [friends[0].id] : []));
  const toggle = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const date = starts.find((s) => s.id === start).date;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" style={themeVars(getProgram(program))} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="kicker small">30 DAYS TOGETHER</div>
            <div className="sheet-title">Start a pact</div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sheet-body pact-form">
          <p className="form-note">
            Everyone starts Day 1 on the same date and picks their own challenge. The commitment is the 30 days.
          </p>

          <h3 className="form-h">Day 1</h3>
          <div className="seg">
            {starts.map((s) => (
              <button key={s.id} className={`seg-btn${start === s.id ? " on" : ""}`} onClick={() => setStart(s.id)}>
                <span>{s.label}</span>
                <small>{formatDay(s.date)}</small>
              </button>
            ))}
          </div>

          <h3 className="form-h">Your challenge</h3>
          <ProgramChoice value={program} onChange={setProgram} />

          <h3 className="form-h">Invite from your crew</h3>
          {friends.length === 0 ? (
            <p className="form-note">No crew yet. Start the pact, then send your invite link: anyone who accepts gets invited.</p>
          ) : (
            <div className="choice-list">
              {friends.map((f) => (
                <button key={f.id} className={`choice${picked.has(f.id) ? " on" : ""}`} onClick={() => toggle(f.id)} aria-pressed={picked.has(f.id)}>
                  <Avatar person={f} size={28} />
                  <span className="choice-main"><span className="choice-name">{f.name}</span></span>
                  <span className="choice-tick">{picked.has(f.id) ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          )}

          <p className="form-fine">
            Your progress is shared with the pact. Friends can join until {formatDay(addDays(date, 3))}.
          </p>
        </div>
        <div className="sheet-foot">
          <button className="btn primary btn-wide" disabled={busy} onClick={() => onStart({ startDate: date, program, friends: [...picked] })}>
            {busy ? "Starting…" : `Start · Day 1 ${start === "today" ? "today" : formatDay(date)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function JoinPactSheet({ invite, crew, me, busy, onJoin, onClose }) {
  const { pact } = invite;
  const inviter = crew.people[invite.invitedBy] || { id: invite.invitedBy, name: "A friend" };
  const members = pact.members.filter((m) => !m.leftAt);
  const tags = {};
  for (const m of members) {
    const who = m.id === me.id ? "You" : firstName(crew.people[m.id]?.name);
    tags[m.program] = tags[m.program] ? `${tags[m.program]} & ${who}` : `Same as ${who}`;
  }
  const inviterProgram = members.find((m) => m.id === invite.invitedBy)?.program;
  const [program, setProgram] = useState(inviterProgram || PROGRAMS[0].id);
  const started = daysUntil(pact.startDate) <= 0;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" style={themeVars(getProgram(program))} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="kicker small">30 DAYS TOGETHER</div>
            <div className="sheet-title">Join {firstName(inviter.name)}'s pact</div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sheet-body pact-form">
          <div className="pact-who">
            <AvatarStack people={members.map((m) => crew.people[m.id] || { id: m.id, name: "?" })} size={30} />
            <span>
              {members.length} {members.length === 1 ? "person" : "people"} · Day 1 {started ? "was" : "is"}{" "}
              <strong>{formatDay(pact.startDate)}</strong>
            </span>
          </div>
          <h3 className="form-h">Pick your challenge</h3>
          <p className="form-note">The same as them or something different. What you share is the 30 days.</p>
          <ProgramChoice value={program} onChange={setProgram} tags={tags} />
          <p className="form-fine">
            Joining starts {getProgram(program).name} with Day 1 on {formatDay(pact.startDate)} and shares your progress
            with the pact. It replaces any challenge you're doing now.
          </p>
        </div>
        <div className="sheet-foot">
          <button className="btn primary btn-wide" disabled={busy} onClick={() => onJoin(program)}>
            {busy ? "Joining…" : `Join with ${getProgram(program).short}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InviteMoreSheet({ crew, busy, onInvite, onShareLink, onClose }) {
  const inPact = new Set(crew.pact.members.filter((m) => !m.leftAt).map((m) => m.id));
  const friends = crew.friends.map((id) => crew.people[id]).filter((f) => f && !inPact.has(f.id));
  const [picked, setPicked] = useState(() => new Set());
  const toggle = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="sheet-title">Invite to your pact</div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sheet-body pact-form">
          {friends.length === 0 ? (
            <p className="form-note">Everyone in your crew is already in. Share your link to bring someone new.</p>
          ) : (
            <div className="choice-list">
              {friends.map((f) => (
                <button key={f.id} className={`choice${picked.has(f.id) ? " on" : ""}`} onClick={() => toggle(f.id)} aria-pressed={picked.has(f.id)}>
                  <Avatar person={f} size={28} />
                  <span className="choice-main"><span className="choice-name">{f.name}</span></span>
                  <span className="choice-tick">{picked.has(f.id) ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          )}
          <button className="ghost-btn" onClick={onShareLink}>Share your invite link instead</button>
        </div>
        {friends.length > 0 && (
          <div className="sheet-foot">
            <button className="btn primary btn-wide" disabled={busy || picked.size === 0} onClick={() => onInvite([...picked])}>
              {picked.size ? `Invite ${picked.size}` : "Pick who to invite"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── The crew screen ─────────────────────────────────────────────────────────

export function CrewScreen({
  crew, me, signedIn, googleOn, loading, error,
  onBack, onSignIn, onRetry, onSharing, onShareLink, onResetLink,
  onCheer, onRemove, onStartPact, onJoin, onDecline, onInviteMore, onDismissCheers,
}) {
  if (!signedIn) {
    return (
      <div className="crew">
        <div className="preview-top"><button className="back-btn" onClick={onBack}>‹ Back</button></div>
        <header className="home-head">
          <p className="kicker">YOUR CREW</p>
          <h1 className="home-title">Train with friends</h1>
          <p className="home-sub">
            Add accountability partners, see each other's progress, cheer each other on, and commit to the same
            30 days together.
          </p>
        </header>
        <div className="crew-card crew-empty">
          <p>Your crew lives in your account, so sign in first.</p>
          {googleOn !== false && <button className="btn primary btn-wide" onClick={onSignIn}>Sign in with Google</button>}
        </div>
      </div>
    );
  }

  if (!crew) {
    return (
      <div className="crew">
        <div className="preview-top"><button className="back-btn" onClick={onBack}>‹ Back</button></div>
        <header className="home-head">
          <p className="kicker">YOUR CREW</p>
          <h1 className="home-title">Crew</h1>
        </header>
        <div className="crew-card crew-empty">
          {error ? (
            <>
              <p>Couldn't load your crew. {error}</p>
              <button className="btn" onClick={onRetry}>Try again</button>
            </>
          ) : <p>Loading…</p>}
        </div>
      </div>
    );
  }

  const friends = crew.friends.map((id) => crew.people[id]).filter(Boolean);
  const pact = crew.pact;
  const inPact = new Set(pact ? pact.members.filter((m) => !m.leftAt).map((m) => m.id) : []);
  const others = friends.filter((f) => !inPact.has(f.id));
  const pactOpen = pact && daysUntil(pact.startDate) >= -3;
  const pactDay = pact ? (daysUntil(pact.startDate) > 0 ? null : dayFromStart(pact.startDate)) : null;
  const pactMembers = pact ? pact.members.map((m) => ({ ...m, person: m.id === me.id ? me : crew.people[m.id] })).filter((m) => m.person) : [];

  return (
    <div className="crew">
      <div className="preview-top">
        <button className="back-btn" onClick={onBack}>‹ Back</button>
        {loading && <span className="crew-sync">Updating…</span>}
      </div>
      <header className="home-head">
        <p className="kicker">YOUR CREW</p>
        <h1 className="home-title">Crew</h1>
      </header>

      <CheerBanner cheers={crew.cheers} people={crew.people} onOpen={onDismissCheers} onDismiss={onDismissCheers} />

      {crew.invites.map((inv) => {
        const inviter = crew.people[inv.invitedBy] || { id: inv.invitedBy, name: "A friend" };
        const prog = getProgram(inv.pact.members.find((m) => m.id === inv.invitedBy)?.program);
        return (
          <section className="crew-card pact-invite" key={inv.pact.id} style={themeVars(prog)}>
            <div className="pact-invite-top">
              <Avatar person={inviter} size={44} />
              <div>
                <div className="kicker small">PACT INVITE</div>
                <div className="pact-invite-title">{firstName(inviter.name)} wants to do 30 days with you</div>
                <div className="person-sub">
                  Day 1 {daysUntil(inv.pact.startDate) > 0 ? "is" : "was"} {formatDay(inv.pact.startDate)}
                  {prog && <> · {firstName(inviter.name)} is doing {prog.name}</>}
                </div>
              </div>
            </div>
            <div className="pact-invite-actions">
              <button className="btn primary" onClick={() => onJoin(inv)}>Pick my challenge</button>
              <button className="btn" onClick={() => onDecline(inv)}>Not now</button>
            </div>
          </section>
        );
      })}

      {pact ? (
        <section className="crew-card pact-card">
          <div className="pact-head">
            <div>
              <div className="kicker small">30 DAYS TOGETHER</div>
              <div className="pact-day">
                {pactDay ? <>Day {pactDay} <span>of {TOTAL_DAYS}</span></>
                  : daysUntil(pact.startDate) === 1 ? "Starts tomorrow"
                  : `Starts in ${daysUntil(pact.startDate)} days`}
              </div>
              {!pactDay && <div className="person-sub">Day 1 is {formatDay(pact.startDate)}</div>}
            </div>
            {pactOpen && <button className="pill-btn" onClick={onInviteMore}>+ Invite</button>}
          </div>
          <div className="people">
            {pactMembers.map((m) => (
              <PersonRow
                key={m.id}
                person={m.person}
                you={m.id === me.id}
                program={m.program}
                leftAt={m.leftAt}
                sent={crew.sent}
                onCheer={onCheer}
              />
            ))}
            {pact.waiting.map((id) => crew.people[id]).filter(Boolean).map((p) => (
              <div className="person waiting" key={p.id}>
                <div className="person-top">
                  <Avatar person={p} size={40} />
                  <div className="person-main">
                    <div className="person-name">{p.name}</div>
                    <div className="person-sub">Invited · hasn't picked a challenge yet</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="crew-card pact-cta">
          <div className="kicker small">30 DAYS TOGETHER</div>
          <div className="pact-invite-title">Pick a challenge with your crew</div>
          <p className="person-sub">
            A shared Day 1. Everyone picks their own challenge, the same or different, and you all see who shows up.
          </p>
          <button className="btn primary btn-wide" onClick={onStartPact}>Start a pact</button>
        </section>
      )}

      <h2 className="section-h">
        {pact ? "Rest of your crew" : "Accountability partners"}
        <span className="section-note">{friends.length ? `${friends.length} in your crew` : "none yet"}</span>
      </h2>
      {friends.length === 0 ? (
        <div className="crew-card crew-empty">
          <p>Send your invite link to a friend. When they accept, you'll see each other's progress here.</p>
        </div>
      ) : others.length === 0 ? (
        <div className="crew-card crew-empty">
          <p>Everyone in your crew is in your pact.</p>
        </div>
      ) : (
        <div className="crew-card people">
          {others.map((f) => (
            <PersonRow key={f.id} person={f} sent={crew.sent} onCheer={onCheer} onRemove={onRemove} />
          ))}
        </div>
      )}

      <section className="crew-card invite-card">
        <div className="invite-title">Add a friend</div>
        <p className="person-sub">Anyone who opens your link and accepts joins your crew.</p>
        <div className="invite-actions">
          <button className="btn primary" onClick={onShareLink}>Share invite link</button>
          <button className="btn" onClick={onResetLink}>New link</button>
        </div>
      </section>

      <section className="crew-card sharing-card">
        <div className="sharing-row">
          <div>
            <div className="invite-title">Share my progress</div>
            <p className="person-sub">
              {crew.me?.sharing
                ? "Your crew and pact can see your challenge, day and ticks."
                : "Off: your crew sees your name, not your progress."}
            </p>
          </div>
          <Switch on={Boolean(crew.me?.sharing)} onChange={onSharing} label="Share my progress" />
        </div>
      </section>
    </div>
  );
}

// The home screen's way in: who's in your crew, and anything waiting.
export function CrewHomeCard({ crew, me, signedIn, onOpen }) {
  const friends = crew ? crew.friends.map((id) => crew.people[id]).filter(Boolean) : [];
  const pending = crew ? crew.invites.length + crew.cheers.length : 0;
  let line;
  if (!signedIn) line = "Sign in to add accountability partners and train together.";
  else if (!crew) line = "Loading your crew…";
  else if (crew.invites.length) line = `${firstName(crew.people[crew.invites[0].invitedBy]?.name)} invited you to do 30 days together.`;
  else if (crew.pact) {
    const n = crew.pact.members.filter((m) => !m.leftAt).length;
    line = daysUntil(crew.pact.startDate) > 0
      ? `Pact of ${n} · Day 1 is ${formatDay(crew.pact.startDate)}`
      : `Pact of ${n} · Day ${dayFromStart(crew.pact.startDate)} together`;
  } else if (friends.length) line = `${friends.length} accountability partner${friends.length === 1 ? "" : "s"}. Start 30 days together?`;
  else line = "Invite a friend to keep each other honest for 30 days.";

  const faces = crew?.pact
    ? crew.pact.members.filter((m) => !m.leftAt).map((m) => (m.id === me?.id ? me : crew.people[m.id])).filter(Boolean)
    : friends;
  return (
    <button className="crew-home" onClick={onOpen}>
      <span className="crew-home-icon" aria-hidden="true">
        {faces.length ? <AvatarStack people={faces} size={30} /> : <span className="crew-home-plus">+</span>}
      </span>
      <span className="crew-home-main">
        <span className="crew-home-title">
          Crew
          {pending > 0 && <span className="crew-badge">{pending}</span>}
        </span>
        <span className="crew-home-line">{line}</span>
      </span>
      <span className="crew-home-go">›</span>
    </button>
  );
}
