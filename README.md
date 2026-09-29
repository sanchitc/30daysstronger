# 💪 30 Days Stronger

A dead-simple daily training tracker. One day, one workout, one checklist.

![30 days programmed](https://img.shields.io/badge/30%20days-programmed-E63946)

## What it does

- **Today's workout, nothing else.** Blocks of rounds, exercises, reps — tick them off as you go.
- **How-to for every move.** Tap an exercise for demo images and step-by-step instructions
  pulled from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (876 exercises, public domain).
- **Rest timer.** Tap `⏱ START REST` on any block for the countdown between rounds. It chimes when rest is up.
- **Hold timer for timed moves.** Any move timed in seconds or minutes (planks, stretches,
  balance holds, foam rolling, strides) gets a `▶` button in place of its reps. Tap it for a
  full-screen countdown that's easy to read from the floor. It counts you in, handles
  `(Each Leg)` with a 5-second side switch, runs sets like `6 × 20 sec` with recovery between,
  beeps the last 3 seconds, and keeps the screen awake. When it finishes, the move is ticked
  off (in single-round blocks; in multi-round blocks one hold is one round, so you tick it).
- **A song for every move.** Give any exercise a Spotify track and a `▶` button appears on
  its row. One tap plays it in a small player docked at the bottom, and a second tap pauses it.
  Music keeps going through the rest timer. See [Music](#music).
- **Build a day in seconds.** Hit `EDIT` → `+ Add exercise from database` → search, tap, set reps.
- **Confetti + applause** when the last box is ticked.
- Progress is kept in `localStorage`. The day number advances on its own from the day
  you first opened the app.

- **The 30-day map.** Tap the `DAY n / 30` header for the whole challenge at a glance:
  what's done, what's half-finished, which days still need exercises — plus your
  current streak. Tap any day to jump to it.

## Accounts & sync

Sign in with Google (via [Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google))
and your progress follows you to any device. Or tap **Continue without an account** and
everything stays in this browser, exactly as before. Signing in later carries that progress
into the account.

Two tables in the Supabase project hold it, both locked to their owner with row-level security:

| Table | One row per | Holds |
| --- | --- | --- |
| `challenges` | user | `program` (active challenge), `start_date` (the day it began), `completions` (badges earned) |
| `day_progress` | user × day | `done` (ticked boxes), `custom` (a day you built in the app), for the active challenge |

Starting or ending a challenge deletes that user's `day_progress` rows and rewrites the
`challenges` row. On sign-in, if the device and the account have different challenges, the
one started most recently wins, and badges from both are kept. Progress saved before
the catalog existed has no program recorded, so it's treated as 30 Days Stronger.
The schema is in `supabase/migrations/`.

`supabase.js` has the project URL and publishable key built in. That key is designed to be
public, and row-level security is what protects the data. Set `VITE_SUPABASE_URL` /
`VITE_SUPABASE_PUBLISHABLE_KEY` to point at a different project.

**One-time setup for Google sign-in** (Supabase dashboard):

1. Google Cloud Console → *APIs & Services → Credentials* → create an **OAuth client ID**
   (Web application). Authorized redirect URI:
   `https://timoqfdzinioppmgxefz.supabase.co/auth/v1/callback`
2. Supabase → *Authentication → Sign In / Providers → Google*: enable it and paste the client
   ID and secret.
3. Supabase → *Authentication → URL Configuration*: **Site URL**
   `https://30daysstronger.vercel.app`, and add `http://localhost:5173` to the redirect URLs
   for local development.

Until Google is enabled, the app skips the sign-in screen and works offline as before.

## Music

Each exercise can carry an optional `song`:

```js
{ name: "Push-Ups", id: "Pushups", reps: "20", note: null,
  song: { uri: "spotify:track:<22-char id>", title: "Song — Artist" } }
```

In the builder, tap **♪ Add song** under an exercise to search Spotify, or paste a share link
(Spotify → Share → Copy song link). **Copy JSON** includes the song, so it drops straight into
`plan.js`, where `x(name, id, reps, note, song)` takes it as a fifth argument.

**Playback** uses Spotify's embed [iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api).
No login or API key is needed. People signed in to Spotify in that browser hear the full
track, and everyone else hears a 30-second preview. One track plays at a time. On some phones
the first play needs a tap on the docked player itself. If the player can't load, the dock
links to the song on Spotify.

**Search** runs through `api/spotify-search.js`, a Vercel function that calls the Spotify
Web API with the Client Credentials flow (an app token with no user sign-in). It needs a
Spotify app:

1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → *Create app*
   (Web API). Since February 2026 the app owner needs Spotify Premium.
2. Vercel → *Project → Settings → Environment Variables*: `SPOTIFY_CLIENT_ID`,
   `SPOTIFY_CLIENT_SECRET`, and optionally `SPOTIFY_MARKET` (default `US`).
3. Locally, `npx vercel dev` serves the function next to the app. With plain `npm run dev`,
   search reports that it's unavailable and the paste-a-link field still works.

Why not sign users in to Spotify? That route (Web Playback SDK / Connect) needs Premium for
every listener, doesn't run in mobile browsers, and apps in development mode are capped at
5 users.

## Challenges

The app is a catalog of 30-day challenges. One is active at a time; the rest can be
previewed day by day.

- **First visit:** the catalog. Tap a challenge to preview it: what it's for, the four
  weeks, and every one of the 30 days. Tap a day to see inside it. Then **Start Day 1 today**.
- **After that:** the app opens straight on your current day's workout. The
  `Challenges` button in the header goes back to the catalog; the program name goes to its plan.
- **Switching or ending:** starting a different challenge, or **End this challenge** at the
  bottom of the active one's plan, first warns that the 30-day progress will be lost. If you
  confirm, the new challenge starts today at Day 1.
- **Badges:** tick every box of all 30 days and the challenge is complete. You get a
  badge on the home screen's trophy shelf, and your rank grows with the count: Finisher (1), Committed (2),
  Relentless (3), Unbreakable (5), Legend (10). Each run counts once. Switching programs never
  removes a badge.
- **NEW tags** mark the first time a move appears in a program.
- Moving between screens uses the browser's View Transitions API. The program's colour panel
  moves from its card to the preview and then to the workout header. Browsers without the
  API get a simple fade-in, and reduced-motion turns both off.

The catalog lives in `programs.js`. To add a challenge, write its 30 days in the same shape
as `plan.js` and add an entry with its name, description, theme colours and week summaries.

| Challenge | For | Kit | Per day |
| --- | --- | --- | --- |
| **30 Days Stronger** (`plan.js`) | Gym-goers wanting a hard month | Dumbbells, barbell, cables | 45-60 min |
| **Ageless Strength** (`plan-ageless.js`) | 60+ or returning to exercise | Bodyweight + light band, a chair, a counter | 20-30 min |
| **Marathon Final 30** (`plan-marathon.js`) | Runners 30 days out from a marathon, base already built | Running shoes, foam roller, a step | 30-180 min |

### Ageless Strength

A gentler month aimed at mobility first, then muscle. Every day opens with joint circles
and ends with stretches. Training days rotate between legs & balance, upper body & posture,
and core & mobility, with a Restore day (walk + stretch flow) on 7, 14, 21 and 28.

| Week | Theme | Volume |
| --- | --- | --- |
| 1 | Foundations: chair squat, wall push-up, bridge, band pull-apart, balance holds | 2 rounds · 8-10 reps · 60s rest |
| 2 | Add the band: band squats, rows, chest press; push-ups move to the counter | 2 rounds · 10-12 reps |
| 3 | Build: single-leg bridges, step-ups with knee lift, side planks, woodchops | 3 rounds · 10-12 reps |
| 4 | Own it: combined moves, chair push-ups, bridge marches | 3 rounds · 12-15 reps · 45s rest |

Each day keeps the moves you've learned and adds one or two new ones (88 different moves
over the month). Day 30 repeats Day 1's moves with nearly double the reps, so you can feel how
far you've come. Every move links to a free-exercise-db entry, except a few balance drills
the database doesn't have; those carry a one-line how-to. When the database only has a
cable or dumbbell version of a move, the note explains how to do it with a band or bodyweight.
The workout screen uses larger type for this program.

### Marathon Final 30

The last block of a marathon build, with the race on Day 30. It isn't a from-scratch plan:
it assumes you can already run 13-15 mi (20-25 km) and have been running 25-35 mi a week.

| Week | Theme | Key sessions |
| --- | --- | --- |
| 1 | Build | 6 × 800 m, 4 mi tempo, 18 mi long run with a marathon-pace finish |
| 2 | Peak | 7 mi at marathon pace, 5 × 1 km, 20 mi long run on Day 14 |
| 3 | Taper | 4 × 1 mi cruise intervals, 5 mi at marathon pace, 12 mi long run |
| 4 | Race week | 3 × 1 mi at marathon pace, sharpener, carb-load, shakeout, race |

Paces are set by feel (easy, marathon pace, threshold, 10K), so the plan works for any goal
time. Distances show in miles and km. Run days open with a drill warm-up. Two short strength
sessions (A: legs, B: hips & core) get lighter as the race nears. Rest days are
"Rest & Roll" (foam roller + mobility), so every day still has boxes to tick. Runs, drills
and race-prep steps aren't in the exercise database, so they have a note in place of a how-to.

## The plan

All 30 days of 30 Days Stronger are programmed in `plan.js`: four weeks of dumbbell, barbell, cable and
bodyweight work, with active-recovery days on 7, 14, 21 and 26 and German Volume Training
to finish on days 28–30. Every exercise links to its
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) entry for the how-to. The
exceptions are the moves the database doesn't have (burpees, windshield wipers, jumping
jacks); those show a one-line how-to in their note instead.

