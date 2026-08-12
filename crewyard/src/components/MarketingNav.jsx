import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, isCollegeEmail } from "../context/AuthContext";

/* ── Inline SVG: magnifying glass ─────────────────────────────── */
function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-cy-muted"
    >
      <circle cx="6.5" cy="6.5" r="5" />
      <line x1="10.5" y1="10.5" x2="15" y2="15" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "BOARD",   to: "/board"   },
  { label: "GROUPS",  to: "/groups"  },
  { label: "EXPLORE", to: "/search"  },
  { label: "ABOUT",   to: "/about"   },
];

export default function MarketingNav() {
  const { signInWithEmail, signInAsGuest, isDemoMode, isLoggedIn } = useAuth();
  const navigate  = useNavigate();
  const [query, setQuery] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Navigate to /board once auth state is committed (after guest or magic-link login)
  useEffect(() => {
    if (isLoggedIn) navigate("/board", { replace: true });
  }, [isLoggedIn, navigate]);

  async function handleSendMagicLink(e) {
    e.preventDefault();
    setEmailError("");
    if (!isCollegeEmail(email)) {
      setEmailError("Must be an allowed college email (.ac.in, .edu, etc).");
      return;
    }
    try {
      await signInWithEmail(email);
      setEmailSent(true);
    } catch (err) {
      setEmailError(err.message || "Failed to send link.");
    }
  }

  return (
    /* 2px solid cy-ink bottom border — the heavy nav divider from the screenshot */
    <header className="bg-cy-bg border-b-2 border-cy-ink sticky top-0 z-50">
      <nav
        className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8"
        aria-label="Marketing navigation"
      >

        {/* ── Wordmark ──────────────────────────────────────────── */}
        <Link
          to="/"
          aria-label="CrewYard home"
          className="flex items-baseline gap-0 shrink-0"
        >
          {/* "CrewYard" in display/serif */}
          <span className="font-display font-bold text-2xl text-cy-ink leading-none tracking-tight">
            CrewYard
          </span>
          {/* Orange period — the logo mark */}
          <span
            className="font-display font-bold text-2xl leading-none"
            style={{ color: "#E8542A" }}
            aria-hidden="true"
          >
            .
          </span>
        </Link>

        {/* ── Nav links ─────────────────────────────────────────── */}
        <ul
          className="hidden md:flex items-center gap-7"
          role="list"
          aria-label="Site sections"
        >
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className="font-mono text-xs font-bold tracking-[0.12em] text-cy-ink
                           opacity-80 hover:opacity-100 transition-opacity"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Spacer ────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Search ────────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center border border-cy-ink bg-cy-bg px-3 h-9 gap-2 w-56 lg:min-w-[280px]">
          <SearchIcon />
          <label className="sr-only" htmlFor="marketing-search">Search</label>
          <input
            id="marketing-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search asks, skills, colleges..."
            className="flex-1 bg-transparent font-mono text-xs text-cy-ink
                       placeholder:text-cy-muted border-0 outline-none p-0
                       focus:outline-none focus:ring-0"
            style={{ border: "none", outline: "none", boxShadow: "none" }}
          />
        </div>

        {/* ── Sign In ───────────────────────────────────────────── */}
        <div className="relative flex items-center shrink-0">
          {!showSignIn ? (
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <button
                  onClick={() => signInAsGuest()}
                  className="font-mono text-[10px] font-bold text-cy-orange tracking-[0.06em] uppercase
                             border-b border-cy-orange hover:opacity-70 transition-opacity"
                >
                  → Guest Mode
                </button>
              )}
              <button
                id="marketing-sign-in-btn"
                onClick={() => setShowSignIn(true)}
                className="btn-primary font-mono text-xs font-bold tracking-[0.1em] uppercase
                           px-5 py-2.5 shrink-0"
              >
                SIGN IN
              </button>
            </div>
          ) : emailSent ? (
            <div className="font-mono text-[10px] text-cy-ink tracking-[0.06em] uppercase border border-cy-ink px-4 py-2 bg-cy-bg">
              Check your email for the magic link.
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="flex items-center gap-2 relative">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="College email..."
                  className="bg-cy-bg font-mono text-xs text-cy-ink px-3 py-2 w-48"
                  style={{ border: "1.5px solid #111111", borderRadius: 0, outline: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = emailError ? "#E8542A" : "#111111"; }}
                  onBlur={(e) => { e.target.style.borderColor = emailError ? "#E8542A" : "#111111"; }}
                  autoFocus
                />
                {emailError && (
                  <p className="absolute top-full left-0 mt-1 font-mono text-[9px] text-cy-orange whitespace-nowrap bg-cy-bg z-10 p-1 border border-cy-orange">
                    {emailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary font-mono text-xs font-bold tracking-[0.05em] uppercase px-3 py-2 shrink-0"
              >
                Send Link
              </button>
              <button
                type="button"
                onClick={() => setShowSignIn(false)}
                className="font-mono text-xs uppercase text-cy-muted hover:text-cy-ink ml-1 px-2 py-2"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
