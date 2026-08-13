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
//  Hero Animation Data
// ─────────────────────────────────────────────────────────────
const HERO_LINES = [
  { text: "Post what you're actually", highlight: "stuck on." },
  { text: "Builder network beyond your", highlight: "campus." },
  { text: "Ask. Answer.", highlight: "Build." },
  { text: "Real builders. Real", highlight: "questions." },
  { text: "Find builders. Not", highlight: "followers." },
  { text: "Skills you can actually", highlight: "check." },
  { text: "A network that remembers what you", highlight: "built." }
];

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

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedHighlight, setDisplayedHighlight] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = HERO_LINES[currentLineIndex];
    const fullText = currentLine.text;
    const fullHighlight = currentLine.highlight;

    let timeoutId;

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayedText.length < fullText.length) {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
          timeoutId = setTimeout(handleTyping, 40);
        } else if (displayedHighlight.length < fullHighlight.length) {
          setDisplayedHighlight(fullHighlight.slice(0, displayedHighlight.length + 1));
          timeoutId = setTimeout(handleTyping, 30);
        } else {
          timeoutId = setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        if (displayedHighlight.length > 0) {
          setDisplayedHighlight(fullHighlight.slice(0, displayedHighlight.length - 1));
          timeoutId = setTimeout(handleTyping, 20);
        } else if (displayedText.length > 0) {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
          timeoutId = setTimeout(handleTyping, 20);
        } else {
          setIsDeleting(false);
          setCurrentLineIndex((prev) => (prev + 1) % HERO_LINES.length);
        }
      }
    };

    timeoutId = setTimeout(handleTyping, 10);
    return () => clearTimeout(timeoutId);
  }, [displayedText, displayedHighlight, isDeleting, currentLineIndex]);

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
    <div className="bg-cy-bg w-full h-full flex flex-col md:flex-row overflow-hidden">

      {/* ══════════════════════════════════════════════════════════
          LEFT COLUMN: 55% Desktop, 100% Mobile (Centered)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="w-full md:w-[50%] h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
        aria-labelledby="hero-heading"
      >
        <div className="flex flex-col gap-7 w-full max-w-2xl mx-auto md:mx-0 py-12 md:py-0">

          {/* Eyebrow badge - Brutalist shadow */}
          <span
            className="font-mono text-xs tracking-[0.14em] uppercase
                       border-2 border-cy-ink bg-cy-bg px-3 py-1.5 w-fit text-cy-ink
                       shadow-[4px_4px_0px_0px_var(--shadow)]"
          >
            FOR BUILDERS WHO'VE OUTGROWN THEIR CAMPUS
          </span>

          {/* H1 — display serif with typing effect */}
          <h1
            id="hero-heading"
            className="font-display font-black text-cy-ink leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", minHeight: "clamp(6.5rem, 12vw, 10.5rem)" }}
          >
            {displayedText}
            {/* Prevent collapsing if empty by rendering a zero-width space if needed, though minHeight helps */}
            {displayedText.length === 0 && "\u200B"}
            <br />
            {/* Highlighted word gets the orange underline accent */}
            <span className="relative inline-block mt-1">
              <span className="relative z-10">
                {displayedHighlight}
                {/* Blinking cursor */}
                <span className={`inline-block w-1.5 h-[0.8em] bg-cy-ink ml-1 align-middle ${isDeleting ? 'opacity-100' : 'animate-pulse'}`}></span>
              </span>
              {/* Orange underline — absolutely positioned thick rule */}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-1 h-3 bg-cy-orange transition-all duration-75"
                style={{ width: displayedHighlight.length > 0 ? '100%' : '0%' }}
              />
            </span>
          </h1>

          {/* Subheadline — monospace */}
          <p className="font-mono text-xl text-cy-ink leading-snug">
            Someone will actually answer.
          </p>

          {/* Body description */}
          <p className="font-sans text-base text-cy-muted leading-relaxed">
            CrewYard is where student builders find real help, real teammates, and people who actually build — verified by what they do, not what they claim.
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
                             border-2 border-cy-ink bg-cy-ink text-[var(--bg)] px-5 py-3
                             shadow-[6px_6px_0px_0px_var(--shadow)]
                             hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow)]
                             active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all"
                >
                  Sign in
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => signInAsGuest()}
                  className="flex items-center gap-3 w-fit
                             text-sm tracking-[0.08em] uppercase font-mono font-bold
                             border-2 border-cy-ink bg-cy-bg text-cy-ink px-5 py-3
                             shadow-[6px_6px_0px_0px_var(--shadow)]
                             hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow)]
                             active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all"
                >
                  Guest Mode
                </button>
              </div>
            ) : emailSent ? (
              <div className="font-mono text-xs text-cy-ink tracking-[0.06em] uppercase border-2 border-cy-ink px-4 py-3 bg-cy-bg w-fit shadow-[6px_6px_0px_0px_var(--shadow)]">
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
                    className="bg-cy-bg font-mono text-sm text-cy-ink px-4 py-3 w-full border-2 border-cy-ink focus:outline-none focus:border-cy-orange shadow-[4px_4px_0px_0px_var(--shadow)] transition-colors"
                    autoFocus
                  />
                  {emailError && (
                    <p className="absolute top-full left-0 mt-3 font-mono text-[10px] text-cy-orange whitespace-nowrap bg-cy-bg z-10 p-1.5 border-2 border-cy-orange shadow-[2px_2px_0px_0px_var(--accent)]">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2
                               font-mono text-xs font-bold tracking-[0.08em] uppercase px-4 py-3 shrink-0
                               border-2 border-cy-ink bg-cy-ink text-[var(--bg)]
                               shadow-[4px_4px_0px_0px_var(--shadow)]
                               hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0px_0px_var(--shadow)]
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
        className="hidden md:flex w-[50%] h-full relative items-center justify-center bg-cy-bg border-l-2 border-cy-ink overflow-hidden p-6"
      >
        {/* Dot pattern background for extra texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(var(--text) 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px'
          }}
        />

        {asksLoading ? (
          <p className="font-mono text-xs text-cy-muted">Loading board…</p>
        ) : (
          <ul className="relative w-full h-[720px] flex items-center justify-center">
            {previewAsks.map((ask, i) => {
              // Asymmetric, overlapping cascade positioning
              const transforms = [
                "absolute top-[5%] left-[2%] -rotate-6 z-10 w-[340px] lg:w-[400px]",
                "absolute top-[32%] right-[2%] rotate-3 z-20 w-[340px] lg:w-[400px]",
                "absolute bottom-[5%] left-[15%] -rotate-2 z-30 w-[340px] lg:w-[400px]"
              ];

              return (
                <li
                  key={ask.id}
                  className={`transition-all duration-300 hover:z-40 hover:scale-105 shadow-[12px_12px_0px_0px_var(--shadow)] ${transforms[i] || "hidden"}`}
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
