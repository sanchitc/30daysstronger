// ─── Sign in ─────────────────────────────────────────────────────────────────

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GoogleButton({ googleOn, onClick, busy }) {
  return (
    <button className="google-btn" onClick={onClick} disabled={googleOn === false || busy}>
      <GoogleMark />
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}

export function SignInScreen({ googleOn, busy, error, onGoogle, onSkip, invited = false }) {
  return (
    <div className="signin">
      <div className="signin-top">
        <p className="signin-kicker">30 DAYS</p>
        <h1 className="signin-title">STRONGER</h1>
        <p className="signin-sub">
          {invited
            ? "You've been invited to be someone's accountability partner. Sign in to accept and see each other's progress."
            : "Sign in to keep your progress safe and pick up on any device."}
        </p>
      </div>

      <div className="signin-actions">
        <GoogleButton googleOn={googleOn} busy={busy} onClick={onGoogle} />
        {googleOn === false && (
          <p className="signin-note">Google sign-in isn't switched on yet — check back soon.</p>
        )}
        {error && <p className="signin-note error">{error}</p>}
        <button className="ghost-btn" onClick={onSkip}>
          Continue without an account
        </button>
        <p className="signin-fine">
          {invited ? "Invites need an account." : "Without an account, progress stays on this device only."}
        </p>
      </div>
    </div>
  );
}

const SYNC_LABEL = {
  syncing: "Saving…",
  synced: "Synced",
  error: "Couldn't sync — changes are saved on this device",
};

export function AccountBar({ session, sync, googleOn, busy, onSignIn, onSignOut }) {
  if (!session) {
    return (
      <div className="account-bar">
        <span className="account-text">Saved on this device only</span>
        {googleOn !== false && (
          <button className="account-link" onClick={onSignIn} disabled={busy}>
            Sign in to sync
          </button>
        )}
      </div>
    );
  }

  const meta = session.user.user_metadata || {};
  const who = meta.full_name || meta.name || session.user.email;
  return (
    <div className="account-bar">
      {meta.avatar_url && (
        <img className="account-avatar" src={meta.avatar_url} alt="" referrerPolicy="no-referrer" />
      )}
      <span className="account-text">
        {who}
        {sync && <span className={`account-sync ${sync}`}> · {SYNC_LABEL[sync]}</span>}
      </span>
      <button className="account-link" onClick={onSignOut}>Sign out</button>
    </div>
  );
}
