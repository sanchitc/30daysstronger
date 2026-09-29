// ─── Ageless Strength — 30 days for 60+ ──────────────────────────────────────
//
// A gentler 30 days built on bodyweight and a light resistance band. The aim is
// mobility and muscle, in that order: every day opens with joint circles, ends
// with stretches, and the work in between grows a little each week.
//
//   Week 1  Foundations   2 rounds · 8-10 reps · 60s rest · wall and chair
//   Week 2  Add the band  2 rounds · 10-12 reps · bands on the legs, counter push-ups
//   Week 3  Build         3 rounds · 10-12 reps · single-leg work, longer holds
//   Week 4  Own it        3 rounds · 12-15 reps · 45s rest · combinations
//   Day 30  Re-test       Day 1's moves again, so you can feel the difference
//
// Rhythm: legs & balance, upper body & posture, core & mobility, and a Restore
// day (walk + stretch) on 7, 14, 21 and 28. Each training day keeps the moves
// from before and adds one or two new ones — the app tags those NEW.
//
// Same shape as plan.js. Ids are free-exercise-db entries; where the database
// only has a cable or dumbbell version, the note says how to do it with a band
// or bodyweight. The few moves the database doesn't have (balance holds,
// heel-to-toe walking) carry a one-line how-to instead.

// song: optional Spotify track, "spotify:track:<id>" or { uri, title }.
const x = (name, id, reps, note = null, song = null) =>
  song ? { name, id, reps, note, song } : { name, id, reps, note };
const block = (rounds, rest, exercises, label = null) => ({ label, rounds, rest, exercises });
const warmUp = (...exercises) => block(1, null, exercises, "Warm Up");
const coolDown = (...exercises) => block(1, null, exercises, "Cool Down");

// ── Moves used across the month ──────────────────────────────────────────────
// Kept in one place so a move reads the same every day it appears.

// Mobility
const shoulderCircles = (reps = "10 each way") => x("Shoulder Rolls", "Shoulder_Circles", reps);
const ankleCircles = (reps = "10 (Each Foot)") =>
  x("Ankle Circles", "Ankle_Circles", reps, "Hold a chair or counter for balance");
const pelvicTilt = (reps = "10") => x("Standing Pelvic Tilt", "Standing_Pelvic_Tilt", reps, "Soft knees; rock the hips gently forward and back");
const armSwings = (reps = "10") => x("Arm Swings", "Dynamic_Back_Stretch", reps, "Swing straight arms up in front, a little higher each time");
const kneeCircles = (reps = "10 each way") => x("Knee Circles", "Knee_Circles", reps, "Hands on thighs, small slow circles");
const legSwings = (reps = "8 (Each Leg)") =>
  x("Front Leg Swings", "Front_Leg_Raises", reps, "Hold a chair, small easy swings to start");
const sideSwings = (reps = "8 (Each Leg)") => x("Side Leg Swings", "Side_Leg_Raises", reps, "Hold a chair; swing across and out");
const hipCircles = (reps = "5 (Each Leg)") =>
  x("Standing Hip Circles", "Standing_Hip_Circles", reps, "Hold a chair, knee up, draw a slow circle");
const shrugs = (reps = "10") => x("Shoulder Shrugs", "Shoulder_Raise", reps, "Up to the ears, pause, then all the way down");
const elbowsBack = (reps = "8") => x("Elbows Back", "Elbows_Back", reps, "Hands on lower back, gently squeeze elbows toward each other");
const armCircles = (reps = "10 each way") => x("Arm Circles", "Arm_Circles", reps);
const catCow = (reps = "8") =>
  x("Cat-Cow", "Cat_Stretch", reps, "On hands and knees — or seated, hands on knees. Round the back, then gently arch.");

// Legs
const chairSquat = (reps, note = "Sit back to lightly touch a sturdy chair, then stand tall. Use your hands if you need them.") =>
  x("Chair Squat", "Bodyweight_Squat", reps, note);
const bridge = (reps, note = "On the floor or on your bed. Squeeze your seat and lift.") =>
  x("Glute Bridge", "Butt_Lift_Bridge", reps, note);
const calfRaise = (reps) =>
  x("Standing Calf Raise", "Standing_Dumbbell_Calf_Raise", reps, "Bodyweight, hands on a counter. Rise onto the balls of your feet, lower slowly.");
const legCurl = (reps) =>
  x("Standing Leg Curl", "Leg_Lift", reps, "Hold a chair and bring your heel toward your seat");
