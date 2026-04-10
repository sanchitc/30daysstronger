# 💪 PushUp Challenge — 30-Day App

A clean, mobile-friendly 30-day push-up challenge app. Day 1 = 1 push-up, Day 30 = 30 push-ups.

## Features
- Daily motivational quote on the home screen
- "Let's Do It" button takes you to your daily target
- Large circular button — tap when done → confetti + applause 🎉
- Progress dots tracking all 30 days
- Remembers your progress via localStorage
- Daily notification reminder at 9 AM PST (browser push notification prompt)

## Deploy to Vercel (3 steps)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run locally**
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel**
   ```bash
   npx vercel
   ```
   Or connect your GitHub repo at vercel.com → Import Project → done.

## Push Notifications

Browser push notifications require HTTPS (Vercel provides this automatically).  
On first visit, the app will prompt for notification permission and schedule the 9 AM PST daily reminder.

> Note: For reliable background notifications on mobile, consider wrapping in a PWA with a service worker, or use a service like OneSignal.
