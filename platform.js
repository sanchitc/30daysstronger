// ─── Platform ────────────────────────────────────────────────────────────────
//
// The same build runs on the web and inside the Capacitor iOS shell. On the web
// every value here is the "no-op" one (same-origin API, window.location), so
// the web app behaves exactly as before. Inside the shell the page is served
// from capacitor://localhost, so anything that needs a real address has to be
// spelled out. Reads window.Capacitor rather than importing @capacitor/core so
// nothing native is pulled into the web bundle.

export const isNative = Boolean(globalThis.Capacitor?.isNativePlatform?.());

// Where the deployed web app (and its /api functions) live. Only used natively.
// Override with VITE_WEB_URL.
export const WEB_URL = (import.meta.env.VITE_WEB_URL || "https://30daysstronger.vercel.app").replace(/\/$/, "");

// Prefix for /api/* calls: empty on the web (same origin).
export const API_BASE = isNative ? WEB_URL : "";

// Custom URL scheme Google sign-in returns to. Must match the scheme registered
// in ios/App/App/Info.plist and Supabase's allowed redirect URLs.
export const APP_SCHEME = "com.thirtydaysstronger.app";
export const NATIVE_AUTH_REDIRECT = `${APP_SCHEME}://login`;
