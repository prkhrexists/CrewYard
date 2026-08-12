import { mockUsers } from "../data/mockData"; // fallback for PostAsk live preview only
import { formatRelativeTime } from "../utils/time";
import { stripMarkdownForPreview } from "../utils/text";

// ─────────────────────────────────────────────────────────────
//  Design-system constants
// ─────────────────────────────────────────────────────────────

/** Label shown in the type badge pill */
export const TYPE_LABELS = {
  help:      "HELP",
  teammate:  "TEAMMATE",
  build_log: "BUILD_LOG",
};

/** 4px left-border + badge background colour per type */
const TYPE_COLORS = {
  help:      "var(--accent)",   // cy-help / cy-orange
  teammate:  "var(--cat-blue)",   // cy-blue
  build_log: "var(--cat-green)",   // cy-green
};

const DEFAULT_COLOR = "var(--text)"; // cy-ink fallback

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

export function getUserById(id) {
  return mockUsers.find((u) => u.id === id) ?? null;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─────────────────────────────────────────────────────────────
//  Inline SVG icons — no icon-library dependency
// ─────────────────────────────────────────────────────────────

function GitHubIcon({ size = 12 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      className="shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839
           9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
           1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088
           2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951
           0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65
           0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004
           1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546
           1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688
           0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855
           0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019
           10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  AskCard
// ─────────────────────────────────────────────────────────────
/**
 * Shared ask card used on Home preview, Board, Search, BuildLogs,
 * and the PostAsk live preview.
 *
 * Props:
 *   ask        — the ask object from db.js (Supabase) or the PostAsk preview
 *   onClick    — optional; makes the card keyboard-focusable + clickable
 *   asArticle  — render root as <article> instead of <li> (default: false)
 */
export default function AskCard({ ask, onClick, asArticle = false }) {
  // Prefer embedded author from Supabase join; fall back to mockUsers for
  // the PostAsk live preview which doesn't go through a Supabase query.
  const author     = ask.author ?? getUserById(ask.authorId);
  const typeLabel  = TYPE_LABELS[ask.type]  ?? ask.type?.toUpperCase();
  const typeColor  = TYPE_COLORS[ask.type]  ?? DEFAULT_COLOR;
  const timeAgo    = ask.createdAt ? formatRelativeTime(ask.createdAt) : "";

  const Root = asArticle ? "article" : "li";

  // ── Interaction props ──────────────────────────────────────
  const interactionProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") onClick(e);
        },
      }
    : {};

  return (
    <Root
      {...interactionProps}
      className={[
        // Brutalist card shell
        "flex flex-col bg-cy-bg border border-cy-ink border-l-[4px]",
        // Hover state when clickable
        onClick ? "cursor-pointer hover:shadow-brutal-sm transition-shadow" : "",
      ].join(" ")}
      style={{ borderLeftColor: typeColor }}
    >

      {/* ── Top row: type badge + timestamp ───────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Type badge — solid colour fill, white mono text */}
        <span
          className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase
                     text-white px-2 py-0.5"
          style={{ backgroundColor: typeColor }}
        >
          {typeLabel}
        </span>

        {/* Relative timestamp */}
        {timeAgo && (
          <span className="font-mono text-[10px] text-cy-muted tracking-[0.05em]">
            {timeAgo}
          </span>
        )}
      </div>

      {/* ── Title ─────────────────────────────────────────── */}
      <h3
        className="font-sans font-bold text-base leading-snug text-cy-ink px-4 pb-2"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {ask.title || <span className="text-cy-muted italic">Title will appear here…</span>}
      </h3>

      {/* ── Description: 2-line clamp ──────────────────────── */}
      <p
        className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3 line-clamp-2 overflow-hidden"
      >
        {ask.details ? stripMarkdownForPreview(ask.details) : <span className="italic">Details will appear here…</span>}
      </p>

      {/* ── Tags row ──────────────────────────────────────── */}
      {ask.tags?.length > 0 && (
        <ul
          className="flex flex-wrap gap-1.5 px-4 pb-3"
          aria-label="Tags"
          role="list"
        >
          {ask.tags.map((tag) => (
            <li
              key={tag}
              className="tag"        /* .tag utility from index.css */
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {/* ── Author footer ─────────────────────────────────── */}
      <footer className="flex items-center justify-between gap-3 px-4 py-3 border-t border-cy-ink mt-auto">

        {/* Left: avatar + name + college */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar — image or initials circle */}
          <div
            className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-cy-ink
                       flex items-center justify-center bg-cy-ink"
            aria-hidden="true"
          >
            {author?.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono text-[8px] font-bold text-white">
                {getInitials(author?.name ?? "?")}
              </span>
            )}
          </div>

          {/* Name + college */}
          <span className="font-mono text-[10px] text-cy-ink leading-none truncate">
            <span className="font-bold">{author?.name ?? "You"}</span>
            {author?.college && (
              <>
                <span className="text-cy-muted mx-1">·</span>
                <span className="text-cy-muted">{author.college}</span>
              </>
            )}
          </span>
        </div>

        {/* Right: commits this month */}
        {typeof ask.commitsThisMonth === "number" && ask.commitsThisMonth > 0 && (
          <div className="flex items-center gap-1 shrink-0 text-cy-muted">
            <GitHubIcon size={10} />
            <span className="font-mono text-[10px] whitespace-nowrap">
              {ask.commitsThisMonth} commits this month
            </span>
          </div>
        )}
      </footer>

    </Root>
  );
}
