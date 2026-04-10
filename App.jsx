import { useState, useEffect, useRef } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Every rep counts. Every day counts.", author: "Anonymous" },
  { text: "It never gets easier. You just get stronger.", author: "Anonymous" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Anonymous" },
  { text: "No pain, no gain. Shut up and train.", author: "Anonymous" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Wake up. Work out. Look hot. Kick ass.", author: "Anonymous" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "One more rep. Always one more.", author: "Anonymous" },
  { text: "Your future self is watching you right now through your memories.", author: "Aubrey de Grey" },
  { text: "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.", author: "Rikki Rogers" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Train insane or remain the same.", author: "Anonymous" },
  { text: "You are one workout away from a good mood.", author: "Anonymous" },
  { text: "Sore today. Strong tomorrow.", author: "Anonymous" },
  { text: "Fall in love with the process and the results will come.", author: "Eric Thomas" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "Be stronger than your excuses.", author: "Anonymous" },
  { text: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt" },
  { text: "Sweat is just fat crying.", author: "Anonymous" },
  { text: "You're only one workout away from a better mood.", author: "Anonymous" },
  { text: "Day 30. You made it. Now go harder.", author: "The Challenge" },
];

// ─── Confetti ────────────────────────────────────────────────────────────────

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FF6B35", "#FFD700", "#FF3D71", "#00E096", "#0095FF", "#FF6BDE"];
    particles.current = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 12 + 6,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height * 0.7) p.opacity = Math.max(0, p.opacity - 0.015);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 100,
      }}
    />
  );
}

// ─── Applause Sound (Web Audio API) ─────────────────────────────────────────

function playApplause() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 2.5;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.4) * 0.6;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(1, 0.1);
  gain.gain.linearRampToValueAtTime(0.7, 0.8);
  gain.gain.linearRampToValueAtTime(0, duration);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

function getStoredData() {
  try {
    const raw = localStorage.getItem("pushup_challenge");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveData(data) {
  try { localStorage.setItem("pushup_challenge", JSON.stringify(data)); } catch {}
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStartDate(data) {
  if (data.startDate) return data.startDate;
  const today = getTodayKey();
  saveData({ ...data, startDate: today });
  return today;
}

function getDayNumber(startDate) {
  const start = new Date(startDate);
  const now = new Date(getTodayKey());
  const diff = Math.floor((now - start) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), 30);
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function HomeScreen({ day, quote, onStart, completed }) {
  return (
    <div className="screen home-screen">
      <div className="home-top">
        <div className="day-badge">DAY {day} <span className="day-of">/ 30</span></div>
        <h1 className="app-title">PUSH<span className="accent">UP</span></h1>
        <p className="app-sub">30-Day Challenge</p>
      </div>

      <div className="quote-card">
        <div className="quote-mark">"</div>
        <p className="quote-text">{quote.text}</p>
        <p className="quote-author">— {quote.author}</p>
      </div>

      {completed ? (
        <div className="completed-today">
          <span className="check-icon">✓</span>
          <p>Crushed it today!</p>
        </div>
      ) : (
        <button className="cta-btn" onClick={onStart}>
          LET'S DO IT
          <span className="btn-arrow">→</span>
        </button>
      )}

      <div className="progress-dots">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`dot ${i + 1 < day ? "done" : i + 1 === day ? "today" : "future"}`}
          />
        ))}
      </div>
    </div>
  );
}

