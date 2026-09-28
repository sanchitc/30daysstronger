// ─── The Plan ────────────────────────────────────────────────────────────────
//
// All 30 days are programmed in DEFINED below. A day missing from DEFINED comes
// out of the template — a warm up plus four 3-round blocks, no exercises — so
// you can fill it in from the app's builder. Shape of a day:
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

// Shorthands for days 2-30. They build the same objects written out longhand in
// day 1, so a block pasted from the builder's Copy JSON still drops in as-is.
const x = (name, id, reps, note = null) => ({ name, id, reps, note });
const warmUp = (note = null) => ({
  label: "Warm Up",
  rounds: 1,
  rest: null,
  exercises: [x("Dynamic Warm Up", null, "5 min", note)],
});
const block = (rounds, rest, exercises, label = null) => ({ label, rounds, rest, exercises });
const GIANT = "Giant Set — no rest between exercises";
const GIANT_FOCUS =
  "Giant sets: 3 exercises back-to-back with no rest, then 60s rest before the next round. 4 rounds each.";
const recoveryDay = (day, note = "Keep your heart rate between 125-145 bpm. Rest, hydrate, and stay disciplined.") => ({
  day,
  title: "Active Recovery",
  focus: "Rest day — light movement only, no lifting",
  blocks: [
    warmUp(),
    block(1, null, [x("Recovery Yoga or Low-Intensity Cardio", null, "25-35 min", note)], "Recovery"),
  ],
});

