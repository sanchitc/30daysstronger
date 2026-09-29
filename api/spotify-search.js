// Vercel serverless function: Spotify track search for the day builder.
//
//   GET /api/spotify-search?q=eye+of+the+tiger   → { tracks: [{ uri, name, artists, image }] }
//   GET /api/spotify-search?uri=spotify:track:ID → { track: { uri, name, artists, image } }
//
// Uses the Client Credentials flow (an app token, no user login), so the
// development-mode cap on signed-in Spotify users doesn't apply. Needs
// SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the Vercel project's env.
// SPOTIFY_MARKET (default US) is sent with every call: without a market or a
// user token, Spotify treats tracks as unavailable.

let token = null; // { value, expires }

async function appToken() {
  if (token && token.expires > Date.now() + 30_000) return token.value;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw Object.assign(new Error("Spotify search isn't configured"), { status: 501 });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw Object.assign(new Error(`Spotify token ${res.status}`), { status: 502 });
  const body = await res.json();
  token = { value: body.access_token, expires: Date.now() + body.expires_in * 1000 };
  return token.value;
}

async function spotify(path) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${await appToken()}` },
  });
  if (res.status === 401) token = null;
  if (!res.ok) throw Object.assign(new Error(`Spotify ${res.status}`), { status: res.status === 429 ? 429 : 502 });
  return res.json();
}

const slim = (t) => ({
  uri: t.uri,
  name: t.name,
  artists: (t.artists || []).map((a) => a.name).join(", "),
  image: t.album?.images?.at(-1)?.url || null,
});

export default async function handler(req, res) {
  const market = process.env.SPOTIFY_MARKET || "US";
  const { q, uri } = req.query;
  try {
    if (uri) {
      const id = String(uri).match(/^spotify:track:([A-Za-z0-9]{22})$/)?.[1];
      if (!id) return res.status(400).json({ error: "bad uri" });
      const t = await spotify(`/tracks/${id}?market=${market}`);
      res.setHeader("Cache-Control", "public, s-maxage=86400");
      return res.status(200).json({ track: slim(t) });
    }
    const query = String(q || "").trim().slice(0, 100);
    if (!query) return res.status(200).json({ tracks: [] });
    // The API caps search at 10 results per type.
    const body = await spotify(
      `/search?type=track&limit=10&market=${market}&q=${encodeURIComponent(query)}`
    );
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(200).json({ tracks: (body.tracks?.items || []).filter(Boolean).map(slim) });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}