function WorkoutScreen({ day, onComplete, completed }) {
  const [celebrate, setCelebrate] = useState(false);
  const [pulse, setPulse] = useState(false);

  const handleTap = () => {
    if (completed || celebrate) return;
    setCelebrate(true);
    setPulse(true);
    playApplause();
    setTimeout(() => setPulse(false), 600);
    onComplete();
  };

  return (
    <div className="screen workout-screen">
      <Confetti active={celebrate} />

      <div className="workout-header">
        <p className="workout-label">TODAY'S TARGET</p>
        <p className="workout-day">Day {day}</p>
      </div>

      {celebrate ? (
        <div className="congrats-block">
          <div className="congrats-emoji">🎉</div>
          <h2 className="congrats-text">CONGRATULATIONS!</h2>
          <p className="congrats-sub">You crushed {day} push-up{day > 1 ? "s" : ""}!</p>
        </div>
      ) : (
        <div className="circle-wrapper">
          <button
            className={`circle-btn ${pulse ? "pulse" : ""}`}
            onClick={handleTap}
          >
            <span className="circle-count">{day}</span>
            <span className="circle-label">push-up{day > 1 ? "s" : ""}</span>
            <span className="circle-tap">TAP WHEN DONE</span>
          </button>
          <div className="circle-ring ring-1" />
          <div className="circle-ring ring-2" />
        </div>
      )}

      <p className="workout-tip">
        {celebrate
          ? "Rest up. Tomorrow brings " + (day < 30 ? (day + 1) + " push-ups!" : "the finish line! 🏆")
          : "Complete your reps, then tap the circle."}
      </p>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home");
  const [data, setData] = useState(() => getStoredData());

  const startDate = getStartDate(data);
  const day = getDayNumber(startDate);
  const todayKey = getTodayKey();
  const completed = data.completedDays?.[todayKey] === true;
  const quoteIndex = (day - 1) % QUOTES.length;
  const quote = QUOTES[quoteIndex];

  const handleComplete = () => {
    const updated = {
      ...data,
      completedDays: { ...(data.completedDays || {}), [todayKey]: true },
    };
    setData(updated);
    saveData(updated);
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #14141e;
          --surface2: #1e1e2e;
          --orange: #FF6B35;
          --yellow: #FFD60A;
          --white: #f0f0f0;
          --muted: #6b6b80;
          --radius: 24px;
        }

        body {
          background: var(--bg);
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          min-height: 100dvh;
          overflow-x: hidden;
        }

        .app {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .screen {
          width: 100%;
          max-width: 420px;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 48px 28px 40px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glow */
        .screen::before {
          content: '';
          position: fixed;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── HOME ── */
        .home-top {
          text-align: center;
          z-index: 1;
        }

        .day-badge {
          display: inline-block;
          background: var(--orange);
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 3px;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .day-of { opacity: 0.6; }

        .app-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 20vw, 96px);
          line-height: 0.9;
          letter-spacing: -2px;
          color: var(--white);
        }

        .accent { color: var(--orange); }

        .app-sub {
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 8px;
        }

        .quote-card {
          background: var(--surface);
          border: 1px solid rgba(255,107,53,0.15);
          border-radius: var(--radius);
          padding: 28px 24px 24px;
          width: 100%;
          z-index: 1;
          position: relative;
        }

        .quote-mark {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          color: var(--orange);
          line-height: 0.5;
          margin-bottom: 12px;
          opacity: 0.6;
        }

        .quote-text {
          font-size: 17px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--white);
        }

        .quote-author {
          font-size: 13px;
          color: var(--muted);
          margin-top: 14px;
        }

        .cta-btn {
          background: var(--orange);
          color: #fff;
          border: none;
          border-radius: 100px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 3px;
          padding: 20px 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 8px 32px rgba(255,107,53,0.35);
          z-index: 1;
          width: 100%;
          justify-content: center;
        }

        .cta-btn:active { transform: scale(0.96); }

        .btn-arrow {
          font-size: 20px;
          transition: transform 0.2s;
        }

        .cta-btn:hover .btn-arrow { transform: translateX(4px); }

        .completed-today {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #00E096;
          z-index: 1;
        }

        .check-icon {
          width: 56px;
          height: 56px;
          border: 2px solid #00E096;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 4px;
        }

        .completed-today p {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          color: #00E096;
        }

        .progress-dots {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          z-index: 1;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .dot.done { background: var(--orange); }
        .dot.today { background: var(--yellow); box-shadow: 0 0 8px var(--yellow); transform: scale(1.3); }
        .dot.future { background: var(--surface2); }

        /* ── WORKOUT ── */
        .workout-screen {
          background: var(--bg);
          gap: 0;
        }

        .workout-header {
          text-align: center;
          z-index: 1;
        }

        .workout-label {
          font-size: 12px;
          letter-spacing: 4px;
          color: var(--muted);
          text-transform: uppercase;
        }

        .workout-day {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          color: var(--orange);
          letter-spacing: 2px;
          margin-top: 4px;
        }

        .circle-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .circle-btn {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: linear-gradient(145deg, #FF6B35, #FF3D71);
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 60px rgba(255,107,53,0.4), 0 0 120px rgba(255,107,53,0.15);
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 2;
          position: relative;
        }

        .circle-btn:active { transform: scale(0.93); }

        .circle-btn.pulse {
          animation: pulse-anim 0.5s ease;
        }

        @keyframes pulse-anim {
          0% { transform: scale(1); }
          30% { transform: scale(1.1); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .circle-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 80px;
          color: #fff;
          line-height: 1;
        }

        .circle-label {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
          letter-spacing: 1px;
        }

        .circle-tap {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 10px;
        }

        .circle-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,107,53,0.2);
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .ring-1 { width: 290px; height: 290px; animation-delay: 0s; }
        .ring-2 { width: 340px; height: 340px; animation-delay: 0.5s; opacity: 0.5; }

        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.03); opacity: 0.7; }
        }

        .congrats-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 1;
          animation: pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes pop-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .congrats-emoji { font-size: 72px; }

        .congrats-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 12vw, 56px);
          letter-spacing: 3px;
          color: var(--yellow);
          text-shadow: 0 0 40px rgba(255,214,10,0.5);
        }

        .congrats-sub {
          font-size: 18px;
          color: var(--white);
          font-weight: 400;
        }

        .workout-tip {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          z-index: 1;
          max-width: 280px;
        }

        /* Back nav */
        .back-btn {
          position: absolute;
          top: 20px;
          left: 24px;
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          color: var(--white);
          font-size: 13px;
          padding: 8px 16px;
          cursor: pointer;
          z-index: 10;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {screen === "home" ? (
        <HomeScreen
          day={day}
          quote={quote}
          onStart={() => setScreen("workout")}
          completed={completed}
        />
      ) : (
        <WorkoutScreen
          day={day}
          onComplete={handleComplete}
          completed={completed}
        />
      )}

      {screen === "workout" && (
        <button className="back-btn" onClick={() => setScreen("home")}>← Back</button>
      )}
    </div>
  );
}
