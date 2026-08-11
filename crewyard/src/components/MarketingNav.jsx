import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [query, setQuery] = useState("");

  function handleSignIn() {
    login();
    navigate("/board");
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
        <div className="hidden sm:flex items-center border border-cy-ink bg-cy-bg px-3 h-9 gap-2 w-56">
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
        <button
          id="marketing-sign-in-btn"
          onClick={handleSignIn}
          className="btn-primary font-mono text-xs font-bold tracking-[0.1em] uppercase
                     px-5 py-2.5 shrink-0"
        >
          SIGN IN
        </button>
      </nav>
    </header>
  );
}
