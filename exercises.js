// ─── Exercise database ───────────────────────────────────────────────────────
//
// 876 exercises from https://github.com/yuhonas/free-exercise-db (public domain).
// The JSON lives in public/ and is fetched on demand — the first screen of the
// app never pays for it.

const DB_URL = "/exercises.json";
const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

let cache = null;
let inflight = null;

export function loadExercises() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(DB_URL)
      .then((r) => r.json())
      .then((list) => {
        cache = list;
        byId = new Map(list.map((e) => [e.id, e]));
        return list;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

let byId = new Map();

export function getExercise(id) {
  return id ? byId.get(id) || null : null;
}

export function imageUrl(path) {
  return IMG_BASE + path;
}

export const MUSCLES = [
  "abdominals", "abductors", "adductors", "biceps", "calves", "chest",
  "forearms", "glutes", "hamstrings", "lats", "lower back", "middle back",
  "neck", "quadriceps", "shoulders", "traps", "triceps",
];

export const EQUIPMENT = [
  "body only", "dumbbell", "barbell", "machine", "cable", "kettlebells",
  "bands", "e-z curl bar", "medicine ball", "exercise ball", "foam roll", "other",
];

// Ranked search: exact match, then prefix, then word-start, then substring.
export function searchExercises(list, query, muscle, equipment) {
  const q = query.trim().toLowerCase();
  const scored = [];
  for (const ex of list) {
    if (muscle && !ex.primaryMuscles.includes(muscle) && !ex.secondaryMuscles.includes(muscle)) continue;
    if (equipment && ex.equipment !== equipment) continue;
    if (!q) {
      scored.push([3, ex]);
      continue;
    }
    const name = ex.name.toLowerCase();
    let score;
    if (name === q) score = 0;
    else if (name.startsWith(q)) score = 1;
    else if (name.includes(" " + q)) score = 2;
    else if (name.includes(q)) score = 3;
    else continue;
    scored.push([score, ex]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name));
  return scored.slice(0, 80).map((s) => s[1]);
}