## Changing a day

Any day missing from `DEFINED` comes out of the template in `plan.js` — a **Warm Up**
section plus **four 3-round / 75s-rest** blocks, no exercises. Two ways to change a day:

**1. Edit `plan.js` (the source of truth)**

Each entry in the `DEFINED` array is one day:

```js
{
  day: 2,
  title: "Push",
  focus: "Chest & shoulders",
  blocks: [
    {
      label: null,               // optional section name, e.g. "Warm Up"
      rounds: 3,
      rest: 75,
      exercises: [
        { name: "Dumbbell Bench Press", id: "Dumbbell_Bench_Press", reps: "12", note: null },
        { name: "Push-Ups", id: "Pushups", reps: "20", note: "to failure on the last round" },
      ],
    },
  ],
},
```

`id` is a [free-exercise-db](https://github.com/yuhonas/free-exercise-db) id — it powers the
how-to sheet. Use `null` for anything not in the database (warm-ups, cardio, your own stuff).

**2. Build it in the app**

Navigate to the day with `›` or the 30-day map, hit `BUILD`, and pick exercises from the database. The workout
saves to your browser right away. Hit **Copy JSON** to get a `plan.js`-ready block to paste
into the file so it's shared across devices and doesn't live only in one browser.

## Files

| File | What's in it |
| --- | --- |
| `programs.js` | The challenge catalog, NEW-move tagging, badge ranks |
| `plan.js` | 30 Days Stronger: all 30 days, plus the empty-day template |
| `plan-ageless.js` | Ageless Strength: the 30-day 60+ program |
| `plan-marathon.js` | Marathon Final 30: the last month before a marathon |
| `App.jsx` | Screens and navigation, today's workout, progress, rest timer, switching |
| `HoldTimer.jsx` | Full-screen countdown for timed moves |
| `timer.js` | Reads timed reps into timer phases; beeps and vibration |
| `Catalog.jsx` | Home/catalog, program preview, day preview, badges, dialogs |
| `Builder.jsx` | The day builder + `Copy JSON` export |
| `ProgressGrid.jsx` | The 30-day map: streak, completion, jump-to-day |
| `ExercisePicker.jsx` | Search/filter over the exercise database |
| `ExerciseSheet.jsx` | Per-exercise how-to (images + instructions) |
| `exercises.js` | Database loader, search, image URLs |
| `spotify.js` | Song links/URIs, search client, iFrame API loader |
| `MusicDock.jsx` | The docked Spotify player the row `▶` buttons control |
| `SongPicker.jsx` | Search Spotify or paste a link for one exercise |
| `api/spotify-search.js` | Vercel function: Spotify search and track lookup (Client Credentials) |
| `supabase.js` | Supabase client, Google sign-in, progress sync |
| `Auth.jsx` | Sign-in screen and the account bar |
| `public/exercises.json` | The 876-exercise database, fetched on demand |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Deploy

```bash
npx vercel
```

Or connect the repo at vercel.com → Import Project.

## Credits

Exercise data and images: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense / public domain).