const bandAbduction = (reps) =>
  x("Band Side Leg Raise", "Band_Hip_Adductions", reps, "Band around the ankles or anchored low. Hold a chair, lift the leg out to the side.");
const stepUp = (reps, note = "Bottom stair, hand on the rail. Step up, stand tall, step down.") =>
  x("Step-Up", "Step-up_with_Knee_Raise", reps, note);
const stepUpKnee = (reps) =>
  x("Step-Up with Knee Lift", "Step-up_with_Knee_Raise", reps, "Bottom stair, hand on the rail. At the top, lift the free knee to hip height.");
const bandSquat = (reps, note = "Stand on the band, ends at your shoulders. Chair behind you as a depth guide.") =>
  x("Band Squat", "Squats_-_With_Bands", reps, note);
const goodMorning = (reps) =>
  x("Band Hip Hinge", "Band_Good_Morning", reps,
    "Stand on the band, hold the ends at your shoulders (not behind the neck). Push hips back with a flat back, then stand tall.");
const monsterWalk = (reps) =>
  x("Band Walk", "Monster_Walk", reps, "One light band around the knees. Short steps forward, then back.");
const reverseLunge = (reps) =>
  x("Supported Reverse Lunge", "Dumbbell_Rear_Lunge", reps,
    "Bodyweight, one hand on a counter. Step back and bend both knees only as far as feels good.");
const hipExtension = (reps) =>
  x("Band Leg Press-Back", "Hip_Extension_with_Bands", reps, "Band anchored low in front. Hold a chair, press the straight leg back.");
const bandCalfRaise = (reps) =>
  x("Band Calf Raise", "Calf_Raises_-_With_Bands", reps, "Stand on the band, ends at your shoulders, a counter within reach");
const singleLegBridge = (reps) =>
  x("Single-Leg Bridge", "Single_Leg_Glute_Bridge", reps, "Keep the other foot resting lightly on the floor until you're ready to lift it");
const bandHamCurl = (reps) =>
  x("Seated Band Leg Curl", "Seated_Band_Hamstring_Curl", reps, "Sit on a chair, band anchored low in front, heel pulls under the seat");
const kneeDrive = (reps) =>
  x("Band Knee Drive", "Hip_Flexion_with_Band", reps, "Band anchored low behind you. Hold a chair, lift the knee to hip height.");

// Upper body
const wallPushUp = (reps) =>
  x("Wall Push-Up", "Incline_Push-Up", reps, "Hands on the wall at chest height, feet a step back");
const counterPushUp = (reps) =>
  x("Counter Push-Up", "Incline_Push-Up", reps, "Hands on a sturdy kitchen counter — lower than the wall, so a little harder");
const closeCounterPushUp = (reps) =>
  x("Close-Grip Counter Push-Up", "Incline_Push-Up_Close-Grip", reps, "Hands close together on the counter, elbows brush your ribs");
const chairPushUp = (reps) =>
  x("Chair Push-Up", "Incline_Push-Up", reps, "Hands on the seat of a sturdy chair pushed against a wall. Stay on the counter if it's too much.");
const pullApart = (reps, note = "Light band, arms straight at chest height, squeeze the shoulder blades") =>
  x("Band Pull-Apart", "Band_Pull_Apart", reps, note);
const bandRow = (reps) =>
  x("Seated Band Row", "Seated_Cable_Rows", reps, "Sit tall, band around your feet. Pull elbows back and squeeze the shoulder blades.");
const bandPress = (reps) =>
  x("Band Shoulder Press", "Shoulder_Press_-_With_Bands", reps, "Stand or sit on the band, press up without shrugging");
const bandCurl = (reps) =>
  x("Band Biceps Curl", "Standing_Biceps_Cable_Curl", reps, "Stand on the band, elbows pinned to your sides");
const lateralRaise = (reps) =>
  x("Band Lateral Raise", "Lateral_Raise_-_With_Bands", reps, "Stand on the band, lift to shoulder height — no higher");
const externalRotation = (reps) =>
  x("Band External Rotation", "External_Rotation_with_Band", reps,
    "Band at elbow height, elbow tucked at your side, rotate the forearm outward. Great for shoulder health.");
const overheadTriceps = (reps) =>
  x("Band Overhead Triceps", "Speed_Band_Overhead_Triceps", reps, "Stand on the band, elbows by your ears. Slow and controlled.");
const chestPress = (reps) =>
  x("Band Chest Press", "Standing_Cable_Chest_Press", reps, "Band anchored behind you (door anchor or a post). Staggered stance.");
const reverseFly = (reps) =>
  x("Band Reverse Fly", "Back_Flyes_-_With_Bands", reps, "Band anchored in front at chest height; open the arms wide");
