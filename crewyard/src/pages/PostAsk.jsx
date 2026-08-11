import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  Users,
  FileText,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createAsk } from "../data/mockDb";
import AskCard from "../components/AskCard";

// ─────────────────────────────────────────────────────────────
//  Design constants
// ─────────────────────────────────────────────────────────────

const ASK_TYPES = [
  {
    value: "help",
    label: "HELP",
    Icon: HelpCircle,
    color: "#E8542A",       // cy-help
    borderClass: "border-[#E8542A]",
    textClass: "text-[#E8542A]",
  },
  {
    value: "teammate",
    label: "TEAMMATE",
    Icon: Users,
    color: "#2D5FE0",       // cy-blue
    borderClass: "border-[#2D5FE0]",
    textClass: "text-[#2D5FE0]",
  },
  {
    value: "build_log",
    label: "BUILD_LOG",
    Icon: FileText,
    color: "#1E8A5A",       // cy-green
    borderClass: "border-[#1E8A5A]",
    textClass: "text-[#1E8A5A]",
  },
];

const TIPS = [
  "Specific and focused",
  "Include what you've tried",
  "Share error messages or code",
  "Mention relevant tech (stack, version)",
];

// ─────────────────────────────────────────────────────────────
//  PostAsk
// ─────────────────────────────────────────────────────────────
export default function PostAsk() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();

  // ── Form state ───────────────────────────────────────────────
  const [askType,    setAskType]    = useState("help");
  const [title,      setTitle]      = useState("");
  const [details,    setDetails]    = useState("");
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ───────────────────────────────────────────────
  function validate() {
    const next = {};
    if (!title.trim())   next.title   = "Title is required.";
    if (!details.trim()) next.details = "Details are required.";
    return next;
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await createAsk({
        type:             askType,
        title:            title.trim(),
        details:          details.trim(),
        tags:             [],
        authorId:         currentUser.id,
        commitsThisMonth: currentUser.commitsThisWeek ?? 0,
      });
      navigate("/board");
    } catch {
      setSubmitting(false);
    }
  }

  // ── Live preview object (re-built every render, updates as user types) ──
  const previewAsk = {
    id:               "__preview__",
    type:             askType,
    title:            title.trim()   || "",
    details:          details.trim() || "",
    tags:             [],
    authorId:         currentUser?.id ?? null,
    commitsThisMonth: currentUser?.commitsThisWeek ?? 0,
    commentCount:     0,
    likeCount:        0,
    saved:            false,
    createdAt:        new Date().toISOString(),
  };

  // Active type config object
  const activeType = ASK_TYPES.find((t) => t.value === askType);

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6">
        <ChevronRight
          size={12}
          strokeWidth={2.5}
          className="text-cy-orange shrink-0"
        />
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-cy-orange">
          Post an Ask
        </span>
      </div>

      {/* ── Two-column grid: ~60/40 split ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

        {/* ══════════════════════════════════════════════════════
            LEFT COLUMN — Form
        ══════════════════════════════════════════════════════ */}
        <section aria-labelledby="form-heading">

          {/* Heading */}
          <h1
            id="form-heading"
            className="font-display font-bold text-cy-ink leading-tight mb-2"
            style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)" }}
          >
            What are you stuck on?
          </h1>
          <p className="font-sans text-sm text-cy-muted mb-8">
            Be specific. The more context, the better answers.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">

            {/* ── Ask Type selector ──────────────────────────── */}
            <fieldset>
              <legend className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-muted mb-2">
                Ask Type
              </legend>
              <div
                className="flex gap-2"
                role="group"
                aria-label="Select ask type"
              >
                {ASK_TYPES.map(({ value, label, Icon, color, borderClass, textClass }) => {
                  const isActive = askType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      id={`ask-type-${value}`}
                      aria-pressed={isActive}
                      onClick={() => setAskType(value)}
                      className={[
                        // Base: equal-width, mono label, icon, sharp corners
                        "flex-1 flex items-center justify-center gap-2",
                        "font-mono text-[10px] font-bold tracking-[0.1em]",
                        "py-3 px-2 transition-colors",
                        // Active: solid fill with type colour, white text/icon
                        isActive
                          ? "text-white"
                          : `bg-cy-bg ${borderClass} ${textClass}`,
                      ].join(" ")}
                      style={
                        isActive
                          ? { backgroundColor: color, borderColor: color, borderWidth: "1.5px" }
                          : { borderColor: color, borderWidth: "1.5px" }
                      }
                    >
                      <Icon size={13} strokeWidth={isActive ? 2.5 : 1.75} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* ── Title input ────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ask-title"
                className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-muted"
              >
                Title
              </label>
              <input
                id="ask-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="e.g. Stuck integrating Razorpay webhook in Next.js"
                aria-describedby={errors.title ? "ask-title-error" : undefined}
                aria-invalid={!!errors.title}
                className="font-sans text-sm text-cy-ink bg-cy-bg px-4 py-3 w-full"
                style={{
                  border: errors.title ? "1.5px solid #E8542A" : "1.5px solid #111111",
                  borderRadius: 0,
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#E8542A"; }}
                onBlur={(e)  => { e.target.style.borderColor = errors.title ? "#E8542A" : "#111111"; }}
              />
              {errors.title && (
                <p
                  id="ask-title-error"
                  role="alert"
                  className="font-mono text-[10px] text-cy-orange tracking-[0.06em]"
                >
                  ↑ {errors.title}
                </p>
              )}
            </div>

            {/* ── Details textarea ───────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ask-details"
                className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-muted"
              >
                Details
              </label>
              <textarea
                id="ask-details"
                rows={7}
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  if (errors.details) setErrors((p) => ({ ...p, details: undefined }));
                }}
                placeholder="Explain what you're trying to do, what's not working, what you've already tried, and any error messages. Code snippets help."
                aria-describedby={errors.details ? "ask-details-error" : undefined}
                aria-invalid={!!errors.details}
                className="font-sans text-sm text-cy-ink bg-cy-bg px-4 py-3 w-full resize-y"
                style={{
                  border: errors.details ? "1.5px solid #E8542A" : "1.5px solid #111111",
                  borderRadius: 0,
                  outline: "none",
                  minHeight: "160px",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#E8542A"; }}
                onBlur={(e)  => { e.target.style.borderColor = errors.details ? "#E8542A" : "#111111"; }}
              />
              {errors.details && (
                <p
                  id="ask-details-error"
                  role="alert"
                  className="font-mono text-[10px] text-cy-orange tracking-[0.06em]"
                >
                  ↑ {errors.details}
                </p>
              )}
            </div>

            {/* ── Post button ────────────────────────────────── */}
            <div>
              <button
                id="post-ask-submit-btn"
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-3
                           font-mono text-xs font-bold tracking-[0.08em] uppercase
                           disabled:opacity-40"
              >
                {submitting ? "Posting…" : "POST"}
                {!submitting && <ArrowRight size={14} strokeWidth={2.5} />}
              </button>
            </div>

          </form>
        </section>

        {/* ══════════════════════════════════════════════════════
            RIGHT COLUMN — Preview + Tips
        ══════════════════════════════════════════════════════ */}
        <aside
          className="flex flex-col gap-6 lg:sticky lg:top-20"
          aria-labelledby="preview-heading"
        >

          {/* ── Preview label + card ─────────────────────────── */}
          <section aria-labelledby="preview-heading">
            <p
              id="preview-heading"
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-muted mb-1"
            >
              Preview
            </p>
            <p className="font-sans text-xs text-cy-muted mb-3">
              This is how your ask will appear on the board.
            </p>

            {/* AskCard inherits Step 3 styling automatically */}
            <ul aria-label="Live ask preview">
              <AskCard ask={previewAsk} />
            </ul>

            <p className="font-mono text-[10px] text-cy-muted mt-2 tracking-[0.06em]">
              JUST NOW
            </p>
          </section>

          {/* ── Tips section ─────────────────────────────────── */}
          <section
            aria-labelledby="tips-heading"
            className="border border-cy-ink bg-cy-bg p-5"
          >
            {/* Section label */}
            <h2
              id="tips-heading"
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-ink mb-4"
            >
              Good asks are:
            </h2>

            {/* Tip list — arrow bullet in orange */}
            <ul className="flex flex-col gap-2.5" role="list">
              {TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span
                    className="font-mono text-xs font-bold shrink-0 leading-relaxed"
                    style={{ color: "#E8542A" }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span className="font-sans text-sm text-cy-ink leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>

            {/* Thin divider + closing line */}
            <div
              className="mt-5 pt-4 border-t"
              style={{ borderTopColor: "rgba(17,17,17,0.15)", borderTopWidth: "1px" }}
            >
              <p className="font-sans text-xs text-cy-muted">
                Be respectful. No spam. Real builders only.
              </p>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
