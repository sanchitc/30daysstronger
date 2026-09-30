// ─── The catalog ─────────────────────────────────────────────────────────────
//
// Every 30-day challenge the app offers. One is active at a time; the rest can
// be previewed day by day. To add a challenge, write its 30 days (same shape as
// plan.js) and add an entry here.

import { PLAN as STRONGER_DAYS, TOTAL_DAYS } from "./plan.js";
import AGELESS_DAYS from "./plan-ageless.js";
import MARATHON_DAYS from "./plan-marathon.js";

export const PROGRAMS = [
  {
    id: "stronger",
    name: "30 Days Stronger",
    short: "Stronger",
    tagline: "Build muscle and conditioning in a month",
    description:
      "Four weeks of dumbbell, barbell, cable and bodyweight circuits: supersets and giant sets in weeks 1-3, German Volume Training to finish. Active-recovery days keep you fresh.",
    audience: "For people comfortable in a gym who want a hard, structured month.",
    level: "Intermediate",
    minutes: "45-60 min",
    equipment: "Gym: dumbbells, barbell, cables",
    theme: { a: "#E63946", b: "#FF6B35", on: "#ffffff" },
    glyph: "dumbbell",
    weeks: [
      { title: "Week 1 · Foundations", text: "Supersets for legs, push, pull and conditioning." },
      { title: "Week 2 · Giant sets", text: "Three moves back to back, 4 rounds each." },
      { title: "Week 3 · Volume", text: "Drop sets, pyramids and longer circuits." },
      { title: "Week 4 · German Volume", text: "10 sets of 10 to finish the month." },
    ],
    days: STRONGER_DAYS,
  },
  {
    id: "ageless",
    name: "Ageless Strength",
    short: "Ageless",
    tagline: "Mobility and strength for 60+",
    description:
      "A gentler month using just your bodyweight and a light resistance band. Every day opens with joint circles and ends with stretches. The work in between grows a little each week, and each day brings back what you've learned with one or two new moves.",
    audience: "For adults 60+, or anyone returning to exercise. Needs a sturdy chair, a counter and a light band.",
    level: "Beginner",
    minutes: "20-30 min",
    equipment: "Bodyweight + resistance band",
    theme: { a: "#2EC4A6", b: "#9AD96B", on: "#052620" },
    glyph: "leaf",
    largeType: true,
    weeks: [
      { title: "Week 1 · Foundations", text: "Chair squats, wall push-ups, bridges and balance. 2 rounds." },
      { title: "Week 2 · Add the band", text: "Band squats, rows and presses. Push-ups move to the counter." },
      { title: "Week 3 · Build", text: "3 rounds, single-leg work, side planks and longer holds." },
      { title: "Week 4 · Own it", text: "Combined moves and a Day 30 re-test of Day 1." },
    ],
    days: AGELESS_DAYS,
  },
  {
    id: "marathon",
    name: "Marathon Final 30",
    short: "Marathon",
    tagline: "The last month before race day",
    description:
      "The final block of a marathon build, ending with the race on Day 30. You peak with a 20-mile long run on Day 14, then taper for three weeks: less running, same sharpness. Intervals, tempo and marathon-pace runs, two short strength sessions a week, and Rest & Roll days with the foam roller. Paces go by feel, so it fits any goal time.",
    audience: "For runners with a marathon 30 days away and the base already built: you can run 13-15 mi (20-25 km) and have been running 25-35 mi (40-55 km) a week. Not a from-scratch plan.",
    level: "Intermediate",
    minutes: "30-180 min",
    equipment: "Running shoes, a foam roller, a step; dumbbells optional",
    theme: { a: "#3A86FF", b: "#8338EC", on: "#ffffff" },
    glyph: "shoe",
    weeks: [
      { title: "Week 1 · Build", text: "800s, a tempo run and an 18-mile long run with a marathon-pace finish." },
      { title: "Week 2 · Peak", text: "7 miles at marathon pace, 1K repeats and the 20-mile peak on Day 14." },
      { title: "Week 3 · Taper", text: "About 25% less running, same intensity. Last long run: 12 miles." },
      { title: "Week 4 · Race week", text: "Short race-pace sharpeners, carb-loading, and 26.2 on Day 30." },
    ],
    days: MARATHON_DAYS,
  },
];

export { TOTAL_DAYS };

export function getProgram(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}

export function getProgramDay(program, dayNumber) {
  return program?.days.find((d) => d.day === dayNumber) || null;
}

// The first time a move shows up in a program, the app tags it NEW. Returns
// { [day]: Set("bi:ei") } for the program as written.
const newCache = new Map();
export function newMoves(program) {
  if (!program) return {};
  if (newCache.has(program.id)) return newCache.get(program.id);
  const seen = new Set();
  const out = {};
  for (const day of program.days) {
    const fresh = new Set();
    day.blocks.forEach((b, bi) =>
      b.exercises.forEach((ex, ei) => {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          // Day 1 is all new — no point tagging every row.
          if (day.day > 1) fresh.add(`${bi}:${ei}`);
        }
      })
    );
    out[day.day] = fresh;
  }
  newCache.set(program.id, out);
  return out;
}

// Rank shown next to the badge count.
const RANKS = [
  [10, "Legend"],
  [5, "Unbreakable"],
  [3, "Relentless"],
  [2, "Committed"],
  [1, "Finisher"],
];
export function rankFor(count) {
  return RANKS.find(([n]) => count >= n)?.[1] || null;
}
