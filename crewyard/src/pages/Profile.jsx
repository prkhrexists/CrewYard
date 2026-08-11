import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Code2,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { getUserByUsername, getAsks } from "../data/mockDb";
import { formatRelativeTime, formatMonthYear } from "../utils/time";

function GithubIcon({ size = 13, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  Design constants
// ─────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  help:      "#E8542A",
  teammate:  "#2D5FE0",
  build_log: "#1E8A5A",
};

const TYPE_VERB = {
  help:      "ASKED",
  teammate:  "ASKED",
  build_log: "LOGGED",
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─────────────────────────────────────────────────────────────
//  Identity sub-components
// ─────────────────────────────────────────────────────────────

/** Large circular avatar with initials fallback */
function LargeAvatar({ user }) {
  return (
    <div
      className="w-24 h-24 rounded-full overflow-hidden border-2 border-cy-ink
                 bg-cy-ink flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display font-black text-3xl text-white">
          {getInitials(user.name)}
        </span>
      )}
    </div>
  );
}

/** Bordered stat box — GitHub commits or top language */
function StatBox({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="border border-cy-ink bg-cy-bg p-4 flex flex-col gap-1"
    >
      {/* Icon + label row */}
      <div className="flex items-center gap-2">
        <Icon size={13} strokeWidth={1.75} className="text-cy-muted" />
        <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-cy-muted">
          {label}
        </span>
      </div>

      {/* Value — large bold */}
      <span className="font-mono font-bold text-2xl text-cy-ink leading-none mt-1">
        {value}
      </span>

      {/* Sub-line */}
      {sub && (
        <span className="font-mono text-[10px] text-cy-muted mt-0.5">
          {sub}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Activity card — type-coded left border + engagement row
// ─────────────────────────────────────────────────────────────
function ActivityCard({ ask }) {
  const typeColor = TYPE_COLORS[ask.type] ?? "#111111";
  const verb      = TYPE_VERB[ask.type]   ?? "POSTED";
  const timeAgo   = formatRelativeTime(ask.createdAt);

  return (
    <li
      className="bg-cy-bg border border-cy-ink border-l-[4px] flex flex-col"
      style={{ borderLeftColor: typeColor }}
    >
      {/* ── Top row: type verb pill + timestamp ──────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span
          className="font-mono text-[10px] font-bold tracking-[0.1em] text-white
                     px-2 py-0.5"
          style={{ backgroundColor: typeColor }}
        >
          {verb}
        </span>
        <span className="font-mono text-[10px] text-cy-muted tracking-[0.05em]">
          {timeAgo}
        </span>
      </div>

      {/* ── Title ────────────────────────────────────────── */}
      <h3
        className="font-sans font-bold text-base leading-snug text-cy-ink px-4 pb-2"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {ask.title}
      </h3>

      {/* ── Description: 3-line clamp for profile view ───── */}
      <p
        className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {ask.details}
      </p>

      {/* ── Engagement footer ─────────────────────────────── */}
      <footer className="border-t border-cy-ink px-4 py-2.5 flex items-center justify-between gap-3 mt-auto">
        {/* Author mini info */}
        <span className="font-mono text-[10px] text-cy-muted truncate">
          {/* rep shown on own profile view */}
          rep {ask.rep ?? "—"}
        </span>

        {/* Right: like, comment, bookmark */}
        <div className="flex items-center gap-3.5 shrink-0">
          {typeof ask.likeCount === "number" && ask.likeCount >= 0 && (
            <span className="flex items-center gap-1 text-cy-muted">
              <ThumbsUp size={11} strokeWidth={1.75} />
              <span className="font-mono text-[10px]">{ask.likeCount}</span>
            </span>
          )}

          {typeof ask.commentCount === "number" && ask.commentCount >= 0 && (
            <span className="flex items-center gap-1 text-cy-muted">
              <MessageCircle size={11} strokeWidth={1.75} />
              <span className="font-mono text-[10px]">{ask.commentCount}</span>
            </span>
          )}

          <span className="text-cy-muted" aria-label="Save">
            <Bookmark size={11} strokeWidth={1.75} />
          </span>
        </div>
      </footer>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  Profile page
// ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { username } = useParams();

  const [user,        setUser]        = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [allAsks,     setAllAsks]     = useState([]);
  const [asksLoading, setAsksLoading] = useState(true);

  // ── Fetch user ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setUser(null);
    setUserLoading(true);
    getUserByUsername(username).then((u) => {
      if (!cancelled) { setUser(u); setUserLoading(false); }
    });
    return () => { cancelled = true; };
  }, [username]);

  // ── Fetch asks after user resolves ───────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAsksLoading(true);
    getAsks().then((asks) => {
      if (!cancelled) { setAllAsks(asks); setAsksLoading(false); }
    });
    return () => { cancelled = true; };
  }, [user]);

  // ── Derive this user's activity, newest first ─────────────
  const userActivity = useMemo(() => {
    if (!user) return [];
    return allAsks
      .filter((a) => a.authorId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allAsks, user]);

  // ── Loading state ──────────────────────────────────────────
  if (userLoading) {
    return (
      <p className="font-mono text-xs text-cy-muted tracking-[0.08em]">
        Loading profile…
      </p>
    );
  }

  // ── Not-found state ───────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col gap-3 max-w-sm">
        <p className="font-display font-bold text-xl text-cy-ink">User not found.</p>
        <p className="font-sans text-sm text-cy-muted">
          No builder with the username{" "}
          <code className="font-mono bg-cy-ink text-white px-1.5 py-0.5 text-xs">
            @{username}
          </code>{" "}
          exists on CrewYard.
        </p>
        <Link
          to="/board"
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em]
                     uppercase text-cy-ink hover:text-cy-orange transition-colors w-fit mt-2"
        >
          <ChevronLeft size={12} strokeWidth={2.5} />
          Back to Board
        </Link>
      </div>
    );
  }

  // ── Commit change arrow glyph ─────────────────────────────
  const changeSign = user.commitsChangePercent >= 0 ? "↑" : "↓";
  const changePct  = `${changeSign} ${Math.abs(user.commitsChangePercent)}% vs last week`;

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl">

      {/* ── Back link ─────────────────────────────────────── */}
      <Link
        to="/board"
        className="inline-flex items-center gap-1.5 font-mono text-[11px]
                   tracking-[0.1em] uppercase text-cy-muted hover:text-cy-ink
                   transition-colors mb-8"
      >
        <ChevronLeft size={12} strokeWidth={2.5} />
        Back to Board
      </Link>

      {/* ── Two-column: ~30 / 70 split ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">

        {/* ══════════════════════════════════════════════════
            LEFT — Identity block
        ══════════════════════════════════════════════════ */}
        <aside
          className="flex flex-col gap-5 lg:sticky lg:top-20"
          aria-label="User identity"
        >
          {/* Avatar */}
          <LargeAvatar user={user} />

          {/* Name + meta */}
          <div className="flex flex-col gap-1">
            <h1 className="font-display font-black text-3xl text-cy-ink leading-tight">
              {user.name}
            </h1>
            <p className="font-sans text-sm text-cy-ink">
              {user.college}
            </p>
            <p className="font-mono text-[11px] text-cy-muted tracking-[0.04em]">
              {user.year}{user.year === 1 ? "st" : user.year === 2 ? "nd" : user.year === 3 ? "rd" : "th"} Year, {user.major}
            </p>

            {/* College verified badge */}
            {user.githubVerified && (
              <span
                className="font-mono text-[10px] font-bold tracking-[0.1em]
                           w-fit mt-1"
                style={{ color: "#E8542A" }}
              >
                [COLLEGE VERIFIED]
              </span>
            )}
          </div>

          {/* Thin divider */}
          <div
            className="border-t border-cy-ink"
            style={{ borderTopWidth: "1px", opacity: 0.15 }}
            role="separator"
          />

          {/* Reputation */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-cy-muted mb-1">
              Reputation
            </p>
            <p
              className="font-display font-black leading-none"
              style={{ color: "#E8542A", fontSize: "clamp(3rem, 7vw, 5rem)" }}
            >
              {user.reputation.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Stat boxes */}
          <div className="flex flex-col gap-3">
            <StatBox
              icon={GithubIcon}
              label="Commits (this week)"
              value={user.commitsThisWeek}
              sub={changePct}
            />
            <StatBox
              icon={Code2}
              label="Top Language"
              value={user.topLanguage}
              sub={`${user.topLanguagePercent}% of commits`}
            />
          </div>

          {/* Joined date */}
          <div className="flex items-center gap-2 text-cy-muted">
            <Calendar size={12} strokeWidth={1.75} />
            <span className="font-mono text-[10px] tracking-[0.06em]">
              Joined {formatMonthYear(user.joinedDate)}
            </span>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════
            RIGHT — Recent activity feed
        ══════════════════════════════════════════════════ */}
        <section aria-labelledby="activity-heading">

          {/* Section heading */}
          <div className="mb-5">
            <h2
              id="activity-heading"
              className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-cy-ink"
            >
              Recent Activity
            </h2>
            <p className="font-sans text-xs text-cy-muted mt-1">
              Asks, answers, and build logs
            </p>
          </div>

          {/* Activity list */}
          {asksLoading ? (
            <p className="font-mono text-xs text-cy-muted">Loading activity…</p>
          ) : userActivity.length === 0 ? (
            <div className="border border-cy-ink p-10 text-center">
              <p className="font-mono text-xs text-cy-muted tracking-[0.08em]">
                No activity yet.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-4">
                {userActivity.map((ask) => (
                  <ActivityCard key={ask.id} ask={ask} />
                ))}
              </ul>

              {/* View all activity link */}
              <button
                id="profile-view-all-btn"
                onClick={() => { /* TODO: paginate or link to filtered board */ }}
                className="mt-6 flex items-center gap-2 font-mono text-[11px]
                           tracking-[0.1em] uppercase text-cy-ink
                           hover:text-cy-orange transition-colors"
                style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
              >
                View all activity
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </>
          )}
        </section>

      </div>
    </div>
  );
}
