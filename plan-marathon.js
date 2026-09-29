// ─── Marathon Final 30 — the last month before race day ──────────────────────
//
// Thirty days is not enough to build a marathoner from scratch, so this is the
// block that sits at the end of a training cycle: one peak fortnight, a
// three-week taper, and the race itself on Day 30. It assumes you can already
// run 13-15 mi (20-25 km) and have been running 25-35 mi (40-55 km) a week.
//
//   Week 1  Build       Intervals, tempo and an 18 mi long run
//   Week 2  Peak        Marathon-pace work and the 20 mi long run on Day 14
//   Week 3  Taper       Volume drops ~25%, the intensity stays
//   Week 4  Race week   Short, sharp, rested — race on Day 30
//
// Every run day opens with the same drill warm-up and ends with stretches.
// Strength is two short sessions (A: legs, B: hips & core) that thin out as
// the race gets close. Rest days are "Rest & Roll": foam roller and mobility,
// so every day still has boxes to tick.
//
// Paces are by feel so the plan fits any goal time:
//   Easy       conversational, you could talk in full sentences
//   MP         your goal marathon pace
//   Threshold  comfortably hard, the pace you could hold for about an hour
//   10K        your current 10K race pace
//   Strides    ~20 sec quick and relaxed, full walk back between
//
// Same shape as plan.js. Runs, drills and race-day steps aren't exercises the
// database has, so they carry id: null and a note saying what to do.

const x = (name, id, reps, note = null) => ({ name, id, reps, note });
const block = (rounds, rest, exercises, label = null) => ({ label, rounds, rest, exercises });
const warmUp = (...exercises) => block(1, null, exercises, "Warm Up");
const coolDown = (...exercises) => block(1, null, exercises, "Cool Down");

// "8 mi · 13 km"
const dist = (mi) => `${mi} mi · ${Math.round(mi * 1.609)} km`;

// ── Runs ─────────────────────────────────────────────────────────────────────

const easyRun = (mi, note = "Conversational pace. If you can't talk, slow down.") =>
  x("Easy Run", null, dist(mi), note);
const recoveryRun = (mi) =>
  x("Recovery Run", null, dist(mi), "Slower than easy. Its only job is to loosen the legs.");
const longRun = (mi, note) => x("Long Run", null, dist(mi), note);
const joggingWarmUp = (mi) => x("Warm-Up Jog", null, dist(mi), "Easy, building to a steady pace by the end");
const joggingCoolDown = (mi) => x("Cool-Down Jog", null, dist(mi), "Easy, let the heart rate settle");
const strides = (n = 6) =>
  x("Strides", null, `${n} × 20 sec`,
    "Build to about 90% of top speed, stay relaxed and tall, walk back to recover between each");

// ── Drills (run-day warm-up) ─────────────────────────────────────────────────

const legSwings = () => x("Front Leg Swings", "Front_Leg_Raises", "10 (Each Leg)", "Hold a wall or fence, easy swings that grow bigger");
const sideSwings = () => x("Side Leg Swings", "Side_Leg_Raises", "10 (Each Leg)", "Swing across the body and out");
const walkingLunge = () => x("Walking Lunge", "Bodyweight_Walking_Lunge", "10 (Each Leg)", "Tall chest, reach the arms up on each step");
const highKnees = () => x("High Knees", null, "20 m", "Quick feet, knees to hip height, stay on the balls of your feet");
const buttKicks = () => x("Butt Kicks", null, "20 m", "Heels flick up toward your seat, quick and light");
const aSkips = () => x("A-Skips", "Fast_Skipping", "20 m", "Skip with a high knee drive and an opposite-arm swing, land under your hips");
const carioca = () => x("Carioca", "Carioca_Quick_Step", "20 m (Each Way)", "Sideways, crossing the trailing foot in front then behind. Loosens the hips.");

const drills = () => warmUp(legSwings(), sideSwings(), walkingLunge(), highKnees(), buttKicks(), aSkips());
const shortDrills = () => warmUp(legSwings(), sideSwings(), walkingLunge());

// ── Strength ─────────────────────────────────────────────────────────────────

const splitSquat = (reps) =>
  x("Rear-Foot-Elevated Split Squat", "Split_Squat_with_Dumbbells", reps,
    "Back foot on a bench or step. Bodyweight, or hold dumbbells once it's easy.");
