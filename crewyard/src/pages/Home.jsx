import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAsks } from "../data/db";
import AskCard from "../components/AskCard";
import { isCollegeEmail } from "../context/AuthContext";

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
//  Home page (Strict 100vh Split Layout)
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const { signInWithEmail, signInAsGuest, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Once logged in (via guest or email), send to /board
  useEffect(() => {
    if (isLoggedIn) navigate("/board", { replace: true });
  }, [isLoggedIn, navigate]);

  const [previewAsks, setPreviewAsks] = useState([]);
  const [asksLoading, setAsksLoading] = useState(true);

  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Fetch board preview (first 3 asks)
  useEffect(() => {
    let cancelled = false;
    setAsksLoading(true);
    getAsks().then((all) => {
      if (!cancelled) {
        setPreviewAsks(all.slice(0, 3));
        setAsksLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div
      className="bg-cy-bg w-full overflow-hidden flex flex-col md:flex-row"
      style={{ height: "calc(100vh - 65px)" }}
    >

      {/* ══════════════════════════════════════════════════════════
          LEFT COLUMN: 55% Desktop, 100% Mobile (Centered)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="w-full md:w-[55%] h-full flex flex-col justify-center px-8 md:px-12 lg:px-20 overflow-y-auto"
        aria-labelledby="hero-heading"
      >
        <div className="flex flex-col gap-7 w-full max-w-xl mx-auto md:mx-0 py-12 md:py-0">

          {/* Eyebrow badge - Brutalist shadow */}
          <span
            className="font-mono text-xs tracking-[0.14em] uppercase
                       border-2 border-cy-ink bg-cy-bg px-3 py-1.5 w-fit text-cy-ink
                       shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
          >
            For Indian College Student Builders
          </span>

          {/* H1 — display serif */}
          <h1
            id="hero-heading"
            className="font-display font-black text-cy-ink leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)" }}
          >
            Post what you're actually
            <br />
            {/* "stuck" gets the orange underline accent */}
            <span className="relative inline-block mt-1">
              <span className="relative z-10">stuck</span>
              {/* Orange underline — absolutely positioned thick rule */}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-1 h-3 bg-cy-orange"
              />
            </span>
            {" on."}
          </h1>

          {/* Subheadline — monospace */}
          <p className="font-mono text-xl text-cy-ink leading-snug">
            Someone will actually answer.
          </p>

          {/* Body description */}
          <p className="font-sans text-base text-cy-muted leading-relaxed">
            CrewYard helps student builders get real help and find real teammates —
            verified by GitHub activity, not follower counts. Ask a technical
            question, post a teammate request, or ship a build log.
          </p>

          {/* CTA button / Inline Form */}
          <div className="relative mt-2">
            {!showSignIn ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <button
                  id="hero-sign-in-btn"
                  onClick={() => setShowSignIn(true)}
                  className="btn-primary flex items-center gap-3 w-fit
                             text-sm tracking-[0.08em] uppercase
                             border-2 border-cy-ink bg-cy-ink text-white px-5 py-3
                             shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]
                             hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]
                             active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all"
                >
                  Sign in
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => signInAsGuest()}
                  className="font-mono text-xs text-cy-ink tracking-[0.06em] uppercase
                             border-b-2 border-cy-orange pb-px hover:text-cy-orange transition-colors mt-2 sm:mt-0"
                >
                  → Try as Guest
                </button>
              </div>
            ) : emailSent ? (
              <div className="font-mono text-xs text-cy-ink tracking-[0.06em] uppercase border-2 border-cy-ink px-4 py-3 bg-cy-bg w-fit shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
                Check your email for the magic link.
              </div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="College email..."
                    className="bg-cy-bg font-mono text-sm text-cy-ink px-4 py-3 w-full border-2 border-cy-ink focus:outline-none focus:border-cy-orange shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-colors"
                    autoFocus
                  />
                  {emailError && (
                    <p className="absolute top-full left-0 mt-3 font-mono text-[10px] text-cy-orange whitespace-nowrap bg-cy-bg z-10 p-1.5 border-2 border-cy-orange shadow-[2px_2px_0px_0px_rgba(232,84,42,1)]">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2
                               font-mono text-xs font-bold tracking-[0.08em] uppercase px-4 py-3 shrink-0
                               border-2 border-cy-ink bg-cy-ink text-white
                               shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]
                               hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]
                               active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Send
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSignIn(false)}
                    className="font-mono text-xs uppercase text-cy-muted hover:text-cy-ink px-2 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          RIGHT COLUMN: 45% Desktop, hidden on Mobile
          Cascading, overlapping layout for AskCards
          ══════════════════════════════════════════════════════════ */}
      <aside
        aria-label="Live board preview"
        className="hidden md:flex w-[45%] h-full relative items-center justify-center bg-cy-bg border-l-2 border-cy-ink overflow-hidden p-8"
      >
        {/* Dot pattern background for extra texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(#111 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px'
          }}
        />

        {asksLoading ? (
          <p className="font-mono text-xs text-cy-muted">Loading board…</p>
        ) : (
          <ul className="relative w-full max-w-3xl h-[700px] flex items-center justify-center">
            {previewAsks.map((ask, i) => {
              // Asymmetric, overlapping cascade positioning
              const transforms = [
                "absolute top-[8%] left-[10%] -rotate-6 z-10 w-[300px] lg:w-[360px]",
                "absolute top-[35%] right-[10%] rotate-3 z-20 w-[300px] lg:w-[360px]",
                "absolute bottom-[10%] left-[25%] -rotate-2 z-30 w-[300px] lg:w-[360px]"
              ];

              return (
                <li
                  key={ask.id}
                  className={`transition-all duration-300 hover:z-40 hover:scale-105 shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] ${transforms[i] || "hidden"}`}
                >
                  <AskCard ask={ask} asArticle />
                </li>
              );
            })}
          </ul>
        )}
      </aside>

    </div>
  );
}
