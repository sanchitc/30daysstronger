import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { loadIframeApi, trackUrl } from "./spotify.js";

// One Spotify embed docked at the bottom of the workout. Rows call
// dock.play(uri): a new song loads and starts; the current song toggles.
// Reports { uri, paused } through onChange so rows can show ▶ or ❚❚.
const MusicDock = forwardRef(function MusicDock({ onChange }, ref) {
  const outer = useRef(null);
  const ctrl = useRef(null);
  const current = useRef(null);
  const wantPlay = useRef(false);
  const report = useRef(onChange);
  report.current = onChange;
  const [uri, setUri] = useState(null);
  const [failed, setFailed] = useState(false);

  const start = () => {
    if (!wantPlay.current || !ctrl.current) return;
    wantPlay.current = false;
    ctrl.current.play();
  };

  useImperativeHandle(ref, () => ({
    async play(next) {
      if (ctrl.current && next === current.current) {
        ctrl.current.togglePlay();
        return;
      }
      current.current = next;
      wantPlay.current = true;
      setUri(next);
      setFailed(false);
      report.current({ uri: next, paused: true });
      if (ctrl.current) {
        ctrl.current.loadUri(next);
        // "ready" fires once the new track is in; this covers players that don't re-fire it.
        setTimeout(start, 2500);
        return;
      }
      try {
        const api = await loadIframeApi();
        if (ctrl.current || current.current !== next || !outer.current) return;
        // The API swaps this element for its iframe, so React mustn't own it.
        const host = document.createElement("div");
        outer.current.appendChild(host);
        api.createController(host, { uri: next, width: "100%", height: 80 }, (c) => {
          ctrl.current = c;
          c.addListener("ready", start);
          // Fires several times a second while playing; only pass on changes.
          let last = null;
          c.addListener("playback_update", (e) => {
            const key = `${current.current}|${Boolean(e.data?.isPaused)}`;
            if (key === last) return;
            last = key;
            report.current({ uri: current.current, paused: Boolean(e.data?.isPaused) });
          });
          if (current.current !== next) c.loadUri(current.current);
        });
      } catch {
        setFailed(true);
      }
    },
  }), []);

  useEffect(() => () => {
    try { ctrl.current?.destroy(); } catch { /* already gone */ }
    ctrl.current = null;
    report.current({ uri: null, paused: true });
  }, []);

  const close = () => {
    try { ctrl.current?.pause(); } catch { /* ignore */ }
    current.current = null;
    setUri(null);
    report.current({ uri: null, paused: true });
  };

  return (
    <div className={`music-dock${uri ? " open" : ""}`} aria-hidden={!uri}>
      <div className="music-frame" ref={outer} />
      {failed && uri && (
        <a className="music-fallback" href={trackUrl(uri)} target="_blank" rel="noreferrer">
          Couldn't load the player. Open in Spotify ↗
        </a>
      )}
      <button className="music-x" onClick={close} aria-label="Close music player">×</button>
    </div>
  );
});

export default MusicDock;