const singleLegRdl = (reps) =>
  x("Single-Leg Romanian Deadlift", "Romanian_Deadlift", reps,
    "One leg, bodyweight or a light dumbbell. Hinge until the back leg is level with your hips, flat back.");
const stepUp = (reps) =>
  x("Step-Up with Knee Drive", "Step-up_with_Knee_Raise", reps, "Knee-height step. Drive up through the heel, finish with the free knee high.");
const calfRaise = (reps) =>
  x("Single-Leg Calf Raise", "Standing_Dumbbell_Calf_Raise", reps,
    "One foot on the edge of a step, hand on the wall. Full stretch at the bottom, 1 sec up, 3 sec down.");
const soleusRaise = (reps) =>
  x("Bent-Knee Calf Raise", "Dumbbell_Seated_One-Leg_Calf_Raise", reps,
    "Standing, knee bent about 30°, rise onto the toes. Trains the soleus that carries you late in the race.");
const lateralBound = (reps) =>
  x("Lateral Bound", "Lateral_Bound", reps, "Leap sideways from one foot to the other, stick each landing for a second");
const pogoHops = (reps) =>
  x("Pogo Hops", null, reps, "Small, quick hops on both feet with stiff ankles. Spend as little time on the ground as possible.");
const tibRaise = (reps) =>
  x("Tibialis Raise", null, reps, "Back against a wall, heels a foot out. Lift the toes up high, lower slowly. Helps with shin splints.");

const singleLegBridge = (reps) =>
  x("Single-Leg Glute Bridge", "Single_Leg_Glute_Bridge", reps, "Drive through the heel, keep the hips level");
const clamshell = (reps) =>
  x("Clamshell", null, reps, "On your side, knees bent, feet together. Open the top knee without rolling back.");
const sidePlank = (reps) => x("Side Plank", "Side_Bridge", reps, "Straight line from head to feet");
const deadBug = (reps) => x("Dead Bug", "Dead_Bug", reps, "Low back pressed into the floor the whole time");
const birdDog = (reps) =>
  x("Bird Dog", "Rear_Leg_Raises", reps, "On hands and knees, reach one arm forward and the opposite leg back. Hold 2 sec.");
const plank = (reps) => x("Plank", "Plank", reps);
const glutePushback = (reps) => x("Glute Kickback", "Glute_Kickback", reps, "On all fours, press the heel up toward the ceiling");

// ── Stretches & foam roller ──────────────────────────────────────────────────

const runnersStretch = () => x("Runner's Stretch", "Runners_Stretch", "30 sec (Each Leg)");
const hipFlexor = () => x("Standing Hip Flexor Stretch", "Standing_Hip_Flexors", "30 sec (Each Side)");
const calfStretch = () => x("Wall Calf Stretch", "Calf_Stretch_Hands_Against_Wall", "30 sec (Each Leg)", "Straight back knee, then bend it slightly for the lower calf");
const figureFour = () => x("Figure-4 Stretch", "Ankle_On_The_Knee", "30 sec (Each Side)", "On your back, ankle over the opposite knee, draw both in");
const itBand = () => x("IT Band & Glute Stretch", "IT_Band_and_Glute_Stretch", "30 sec (Each Leg)", "A belt or towel around the foot, leg across the body");
const hamCalf = () => x("Standing Hamstring & Calf Stretch", "Standing_Hamstring_and_Calf_Stretch", "30 sec (Each Leg)");
const worldsGreatest = () => x("World's Greatest Stretch", "Worlds_Greatest_Stretch", "5 (Each Side)", "Slow, breathe into each position");
const quadStretch = () => x("Side-Lying Quad Stretch", "On_Your_Side_Quad_Stretch", "30 sec (Each Side)");
const childsPose = () => x("Child's Pose", "Childs_Pose", "45 sec");
const catCow = () => x("Cat-Cow", "Cat_Stretch", "10");
const hipCircles = () => x("All-Fours Hip Circles", "Hip_Circles_prone", "8 (Each Leg)");

