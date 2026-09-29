// ─── Timed moves ─────────────────────────────────────────────────────────────
//
// Reads a move's reps ("45 sec", "30 sec (Each Leg)", "6 × 20 sec",
// "30 sec / 30 sec / 30 sec", "10 min") and turns it into the phases the hold
// timer runs through. Anything that isn't a plain duration (ranges like
// "15-20 min", distances, rep counts) returns null and stays a normal row.

const READY = 3; // count-in before the first hold
const SWITCH = 5; // time to change sides or positions
const RECOVER = 30; // between sets of "N × M sec"

const toSeconds = (n, unit) => (/^min/i.test(unit) ? n * 60 : n);

export function parseTimed(reps) {
  if (!reps) return null;
  const s = String(reps).trim();

  // "6 × 20 sec" — sets with a short recovery between
  let m = /^(\d+)\s*[×x]\s*(\d+)\s*(sec|min)\b/i.exec(s);
  if (m) {
    const sets = +m[1];
    const work = toSeconds(+m[2], m[3]);
    if (!sets || !work) return null;
    return build(Array.from({ length: sets }, (_, i) => ({ label: `Set ${i + 1} of ${sets}`, secs: work })), RECOVER, "Recover");
  }

  // "30 sec / 30 sec / 30 sec" — back-to-back positions
  if (s.includes("/")) {
    const parts = s.split("/").map((p) => /^\s*(\d+)\s*(sec|min)\s*$/i.exec(p));
    if (parts.length > 1 && parts.every(Boolean)) {
      const n = parts.length;
      return build(parts.map((p, i) => ({ label: `Part ${i + 1} of ${n}`, secs: toSeconds(+p[1], p[2]) })), SWITCH, "Switch");
    }
    return null;
  }

  // "45 sec", "30 sec (Each Leg)", "10 min", "60 sec or 100 revolutions"
  m = /^(\d+)\s*(sec|min)\b/i.exec(s);
  if (!m) return null;
  const work = toSeconds(+m[1], m[2]);
  if (!work) return null;
  const each = /\(each\s+(\w+)\)/i.exec(s);
  if (each) {
    const word = each[1].toLowerCase();
    const one = word === "each" ? "side" : word;
    const Title = one[0].toUpperCase() + one.slice(1);
    const plural = one === "foot" ? "feet" : `${one}s`;
    return build(
      [{ label: `${Title} 1 of 2`, secs: work }, { label: `${Title} 2 of 2`, secs: work }],
      SWITCH,
      `Switch ${plural}`,
    );
  }
  return build([{ label: null, secs: work }], 0, null);
}

// What the start button shows: the duration, plus a small second line for
// sides or sets ("30 sec" / "each leg", "20 sec" / "× 6").
export function timedLabel(reps) {
  const s = String(reps).trim();
  let m = /^(\d+)\s*[×x]\s*(\d+\s*(?:sec|min))/i.exec(s);
  if (m) return { main: m[2], sub: `× ${m[1]}` };
  if (s.includes("/")) {
    const parts = s.split("/");
    return { main: parts[0].trim(), sub: `× ${parts.length}` };
  }
  m = /^(\d+\s*(?:sec|min))\s*(.*)$/i.exec(s);
  if (!m) return { main: s, sub: null };
  const rest = m[2].replace(/[()]/g, "").trim().toLowerCase();
  return { main: m[1], sub: rest || null };
}

// Interleave the holds with the gaps between them, after a short count-in.
function build(holds, gap, gapLabel) {
  const phases = [{ kind: "ready", label: "Get ready", secs: READY }];
  holds.forEach((h, i) => {
    if (i > 0 && gap) phases.push({ kind: "gap", label: gapLabel, secs: gap });
    phases.push({ kind: "work", label: h.label, secs: h.secs });
  });
  const workTotal = holds.reduce((n, h) => n + h.secs, 0);
  return { phases, workTotal };
}

// ─── Sound & buzz ────────────────────────────────────────────────────────────
// One shared AudioContext, created on the tap that starts a timer so browsers
// allow it to play.

let ctx = null;
export function primeAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch {}
}

export function beep(freq = 880, ms = 120, volume = 0.18) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.02);
  } catch {}
}

export function buzz(pattern) {
  try { navigator.vibrate?.(pattern); } catch {}
}

// Count-down pips, then a higher, longer tone when a phase ends.
export const tick = () => beep(660, 90);
export const go = () => { beep(1046, 260, 0.22); buzz(120); };
export const finish = () => {
  beep(784, 160, 0.22);
  setTimeout(() => beep(1046, 160, 0.22), 170);
  setTimeout(() => beep(1318, 320, 0.22), 340);
  buzz([120, 80, 120, 80, 240]);
};

export function formatClock(secs) {
  const s = Math.max(0, Math.ceil(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
