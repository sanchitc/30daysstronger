import { useEffect, useState } from "react";
import { searchTracks, parseSpotifyUri, fetchTrackTitle } from "./spotify.js";

// Pick a Spotify track for one exercise: search, or paste a share link.
export default function SongPicker({ exercise, onPick, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | unavailable
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setStatus((s) => (s === "unavailable" ? s : "idle")); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setStatus("loading");
      searchTracks(q, ctrl.signal).then(
        (tracks) => { setResults(tracks); setStatus("done"); },
        (err) => { if (err.name !== "AbortError") setStatus("unavailable"); }
      );
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  const usePasted = async () => {
    const uri = parseSpotifyUri(link);
    if (!uri) { setLinkError(true); return; }
    const title = await fetchTrackTitle(uri);
    onPick({ uri, title });
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="sheet-title">Song for {exercise.name}</div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div style={{ padding: "14px 18px 0" }}>
          <input
            className="picker-search"
            placeholder="Search Spotify…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="song-paste">
            <input
              className="picker-search"
              placeholder="…or paste a Spotify track link"
              value={link}
              onChange={(e) => { setLink(e.target.value); setLinkError(false); }}
              onKeyDown={(e) => e.key === "Enter" && usePasted()}
            />
            <button className="btn small" onClick={usePasted} disabled={!link.trim()}>Use</button>
          </div>
          {linkError && <p className="song-error">That doesn't look like a Spotify track link.</p>}
        </div>

        <div className="sheet-body">
          {status === "loading" && results.length === 0 && <p className="p-status">Searching…</p>}
          {status === "unavailable" && (
            <p className="p-status">
              Search isn't available right now. In Spotify, tap <strong>Share → Copy song link</strong> and paste it above.
            </p>
          )}
          {status === "done" && results.length === 0 && <p className="p-status">No songs match that.</p>}

          {results.map((t) => (
            <button
              key={t.uri}
              className="p-row"
              onClick={() => onPick({ uri: t.uri, title: `${t.name} — ${t.artists}` })}
            >
              {t.image
                ? <img className="song-art" src={t.image} alt="" loading="lazy" />
                : <span className="song-art" aria-hidden="true" />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="p-name">{t.name}</span>
                <span className="p-meta" style={{ display: "block" }}>{t.artists}</span>
              </span>
              <span className="p-add">+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