const rollCalves = () => x("Foam Roll: Calves", "Calves-SMR", "60 sec (Each Leg)", "Pause on tender spots and point/flex the foot");
const rollQuads = () => x("Foam Roll: Quads", "Quadriceps-SMR", "60 sec (Each Leg)");
const rollHams = () => x("Foam Roll: Hamstrings", "Hamstring-SMR", "60 sec (Each Leg)");
const rollItBand = () => x("Foam Roll: Outer Thigh", "Iliotibial_Tract-SMR", "45 sec (Each Leg)", "Gentle here: roll the side of the thigh, not the knee");
const rollGlutes = () => x("Foam Roll: Glutes", "Piriformis-SMR", "60 sec (Each Side)");
const rollFeet = () => x("Roll the Feet", "Foot-SMR", "60 sec (Each Foot)", "Tennis or lacrosse ball under the arch");
const rollShins = () => x("Foam Roll: Shins", "Anterior_Tibialis-SMR", "45 sec (Each Leg)");

const runCoolDown = () => coolDown(runnersStretch(), hipFlexor(), calfStretch(), figureFour());

// ── Day shapes ───────────────────────────────────────────────────────────────

// Rest & Roll: no running, 15-20 minutes on the floor.
const restDay = (day, focus, extra = []) => ({
  day,
  title: "Rest & Roll",
  focus,
  blocks: [
    block(1, null, [rollCalves(), rollQuads(), rollHams(), rollGlutes(), rollFeet()], "Foam Roller"),
    block(1, null, [catCow(), hipCircles(), worldsGreatest(), childsPose(), ...extra], "Mobility"),
  ],
});

// Strength A — legs and springs
const strengthA = (rounds, rest, reps) =>
  block(rounds, rest, [
    splitSquat(reps.split),
    singleLegRdl(reps.rdl),
    calfRaise(reps.calf),
    ...(reps.plyo ? [reps.plyo] : []),
  ], "Strength A · Legs");

// Strength B — hips and core
const strengthB = (rounds, rest, reps) =>
  block(rounds, rest, [
    singleLegBridge(reps.bridge),
    clamshell(reps.clam),
    sidePlank(reps.side),
    deadBug(reps.bug),
    ...(reps.extra || []),
  ], "Strength B · Hips & Core");

// ── The 30 days ──────────────────────────────────────────────────────────────

