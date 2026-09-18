// ─── The Plan ────────────────────────────────────────────────────────────────
//
// All 30 days exist from the start. A day you haven't programmed yet comes out
// of TEMPLATE below — a warm up plus four 3-round blocks, no exercises — so you
// can fill it in from the app's builder whenever you like.
//
// To pin a day down in code, add it to DEFINED and it replaces the template for
// that day number. Shape of a day:
//
//   day       number, 1-30
//   title     short name shown in the header
//   focus     optional one-liner under the title
//   blocks    ordered list of blocks. Each block is:
//               label      optional section name ("Warm Up", "Finisher")
//               rounds     how many times through (1 = straight set)
//               rest       seconds of rest between rounds (null = none shown)
//               exercises  [{ name, id, reps, note }]
//                            name  what is shown in the list
//                            id    free-exercise-db id (for the demo + how-to),
//                                  or null for anything not in the database
//                            reps  free text — "15", "15 (Each Arm)", "30 sec"
//                            note  optional small grey line under the name
//
// Tip: hit "EDIT" in the app to assemble a day by searching the exercise
// database, then use "Copy JSON" and paste the result into DEFINED below.

export const TOTAL_DAYS = 30;

// The empty scaffold every unprogrammed day starts from.
function template(day) {
  return {
    day,
    title: `Day ${day}`,
    focus: null,
    blocks: [
      { label: "Warm Up", rounds: 1, rest: null, exercises: [] },
      { label: null, rounds: 3, rest: 75, exercises: [] },
      { label: null, rounds: 3, rest: 75, exercises: [] },
      { label: null, rounds: 3, rest: 75, exercises: [] },
      { label: null, rounds: 3, rest: 75, exercises: [] },
    ],
  };
}

// ─── Days you've programmed ──────────────────────────────────────────────────
// Paste new days here. Anything not listed falls back to the template above.

const DEFINED = [
  {
    day: 1,
    title: "Legs & Arms",
    focus: "Dumbbell circuits — 3 rounds each, 60s rest",
    blocks: [
      {
        label: "Warm Up",
        rounds: 1,
        rest: null,
        exercises: [
          { name: "Dynamic Warm Up", id: null, reps: "5 min", note: null },
        ],
      },
      {
        label: null,
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Dumbbell Walking Lunges", id: "Dumbbell_Lunges", reps: "15", note: null },
          { name: "Dumbbell Curls", id: "Dumbbell_Bicep_Curl", reps: "15", note: null },
        ],
      },
      {
        label: null,
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Dumbbell Squats", id: "Dumbbell_Squat", reps: "20", note: null },
          { name: "Hammer Curls", id: "Hammer_Curls", reps: "15 (Each Arm)", note: null },
        ],
      },
      {
        label: null,
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Leg Extension", id: "Leg_Extensions", reps: "20", note: null },
          { name: "Bench Dips", id: "Bench_Dips", reps: "25", note: "add 25 lb or 45 lb plate if needed" },
        ],
      },
      {
        label: null,
        rounds: 3,
        rest: 60,
        exercises: [
          {
            name: "3-way Calf Raise",
            id: "Standing_Calf_Raises",
            reps: "30",
            note: "30 total reps (10 toes straight / 10 toes turned out / 10 toes turned in)",
          },
          { name: "Tricep Extension", id: "Standing_Dumbbell_Triceps_Extension", reps: "20", note: null },
        ],
      },
    ],
  },
];

export const PLAN = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const day = i + 1;
  return DEFINED.find((d) => d.day === day) || template(day);
});

export function getDay(dayNumber) {
  return PLAN.find((d) => d.day === dayNumber) || null;
}

export function countExercises(workout) {
  if (!workout) return 0;
  return workout.blocks.reduce((n, b) => n + b.exercises.length, 0);
}

// How many of a day's boxes are ticked, counting only boxes that still exist.
export function countDone(workout, done) {
  if (!workout || !done) return 0;
  return workout.blocks.reduce(
    (n, b, bi) => n + b.exercises.filter((_, ei) => done[`${bi}:${ei}`]).length,
    0
  );
}