const hammerCurl = (reps) =>
  x("Band Hammer Curl", "Cable_Hammer_Curls_-_Rope_Attachment", reps, "Stand on the band, palms facing each other");
const chestFly = (reps) =>
  x("Band Chest Fly", "Cross_Over_-_With_Bands", reps, "Band anchored behind you; hug a big tree");
const highRow = (reps) =>
  x("Band High Row", "Kneeling_Single-Arm_High_Pulley_Row", reps, "Band anchored high on a door. Pull the elbow down to your ribs.");
const facePull = (reps) =>
  x("Band Face Pull", "Face_Pull", reps, "Band at eye height. Pull toward your face, elbows high, hands apart.");
const woodchop = (reps) =>
  x("Band Woodchop", "Standing_Cable_Wood_Chop", reps, "Band anchored high to your side. Slow, high to low, turning from the chest.");
const skullCrusher = (reps) =>
  x("Lying Band Triceps", "Band_Skull_Crusher", reps, "On the floor or bed, band anchored behind your head");

// Core
const deadBug = (reps, note = null) => x("Dead Bug", "Dead_Bug", reps, note);
const pallof = (reps) =>
  x("Band Pallof Press", "Pallof_Press", reps, "Band anchored at chest height to your side. Press straight out and don't let it twist you.");
const kneePlank = (reps) =>
  x("Plank", "Plank", reps, "On knees and forearms — or hands on a counter. Breathe the whole time.");
const sidePlank = (reps) =>
  x("Side Plank (Knees)", "Side_Bridge", reps, "On your forearm and knees, hips lifted");
const legReach = (reps) =>
  x("All-Fours Leg Reach", "Rear_Leg_Raises", reps, "On hands and knees, reach one leg back. Add the opposite arm forward if you feel steady.");
const hipCirclesFloor = (reps = "5 (Each Leg)") => x("All-Fours Hip Circles", "Hip_Circles_prone", reps);

// Balance — not in the database, so each one says how
const singleLegStand = (reps, note = "Stand tall beside a counter, fingertips on it, lift one foot an inch") =>
  x("Single-Leg Stand", null, reps, note);
const heelToe = (reps) =>
  x("Heel-to-Toe Walk", null, reps, "Walk beside a counter, placing each heel directly in front of the other toes");
const march = (reps) =>
  x("Standing March", null, reps, "Hold a counter, lift each knee toward hip height slowly");
const tandem = (reps) =>
  x("Tandem Stance", null, reps, "Stand with one foot directly in front of the other, hand near the counter. Swap feet halfway.");
const reachStand = (reps) =>
  x("Single-Leg Stand with Reach", null, reps, "On one leg by the counter, reach the free foot forward, to the side, then back");

// Stretches
const hamstringStretch = (reps = "30 sec (Each Leg)") =>
  x("Seated Hamstring Stretch", "Chair_Leg_Extended_Stretch", reps, "Sit on the edge of a chair, one leg straight, lean forward from the hips");
const calfStretch = (reps = "30 sec (Each Leg)") => x("Wall Calf Stretch", "Calf_Stretch_Hands_Against_Wall", reps);
const chestStretch = (reps = "30 sec") =>
  x("Chest & Shoulder Stretch", "Chest_And_Front_Of_Shoulder_Stretch", reps, "A towel or broom handle works; lift only as far as comfortable");
const hipFlexorStretch = (reps = "30 sec (Each Side)") => x("Standing Hip Flexor Stretch", "Standing_Hip_Flexors", reps);
const shoulderStretch = (reps = "20 sec (Each Arm)") => x("Cross-Body Shoulder Stretch", "Shoulder_Stretch", reps);
const tricepsStretch = (reps = "20 sec (Each Arm)") => x("Overhead Triceps Stretch", "Triceps_Stretch", reps);
const upperBackStretch = (reps = "20 sec") => x("Upper Back Stretch", "Upper_Back_Stretch", reps);
const neckStretch = (reps = "15 sec (Each Side)") => x("Side Neck Stretch", "Side_Neck_Stretch", reps, "Gentle — no pulling");
const kneesToChest = (reps = "30 sec") => x("Knees to Chest", "Hug_Knees_To_Chest", reps, "Hold under the knees");
const lyingTwist = (reps = "20 sec (Each Side)") => x("Lying Knee Across", "Knee_Across_The_Body", reps);
const childsPose = (reps = "30 sec") => x("Child's Pose", "Childs_Pose", reps, "Knees wide; a pillow under your hips helps");
const figureFour = (reps = "30 sec (Each Side)") =>
  x("Figure-4 Stretch", "Ankle_On_The_Knee", reps, "On your back, ankle over the opposite knee, draw both in");
