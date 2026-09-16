# 💪 30 Days Stronger

A dead-simple daily training tracker. One day, one workout, one checklist.

![Day 1](https://img.shields.io/badge/day%201-legs%20%26%20arms-E63946)

## What it does

- **Today's workout, nothing else.** Blocks of rounds, exercises, reps — tick them off as you go.
- **How-to for every move.** Tap an exercise for demo images and step-by-step instructions
  pulled from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (876 exercises, public domain).
- **Rest timer.** Tap `⏱ START REST` on any block for the countdown between rounds.
- **Build a day in seconds.** Hit `EDIT` → `+ Add exercise from database` → search, tap, set reps.
- **Confetti + applause** when the last box is ticked.
- Progress is kept in `localStorage`. The day number advances on its own from the day
  you first opened the app.

## Adding more days

Two ways — both end up in the same shape.

**1. Edit `plan.js` (the source of truth)**

```js
{
  day: 2,
  title: "Push",
  focus: "Chest & shoulders",
  blocks: [
    {
      rounds: 3,
      rest: 60,
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

Navigate to the day with `›`, hit `BUILD`, and pick exercises from the database. The workout
saves to your browser right away. Hit **Copy JSON** to get a `plan.js`-ready block to paste
into the file so it's shared across devices and doesn't live only in one browser.

## Files

| File | What's in it |
| --- | --- |
| `plan.js` | The training plan — day 1 lives here, add more days below it |
| `App.jsx` | Today's workout screen, progress, rest timer |
| `Builder.jsx` | The day builder + `Copy JSON` export |
| `ExercisePicker.jsx` | Search/filter over the exercise database |
| `ExerciseSheet.jsx` | Per-exercise how-to (images + instructions) |
| `exercises.js` | Database loader, search, image URLs |
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
