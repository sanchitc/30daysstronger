// ─── The Plan ────────────────────────────────────────────────────────────────
//
// One entry per training day. Add a new object to add a day — nothing else in
// the app needs to change.
//
//   day       number, 1-based
//   title     short name shown in the header
//   focus     optional one-liner under the title
//   blocks    ordered list of blocks. Each block is:
//               rounds     how many times through (1 = straight set)
//               rest       seconds of rest between rounds (null = none shown)
//               exercises  [{ name, id, reps, note }]
//                            name  what is shown in the list
//                            id    free-exercise-db id (for the demo + how-to),
//                                  or null for anything not in the database
//                            reps  free text — "15", "15 (Each Arm)", "30 sec"
//                            note  optional small grey line under the name
//
// Tip: hit "Build" in the app to assemble a day by searching the exercise
// database, then use "Copy JSON" and paste the result here.

export const PLAN = [
  {
    day: 1,
    title: "Legs & Arms",
    focus: "Dumbbell circuits — 3 rounds each, 60s rest",
    blocks: [
      {
        rounds: 1,
        rest: null,
        exercises: [
          { name: "Dynamic Warm Up", id: null, reps: "5 min", note: null },
        ],
      },
      {
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Dumbbell Walking Lunges", id: "Dumbbell_Lunges", reps: "15", note: null },
          { name: "Dumbbell Curls", id: "Dumbbell_Bicep_Curl", reps: "15", note: null },
        ],
      },
      {
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Dumbbell Squats", id: "Dumbbell_Squat", reps: "20", note: null },
          { name: "Hammer Curls", id: "Hammer_Curls", reps: "15 (Each Arm)", note: null },
        ],
      },
      {
        rounds: 3,
        rest: 60,
        exercises: [
          { name: "Leg Extension", id: "Leg_Extensions", reps: "20", note: null },
          { name: "Bench Dips", id: "Bench_Dips", reps: "25", note: "add 25 lb or 45 lb plate if needed" },
        ],
      },
      {
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

export function getDay(dayNumber) {
  return PLAN.find((d) => d.day === dayNumber) || null;
}

export function countExercises(workout) {
  if (!workout) return 0;
  return workout.blocks.reduce((n, b) => n + b.exercises.length, 0);
}