const sideQuadStretch = (reps = "30 sec (Each Side)") => x("Side-Lying Quad Stretch", "On_Your_Side_Quad_Stretch", reps);
const bicepsStretch = (reps = "20 sec") => x("Standing Biceps Stretch", "Standing_Biceps_Stretch", reps);
const seatedTwist = (reps = "3 (Each Side)") =>
  x("Seated Spinal Twist", "Spinal_Stretch", reps, "Sit tall on a chair, turn slowly as far as is comfortable");
const sideBend = (reps = "20 sec (Each Side)") => x("Seated Side Bend", "Chair_Lower_Back_Stretch", reps);
const kneelingHipFlexor = (reps = "20 sec (Each Side)") =>
  x("Kneeling Hip Flexor Stretch", "Kneeling_Hip_Flexor", reps, "Cushion under the back knee");
const standingTwist = (reps = "15 sec (Each Side)") => x("Standing Waist Twist", "Middle_Back_Stretch", reps);
const lateralStretch = (reps = "5 (Each Side)") => x("Standing Side Stretch", "Standing_Lateral_Stretch", reps);
const upwardStretch = (reps = "20 sec") => x("Reach for the Sky", "Upward_Stretch", reps);

const walk = (reps, note = "Easy pace — outdoors, a mall, or laps of the house. You should be able to talk.") =>
  x("Easy Walk", "Trail_Running_Walking", reps, note);

const restoreDay = (day, walkTime, stretches, focus) => ({
  day,
  title: "Restore",
  focus,
  blocks: [
    warmUp(shoulderCircles(), ankleCircles(), armSwings()),
    block(1, null, [walk(walkTime)], "Walk"),
    block(1, null, stretches, "Stretch Flow"),
  ],
});

// ── The 30 days ──────────────────────────────────────────────────────────────

