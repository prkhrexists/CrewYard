import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAsks, getStats } from "../data/mockDb";
import AskCard from "../components/AskCard";

// ─────────────────────────────────────────────────────────────
//  Arrow icon (inline SVG)
// ─────────────────────────────────────────────────────────────
function ArrowRight({ size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" y1="8" x2="14" y2="8" />
      <polyline points="9 3 14 8 9 13" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  Stat block — used in the stats strip
// ─────────────────────────────────────────────────────────────
function StatBlock({ value, label, cellClass = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 px-6 py-5 ${cellClass}`}>
      {/* Big orange number — display/serif face at large size */}
      <span
        className="font-display font-black tabular-nums leading-none"
        style={{ color: "#E8542A", fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        {value.toLocaleString("en-IN")}
      </span>
      {/* Monospace uppercase label */}
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-cy-ink mt-1">
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Home page
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [previewAsks, setPreviewAsks] = useState([]);
  const [asksLoading, setAsksLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch board preview (first 3 asks)
  useEffect(() => {
    let cancelled = false;
    setAsksLoading(true);
    getAsks().then((all) => {
      if (!cancelled) { setPreviewAsks(all.slice(0, 3)); setAsksLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch platform stats
  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    getStats().then((s) => {
      if (!cancelled) { setStats(s); setStatsLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  function handleSignIn() {
    login();
    navigate("/board");
  }

  return (
    <div className="bg-cy-bg min-h-screen flex flex-col">

      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION
          Two-column on desktop: left=copy, right=board preview
          ══════════════════════════════════════════════════════════ */}
      <section
        className="max-w-6xl mx-auto w-full px-6 pt-16 pb-12
                   grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start"
        aria-labelledby="hero-heading"
      >

        {/* ── LEFT: Hero copy ─────────────────────────────────── */}
        <div className="flex flex-col gap-7">

          {/* Eyebrow badge */}
          <span
            className="font-mono text-xs tracking-[0.14em] uppercase
                       border border-cy-ink px-3 py-1.5 w-fit text-cy-ink"
          >
            For Indian College Student Builders
          </span>

          {/* H1 — display serif, very large, tight leading */}
          <h1
            id="hero-heading"
            className="font-display font-black text-cy-ink leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.25rem)" }}
          >
            Post what you're actually
            <br />
            {/* "stuck" gets the orange underline accent */}
            <span className="relative inline-block">
              <span className="relative z-10">stuck</span>
              {/* Orange underline — absolutely positioned thick rule */}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-0"
                style={{
                  height: "4px",
                  backgroundColor: "#E8542A",
                  bottom: "4px",
                }}
              />
            </span>
            {" on."}
          </h1>

          {/* Subheadline — monospace, large */}
          <p className="font-mono text-xl text-cy-ink leading-snug">
            Someone will actually answer.
          </p>

          {/* Body description — sans, muted, narrow measure */}
          <p
            className="font-sans text-base text-cy-muted leading-relaxed"
            style={{ maxWidth: "42ch" }}
          >
            CrewYard helps student builders get real help and find real teammates —
            verified by GitHub activity, not follower counts. Ask a technical
            question, post a teammate request, or ship a build log.
          </p>

          {/* CTA button */}
          <button
            id="hero-sign-in-btn"
            onClick={handleSignIn}
            className="btn-primary flex items-center gap-3 w-fit
                       text-sm tracking-[0.08em] uppercase
                       hover:-translate-y-px active:translate-y-0 transition-transform"
          >
            Sign in
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ── RIGHT: Live board preview cards ─────────────────── */}
        <aside aria-label="Live board preview" className="flex flex-col gap-3">
          {asksLoading ? (
            <p className="font-mono text-xs text-cy-muted">Loading board…</p>
          ) : (
            /* Cards cascade: top card is most-right, last is flush-left */
            <ul className="flex flex-col gap-3">
              {previewAsks.map((ask, i) => (
                <li
                  key={ask.id}
                  style={{ marginLeft: i === 0 ? "2.5rem" : i === 1 ? "1.25rem" : "0" }}
                >
                  <AskCard ask={ask} asArticle />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. STATS STRIP
          Full-width, thick top+bottom borders, orange numbers
          ══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="stats-heading"
        className="border-t-2 border-b-2 border-cy-ink bg-cy-bg mt-auto"
      >
        <h2 id="stats-heading" className="sr-only">Platform Stats</h2>

        {statsLoading || !stats ? (
          <p className="font-mono text-xs text-cy-muted text-center py-6">
            Loading stats…
          </p>
        ) : (
          /*
           * Responsive grid:
           *   Mobile  → 2-col × 2-row  (2×2)
           *   Desktop → 4-col + GitHub (4+1 cells)
           * Borders are per-cell so they work in both grid and flex contexts.
           */
          <div className="grid grid-cols-2 md:flex md:flex-wrap">

            {/* Cell 1 — right + bottom borders on mobile; right only on md */}
            <StatBlock
              value={stats.activeBuilders}
              label="Active Builders"
              cellClass="border-r-2 border-b-2 md:border-b-0 border-cy-ink"
            />

            {/* Cell 2 — bottom border on mobile; right on md */}
            <StatBlock
              value={stats.questionsAnswered}
              label="Questions Answered"
              cellClass="border-b-2 md:border-r-2 md:border-b-0 border-cy-ink"
            />

            {/* Cell 3 — right border only (last row on mobile) */}
            <StatBlock
              value={stats.teamsFormed}
              label="Teams Formed"
              cellClass="border-r-2 md:border-r-2 border-cy-ink"
            />

            {/* Cell 4 — no bottom border (last row on mobile); right on md */}
            <StatBlock
              value={stats.collegesCount}
              label="Colleges"
              cellClass="md:border-r-2 border-cy-ink"
            />

            {/* Cell 5 — GitHub Verified: full-width on mobile, auto on md */}
            <div
              className="col-span-2 md:col-span-1 md:flex-1
                         flex flex-col items-center justify-center gap-1.5
                         px-6 py-5 border-t-2 md:border-t-0 border-cy-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"
                width="22" height="22" className="text-cy-ink">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839
                     9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
                     1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088
                     2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951
                     0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65
                     0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110
                     4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027
                     2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595
                     1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678
                     1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019
                     10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
              </svg>
              <span className="font-mono text-xs font-bold tracking-[0.1em] uppercase text-cy-ink">
                GitHub Verified
              </span>
              <span className="font-mono text-[10px] text-cy-muted">
                All activity is real
              </span>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