const DAYS = [
  // ── Week 1 — Build ────────────────────────────────────────────────────────
  {
    day: 1,
    title: "Easy + Strides",
    focus: "Settle in. An easy run, then strides to wake the legs up. Learn the drill warm-up: you'll use it all month.",
    blocks: [
      drills(),
      block(1, null, [easyRun(5), strides(6)], "Run"),
      runCoolDown(),
    ],
  },
  {
    day: 2,
    title: "Strength A + B",
    focus: "No running. Both strength sessions, done properly: single-leg work is what keeps your form together at mile 20. 3 rounds, 60s rest.",
    blocks: [
      shortDrills(),
      strengthA(3, 60, { split: "8 (Each Leg)", rdl: "8 (Each Leg)", calf: "12 (Each Leg)", plyo: lateralBound("6 (Each Side)") }),
      strengthB(3, 45, { bridge: "10 (Each Leg)", clam: "15 (Each Side)", side: "30 sec (Each Side)", bug: "8 (Each Side)" }),
      coolDown(quadStretch(), figureFour(), childsPose()),
    ],
  },
  {
    day: 3,
    title: "800s",
    focus: "The week's speed session: 6 × 800 m at 10K pace, 400 m easy jog between. Even splits, the last one no faster than the first.",
    blocks: [
      drills(),
      block(1, null, [joggingWarmUp(2), strides(4)], "Warm-Up Run"),
      block(6, 150, [
        x("800 m Repeat", null, "800 m", "10K pace. Jog 400 m (about 2-3 min) before the next."),
      ], "Intervals"),
      block(1, null, [joggingCoolDown(1.5)], "Cool-Down Run"),
      runCoolDown(),
    ],
  },
  {
    day: 4,
    title: "Easy + Strength B",
    focus: "An easy run to absorb yesterday, then the hips and core.",
    blocks: [
      shortDrills(),
      block(1, null, [easyRun(5)], "Run"),
      strengthB(2, 45, { bridge: "10 (Each Leg)", clam: "15 (Each Side)", side: "30 sec (Each Side)", bug: "8 (Each Side)", extra: [birdDog("8 (Each Side)")] }),
      runCoolDown(),
    ],
  },
  {
    day: 5,
    title: "Tempo",
    focus: "4 miles at threshold: comfortably hard, controlled breathing. You should finish feeling you had one more mile in you.",
    blocks: [
      drills(),
      block(1, null, [
        joggingWarmUp(1.5),
        x("Tempo", null, dist(4), "Threshold pace, steady from start to finish"),
        joggingCoolDown(1.5),
      ], "Run"),
      coolDown(runnersStretch(), hipFlexor(), itBand(), calfStretch()),
    ],
  },
  restDay(6,"Legs up before the long run. Roll, stretch, eat well and go to bed early."),
  {
    day: 7,
    title: "Long Run: 18",
    focus: "The first big one. Easy for 16, then the last 2 at marathon pace. Practise race fuel: a gel or chews every 30-40 minutes.",
    blocks: [
      shortDrills(),
      block(1, null, [
        longRun(16, "Easy. Start slower than you think you should."),
        x("Marathon-Pace Finish", null, dist(2), "Goal marathon pace on tired legs. This is the rehearsal."),
      ], "Long Run"),
      block(1, null, [
        x("Fuel Practice", null, "every 30-40 min", "Take exactly what you'll use on race day, with water"),
      ], "Fuel"),
      coolDown(runnersStretch(), hamCalf(), figureFour(), quadStretch()),
    ],
  },

  // ── Week 2 — Peak ─────────────────────────────────────────────────────────
  {
    day: 8,
    title: "Recovery",
    focus: "Slow miles after the long run, then 10 minutes with the roller.",
    blocks: [
      shortDrills(),
      block(1, null, [recoveryRun(4)], "Run"),
      block(1, null, [rollCalves(), rollQuads(), rollItBand()], "Foam Roller"),
      runCoolDown(),
    ],
  },
  {
    day: 9,
    title: "Strength A + B",
    focus: "Same sessions as Day 2, a little heavier. Pogo hops replace the bounds: quick, stiff ankles like the last miles of a race. 3 rounds.",
    blocks: [
      shortDrills(),
      strengthA(3, 60, { split: "10 (Each Leg)", rdl: "10 (Each Leg)", calf: "15 (Each Leg)", plyo: pogoHops("3 × 20 sec") }),
      strengthB(3, 45, { bridge: "12 (Each Leg)", clam: "20 (Each Side)", side: "40 sec (Each Side)", bug: "10 (Each Side)", extra: [soleusRaise("15 (Each Leg)")] }),
      coolDown(quadStretch(), figureFour(), childsPose()),
    ],
  },
  {
    day: 10,
    title: "Marathon Pace",
    focus: "7 miles at goal pace, bookended by easy running. Lock the rhythm in. Take one gel at halfway.",
    blocks: [
      drills(),
      block(1, null, [
        joggingWarmUp(2),
        x("Marathon Pace", null, dist(7), "Goal pace. Check it every mile; don't bank time."),
        joggingCoolDown(1),
      ], "Run"),
      runCoolDown(),
    ],
  },
  {
    day: 11,
    title: "Easy + Strides",
    focus: "Easy mileage and some leg speed. Add the carioca to the drills.",
    blocks: [
      warmUp(legSwings(), sideSwings(), walkingLunge(), highKnees(), buttKicks(), aSkips(), carioca()),
      block(1, null, [easyRun(6), strides(6)], "Run"),
      runCoolDown(),
    ],
  },
  {
    day: 12,
    title: "1K Repeats",
    focus: "5 × 1 km at 10K pace, 2 minutes' easy jog between. The last hard workout before the peak long run.",
    blocks: [
      drills(),
      block(1, null, [joggingWarmUp(2), strides(4)], "Warm-Up Run"),
      block(5, 120, [
        x("1 km Repeat", null, "1 km", "10K pace. Jog 2 min between."),
      ], "Intervals"),
      block(1, null, [joggingCoolDown(1.5)], "Cool-Down Run"),
      runCoolDown(),
    ],
  },
  restDay(13, "The big one is tomorrow. Roll, stretch, lay out your kit and fuel tonight.", [itBand()]),
  {
    day: 14,
    title: "Long Run: 20 (Peak)",
    focus: "The longest run of the month and the peak of your training. All easy — the goal is time on your feet, not pace. Rehearse race fuel, kit and breakfast.",
    blocks: [
      shortDrills(),
      block(1, null, [
        longRun(20, "Easy all the way. If you feel great at 16, hold it there anyway."),
      ], "Long Run"),
      block(1, null, [
        x("Fuel Practice", null, "every 30-40 min", "Race-day gels and drinks, same timing you'll use in the race"),
        x("Kit Check", null, null, "Race shoes, socks, shorts and top. Note anything that rubs."),
      ], "Race Rehearsal"),
      coolDown(runnersStretch(), hamCalf(), figureFour(), quadStretch()),
    ],
  },

  // ── Week 3 — Taper ────────────────────────────────────────────────────────
  restDay(15, "The hard training is done. From here, less running and more rest: the fitness is in the bank, the taper lets it show.", [itBand()]),
  {
    day: 16,
    title: "Recovery + Strength B",
    focus: "Easy miles and a lighter strength session: 2 rounds from here on.",
    blocks: [
      shortDrills(),
      block(1, null, [recoveryRun(4)], "Run"),
      strengthB(2, 45, { bridge: "12 (Each Leg)", clam: "20 (Each Side)", side: "40 sec (Each Side)", bug: "10 (Each Side)", extra: [tibRaise("15")] }),
      runCoolDown(),
    ],
  },
  {
    day: 17,
    title: "Cruise Miles",
    focus: "4 × 1 mile at threshold, 1 minute jog between. Less volume than last week, same intensity. Stay smooth.",
    blocks: [
      drills(),
      block(1, null, [joggingWarmUp(1.5)], "Warm-Up Run"),
      block(4, 60, [
        x("Mile Repeat", null, dist(1), "Threshold pace. Jog 1 min between."),
      ], "Intervals"),
      block(1, null, [joggingCoolDown(1.5)], "Cool-Down Run"),
      runCoolDown(),
    ],
  },
  {
    day: 18,
    title: "Easy + Strength A",
    focus: "An easy run, then the last proper leg session: 2 rounds, no plyometrics.",
    blocks: [
      shortDrills(),
      block(1, null, [easyRun(5), strides(4)], "Run"),
      strengthA(2, 60, { split: "8 (Each Leg)", rdl: "8 (Each Leg)", calf: "12 (Each Leg)" }),
      runCoolDown(),
    ],
  },
  restDay(19, "Rest. If the taper makes you restless, that's normal: it means it's working."),
  {
    day: 20,
    title: "Marathon Pace",
    focus: "5 miles at goal pace. It should feel easier than Day 10. That's the taper at work.",
    blocks: [
      drills(),
      block(1, null, [
        joggingWarmUp(1.5),
        x("Marathon Pace", null, dist(5), "Goal pace, relaxed shoulders, even effort"),
        joggingCoolDown(1.5),
      ], "Run"),
      runCoolDown(),
    ],
  },
  {
    day: 21,
    title: "Long Run: 12",
    focus: "The last long run. Easy for 9, the last 3 at marathon pace. Rehearse race morning: same wake-up time, same breakfast.",
    blocks: [
      shortDrills(),
      block(1, null, [
        longRun(9, "Easy"),
        x("Marathon-Pace Finish", null, dist(3), "Goal pace. Notice how controlled it feels now."),
      ], "Long Run"),
      block(1, null, [
        x("Race-Morning Rehearsal", null, null, "Breakfast 3 hours before, same food and coffee you'll have on race day"),
        x("Fuel Practice", null, "every 30-40 min"),
      ], "Race Rehearsal"),
      coolDown(runnersStretch(), hamCalf(), figureFour(), quadStretch()),
    ],
  },

  // ── Week 4 — Race week ────────────────────────────────────────────────────
  restDay(22, "Race week starts. Rest, roll, and make your race plan.", [
    x("Write Your Race Plan", null, null, "Goal pace per mile/km, where the gels go, where you'll see friends"),
  ]),
  {
    day: 23,
    title: "Easy + Light Strength",
    focus: "The last strength session: 1 round, just enough to keep the muscles awake. No soreness this week.",
    blocks: [
      shortDrills(),
      block(1, null, [easyRun(5)], "Run"),
      block(1, null, [singleLegBridge("10 (Each Leg)"), calfRaise("10 (Each Leg)"), sidePlank("30 sec (Each Side)"), glutePushback("10 (Each Leg)"), plank("30 sec")], "Light Strength"),
      runCoolDown(),
    ],
  },
  {
    day: 24,
    title: "Race-Pace Miles",
    focus: "3 × 1 mile at marathon pace with 2 minutes' easy between. Short, confident, done.",
    blocks: [
      drills(),
      block(1, null, [joggingWarmUp(1.5)], "Warm-Up Run"),
      block(3, 120, [
        x("Mile at Marathon Pace", null, dist(1), "Goal pace exactly. Jog 2 min between."),
      ], "Race Pace"),
      block(1, null, [joggingCoolDown(1)], "Cool-Down Run"),
      runCoolDown(),
    ],
  },
  {
    day: 25,
    title: "Easy + Strides",
    focus: "Short and easy. Start eating a little more carbohydrate at each meal from today.",
    blocks: [
      shortDrills(),
      block(1, null, [easyRun(4), strides(4)], "Run"),
      runCoolDown(),
    ],
  },
  restDay(26, "Full rest. Stay off your feet where you can, drink water, sleep."),
  {
    day: 27,
    title: "Sharpener",
    focus: "An easy run with 2 miles at goal pace in the middle. The last time you'll run at race pace before the race.",
    blocks: [
      shortDrills(),
      block(1, null, [
        easyRun(1),
        x("Marathon Pace", null, dist(2), "Goal pace, and it should feel easy now"),
        easyRun(1),
      ], "Run"),
      runCoolDown(),
    ],
  },
  {
    day: 28,
    title: "Rest & Carb-Load",
    focus: "No running. Two days of carb-loading start today: most of each meal from rice, pasta, bread, potatoes. Keep fibre and fat low.",
    blocks: [
      block(1, null, [rollCalves(), rollQuads(), rollFeet()], "Light Roll"),
      block(1, null, [catCow(), hipCircles(), childsPose()], "Mobility"),
      block(1, null, [
        x("Carb-Load: Day 1", null, "~8-10 g carbs per kg", "Spread over the day, with plenty of water"),
        x("Check the Course", null, null, "Hills, aid stations, where the gels go, how to get to the start"),
      ], "Race Prep"),
    ],
  },
  {
    day: 29,
    title: "Shakeout & Prep",
    focus: "A 20-minute shakeout to loosen up, then get everything ready so race morning is automatic.",
    blocks: [
      shortDrills(),
      block(1, null, [easyRun(2, "Very easy, 15-20 min"), strides(4)], "Shakeout"),
      block(1, null, [
        x("Carb-Load: Day 2", null, "~8-10 g carbs per kg", "Main meal at lunch, a lighter familiar dinner"),
        x("Lay Out Your Kit", null, null, "Shoes, socks, clothes, bib pinned, anti-chafe, watch charged"),
        x("Pack Your Fuel", null, null, "The gels you trained with, one more than you think you need"),
        x("Plan Race Morning", null, null, "Alarm, breakfast 3 hours before, transport, when to leave"),
      ], "Race Prep"),
      coolDown(calfStretch(), hipFlexor(), figureFour()),
    ],
  },
  {
    day: 30,
    title: "Race Day: 26.2",
    focus: "Everything you've done this month was for today. Start slow, stick to the plan, and enjoy it.",
    blocks: [
      warmUp(
        x("Breakfast", null, "3 hrs before", "The one you practised. Sip water or sports drink until the start."),
        x("Easy Jog", null, "5-10 min", "Very easy, 20-30 min before the gun. Skip it if the start corral is tight."),
        legSwings(),
        sideSwings(),
      ),
      block(1, null, [
        x("Miles 1-6 · km 1-10", null, "hold back", "5-10 sec/mile slower than goal pace. It will feel too easy. Good."),
        x("Miles 6-13 · km 10-21", null, "settle", "Goal pace, even effort. Relax the shoulders and hands."),
        x("Miles 13-20 · km 21-32", null, "stay steady", "Stay on goal pace. Keep taking your fuel, even if you don't feel like it."),
        x("Miles 20-26.2 · km 32-42.2", null, "race it", "If you have anything left, now's the time to use it. Short, quick steps and arms driving."),
      ], "The Race · 42.2 km"),
      block(1, null, [
        x("Fuel", null, "every 30-40 min", "Start by minute 40. Water at every other aid station at least."),
      ], "Fuel"),
      coolDown(
        x("Keep Walking", null, "10 min", "Don't stop dead at the finish. Walk, drink, and eat something within the hour."),
        x("Celebrate", null, null, "You're a marathoner."),
      ),
    ],
  },
];

export default DAYS;