const DAYS = [
  // ── Week 1 — Foundations ──────────────────────────────────────────────────
  {
    day: 1,
    title: "First Steps",
    focus: "The five moves this month is built on. 2 easy rounds, 60s rest. Stop anything that hurts.",
    blocks: [
      warmUp(shoulderCircles(), ankleCircles(), pelvicTilt(), armSwings()),
      block(2, 60, [chairSquat("8"), wallPushUp("8"), bridge("8"), pullApart("10")], "Strength"),
      block(2, 30, [singleLegStand("15 sec (Each Leg)")], "Balance"),
      coolDown(hamstringStretch(), calfStretch(), chestStretch()),
    ],
  },
  {
    day: 2,
    title: "Legs & Balance",
    focus: "The legs that get you up the stairs. 2 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), sideSwings(), ankleCircles()),
      block(2, 60, [chairSquat("8"), calfRaise("10"), legCurl("8 (Each Leg)")], "Strength"),
      block(2, 60, [bridge("8"), bandAbduction("8 (Each Leg)")], "Hips"),
      block(2, 30, [singleLegStand("20 sec (Each Leg)"), heelToe("10 steps")], "Balance"),
      coolDown(hipFlexorStretch(), hamstringStretch(), calfStretch()),
    ],
  },
  {
    day: 3,
    title: "Upper Body & Posture",
    focus: "Stand taller: open the chest and strengthen the upper back. 2 rounds, 60s rest.",
    blocks: [
      warmUp(shoulderCircles(), shrugs(), elbowsBack(), neckStretch()),
      block(2, 60, [wallPushUp("8"), pullApart("10"), bandRow("10")], "Push & Pull"),
      block(2, 60, [bandPress("8"), bandCurl("10")], "Arms & Shoulders"),
      coolDown(chestStretch(), shoulderStretch(), tricepsStretch(), upperBackStretch()),
    ],
  },
  {
    day: 4,
    title: "Core & Mobility",
    focus: "A gentle flow for the spine and hips, then core work lying down. 2 rounds, 45s rest.",
    blocks: [
      warmUp(armSwings(), lateralStretch(), pelvicTilt()),
      block(2, 30, [catCow("8"), hipCirclesFloor(), childsPose("20 sec")], "Mobility Flow"),
      block(2, 45, [deadBug("6 (Each Side)", "Arms only this week if the legs are too much"), bridge("10")], "Core"),
      coolDown(kneesToChest(), lyingTwist(), seatedTwist()),
    ],
  },
  {
    day: 5,
    title: "Legs & Balance",
    focus: "Same pattern as Day 2 with a little more, plus the step-up. 2 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), hipCircles(), ankleCircles()),
      block(2, 60, [chairSquat("10"), stepUp("6 (Each Leg)"), calfRaise("12")], "Strength"),
      block(2, 60, [bridge("10", "Pause for 2 seconds at the top"), bandAbduction("10 (Each Leg)"), legCurl("10 (Each Leg)")], "Hips"),
      block(2, 30, [singleLegStand("20 sec (Each Leg)", "Try just one fingertip on the counter"), heelToe("12 steps")], "Balance"),
      coolDown(sideQuadStretch(), hamstringStretch(), figureFour()),
    ],
  },
  {
    day: 6,
    title: "Upper Body & Posture",
    focus: "Two new shoulder moves for healthy joints. 2 rounds, 60s rest.",
    blocks: [
      warmUp(armCircles(), shrugs(), elbowsBack()),
      block(2, 60, [wallPushUp("10"), bandRow("12"), externalRotation("10 (Each Arm)")], "Push & Pull"),
      block(2, 60, [bandPress("10"), lateralRaise("8"), bandCurl("10"), overheadTriceps("8")], "Arms & Shoulders"),
      coolDown(chestStretch(), bicepsStretch(), tricepsStretch()),
    ],
  },
  restoreDay(7, "15-20 min",
    [catCow("8"), childsPose(), kneesToChest(), hamstringStretch(), calfStretch(), chestStretch()],
    "Walk, stretch, breathe. Week 1 done — well done."),

  // ── Week 2 — Add the band ─────────────────────────────────────────────────
  {
    day: 8,
    title: "Full Body Check-In",
    focus: "Week 2: a little more of everything. Push-ups move from the wall to the counter. 2 rounds, 60s rest.",
    blocks: [
      warmUp(armSwings(), kneeCircles(), pelvicTilt(), legSwings()),
      block(2, 60, [chairSquat("12"), counterPushUp("8"), bandRow("12")], "Strength"),
      block(2, 60, [bridge("12"), pullApart("12"), calfRaise("12")], "Strength"),
      block(2, 30, [singleLegStand("25 sec (Each Leg)"), march("20 steps")], "Balance"),
      coolDown(hamstringStretch(), hipFlexorStretch(), chestStretch()),
    ],
  },
  {
    day: 9,
    title: "Legs & Balance",
    focus: "The band comes to leg day: squats and the hip hinge. 2 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), sideSwings(), hipCircles()),
      block(2, 60, [bandSquat("10"), stepUp("8 (Each Leg)"), goodMorning("10")], "Strength"),
      block(2, 60, [monsterWalk("10 steps each way"), bandAbduction("12 (Each Leg)")], "Hips"),
      block(2, 30, [singleLegStand("25 sec (Each Leg)", "Fix your eyes on a spot on the wall"), heelToe("15 steps")], "Balance"),
      coolDown(sideQuadStretch(), hamstringStretch(), figureFour()),
    ],
  },
  {
    day: 10,
    title: "Upper Body & Posture",
    focus: "Anchor the band and add the chest press and reverse fly. 2 rounds, 60s rest.",
    blocks: [
      warmUp(armCircles(), shoulderCircles(), elbowsBack()),
      block(2, 60, [chestPress("10"), bandRow("12"), reverseFly("10"), externalRotation("12 (Each Arm)")], "Push & Pull"),
      block(2, 60, [counterPushUp("10"), bandPress("10"), hammerCurl("10"), overheadTriceps("10")], "Arms & Shoulders"),
      coolDown(chestStretch(), shoulderStretch(), upperBackStretch()),
    ],
  },
  {
    day: 11,
    title: "Core & Mobility",
    focus: "New: the leg reach, the Pallof press and your first plank. 2 rounds, 45s rest.",
    blocks: [
      warmUp(armSwings(), lateralStretch(), standingTwist()),
      block(2, 30, [catCow("10"), hipCirclesFloor("6 (Each Leg)"), legReach("6 (Each Side)")], "Mobility Flow"),
      block(2, 45, [deadBug("8 (Each Side)"), pallof("8 (Each Side)"), kneePlank("15 sec")], "Core"),
      coolDown(childsPose(), lyingTwist(), kneesToChest()),
    ],
  },
  {
    day: 12,
    title: "Legs & Balance",
    focus: "The supported lunge joins in. 2 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), hipCircles(), ankleCircles()),
      block(2, 60, [bandSquat("12"), reverseLunge("6 (Each Leg)"), goodMorning("12")], "Strength"),
      block(2, 60, [hipExtension("10 (Each Leg)"), monsterWalk("12 steps each way"), bandCalfRaise("12")], "Hips & Calves"),
      block(2, 30, [
        singleLegStand("20 sec (Each Leg)", "Now slowly turn your head side to side as you balance"),
        heelToe("15 steps"),
      ], "Balance"),
      coolDown(hipFlexorStretch(), hamstringStretch(), calfStretch()),
    ],
  },
  {
    day: 13,
    title: "Upper Body & Posture",
    focus: "Chest fly, high row and face pull — the posture trio. 2 rounds, 60s rest.",
    blocks: [
      warmUp(armCircles(), shrugs(), neckStretch()),
      block(2, 60, [counterPushUp("12"), chestPress("12"), chestFly("10")], "Push"),
      block(2, 60, [highRow("10 (Each Arm)"), bandRow("12"), facePull("10")], "Pull"),
      block(2, 45, [lateralRaise("10"), bandCurl("12")], "Arms & Shoulders"),
      coolDown(chestStretch(), shoulderStretch(), bicepsStretch()),
    ],
  },
  restoreDay(14, "20-25 min",
    [catCow("10"), childsPose(), figureFour(), sideBend(), hamstringStretch(), calfStretch(), upwardStretch()],
    "Two weeks in. A longer walk and a longer stretch."),

  // ── Week 3 — Build ────────────────────────────────────────────────────────
  {
    day: 15,
    title: "Full Body Builder",
    focus: "Week 3 goes to 3 rounds. Slow the squat down and add the band to the bridge. 60s rest.",
    blocks: [
      warmUp(armSwings(), kneeCircles(), pelvicTilt(), hipCircles()),
      block(3, 60, [chairSquat("10", "3 seconds down to the chair, 1 second up"), counterPushUp("10"), bandRow("12")], "Strength"),
      block(3, 60, [
        x("Band Glute Bridge", "Hip_Lift_with_Band", "12", "Band across your hips, ends pinned under your hands"),
        pullApart("15"),
        bandCalfRaise("15"),
      ], "Strength"),
      block(2, 30, [singleLegStand("30 sec (Each Leg)"), march("30 steps")], "Balance"),
      coolDown(hamstringStretch(), hipFlexorStretch(), chestStretch()),
    ],
  },
  {
    day: 16,
    title: "Legs & Balance",
    focus: "The step-up gets a knee lift and the band drives the knee. 3 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), sideSwings(), ankleCircles()),
      block(3, 60, [bandSquat("12"), stepUpKnee("8 (Each Leg)"), goodMorning("12")], "Strength"),
      block(3, 60, [reverseLunge("8 (Each Leg)"), kneeDrive("10 (Each Leg)"), bandAbduction("12 (Each Leg)")], "Hips"),
      block(2, 30, [tandem("30 sec"), heelToe("20 steps")], "Balance"),
      coolDown(sideQuadStretch(), kneelingHipFlexor(), hamstringStretch()),
    ],
  },
  {
    day: 17,
    title: "Upper Body & Posture",
    focus: "Close-grip push-ups for the triceps. 3 rounds on the big moves, 60s rest.",
    blocks: [
      warmUp(armCircles(), shoulderCircles(), elbowsBack()),
      block(3, 60, [closeCounterPushUp("8"), chestPress("12"), chestFly("12")], "Push"),
      block(3, 60, [highRow("10 (Each Arm)"), facePull("12"), externalRotation("12 (Each Arm)")], "Pull"),
      block(2, 45, [bandPress("12"), bandCurl("12"), overheadTriceps("12")], "Arms & Shoulders"),
      coolDown(chestStretch(), tricepsStretch(), upperBackStretch()),
    ],
  },
  {
    day: 18,
    title: "Core & Mobility",
    focus: "The side plank arrives, and the hips open further. 3 rounds of core, 45s rest.",
    blocks: [
      warmUp(armSwings(), lateralStretch(), standingTwist(), pelvicTilt()),
      block(2, 30, [catCow("10"), legReach("8 (Each Side)"), kneelingHipFlexor()], "Mobility Flow"),
      block(3, 45, [deadBug("10 (Each Side)"), pallof("10 (Each Side)"), kneePlank("20 sec"), sidePlank("15 sec (Each Side)")], "Core"),
      coolDown(childsPose(), figureFour(), seatedTwist()),
    ],
  },
  {
    day: 19,
    title: "Legs & Balance",
    focus: "One leg at a time: the single-leg bridge and the band leg curl. 3 rounds, 60s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), hipCircles(), ankleCircles()),
      block(3, 60, [singleLegBridge("6 (Each Leg)"), bandSquat("15"), bandHamCurl("12")], "Strength"),
      block(3, 60, [reverseLunge("10 (Each Leg)"), monsterWalk("15 steps each way"), bandCalfRaise("15")], "Hips & Calves"),
      block(2, 30, [tandem("30 sec"), reachStand("3 reaches each way (Each Leg)")], "Balance"),
      coolDown(sideQuadStretch(), hamstringStretch(), calfStretch()),
    ],
  },
  {
    day: 20,
    title: "Upper Body & Posture",
    focus: "The woodchop brings in rotation; triceps work goes to the floor. 3 rounds, 60s rest.",
    blocks: [
      warmUp(armCircles(), shrugs(), neckStretch()),
      block(3, 60, [closeCounterPushUp("10"), chestFly("12"), bandRow("15")], "Push & Pull"),
      block(3, 60, [woodchop("8 (Each Side)"), lateralRaise("12"), facePull("12")], "Shoulders & Rotation"),
      block(2, 45, [hammerCurl("12"), skullCrusher("10")], "Arms"),
      coolDown(chestStretch(), shoulderStretch(), bicepsStretch()),
    ],
  },
  restoreDay(21, "25 min",
    [catCow("10"), childsPose(), kneelingHipFlexor(), figureFour(), sideBend(), shoulderStretch(), upwardStretch()],
    "Three weeks strong. Walk a little further than last week."),

  // ── Week 4 — Own it ───────────────────────────────────────────────────────
  {
    day: 22,
    title: "Full Body Strength",
    focus: "Week 4: 3 rounds of 12-15, rest drops to 45s. You're ready.",
    blocks: [
      warmUp(armSwings(), kneeCircles(), pelvicTilt(), legSwings()),
      block(3, 45, [bandSquat("15"), counterPushUp("12"), bandRow("15")], "Strength"),
      block(3, 45, [singleLegBridge("8 (Each Leg)"), pullApart("15"), stepUpKnee("10 (Each Leg)")], "Strength"),
      block(2, 30, [tandem("40 sec"), reachStand("5 reaches each way (Each Leg)")], "Balance"),
      coolDown(
        x("Standing Hamstring & Calf Stretch", "Standing_Hamstring_and_Calf_Stretch", "30 sec (Each Leg)", "Heel forward, toes up, hinge gently from the hips"),
        hipFlexorStretch(),
        chestStretch(),
      ),
    ],
  },
  {
    day: 23,
    title: "Legs & Balance",
    focus: "Combine moves: squat into a calf raise, walk sideways, hold the step-up. 3 rounds, 45s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), sideSwings(), hipCircles()),
      block(3, 45, [
        x("Band Squat to Calf Raise", "Squats_-_With_Bands", "12", "Stand all the way up, then rise onto your toes"),
        reverseLunge("10 (Each Leg)"),
        goodMorning("15"),
      ], "Strength"),
      block(3, 45, [
        x("Side Band Walk", "Monster_Walk", "10 steps each way", "Band around the knees, stay a little low, step sideways"),
        hipExtension("12 (Each Leg)"),
        bandHamCurl("15"),
      ], "Hips"),
      block(2, 30, [
        stepUp("5 (Each Leg)", "Step up, lift the knee and hold it there for 3 seconds before stepping down"),
      ], "Balance"),
      coolDown(sideQuadStretch(), kneelingHipFlexor(), figureFour()),
    ],
  },
  {
    day: 24,
    title: "Upper Body & Posture",
    focus: "Push-ups go lower to a chair; the pull-apart goes diagonal. 3 rounds, 45s rest.",
    blocks: [
      warmUp(armCircles(), shoulderCircles(), elbowsBack()),
      block(3, 45, [chairPushUp("8"), chestPress("15"), bandRow("15")], "Push & Pull"),
      block(3, 45, [
        bandPress("12"),
        facePull("15"),
        x("Diagonal Pull-Apart", "Band_Pull_Apart", "10 (Each Side)", "One hand high, one low — pull apart, then swap"),
      ], "Shoulders"),
      block(2, 45, [bandCurl("15"), overheadTriceps("12"), externalRotation("15 (Each Arm)")], "Arms"),
      coolDown(chestStretch(), tricepsStretch(), upperBackStretch()),
    ],
  },
  {
    day: 25,
    title: "Core & Mobility",
    focus: "The Pallof press turns, and the bridge marches. 3 rounds, 45s rest.",
    blocks: [
      warmUp(armSwings(), lateralStretch(), standingTwist(), pelvicTilt()),
      block(2, 30, [catCow("10"), hipCirclesFloor("8 (Each Leg)"), legReach("10 (Each Side)"), childsPose("20 sec")], "Mobility Flow"),
      block(3, 45, [
        deadBug("12 (Each Side)"),
        x("Pallof Press with Turn", "Pallof_Press_With_Rotation", "8 (Each Side)", "Press out, then turn slowly away from the anchor and back"),
        sidePlank("20 sec (Each Side)"),
        x("Bridge March", "Butt_Lift_Bridge", "8 (Each Leg)", "Hold the bridge up, lift one foot a few inches, then the other"),
      ], "Core"),
      coolDown(kneesToChest(), lyingTwist(), seatedTwist(), sideBend()),
    ],
  },
  {
    day: 26,
    title: "Legs & Balance",
    focus: "Everything you've built, at its best. 3 rounds, 45s rest.",
    blocks: [
      warmUp(kneeCircles(), legSwings(), hipCircles(), ankleCircles()),
      block(3, 45, [singleLegBridge("10 (Each Leg)"), bandSquat("15", "Pause for 2 seconds at the bottom"), stepUpKnee("12 (Each Leg)")], "Strength"),
      block(3, 45, [reverseLunge("12 (Each Leg)"), bandAbduction("15 (Each Leg)"), bandCalfRaise("20")], "Hips & Calves"),
      block(2, 30, [
        x("Backward Heel-to-Toe Walk", null, "10 steps", "Beside a counter, place each toe directly behind the other heel"),
        reachStand("5 reaches each way (Each Leg)"),
      ], "Balance"),
      coolDown(sideQuadStretch(), hamstringStretch(), calfStretch()),
    ],
  },
  {
    day: 27,
    title: "Upper Body & Posture",
    focus: "Last upper-body day. 3 rounds, 45s rest.",
    blocks: [
      warmUp(armCircles(), shrugs(), neckStretch()),
      block(3, 45, [chairPushUp("10"), chestFly("15"), highRow("12 (Each Arm)")], "Push & Pull"),
      block(3, 45, [woodchop("10 (Each Side)"), lateralRaise("12"), reverseFly("15")], "Shoulders & Rotation"),
      block(2, 45, [
        hammerCurl("15"),
        skullCrusher("12"),
        x("Palm Press", "Isometric_Chest_Squeezes", "20 sec", "Press the palms together hard in front of your chest, breathing steadily"),
        pullApart("20"),
      ], "Arms"),
      coolDown(chestStretch(), shoulderStretch(), bicepsStretch()),
    ],
  },
  restoreDay(28, "30 min",
    [catCow("10"), childsPose(), kneelingHipFlexor(), figureFour(), lyingTwist(), hamstringStretch(), calfStretch(), chestStretch()],
    "Your longest walk of the month, then the full stretch flow."),
  {
    day: 29,
    title: "Full Body Finale",
    focus: "One big circuit of your strongest moves. 3 rounds, 45s rest between rounds.",
    blocks: [
      warmUp(armSwings(), kneeCircles(), pelvicTilt(), legSwings(), shoulderCircles()),
      block(3, 45, [
        bandSquat("15"),
        chairPushUp("12"),
        bandRow("15"),
        singleLegBridge("10 (Each Leg)"),
        pallof("10 (Each Side)"),
        facePull("15"),
        stepUpKnee("10 (Each Leg)"),
      ], "Circuit"),
      block(2, 30, [tandem("45 sec"), reachStand("5 reaches each way (Each Leg)")], "Balance"),
      coolDown(hamstringStretch(), hipFlexorStretch(), chestStretch()),
    ],
  },
  {
    day: 30,
    title: "Day 30: Feel the Difference",
    focus: "Day 1's moves again — now 3 rounds with nearly double the reps. Notice how much easier they feel.",
    blocks: [
      warmUp(shoulderCircles(), ankleCircles(), pelvicTilt(), armSwings()),
      block(3, 60, [
        chairSquat("15", "Day 1: 8 reps. Try it without using your hands."),
        wallPushUp("15"),
        bridge("15", "Day 1: 8 reps"),
        pullApart("20", "Day 1: 10 reps"),
      ], "Strength"),
      block(2, 30, [singleLegStand("30 sec (Each Leg)", "Day 1: 15 seconds. Hover your hand just above the counter.")], "Balance"),
      coolDown(hamstringStretch(), calfStretch(), chestStretch()),
    ],
  },
];

export default DAYS;