// ─── Days you've programmed ──────────────────────────────────────────────────
// Every day is programmed. Anything removed from here falls back to the template above.

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
  // ── Week 1 ──────────────────────────────────────────────────────────────────
  {
    day: 2,
    title: "Chest & Shoulders",
    focus: "Dumbbell & barbell circuits — 3 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(1, null, [
        x("Dumbbell Lateral Raise Pyramid", "Side_Lateral_Raise", "20→10→20",
          "20-15-12-10-12-15-20 as one continuous set: start light, add weight as reps drop, then reverse back up to 20. No rest until the set is done."),
      ], "Pyramid Set — No Rest"),
      block(3, 60, [
        x("Dumbbell Incline Bench Press", "Incline_Dumbbell_Press", "15"),
        x("Push-Ups", "Pushups", "Failure"),
      ]),
      block(3, 60, [
        x("Dumbbell Rear Delt Fly", "Reverse_Flyes", "15"),
        x("Dumbbell Shoulder Press", "Dumbbell_Shoulder_Press", "20"),
      ]),
      block(3, 60, [
        x("Dumbbell Chest Fly", "Dumbbell_Flyes", "20"),
        x("Plate Front Raise", "Front_Plate_Raise", "20", "Use a 25 lb or 45 lb plate"),
        x("Preacher Bench Plate Press", "Svend_Press", "20"),
      ], "Tri-Set — 1 set of each = 1 round"),
      block(3, 60, [
        x("Barbell Bench Press (3-Grip)", "Barbell_Bench_Press_-_Medium_Grip", "30",
          "30 total reps per set: 10 close grip / 10 shoulder width / 10 wide grip"),
        x("Dumbbell Lateral Raise Hold", "Side_Lateral_Raise", "30 sec", "Static hold, arms raised to the side"),
      ]),
    ],
  },
  {
    day: 3,
    title: "Conditioning Circuit",
    focus: "Bodyweight circuit — 3 rounds, 30s rest between exercises",
    blocks: [
      warmUp(),
      block(3, 30, [
        x("Jump Rope", "Rope_Jumping", "60 sec"),
        x("Reverse Lunges", "Dumbbell_Rear_Lunge", "60 sec", "Bodyweight — no dumbbells needed"),
        x("Diamond Push-Ups", "Push-Ups_-_Close_Triceps_Position", "60 sec"),
        x("Front Plank", "Plank", "60 sec"),
        x("Mountain Climbers", "Mountain_Climbers", "60 sec"),
        x("Pulse Squats", "Bodyweight_Squat", "30 sec", "Stay low and pulse through the bottom few inches"),
      ], "3 Rounds of Each"),
    ],
  },
  {
    day: 4,
    title: "Legs & Triceps",
    focus: "Dumbbell supersets — 3 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(3, 60, [
        x("Dumbbell Bulgarian Split Squat", "Split_Squat_with_Dumbbells", "15 (Each Leg)", "Rear foot up on a bench"),
      ]),
      block(3, 60, [
        x("Dumbbell Romanian Deadlift", "Stiff-Legged_Dumbbell_Deadlift", "15"),
        x("Tricep Underbar Press", "Body_Tricep_Press", "15"),
      ], "Superset"),
      block(3, 60, [
        x("Sumo Pulse Squat", "Plie_Dumbbell_Squat", "15"),
        x("Leg Curl", "Lying_Leg_Curls", "15"),
      ], "Superset"),
      block(3, 60, [
        x("Tricep Extension 21s", "Standing_Dumbbell_Triceps_Extension", "7/7/7",
          "7 top half, 7 bottom half, 7 full reps"),
        x("Bodyweight Hip Bridge (Squeeze)", "Butt_Lift_Bridge", "15", "Squeeze glutes at the top of each rep"),
      ], "Superset"),
    ],
  },
  {
    day: 5,
    title: "Back & Biceps",
    focus: "Dumbbell & cable supersets — 3 rounds, 60s rest",
    blocks: [
      warmUp(),
      block(3, 60, [
        x("Pull-Up (or Lat Pulldown)", "Pullups", "15",
          "Use the lat pulldown machine if you can't do bodyweight pull-ups"),
        x("Cable Reverse-Grip Curl", "Reverse_Cable_Curl", "20"),
      ]),
      block(3, 60, [
        x("Bent-Over Dumbbell Row", "Bent_Over_Two-Dumbbell_Row", "15"),
        x("Dumbbell Cheat Curl", "Dumbbell_Bicep_Curl", "15", "Use a little body swing to get the weight up, then lower it slowly"),
      ]),
      block(3, 60, [
        x("Eccentric Bodyweight Calf Raise", "Standing_Dumbbell_Calf_Raise", "15",
          "Bodyweight, off the edge of a step — up fast, 3 seconds down"),
        x("Hammer Curl Rack Run", "Hammer_Curls", "10 per weight",
          "6-7 weights, pyramid up then down: 3 sets up, 1 at your heaviest, 3 back down, 10 reps at each weight (e.g. 5/10/15/20/15/10/5 lb)"),
      ]),
    ],
  },
  {
    day: 6,
    title: "Full Body Conditioning",
    focus: "Bodyweight circuit — 40s work per move, 3 rounds, 60s rest between rounds",
    blocks: [
      warmUp(),
      block(3, 60, [
        x("Bodyweight Squat", "Bodyweight_Squat", "40 sec"),
        x("Squat Jump", "Freehand_Jump_Squat", "40 sec"),
        x("Burpee", null, "40 sec", "Squat, kick back to a plank, push-up, jump the feet in, jump up"),
        x("Tricep Press", "Body_Tricep_Press", "40 sec"),
        x("Frog Crunch", "Frog_Sit-Ups", "40 sec"),
        x("Side Plank Hip Lift (Both Sides)", "Side_Bridge", "40 sec", "20 sec each side"),
        x("Bicycle Crunch", "Air_Bike", "40 sec"),
        x("Turkish Crunch (Both Sides)", "Oblique_Crunches_-_On_The_Floor", "40 sec", "20 sec each side"),
        x("Scissor Lunge", "Scissors_Jump", "40 sec"),
        x("Windshield Wipers", null, "40 sec",
          "On your back, legs straight up, arms out wide — lower both legs to one side, then the other"),
        x("Box Jump", "Front_Box_Jump", "40 sec"),
        x("Push-Up", "Pushups", "40 sec"),
        x("Diamond Push-Up", "Push-Ups_-_Close_Triceps_Position", "40 sec"),
        x("Reverse Lunge", "Dumbbell_Rear_Lunge", "40 sec", "Bodyweight — no dumbbells needed"),
      ], "Circuit"),
    ],
  },
  recoveryDay(7),

  // ── Week 2 ──────────────────────────────────────────────────────────────────
  {
    day: 8,
    title: "Chest, Triceps & Core",
    focus: GIANT_FOCUS,
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Incline Cable Fly", "Incline_Cable_Flye", "12", "1½ technique: half rep, full rep, count as one"),
        x("Diamond Push-Up", "Push-Ups_-_Close_Triceps_Position", "Till technique failure"),
        x("3-Way Plank", "Plank", "30 sec each", "Straight, right side, left side"),
      ], GIANT),
      block(4, 60, [
        x("Close-Grip Bench Press", "Close-Grip_Barbell_Bench_Press", "10"),
        x("Toe Taps", "Toe_Touchers", "60 sec"),
        x("Wide-Grip Bench Press", "Wide-Grip_Barbell_Bench_Press", "10", "Extra wide grip"),
      ], GIANT),
      block(4, 60, [
        x("Single-Arm Dumbbell Shoulder Press", "Dumbbell_One-Arm_Shoulder_Press", "10 (Each Arm)"),
        x("Hanging Oblique Crunch", "Hanging_Leg_Raise", "10 (Each Side)", "Bring the knees up and across to one side"),
        x("Dumbbell Floor Press", "Dumbbell_Floor_Press", "10"),
      ], GIANT),
    ],
  },
  {
    day: 9,
    title: "Full Body Stability",
    focus: "Single-side and stability work — 4 rounds, 60s rest between rounds",
    blocks: [
      warmUp(
        "We're training 3 different body parts today. Body rest may be 60 sec, but each muscle actually gets about 3x that. On any single-sided movement, keep your core braced throughout."
      ),
      block(4, 60, [
        x("Single-Arm Dumbbell Shoulder Press (Standing)", "Dumbbell_One-Arm_Shoulder_Press", "10 (Each Arm)"),
        x("Dumbbell Walking Lunge (Drop Set)", "Dumbbell_Lunges", "10/10 each leg",
          "One drop set: drop the weight and go straight into 10 reps per leg"),
        x("Good Morning", "Good_Morning", "20"),
      ]),
      block(4, 60, [
        x("Goblet Squat", "Goblet_Squat", "12"),
        x("Lateral Step-Over", "Side_to_Side_Box_Shuffle", "60 sec"),
        x("Dumbbell Lateral Raise", "Side_Lateral_Raise", "12", "1½ technique: half rep, full rep, count as one"),
      ]),
      block(4, 60, [
        x("Leg Extension", "Leg_Extensions", "15"),
        x("Two-Way Shoulder Raise", "Side_Laterals_to_Front_Raise", "10/10", "10 to the side, 10 to the front"),
        x("Cable Rope Crunch", "Cable_Crunch", "25"),
      ]),
    ],
  },
  {
    day: 10,
    title: "Back & Biceps Giant Sets",
    focus: GIANT_FOCUS,
    blocks: [
      warmUp(),
      block(4, 60, [
        x("V-Bar Pulldown", "V-Bar_Pulldown", "10"),
        x("EZ-Bar Wall Curl (Strict Form)", "EZ-Bar_Curl", "10", "Back and elbows against a wall — no swinging"),
        x("Side Plank Hip Lift", "Side_Bridge", "15 (Each Side)"),
      ], GIANT),
      block(4, 60, [
        x("Stabilized Dumbbell Row", "One-Arm_Dumbbell_Row", "12 (Each Arm)"),
        x("Incline Dumbbell T-Curl", "Incline_Inner_Biceps_Curl", "12"),
        x("Burpee Pull-Up", "Pullups", "10", "Burpee, then jump straight into a pull-up"),
      ], GIANT),
      block(4, 60, [
        x("Reverse-Grip Bent-Over Row", "Reverse_Grip_Bent-Over_Rows", "15"),
        x("Barbell Rollout", "Barbell_Ab_Rollout", "10"),
        x("Barbell Peel-Off Curl", "Barbell_Curl", "10/10/10", "3 grip widths, 10 reps each"),
      ], GIANT),
    ],
  },
  {
    day: 11,
    title: "Full Body Giant Sets",
    focus: GIANT_FOCUS,
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Dumbbell RDL to Reverse Lunge", "Stiff-Legged_Dumbbell_Deadlift", "10 (Each Leg)",
          "One rep = RDL straight into a reverse lunge, same leg"),
        x("Dumbbell 3-Way Raise", "Side_Laterals_to_Front_Raise", "10/10/10",
          "10 reps each position: front, side, rear"),
        x("V-Up", "Jackknife_Sit-Up", "20"),
      ], GIANT),
      block(4, 60, [
        x("Leg Curl 21s", "Lying_Leg_Curls", "7/7/7", "7 reps each position: bottom half, top half, full range"),
        x("Seated Military Press", "Seated_Barbell_Military_Press", "10"),
        x("Side Lunge", "Barbell_Side_Split_Squat", "15 (Each Leg)", "Sheet calls for 5 rounds on this one — do the extra round if you have it"),
      ], GIANT),
      block(4, 60, [
        x("Barbell Triple Threat", "Upright_Barbell_Row", "10/10/10",
          "Upright row, front raise, press — 10 reps each, no rest"),
        x("Back Squat", "Barbell_Squat", "6", "5-second eccentric (slow lowering) on every rep"),
        x("Army Crawl", "Inchworm", "10 (Each Arm)", "Plank walk-out \"steps\""),
      ], GIANT),
    ],
  },
  {
    day: 12,
    title: "Chest & Triceps Giant Sets",
    focus: GIANT_FOCUS,
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Dumbbell Flat Bench Press", "Dumbbell_Bench_Press", "15"),
        x("Dip", "Dips_-_Triceps_Version", "15", "Weight optional"),
        x("Jump Rope", "Rope_Jumping", "60 sec or 100 revolutions"),
      ], GIANT),
      block(4, 60, [
        x("Incline Bench Press (3-Grip)", "Barbell_Incline_Bench_Press_-_Medium_Grip", "10/10/10",
          "10 reps at each grip width: close, shoulder width, wide"),
        x("Dumbbell Incline Skull Crusher (with Pronation)", "Dumbbell_Tricep_Extension_-Pronated_Grip", "15",
          "On an incline bench — rotate (pronate) the wrists through the movement"),
        x("Toe Taps", "Toe_Touchers", "20 (Each Foot)"),
      ], GIANT),
      block(4, 60, [
        x("Cable Fly (2-Way)", "Cable_Crossover", "10/10", "10 high-to-low, 10 low-to-high"),
        x("Tricep Extension 21s", "Standing_Dumbbell_Triceps_Extension", "7/7/7",
          "7 top half, 7 bottom half, 7 full range"),
        x("X-Up", "Cross-Body_Crunch", "10 (Each Side)", "Lying in an X, reach one hand to the opposite foot"),
      ], GIANT),
    ],
  },
  {
    day: 13,
    title: "Legs, Back & Biceps Giant Sets",
    focus: GIANT_FOCUS,
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Back Squat", "Barbell_Squat", "12"),
        x("EZ-Bar Preacher Curl", "Preacher_Curl", "12"),
        x("Push-Up", "Pushups", "20"),
      ], GIANT),
      block(4, 60, [
        x("Dumbbell Reverse Lunge", "Dumbbell_Rear_Lunge", "10 (Each Leg)"),
        x("Wide-Grip Chin-Up", "Chin-Up", "10", "Palms facing you, hands wider than shoulders"),
        x("Weighted V-Up (Plate)", "Jackknife_Sit-Up", "20", "Hold a plate overhead"),
      ], GIANT),
      block(4, 60, [
        x("Cable Bicep Triple Threat", "Standing_Biceps_Cable_Curl", "10/10/10",
          "3 grip/angle variations, 10 reps each, no rest"),
        x("Smith Machine Row", "Smith_Machine_Bent_Over_Row", "10 (Each Side)"),
        x("Turkish V-Up", "Side_Jackknife", "15 (Each Side)"),
      ], GIANT),
    ],
  },
  recoveryDay(14),

  // ── Week 3 ──────────────────────────────────────────────────────────────────
  {
    day: 15,
    title: "Chest & Triceps",
    focus: "Cable & barbell supersets — 5 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(5, 60, [
        x("Overhead Cable Tricep Extension (Rope)", "Cable_Rope_Overhead_Triceps_Extension", "20"),
        x("Toe Taps", "Toe_Touchers", "50", "Total reps"),
      ]),
      block(5, 60, [
        x("Cable Fly (2-Position)", "Cable_Crossover", "15/15", "15 reps at each position: high, then low"),
        x("Reverse Crunch", "Reverse_Crunch", "25"),
      ]),
      block(5, 60, [
        x("Tricep Pushdown (Dual Grip)", "Triceps_Pushdown", "12/12", "12 reps overhand, 12 reps underhand"),
      ]),
      block(5, 60, [
        x("Wide-Grip Barbell Bench Press", "Wide-Grip_Barbell_Bench_Press", "12"),
        x("Diamond Push-Up", "Push-Ups_-_Close_Triceps_Position", "Failure"),
      ]),
    ],
  },
  {
    day: 16,
    title: "Legs & Conditioning",
    focus: "Bodyweight & dumbbell circuits — 5 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(5, 60, [
        x("Jump Rope", "Rope_Jumping", "60 sec"),
        x("Dumbbell Goblet Squat", "Goblet_Squat", "20", "Hold one dumbbell vertically at your chest"),
      ]),
      block(5, 60, [
        x("Dumbbell Walking Lunge", "Dumbbell_Lunges", "10 (Each Leg)"),
        x("Bodyweight Squat", "Bodyweight_Squat", "20"),
      ]),
      block(5, 60, [
        x("Bulgarian Split Squat", "Split_Squat_with_Dumbbells", "12 (Each Leg)", "Rear foot up on a bench"),
        x("Plank", "Plank", "60 sec"),
      ]),
    ],
  },
  {
    day: 17,
    title: "Bodyweight Giant Circuit",
    focus: "Bodyweight giant sets — 5 rounds, 3 min rest after each round, plus an extra-credit finisher",
    blocks: [
      warmUp(),
      block(5, 180, [
        x("Close-Grip Chin-Up", "Chin-Up", "10", "Hands about 6 inches apart"),
        x("Diamond Push-Up", "Push-Ups_-_Close_Triceps_Position", "15"),
        x("Walking Lunge (Bodyweight)", "Bodyweight_Walking_Lunge", "15 (Each Leg)"),
        x("Hanging Knee Raise", "Hanging_Leg_Raise", "10", "Bend the knees and drive them to your chest"),
      ], "Giant Set — 4 exercises, then 3 min rest"),
      block(5, 180, [
        x("Bodyweight Dip", "Dips_-_Triceps_Version", "20"),
        x("Toe Touch", "Toe_Touchers", "25"),
        x("Bodyweight Squat", "Bodyweight_Squat", "25"),
        x("Burpee", null, "20", "Squat, kick back to a plank, push-up, jump the feet in, jump up"),
      ], "Giant Set — 4 exercises, then 3 min rest"),
      block(1, null, [
        x("Dumbbell Bicep Curl Rack Run (5 Weights)", "Dumbbell_Bicep_Curl", "100",
          "100 total reps, working through 5 weights (20 at each)"),
      ], "Extra Credit"),
    ],
  },
  {
    day: 18,
    title: "Shoulders & Core",
    focus: "Dumbbell & cable supersets — 5 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(5, 60, [
        x("Cable Lateral Raise", "Standing_Low-Pulley_Deltoid_Raise", "20 (Each Arm)"),
        x("Stabilized Rear Delt Fly", "Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench", "15",
          "Forehead on an incline bench to stop any swinging"),
        x("Hanging Knee Raise", "Hanging_Leg_Raise", "20", "Bend the knees and drive them to your chest"),
      ]),
      block(5, 60, [
        x("Leg Press Calf Raise (3-Way)", "Calf_Press_On_The_Leg_Press_Machine", "7/7/7",
          "On the leg press machine: 7 toes straight / 7 toes out / 7 toes in"),
        x("Jump Rope", "Rope_Jumping", "60 sec"),
      ]),
      block(5, 60, [
        x("Dumbbell Shoulder Press (Eccentric)", "Dumbbell_Shoulder_Press", "5", "5-second negative on every rep"),
        x("Dumbbell Shrug (2-Position)", "Dumbbell_Shrug", "10/10", "10 with dumbbells at your sides, 10 in front"),
        x("Decline Pulse Crunch", "Decline_Crunch", "25", "Small pulses at the top of the crunch"),
      ]),
    ],
  },
  {
    day: 19,
    title: "Back & Biceps",
    focus: "Cable, dumbbell & barbell supersets — 5 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(5, 60, [
        x("V-Bar Pulldown", "V-Bar_Pulldown", "10"),
        x("Cable Rope Curl", "Cable_Hammer_Curls_-_Rope_Attachment", "10"),
      ]),
      block(5, 60, [
        x("Incline Dumbbell Row", "Dumbbell_Incline_Row", "10"),
        x("Barbell Curl (3-Position)", "Barbell_Curl", "5/5/5", "5 close grip, 5 shoulder width, 5 wide"),
        x("Frog Crunch", "Frog_Sit-Ups", "20"),
      ]),
      block(5, 60, [
        x("Bodyweight Row", "Inverted_Row", "10"),
        x("Dumbbell Preacher Curl", "One_Arm_Dumbbell_Preacher_Curl", "10 (Each Arm)"),
      ]),
    ],
  },
  {
    day: 20,
    title: "Full Body Bodyweight & Dumbbell Circuit",
    focus: "Bodyweight & dumbbell circuits — 4 rounds each, 60s rest, plus an extra-credit finisher",
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Wide-Grip Pull-Up", "Pullups", "10", "Hands wider than shoulders"),
        x("Wide-Grip Push-Up", "Push-Up_Wide", "10"),
        x("Scissor Lunge", "Scissors_Jump", "15 (Each Leg)"),
        x("Russian Twist", "Russian_Twist", "15 (Each Side)"),
      ]),
      block(4, 60, [
        x("Bodyweight Bench Dip", "Bench_Dips", "30"),
        x("Lateral Step-Up", "Dumbbell_Step_Ups", "15 (Each Leg)", "Step up onto the bench from the side"),
        x("EZ-Bar Curl", "EZ-Bar_Curl", "15"),
        x("Good Morning", "Good_Morning", "20"),
      ]),
      block(1, null, [
        x("Dumbbell Tricep Gauntlet", "Standing_Dumbbell_Triceps_Extension", "100",
          "5 weights, 100 total reps (20 at each)"),
      ], "Extra Credit"),
    ],
  },
  recoveryDay(21),

  // ── Week 4 ──────────────────────────────────────────────────────────────────
  {
    day: 22,
    title: "Legs",
    focus: "Dumbbell leg circuits — 4 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(4, 60, [
        x("3-Way Plank", "Plank", "30 sec / 30 sec / 30 sec", "Front, side, side"),
        x("Leg Extension", "Leg_Extensions", "15"),
        x("Leg Curl", "Lying_Leg_Curls", "15"),
      ]),
      block(4, 60, [
        x("Dumbbell Walking Lunge", "Dumbbell_Lunges", "15 (Each Leg)"),
        x("Dumbbell Romanian Deadlift", "Stiff-Legged_Dumbbell_Deadlift", "15"),
      ]),
      block(4, 60, [
        x("Dumbbell Squat", "Dumbbell_Squat", "15"),
        x("Dumbbell Step-Up", "Dumbbell_Step_Ups", "15 (Each Leg)"),
      ]),
    ],
  },
  {
    day: 23,
    title: "Chest & Triceps",
    focus: "Dumbbell, barbell & bodyweight circuits — 3-4 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(4, 60, [
        x("Single-Arm Hammer-Grip Tricep Extension", "Standing_One-Arm_Dumbbell_Triceps_Extension", "15 (Each Arm)",
          "Palm facing in (hammer grip)"),
        x("Diamond Push-Up", "Push-Ups_-_Close_Triceps_Position", "20"),
        x("Bodyweight Squat", "Bodyweight_Squat", "20"),
      ]),
      block(3, 60, [
        x("Incline Barbell Bench Press (3-Grip)", "Barbell_Incline_Bench_Press_-_Medium_Grip", "10/10/10",
          "10 reps at each grip width: close, shoulder width, wide"),
        x("Dumbbell Deficit Push-Up", "Pushups", "10", "Hands on dumbbells — 2-second pause at the bottom"),
        x("Jumping Jacks", null, "60"),
      ]),
      block(4, 60, [
        x("Close-Grip Barbell Bench Press", "Close-Grip_Barbell_Bench_Press", "12"),
        x("Dumbbell Overhead Press Combo (Over-Back & Press)", "Standing_Dumbbell_Triceps_Extension", "12",
          "Lower the dumbbell behind your head, extend, then press — 1 over-back + 1 press = 1 rep"),
        x("3-Way Plank", "Plank", "12 (Each Side)", "Front, right side, left side"),
      ]),
    ],
  },
  {
    day: 24,
    title: "Full Body Complex",
    focus: "Dumbbell complex — 4 rounds, 10 reps each, 90s rest; finish with a cool-down",
    blocks: [
      warmUp(),
      block(4, 90, [
        x("Renegade Row (High Plank Dumbbell Row)", "Alternating_Renegade_Row", "10 (Each Arm)"),
        x("Dumbbell Squat to Press (Thruster)", "Kettlebell_Thruster", "10", "Same movement with dumbbells"),
        x("Dumbbell Curl to Press", "Dumbbell_Bicep_Curl", "10", "Curl up, rotate the palms out, press overhead"),
        x("Burpee with Dumbbell Press", null, "10", "Burpee holding the dumbbells, stand and press them overhead"),
      ], "Complex — one move straight into the next"),
      block(1, null, [
        x("Active Cool Down", "Walking_Treadmill", "10 min", "Walking on an incline"),
      ], "Cool Down"),
    ],
  },
  {
    day: 25,
    title: "Back & Shoulders",
    focus: "Dumbbell, barbell & bodyweight supersets — 3 rounds each, 60s rest",
    blocks: [
      warmUp(),
      block(3, 60, [
        x("Dumbbell Lateral Raise Rack Run", "Side_Lateral_Raise", "100", "100 total reps, working through the rack"),
      ]),
      block(3, 60, [
        x("Wide-Grip Pull-Up (or Lat Pulldown)", "Pullups", "15", "Use the wide-grip lat pulldown if you can't do pull-ups"),
        x("Toes-to-Bar (or Hanging Knee Tuck)", "Hanging_Leg_Raise", "15"),
      ]),
      block(3, 60, [
        x("Standing Single-Arm Dumbbell Shoulder Press", "Dumbbell_One-Arm_Shoulder_Press", "15 (Each Arm)"),
        x("Bent-Over Dumbbell Row", "Bent_Over_Two-Dumbbell_Row", "15"),
      ]),
      block(3, 60, [
        x("Deficit Barbell Rear-Delt Row", "Barbell_Rear_Delt_Row", "15", "Stand on a plate or low step"),
        x("Bus Driver (or Weighted Chin-Up)", "Front_Plate_Raise", "15",
          "Hold a plate at arm's length and turn it side to side like a steering wheel"),
      ]),
    ],
  },
  recoveryDay(
    26,
    "Keep your heart rate between 125-145 bpm. This rest day lets your body recover from the last 3 demanding days — rest, hydrate, and stay disciplined!"
  ),

  // ── The last push ───────────────────────────────────────────────────────────
  {
    day: 27,
    title: "Arms & Core Giant Circuit",
    focus: "Giant circuit — 10 exercises back-to-back, 3 rounds total, no rest between rounds",
    blocks: [
      warmUp(),
      block(3, null, [
        x("3-Way Plank", "Plank", "30 sec / 30 sec / 30 sec", "Front, right side, left side"),
        x("Bent-Over Tricep Kickback", "Tricep_Dumbbell_Kickback", "20"),
        x("Squatting Preacher Curl", "Concentration_Curls", "20", "Sit deep in a squat, elbow braced on your knee"),
        x("Dumbbell V-Up", "Jackknife_Sit-Up", "10", "Hold one dumbbell"),
        x("Eccentric Chin-Up", "Chin-Up", "5", "5-second slow lowering on every rep"),
        x("Tricep Underbar Press", "Body_Tricep_Press", "20"),
        x("Dumbbell Curl Static Hold", "Dumbbell_Bicep_Curl", "10 (Each Arm)", "Hold one arm at 90° while the other curls"),
        x("Weighted Hanging Knee Raise", "Hanging_Leg_Raise", "10", "Dumbbell between the feet, knees to chest"),
        x("Lying Dumbbell Skull Crusher", "Lying_Dumbbell_Tricep_Extension", "30"),
        x("Dumbbell Curl (2-Way)", "Dumbbell_Alternate_Bicep_Curl", "15 (Each Arm)"),
      ], "Giant Circuit — no rest between rounds"),
    ],
  },
  {
    day: 28,
    title: "German Volume Training — Legs & Core",
    focus:
      "10 sets of 10 reps at the same weight per exercise. Start with a weight you could lift for 20 reps to failure — for most people that's about 60% of your 1-rep max.",
    blocks: [
      warmUp(),
      block(10, 60, [x("Dumbbell Walking Lunge", "Dumbbell_Lunges", "10 (Each Leg)")]),
      block(3, 60, [x("3-Way Crunch", "Crunches", "20/20/20", "20 straight, 20 to the right, 20 to the left")]),
      block(10, 60, [x("Barbell Back Squat", "Barbell_Squat", "10")]),
      block(10, 60, [x("Barbell Skull Crusher", "EZ-Bar_Skullcrusher", "10")]),
    ],
  },
  {
    day: 29,
    title: "Chest & Shoulders — German Volume",
    focus: "German Volume Training-style supersets — 10 sets of 10, 60s rest",
    blocks: [
      warmUp(),
      block(10, 60, [
        x("Wide-Grip Barbell Bench Press", "Wide-Grip_Barbell_Bench_Press", "10"),
        x("Dumbbell Lateral Raise", "Side_Lateral_Raise", "10"),
      ]),
      block(4, 60, [x("Jump Rope", "Rope_Jumping", "1 min")]),
      block(10, 60, [
        x("Plate Front Raise", "Front_Plate_Raise", "10"),
        x("Push-Up", "Pushups", "10"),
        x("Plate Chest Fly", "Svend_Press", "10"),
      ]),
    ],
  },
  {
    day: 30,
    title: "Full Body German Volume Circuit",
    focus:
      "German Volume Training targets one muscle group with high volume (ten sets of an exercise) so the body hypertrophies to cope with the load. Geared toward muscle growth, but it carries over to strength too.",
    blocks: [
      warmUp(),
      block(5, 30, [
        x("Bodyweight Pull-Up", "Pullups", "10"),
        x("Weighted Reverse Lunge (Plate)", "Dumbbell_Rear_Lunge", "10 (Each Leg)", "Hold a plate at your chest"),
      ]),
      block(5, 30, [
        x("Chin-Up (Half Rep)", "Chin-Up", "10", "Top half of the movement only"),
        x("Deficit Push-Up (Paused)", "Pushups", "10", "Hands on plates or dumbbells — pause at the bottom"),
      ]),
      block(5, 30, [
        x("Russian Twist", "Russian_Twist", "15 (Each Side)"),
        x("Plate Lateral Raise", "Side_Lateral_Raise", "10", "Hold a plate in each hand"),
      ]),
      block(5, 30, [
        x("Weighted Bodyweight Squat (Plate)", "Bodyweight_Squat", "15", "Hold a plate at your chest"),
        x("Dumbbell Row to Curl", "Bent_Over_Two-Dumbbell_Row", "10/10", "10 rows straight into 10 curls"),
      ]),
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
