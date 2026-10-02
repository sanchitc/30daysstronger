// ─── Spotify ─────────────────────────────────────────────────────────────────
//
// An exercise can carry a song: { uri: "spotify:track:<id>", title: "Song — Artist" }.
// Playback goes through Spotify's embed iFrame API, which needs no login or app
// key: listeners signed in to Spotify in the browser hear the full track,
// everyone else a 30-second preview. Search goes through /api/spotify-search
// (a Vercel function holding the app's client secret).

import { API_BASE } from "./platform.js";

const TRACK_ID = /^[A-Za-z0-9]{22}$/;

// Accepts "spotify:track:ID", "https://open.spotify.com/track/ID?si=…" (also
// the /intl-xx/track/ form) or a bare 22-character ID. Returns the URI or null.
export function parseSpotifyUri(text) {
  const s = String(text || "").trim();
  if (!s) return null;
  let m = s.match(/^spotify:track:([A-Za-z0-9]{22})$/);
  if (m) return `spotify:track:${m[1]}`;
  m = s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?track\/([A-Za-z0-9]{22})/);
  if (m) return `spotify:track:${m[1]}`;
  if (TRACK_ID.test(s)) return `spotify:track:${s}`;
  return null;
}

// An exercise's song as { uri, title }, whether it was written as a bare URI
// string (handy in plan.js) or as an object (what the builder saves).
export function songOf(ex) {
  const song = ex?.song;
  if (!song) return null;
  if (typeof song === "string") {
    const uri = parseSpotifyUri(song);
    return uri ? { uri, title: null } : null;
  }
  const uri = parseSpotifyUri(song.uri);
  return uri ? { uri, title: song.title || null } : null;
}

export function trackUrl(uri) {
  return `https://open.spotify.com/track/${uri.split(":").pop()}`;
}

// ── Search (server side, see api/spotify-search.js) ──

export async function searchTracks(q, signal) {
  const res = await fetch(`${API_BASE}/api/spotify-search?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const body = await res.json();
  return body.tracks || [];
}

// Title for a pasted link. Tries our API first, then Spotify's public oEmbed.
const metaCache = new Map();
export function fetchTrackTitle(uri) {
  if (metaCache.has(uri)) return metaCache.get(uri);
  const p = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/spotify-search?uri=${encodeURIComponent(uri)}`);
      if (res.ok) {
        const t = (await res.json()).track;
        if (t) return `${t.name} — ${t.artists}`;
      }
    } catch { /* fall through */ }
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl(uri))}`);
      if (res.ok) return (await res.json()).title || null;
    } catch { /* offline or blocked */ }
    return null;
  })();
  metaCache.set(uri, p);
  return p;
}

// ── iFrame API ──

let apiPromise = null;
export function loadIframeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.SpotifyIframeApi) return resolve(window.SpotifyIframeApi);
    const prev = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      window.SpotifyIframeApi = api;
      prev?.(api);
      resolve(api);
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => { apiPromise = null; reject(new Error("Spotify player failed to load")); };
    document.body.appendChild(s);
  });
  return apiPromise;
}
