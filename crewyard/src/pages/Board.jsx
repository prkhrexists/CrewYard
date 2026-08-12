import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAsks } from "../data/db";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "ALL",       value: null,        color: "#111111" },
  { label: "HELP",      value: "help",      color: "#E8542A" },
  { label: "TEAMMATE",  value: "teammate",  color: "#2D5FE0" },
  { label: "BUILD_LOG", value: "build_log", color: "#1E8A5A" },
];

const TYPE_META = {
  help:      { label: "HELP",      color: "#E8542A" },
  teammate:  { label: "TEAMMATE",  color: "#2D5FE0" },
  build_log: { label: "BUILD_LOG", color: "#1E8A5A" },
};

// Mock comments per ask for prototype
const MOCK_COMMENTS = {
  a1: [
    { id: "c1", author: { name: "Priya Nair", college: "BITS Pilani", avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=priya_builds" }, body: "You're using `req.text()` but Razorpay expects the raw body buffer. In Next.js App Router, make sure you're not parsing the body before verifying. Try using `Buffer.from(await req.text())` directly.", createdAt: "2025-08-10T10:20:00Z", upvotes: 18 },
    { id: "c2", author: { name: "Karan Mehta", college: "IIIT Hyderabad", avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=karan_hacks" }, body: "Also double check that your webhook secret in `.env` doesn't have extra whitespace. Caught me off guard once.", createdAt: "2025-08-10T11:00:00Z", upvotes: 7 },
  ],
  a2: [
    { id: "c3", author: { name: "Rohan Gupta", college: "IIT Bombay", avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=rohan_ml" }, body: "I have 1.5 yrs PyTorch + YOLO experience and can do model fine-tuning. Drop me a DM!", createdAt: "2025-08-09T15:00:00Z", upvotes: 12 },
    { id: "c4", author: { name: "Sneha Reddy", college: "PESIT Bangalore", avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sneha_404" }, body: "What's the timeline for final submission? Also is this open to non-NIT colleges?", createdAt: "2025-08-09T16:30:00Z", upvotes: 3 },
  ],
  a3: [
    { id: "c5", author: { name: "Prakhar Jaiswal", college: "NMIMS MPSTME Shirpur", avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=prkhr_exists" }, body: "The Supabase Realtime approach is underrated. I used the same pattern for a live polling app. Solid choice.", createdAt: "2025-08-07T19:00:00Z", upvotes: 22 },
  ],
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function formatRelative(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function stripMarkdown(str = "") {
  return str
    .replace(/```[\s\S]*?```/g, "[code]")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_~>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─────────────────────────────────────────────────────────────
//  Inline icons
// ─────────────────────────────────────────────────────────────
function GitHubIcon({ size = 11 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
           0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466
           -.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832
           .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688
           -.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004
           1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7
           1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855
           0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484
           15.522 0 10 0z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  FeedCard
// ─────────────────────────────────────────────────────────────
function FeedCard({ ask, isSelected, onClick }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "#111111" };
  const author  = ask.author;
  const timeAgo = ask.createdAt ? formatRelative(ask.createdAt) : "";

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      className={[
        "group cursor-pointer transition-all duration-150 border-2",
        isSelected
          ? "border-cy-ink bg-cy-ink/5 shadow-[6px_6px_0px_0px_#111111] -translate-y-1 -translate-x-1"
          : "border-cy-ink bg-cy-bg hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#111111]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cy-orange",
      ].join(" ")}
      style={{ borderLeftColor: meta.color, borderLeftWidth: "4px" }}
    >
      {/* Type badge + timestamp */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span
          className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-white px-2.5 py-1"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
        {timeAgo && (
          <span className="font-mono text-[10px] text-cy-muted tracking-[0.04em]">{timeAgo}</span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-sans font-bold text-[15px] leading-snug text-cy-ink px-4 pb-2"
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {ask.title}
      </h3>

      {/* Description preview */}
      <p className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3 line-clamp-2">
        {stripMarkdown(ask.details)}
      </p>

      {/* Tags */}
      {ask.tags?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 px-4 pb-3">
          {ask.tags.map((tag) => (
            <li key={tag} className="font-mono text-[9px] tracking-[0.06em] uppercase border border-cy-ink px-2 py-0.5 text-cy-ink">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between gap-3 px-4 py-3 border-t border-cy-ink/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-cy-ink flex items-center justify-center bg-cy-ink" aria-hidden="true">
            {author?.avatarUrl
              ? <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
              : <span className="font-mono text-[8px] font-bold text-white">{getInitials(author?.name ?? "?")}</span>
            }
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[10px] font-bold text-cy-ink truncate block">{author?.name ?? "You"}</span>
            {author?.college && <span className="font-mono text-[9px] text-cy-muted truncate block">{author.college}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-cy-muted">
          {typeof ask.commitsThisMonth === "number" && ask.commitsThisMonth > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px]"><GitHubIcon /> {ask.commitsThisMonth}</span>
          )}
          <span className="font-mono text-[10px]">💬 {ask.commentCount ?? 0}</span>
          <span className="font-mono text-[10px]">▲ {ask.likeCount ?? 0}</span>
        </div>
      </footer>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  DetailPanel — Reddit-style post view
// ─────────────────────────────────────────────────────────────
function DetailPanel({ ask, onClose }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "#111111" };
  const author  = ask.author;
  const timeAgo = ask.createdAt ? formatRelative(ask.createdAt) : "";
  const comments = MOCK_COMMENTS[ask.id] ?? [];

  const [upvotes, setUpvotes]   = useState(ask.likeCount ?? 0);
  const [voted, setVoted]       = useState(null); // "up" | "down" | null
  const [comment, setComment]   = useState("");
  const [allComments, setAllComments] = useState(comments);
  const { profile } = useAuth();

  function handleVote(dir) {
    if (voted === dir) {
      setVoted(null);
      setUpvotes((v) => dir === "up" ? v - 1 : v + 1);
    } else {
      const delta = voted === null ? (dir === "up" ? 1 : -1) : (dir === "up" ? 2 : -2);
      setVoted(dir);
      setUpvotes((v) => v + delta);
    }
  }

  function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = {
      id: `new-${Date.now()}`,
      author: { name: profile?.name ?? "You", college: profile?.college ?? "", avatarUrl: profile?.avatarUrl },
      body: comment.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };
    setAllComments((prev) => [newComment, ...prev]);
    setComment("");
  }

  // Format details with basic markdown-like rendering
  const renderDetails = (text = "") => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("```")) return null;
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-sans font-bold text-sm text-cy-ink mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return <p key={i} className="font-sans text-sm text-cy-muted pl-3 leading-relaxed">• {line.slice(2)}</p>;
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return <p key={i} className="font-sans text-sm text-cy-muted leading-relaxed">{line}</p>;
    }).filter(Boolean);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden border-l-2 border-cy-ink bg-cy-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-cy-ink shrink-0">
        <span
          className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-white px-2.5 py-1"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-xs text-cy-muted hover:text-cy-ink transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Close detail"
        >
          ✕ close
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 pb-6 flex flex-col gap-5">

          {/* Voting + Title row */}
          <div className="flex gap-3 items-start">
            {/* Vote column */}
            <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
              <button
                onClick={() => handleVote("up")}
                className={`w-8 h-8 flex items-center justify-center border-2 text-sm font-bold transition-all
                            ${voted === "up" ? "bg-cy-orange border-cy-orange text-white" : "border-cy-ink text-cy-ink hover:border-cy-orange hover:text-cy-orange"}`}
                aria-label="Upvote"
              >
                ▲
              </button>
              <span className="font-mono text-sm font-bold text-cy-ink tabular-nums">{upvotes}</span>
              <button
                onClick={() => handleVote("down")}
                className={`w-8 h-8 flex items-center justify-center border-2 text-sm font-bold transition-all
                            ${voted === "down" ? "bg-cy-ink border-cy-ink text-white" : "border-cy-ink text-cy-ink hover:border-cy-ink/60"}`}
                aria-label="Downvote"
              >
                ▼
              </button>
            </div>

            {/* Title */}
            <h2 className="font-sans font-black text-lg leading-snug text-cy-ink flex-1">
              {ask.title}
            </h2>
          </div>

          {/* Author row */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-cy-ink flex items-center justify-center bg-cy-ink shrink-0">
              {author?.avatarUrl
                ? <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                : <span className="font-mono text-[8px] font-bold text-white">{getInitials(author?.name ?? "?")}</span>
              }
            </div>
            <div>
              <span className="font-mono text-[11px] font-bold text-cy-ink">{author?.name ?? "You"}</span>
              {author?.college && <span className="font-mono text-[10px] text-cy-muted ml-2">{author.college}</span>}
            </div>
            <span className="ml-auto font-mono text-[10px] text-cy-muted">{timeAgo}</span>
          </div>

          {/* Full body */}
          <div className="border-l-2 pl-4 flex flex-col gap-0.5" style={{ borderLeftColor: meta.color }}>
            {renderDetails(ask.details)}
          </div>

          {/* Tags */}
          {ask.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {ask.tags.map((tag) => (
                <li key={tag} className="font-mono text-[9px] tracking-[0.06em] uppercase border border-cy-ink px-2 py-0.5 text-cy-ink">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {/* GitHub commits */}
          {typeof ask.commitsThisMonth === "number" && ask.commitsThisMonth > 0 && (
            <div className="flex items-center gap-2 font-mono text-[10px] text-cy-muted">
              <GitHubIcon size={12} />
              <span>{ask.commitsThisMonth} commits this month</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 border-t border-cy-ink/20 pt-4">
            <button className="font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-white transition-colors">
              💬 Reply
            </button>
            <button className="font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-white transition-colors">
              🔗 Share
            </button>
            <button className="font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-white transition-colors">
              🔖 Save
            </button>
          </div>

          {/* Comment box */}
          <form onSubmit={handleComment} className="flex flex-col gap-2 border-t border-cy-ink/20 pt-4">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-cy-muted">Add a comment</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your response..."
              rows={3}
              className="w-full font-sans text-sm text-cy-ink bg-cy-bg border-2 border-cy-ink px-3 py-2 resize-none focus:outline-none focus:border-cy-orange transition-colors"
              style={{ borderRadius: 0 }}
            />
            <button
              type="submit"
              className="self-end font-mono text-[10px] font-bold tracking-[0.1em] uppercase
                         px-4 py-2 border-2 border-cy-ink bg-cy-ink text-white
                         hover:bg-transparent hover:text-cy-ink transition-colors"
            >
              Post →
            </button>
          </form>

          {/* Comments */}
          {allComments.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-cy-ink/20 pt-4">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-cy-muted">
                {allComments.length} comment{allComments.length !== 1 ? "s" : ""}
              </p>
              {allComments.map((c) => (
                <div key={c.id} className="border-l-2 border-cy-ink/30 pl-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-cy-ink flex items-center justify-center bg-cy-ink shrink-0">
                      {c.author?.avatarUrl
                        ? <img src={c.author.avatarUrl} alt={c.author.name} className="w-full h-full object-cover" />
                        : <span className="font-mono text-[7px] font-bold text-white">{getInitials(c.author?.name ?? "?")}</span>
                      }
                    </div>
                    <span className="font-mono text-[10px] font-bold text-cy-ink">{c.author?.name}</span>
                    {c.author?.college && <span className="font-mono text-[9px] text-cy-muted">{c.author.college}</span>}
                    <span className="ml-auto font-mono text-[9px] text-cy-muted">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="font-sans text-sm text-cy-ink leading-relaxed">{c.body}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button className="font-mono text-[9px] text-cy-muted hover:text-cy-orange transition-colors">▲ {c.upvotes}</button>
                    <button className="font-mono text-[9px] text-cy-muted hover:text-cy-ink transition-colors">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Board page
// ─────────────────────────────────────────────────────────────
export default function Board() {
  const { profile } = useAuth();

  const [allAsks,     setAllAsks]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeType,  setActiveType]  = useState(null);
  const [activeTag,   setActiveTag]   = useState(null);
  const [selectedAsk, setSelectedAsk] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAsks().then((asks) => {
      if (!cancelled) { setAllAsks(asks); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    allAsks.forEach((ask) => ask.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [allAsks]);

  const filteredAsks = useMemo(() => {
    return allAsks.filter((ask) => {
      const typeMatch = activeType === null || ask.type === activeType;
      const tagMatch  = activeTag  === null || ask.tags?.includes(activeTag);
      return typeMatch && tagMatch;
    });
  }, [allAsks, activeType, activeTag]);

  return (
    // Full-height flex row: feed left, detail panel right
    <div className="flex gap-0 items-start h-full -m-6 md:-m-8">

      {/* ── Feed column ──────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 min-w-0 h-full overflow-y-auto ${selectedAsk ? "hidden xl:flex" : "flex"}`}>
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-0">

          {/* Page header */}
          <header className="flex items-start justify-between gap-4 flex-wrap pb-5">
            <div>
              <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">Board</h1>
              <p className="font-mono text-xs text-cy-muted mt-1 tracking-[0.04em]">
                What builders at Indian colleges are working on right now.
              </p>
            </div>
            <Link
              to="/ask/new"
              className="font-mono text-xs font-bold tracking-[0.1em] uppercase
                         px-4 py-2.5 border-2 border-cy-ink bg-cy-ink text-white shrink-0
                         shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]
                         hover:translate-x-0.5 hover:translate-y-0.5
                         hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]
                         active:translate-x-1 active:translate-y-1 active:shadow-none
                         transition-all flex items-center gap-2"
            >
              + Post an Ask
            </Link>
          </header>

          {/* Filter bar — scrolls WITH the feed, not sticky */}
          <section aria-labelledby="filter-heading" className="border-y-2 border-cy-ink -mx-6 md:-mx-8 px-6 md:px-8 py-3 flex flex-col gap-3 mb-6">
            <h2 id="filter-heading" className="sr-only">Filters</h2>
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by type">
              {TYPE_FILTERS.map(({ label, value, color }) => {
                const isActive = activeType === value;
                return (
                  <button
                    key={label}
                    id={`filter-type-${label.toLowerCase()}`}
                    onClick={() => { setActiveType(value); setActiveTag(null); }}
                    aria-pressed={isActive}
                    className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase
                               px-4 py-1.5 border-2 transition-all duration-150 hover:-translate-y-px"
                    style={
                      isActive
                        ? { backgroundColor: value === null ? "#111111" : color, borderColor: color, color: "#ffffff", boxShadow: `3px 3px 0 0 ${color}66` }
                        : { backgroundColor: "transparent", borderColor: color, color: color }
                    }
                  >
                    {label}
                  </button>
                );
              })}
              {!loading && (
                <span className="ml-auto font-mono text-[9px] text-cy-muted tracking-[0.08em] uppercase">
                  {filteredAsks.length} ask{filteredAsks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {allTags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Tag filters" role="list">
                {allTags.map((tag) => {
                  const isActive = activeTag === tag;
                  return (
                    <li key={tag}>
                      <button
                        id={`filter-tag-${tag}`}
                        onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                        aria-pressed={isActive}
                        className="font-mono text-[9px] tracking-[0.04em] uppercase px-2 py-0.5 border transition-colors duration-150"
                        style={
                          isActive
                            ? { backgroundColor: "#111111", borderColor: "#111111", color: "#FBF8F2" }
                            : { backgroundColor: "transparent", borderColor: "#111111", color: "#111111" }
                        }
                      >
                        {tag}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Ask feed */}
        <div className="px-6 md:px-8 pb-12">
          <section aria-labelledby="asks-list-heading" aria-live="polite">
            <h2 id="asks-list-heading" className="sr-only">Asks</h2>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-cy-ink/5 border-2 border-cy-ink/10 animate-pulse" />
                ))}
              </div>
            ) : filteredAsks.length === 0 ? (
              <div className="border-2 border-cy-ink p-10 text-center shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
                <p className="font-display font-bold text-lg text-cy-ink">No asks match these filters.</p>
                <button
                  onClick={() => { setActiveType(null); setActiveTag(null); }}
                  className="mt-5 font-mono text-xs tracking-[0.1em] uppercase text-cy-ink
                             hover:text-cy-orange transition-colors border-b-2 border-cy-orange pb-px"
                >
                  → Clear all filters
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-5">
                {filteredAsks.map((ask) => (
                  <li key={ask.id}>
                    <FeedCard
                      ask={ask}
                      isSelected={selectedAsk?.id === ask.id}
                      onClick={() => setSelectedAsk(selectedAsk?.id === ask.id ? null : ask)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────── */}
      {selectedAsk ? (
        <div className="w-full xl:w-[440px] shrink-0 h-full sticky top-0 self-start border-l-2 border-cy-ink">
          <DetailPanel
            ask={selectedAsk}
            onClose={() => setSelectedAsk(null)}
          />
        </div>
      ) : (
        // Empty state when nothing selected
        <div className="hidden xl:flex w-[380px] shrink-0 h-full items-center justify-center border-l-2 border-cy-ink/30 border-dashed">
          <div className="text-center px-8">
            <p className="font-display font-black text-5xl text-cy-ink/10 mb-3">→</p>
            <p className="font-mono text-xs text-cy-muted tracking-[0.08em] uppercase">
              Click a post to read it
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
