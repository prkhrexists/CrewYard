import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAsks, toggleLike, toggleSave, addComment } from "../data/db";
import { useAuth } from "../context/AuthContext";
import { useCat } from "../context/CatContext";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "All",       value: null,        color: "#111111",   activeText: "#fff" },
  { label: "Help",      value: "help",      color: "#E8542A",   activeText: "#fff" },
  { label: "Teammate",  value: "teammate",  color: "#2D5FE0",   activeText: "#fff" },
  { label: "Build Log", value: "build_log", color: "#1E8A5A",   activeText: "#fff" },
];

const TYPE_META = {
  help:      { label: "HELP",      color: "#E8542A",  textColor: "#fff" },
  teammate:  { label: "TEAMMATE",  color: "#2D5FE0",  textColor: "#fff" },
  build_log: { label: "BUILD LOG", color: "#1E8A5A",  textColor: "#fff" },
};

const POPULAR_TOPICS = [
  "razorpay","next.js","react","node.js","machine-learning",
  "solution-arch","open-source","system-design","python",
  "SIH2025","GSoC2026","webhook","postgresql","docker",
  "aws","opencv","rust","ui/ux"
];

const TOP_COLLEGES = [
  { name: "VIT Vellore",    count: 128, color: "#E8542A" },
  { name: "IIT Bangalore",  count: 94,  color: "#2D5FE0" },
  { name: "DTU Delhi",      count: 81,  color: "#1E8A5A" },
  { name: "VJTI Mumbai",    count: 63,  color: "#E8542A" },
  { name: "PESU Bangalore", count: 58,  color: "#2D5FE0" },
];

const TRENDING_TOPICS = [
  { name: "Razorpay",         count: 128, color: "#E8542A" },
  { name: "SIH 2025",         count: 96,  color: "#E8542A" },
  { name: "Machine Learning", count: 84,  color: "#E8542A" },
  { name: "Next.js",          count: 71,  color: "#E8542A" },
  { name: "Open Source",      count: 58,  color: "#E8542A" },
];

const PINNED_GROUPS = [
  { name: "React India",       members: "12.4k", color: "#2D5FE0" },
  { name: "ML Builders",       members: "9.1k",  color: "#1E8A5A" },
  { name: "Open Source India", members: "8.3k",  color: "#9B59B6" },
];

const MOCK_COMMENTS = {
  a1: [
    { id: "c1", author: { name: "Priyanshi Upadhyay", college: "NMIMS MPSTME Shirpur", avatarUrl: "/avatars/avatar_02.jpg" }, body: "You're using `req.text()` but Razorpay expects the raw body buffer. In Next.js App Router, make sure you're not parsing the body before verifying. Try using `Buffer.from(await req.text())` directly.", createdAt: "2025-08-10T10:20:00Z", upvotes: 18 },
    { id: "c2", author: { name: "Bhanu Bhaskar", college: "DTU Delhi", avatarUrl: "/avatars/avatar_05.jpg" }, body: "Also double check that your webhook secret in `.env` doesn't have extra whitespace. Caught me off guard once.", createdAt: "2025-08-10T11:00:00Z", upvotes: 7 },
  ],
  a2: [
    { id: "c3", author: { name: "Ayush Singh", college: "NMIMS MPSTME Shirpur", avatarUrl: "/avatars/avatar_03.jpg" }, body: "I have 1.5 yrs PyTorch + YOLO experience and can do model fine-tuning. Drop me a DM!", createdAt: "2025-08-09T15:00:00Z", upvotes: 12 },
  ],
  a3: [
    { id: "c5", author: { name: "Prakhar Jaiswal", college: "NMIMS MPSTME Shirpur", avatarUrl: "/avatars/avatar_01.jpg" }, body: "The Supabase Realtime approach is underrated. Used the same pattern for a live polling app. Solid choice.", createdAt: "2025-08-07T19:00:00Z", upvotes: 22 },
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
function ChatIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10c0 4.418-3.582 8-8 8H2l2-2A8 8 0 1 1 18 10z" />
    </svg>
  );
}

function ThumbUpIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function BookmarkIcon({ filled = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h14a1 1 0 0 1 1 1v19l-8-5-8 5V3a1 1 0 0 1 1-1z"/>
    </svg>
  );
}

function DotsIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 4" fill="currentColor">
      <circle cx="2" cy="2" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="18" cy="2" r="1.5"/>
    </svg>
  );
}

function FilterIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h14M6 10h8M9 15h2"/>
    </svg>
  );
}

function ArrowUpIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}

function ArrowDownIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  );
}

function Avatar({ src, name, size = 6 }) {
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 border border-cy-ink/30 flex items-center justify-center bg-cy-ink`} aria-hidden="true">
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span className="font-mono text-[7px] font-bold text-white">{getInitials(name ?? "?")}</span>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BoardCard — matches the reference screenshot exactly
// ─────────────────────────────────────────────────────────────
function BoardCard({ ask, isSelected, isCompact, onClick }) {
  const meta   = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "#111", textColor: "#fff" };
  const author = ask.author;
  const timeAgo = ask.createdAt ? formatRelative(ask.createdAt) : "";

  const [localSaved, setLocalSaved]   = useState(ask.saved ?? false);
  const [localLikes, setLocalLikes]   = useState(ask.likeCount ?? 0);
  const [liked,      setLiked]        = useState(false);
  const [saving,     setSaving]       = useState(false);
  const [liking,     setLiking]       = useState(false);

  async function handleSave(e) {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const { saved } = await toggleSave(ask.id);
      setLocalSaved(saved);
    } catch {
      setLocalSaved((s) => !s); // optimistic toggle
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(e) {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      const { liked: nowLiked } = await toggleLike(ask.id);
      setLiked(nowLiked);
      setLocalLikes((v) => nowLiked ? v + 1 : v - 1);
    } catch {
      setLiked((l) => !l);
      setLocalLikes((v) => liked ? v - 1 : v + 1);
    } finally {
      setLiking(false);
    }
  }

  if (isCompact) {
    return (
      <article
        onClick={onClick}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
        className={`cursor-pointer border-l-4 border-y border-r transition-all duration-150 p-3 ${
          isSelected
            ? "bg-cy-orange/5 border-l-[5px] border-y-cy-orange/30 border-r-cy-orange/30"
            : "border-cy-ink/15 hover:bg-cy-ink/[0.02]"
        }`}
        style={{ borderLeftColor: meta.color }}
      >
        <span className="font-mono text-[8px] font-bold uppercase text-white px-1.5 py-0.5 inline-block mb-1.5" style={{ backgroundColor: meta.color }}>{meta.label}</span>
        <p className="font-sans font-bold text-[11px] leading-snug text-cy-ink line-clamp-2">{ask.title}</p>
        <p className="font-mono text-[9px] text-cy-muted mt-1">{author?.name ?? "You"}</p>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      className={`group cursor-pointer border-l-[5px] transition-all duration-200 relative ${
        isSelected
          ? "border-l-[6px] bg-cy-orange/[0.04]"
          : "border-cy-ink/10 hover:border-cy-ink/20"
      }`}
      style={{
        borderLeftColor: meta.color,
        borderTop: "1px solid var(--border-subtle)",
        borderRight: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: isSelected ? undefined : "var(--bg)",
        boxShadow: isSelected ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      {/* Top row: badge + time + dots */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <span
          className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5"
          style={{ backgroundColor: meta.color, color: meta.textColor }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] text-cy-muted">{timeAgo}</span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-cy-muted hover:text-cy-ink transition-colors opacity-0 group-hover:opacity-100 border-0"
            title="More options"
          >
            <DotsIcon size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-sans font-bold text-[15px] leading-snug text-cy-ink px-4 pb-1.5 line-clamp-2">
        {ask.title}
      </h3>

      {/* Body excerpt */}
      <p className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3 line-clamp-2">
        {stripMarkdown(ask.details)}
      </p>

      {/* Tags */}
      {ask.tags?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 px-4 pb-3.5">
          {ask.tags.slice(0, 5).map((tag) => (
            <li
              key={tag}
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-[8px] tracking-[0.04em] uppercase border border-cy-ink/25 px-2 py-0.5 text-cy-muted hover:border-cy-ink/50 hover:text-cy-ink transition-colors cursor-pointer"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-cy-ink/10">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={author?.avatarUrl} name={author?.name} size={6} />
          <span className="font-sans text-[12px] text-cy-ink leading-none truncate">
            <span className="font-semibold">{author?.name ?? "You"}</span>
            {author?.college && <span className="text-cy-muted font-normal"> · {author.college}</span>}
            {timeAgo && <span className="text-cy-muted font-normal"> · {timeAgo}</span>}
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-cy-muted hover:text-cy-ink transition-colors border-0 px-0 py-0"
          >
            <ChatIcon size={13} />
            <span className="font-mono text-[10px]">{ask.commentCount ?? 0}</span>
          </button>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors border-0 px-0 py-0 ${liked ? "text-cy-orange" : "text-cy-muted hover:text-cy-orange"}`}
            disabled={liking}
          >
            <ThumbUpIcon size={13} />
            <span className="font-mono text-[10px]">{localLikes}</span>
          </button>
          <button
            onClick={handleSave}
            className={`transition-colors border-0 px-0 py-0 ${localSaved ? "text-cy-orange" : "text-cy-muted hover:text-cy-orange"}`}
            disabled={saving}
            title={localSaved ? "Unsave" : "Save"}
          >
            <BookmarkIcon filled={localSaved} size={13} />
          </button>
        </div>
      </footer>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  DetailPanel — fully wired to backend
// ─────────────────────────────────────────────────────────────
function DetailPanel({ ask, onClose, onAskUpdate }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "#111", textColor: "#fff" };
  const author  = ask.author;
  const timeAgo = ask.createdAt ? formatRelative(ask.createdAt) : "";

  const { profile } = useAuth();
  const textareaRef = useRef(null);

  // ── Vote / Like state ─────────────────────────────────────
  const [upvotes, setUpvotes]   = useState(ask.likeCount ?? 0);
  const [voted, setVoted]       = useState(null); // 'up' | 'down' | null
  const [liking, setLiking]     = useState(false);

  // ── Save state ────────────────────────────────────────────
  const [saved, setSaved]       = useState(ask.saved ?? false);
  const [saving, setSaving]     = useState(false);

  // ── Comment state ─────────────────────────────────────────
  const [comment, setComment]   = useState("");
  const [posting, setPosting]   = useState(false);
  const [commentLikes, setCommentLikes] = useState({}); // commentId → { count, liked }
  const initialComments = useMemo(() => {
    const base = MOCK_COMMENTS[ask.id] ?? [];
    return base.map(c => ({ ...c, upvotes: c.upvotes ?? 0 }));
  }, [ask.id]);
  const [allComments, setAllComments] = useState(initialComments);

  // ── Upvote / Downvote ────────────────────────────────────
  async function handleVote(dir) {
    if (liking) return;
    if (dir === "up") {
      // Call real backend for upvote
      setLiking(true);
      try {
        const prev = voted;
        if (voted === "up") {
          // un-upvote
          setVoted(null);
          setUpvotes(v => v - 1);
          await toggleLike(ask.id);
        } else {
          const delta = voted === "down" ? 2 : 1;
          setVoted("up");
          setUpvotes(v => v + delta);
          await toggleLike(ask.id);
        }
        onAskUpdate?.(ask.id);
      } catch {
        // rollback optimistic update on error
      } finally {
        setLiking(false);
      }
    } else {
      // Downvote — local only (no downvote table in schema)
      if (voted === "down") {
        setVoted(null);
        setUpvotes(v => v + 1);
      } else {
        const delta = voted === "up" ? -2 : -1;
        setVoted("down");
        setUpvotes(v => v + delta);
      }
    }
  }

  // ── Save ─────────────────────────────────────────────────
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const { saved: nowSaved } = await toggleSave(ask.id);
      setSaved(nowSaved);
    } catch {
      setSaved(s => !s); // optimistic rollback
    } finally {
      setSaving(false);
    }
  }

  // ── Post comment ─────────────────────────────────────────
  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim() || posting) return;
    setPosting(true);
    // Optimistic append
    const optimistic = {
      id: `opt-${Date.now()}`,
      author: { name: profile?.name ?? "You", college: profile?.college ?? "", avatarUrl: profile?.avatarUrl },
      body: comment.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };
    setAllComments(prev => [optimistic, ...prev]);
    setComment("");
    try {
      const saved = await addComment(ask.id, optimistic.body);
      // Replace optimistic entry with real one
      setAllComments(prev => prev.map(c => c.id === optimistic.id ? { ...saved, upvotes: 0 } : c));
    } catch {
      // keep optimistic on error, just mark as local
    } finally {
      setPosting(false);
    }
  }

  // ── Reply to comment (focus textarea + prefill) ──────────
  function handleReply(authorName) {
    setComment(`@${authorName} `);
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ── Comment upvote (local toggle — no comment_likes table) 
  function handleCommentLike(commentId, currentUpvotes) {
    setCommentLikes(prev => {
      const existing = prev[commentId];
      if (existing?.liked) {
        return { ...prev, [commentId]: { count: (existing.count ?? currentUpvotes) - 1, liked: false } };
      }
      return { ...prev, [commentId]: { count: (existing?.count ?? currentUpvotes) + 1, liked: true } };
    });
  }

  // ── Markdown-ish renderer ────────────────────────────────
  const renderDetails = (text = "") => {
    let inCode = false; let code = []; const els = [];
    text.split("\n").forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCode) { els.push(<div key={`code-${i}`} className="my-4 border-2 border-cy-ink bg-cy-ink text-white p-4 overflow-x-auto"><pre className="font-mono text-[13px] leading-relaxed"><code>{code.join("\n")}</code></pre></div>); code = []; inCode = false; } else { inCode = true; } return;
      }
      if (inCode) { code.push(line); return; }
      if (line.trim() === "") { els.push(<div key={i} className="h-3" />); }
      else { els.push(<p key={i} className="font-sans text-[15px] text-cy-ink leading-relaxed">{line}</p>); }
    });
    return els;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-cy-bg border-l border-cy-ink/15">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-12">
          {/* Badge + Close */}
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1" style={{ backgroundColor: meta.color, color: meta.textColor }}>
              {meta.label}
            </span>
            <button onClick={onClose} className="font-mono text-[10px] font-bold tracking-[0.08em] text-cy-muted hover:text-cy-ink transition-colors flex items-center gap-1 uppercase border-0">
              ✕ Close
            </button>
          </div>

          <div className="flex gap-4">
            {/* Vote column */}
            <div className="flex flex-col items-center shrink-0 w-11 border-2 border-cy-ink bg-cy-bg shadow-[3px_3px_0px_0px_var(--shadow)] self-start mt-1">
              <button
                onClick={() => handleVote("up")}
                disabled={liking}
                className={`w-full h-9 flex items-center justify-center border-0 border-b-2 border-cy-ink transition-colors px-0 py-0 rounded-none outline-none ${voted === 'up' ? 'bg-cy-orange text-white' : 'hover:bg-cy-orange hover:text-white text-cy-ink'} disabled:opacity-50`}
                title="Upvote"
              >
                <ArrowUpIcon size={16} />
              </button>
              <div className="w-full h-9 flex items-center justify-center font-mono font-bold text-[13px] bg-cy-ink/[0.03]">
                {upvotes}
              </div>
              <button
                onClick={() => handleVote("down")}
                className={`w-full h-9 flex items-center justify-center border-0 border-t-2 border-cy-ink transition-colors px-0 py-0 rounded-none outline-none ${voted === 'down' ? 'bg-cy-ink text-white' : 'hover:bg-cy-ink hover:text-white text-cy-ink'}`}
                title="Downvote"
              >
                <ArrowDownIcon size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-black text-2xl leading-tight tracking-tight text-cy-ink mb-3">{ask.title}</h2>

              <div className="flex items-center justify-between gap-3 border-b border-cy-ink/15 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Avatar src={author?.avatarUrl} name={author?.name} size={8} />
                  <div>
                    <p className="font-sans font-semibold text-[14px] text-cy-ink">{author?.name ?? "You"}</p>
                    <p className="font-mono text-[10px] text-cy-muted">{author?.college} · {timeAgo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* SAVE button — wired to toggleSave */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`font-mono text-[10px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border transition-all disabled:opacity-60 ${
                      saved
                        ? "border-cy-orange bg-cy-orange text-white"
                        : "border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)]"
                    }`}
                  >
                    {saved ? "✓ SAVED" : "SAVE"}
                  </button>
                  {/* REPLY — scrolls to comment box */}
                  <button
                    onClick={() => {
                      textareaRef.current?.focus();
                      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all"
                  >
                    REPLY
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-5">{renderDetails(ask.details)}</div>

              {ask.tags?.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-6">
                  {ask.tags.map((tag) => (
                    <li key={tag} className="font-mono text-[9px] uppercase tracking-[0.06em] border border-cy-ink/25 px-2.5 py-1 text-cy-muted">{tag}</li>
                  ))}
                </ul>
              )}

              <p className="font-mono text-[10px] text-cy-muted mb-4">{allComments.length} comment{allComments.length !== 1 ? "s" : ""}</p>

              {/* Top answer */}
              {allComments.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-1.5 mb-2" style={{ color: "#1E8A5A" }}>
                    <span className="font-mono text-sm font-bold">✓</span>
                    <span className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase">Top Answer</span>
                  </div>
                  <div className="border-l-4 border-[#1E8A5A] pl-4 bg-[#1E8A5A]/5 py-3 pr-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar src={allComments[0].author?.avatarUrl} name={allComments[0].author?.name} size={7} />
                      <div>
                        <p className="font-sans font-semibold text-[13px] text-cy-ink">{allComments[0].author?.name}</p>
                        <p className="font-mono text-[9px] text-cy-muted">{allComments[0].author?.college}</p>
                      </div>
                    </div>
                    <p className="font-sans text-[14px] text-cy-ink leading-relaxed">{allComments[0].body}</p>
                  </div>
                </div>
              )}

              <hr className="border-t border-cy-ink/10 mb-4" />

              {/* Comment form — wired to addComment */}
              <form onSubmit={handleComment} className="flex flex-col gap-2 mb-6">
                <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-cy-muted">Add a comment</p>
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleComment(e); }}
                  placeholder="Write your response... (Ctrl+Enter to post)"
                  rows={3}
                  className="w-full font-sans text-sm text-cy-ink bg-cy-bg border border-cy-ink/30 px-3 py-2 resize-none focus:outline-none focus:border-cy-orange transition-colors"
                  style={{ borderRadius: 0 }}
                />
                <button
                  type="submit"
                  disabled={posting || !comment.trim()}
                  className="self-end font-mono text-[10px] font-bold tracking-[0.08em] uppercase px-4 py-2 border border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-colors disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post →"}
                </button>
              </form>

              {/* Comments list */}
              {allComments.length > 0 && (
                <div className="flex flex-col gap-4">
                  {allComments.map((c) => {
                    const likeState = commentLikes[c.id];
                    const displayUpvotes = likeState?.count ?? c.upvotes ?? 0;
                    const isLiked = likeState?.liked ?? false;
                    return (
                      <div key={c.id} className="border-l-2 border-cy-ink/20 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar src={c.author?.avatarUrl} name={c.author?.name} size={5} />
                          <span className="font-mono text-[10px] font-bold text-cy-ink">{c.author?.name}</span>
                          {c.author?.college && <span className="font-mono text-[9px] text-cy-muted">{c.author.college}</span>}
                          <span className="ml-auto font-mono text-[9px] text-cy-muted">{formatRelative(c.createdAt)}</span>
                        </div>
                        <p className="font-sans text-sm text-cy-ink leading-relaxed">{c.body}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Comment upvote — local toggle */}
                          <button
                            onClick={() => handleCommentLike(c.id, c.upvotes ?? 0)}
                            className={`font-mono text-[9px] transition-colors border-0 ${isLiked ? "text-cy-orange font-bold" : "text-cy-muted hover:text-cy-orange"}`}
                          >
                            ▲ {displayUpvotes}
                          </button>
                          {/* Reply — focuses comment box with @mention */}
                          <button
                            onClick={() => handleReply(c.author?.name ?? "")}
                            className="font-mono text-[9px] text-cy-muted hover:text-cy-ink transition-colors border-0"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Discovery Rail
// ─────────────────────────────────────────────────────────────
function RailSection({ title, children }) {
  return (
    <div className="border-b border-cy-ink/10 pb-5 mb-5 last:border-0 last:mb-0">
      <h3 className="font-display font-black text-[14px] text-cy-ink mb-3 tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

function DiscoveryRail() {
  return (
    <aside className="hidden xl:block w-[268px] shrink-0 bg-cy-bg border-l border-cy-ink/15 h-full overflow-y-auto px-5 pt-6 pb-8">

      <RailSection title="Activity this week">
        <dl className="space-y-2">
          {[
            { icon: "📊", label: "Asks posted",   value: 64  },
            { icon: "💬", label: "Answers given", value: 142 },
            { icon: "👥", label: "New builders",  value: 87  },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 font-sans text-[12px] text-cy-muted">
                <span className="text-[10px]">{icon}</span>{label}
              </dt>
              <dd className="font-mono text-[13px] font-bold text-cy-ink tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </RailSection>

      <RailSection title="Top colleges">
        <dl className="space-y-2.5">
          {TOP_COLLEGES.map(({ name, count, color }) => (
            <div key={name} className="flex items-center justify-between">
              <dt className="flex items-center gap-2 font-sans text-[12px] text-cy-ink">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="truncate">{name}</span>
              </dt>
              <dd className="font-mono text-[12px] font-bold tabular-nums shrink-0 ml-2" style={{ color }}>{count}</dd>
            </div>
          ))}
        </dl>
        <button className="font-sans text-[11px] text-cy-muted hover:text-cy-orange transition-colors mt-3 block border-0">
          View all colleges →
        </button>
      </RailSection>

      <RailSection title="Trending topics">
        <div className="flex items-center justify-between mb-2">
          <div></div>
          <button className="font-sans text-[11px] text-cy-muted hover:text-cy-orange transition-colors border-0">View all</button>
        </div>
        <dl className="space-y-2.5">
          {TRENDING_TOPICS.map(({ name, count, color }) => (
            <div key={name} className="flex items-center justify-between">
              <dt className="flex items-center gap-2 font-sans text-[12px] text-cy-ink">
                <span className="text-[10px]">🔥</span>{name}
              </dt>
              <dd className="font-mono text-[12px] font-bold tabular-nums" style={{ color }}>{count}</dd>
            </div>
          ))}
        </dl>
      </RailSection>

      <RailSection title="Pinned groups">
        <div className="flex items-center justify-between mb-2">
          <div></div>
          <button className="font-sans text-[11px] text-cy-muted hover:text-cy-orange transition-colors border-0">View all</button>
        </div>
        <ul className="space-y-3">
          {PINNED_GROUPS.map(({ name, members, color }) => (
            <li key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-cy-ink/20 flex items-center justify-center shrink-0" style={{ backgroundColor: color + "22" }}>
                  <span className="font-mono text-[8px] font-bold" style={{ color }}>{name[0]}</span>
                </div>
                <div>
                  <p className="font-sans font-semibold text-[12px] text-cy-ink leading-tight">{name}</p>
                  <p className="font-mono text-[10px] text-cy-muted">{members} members</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <button className="text-cy-muted hover:text-cy-ink transition-colors border-0 text-[11px]">···</button>
              </div>
            </li>
          ))}
        </ul>
      </RailSection>

    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
//  Board page
// ─────────────────────────────────────────────────────────────
export default function Board() {
  const { setContext } = useCat();

  const [allAsks,     setAllAsks]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeType,  setActiveType]  = useState(null);
  const [activeTag,   setActiveTag]   = useState(null);
  const [sortBy,      setSortBy]      = useState("latest");
  const [showSort,    setShowSort]    = useState(false);
  const [selectedAsk, setSelectedAsk] = useState(null);
  
  // Filter states
  const [activeCollege, setActiveCollege] = useState(null);
  const [showCollegeFilter, setShowCollegeFilter] = useState(false);
  const sortRef = useRef(null);
  const collegeRef = useRef(null);

  useEffect(() => { setContext({ page: "board" }); }, [setContext]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handle(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

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

  const allColleges = useMemo(() => {
    const colSet = new Set();
    allAsks.forEach((ask) => {
      if (ask.author?.college) colSet.add(ask.author.college);
    });
    return Array.from(colSet).sort();
  }, [allAsks]);

  const filteredAsks = useMemo(() => {
    let result = allAsks.filter((ask) => {
      const typeMatch    = activeType === null || ask.type === activeType;
      const tagMatch     = activeTag === null  || ask.tags?.includes(activeTag);
      const collegeMatch = activeCollege === null || ask.author?.college === activeCollege;
      return typeMatch && tagMatch && collegeMatch;
    });
    if (sortBy === "most-helpful")   result = [...result].sort((a, b) => (b.likeCount ?? 0)   - (a.likeCount ?? 0));
    if (sortBy === "most-discussed") result = [...result].sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    return result;
  }, [allAsks, activeType, activeTag, activeCollege, sortBy]);

  const hasFilters = activeType !== null || activeTag !== null;
  const isDetail   = selectedAsk !== null;
  const topicChips = allTags.length > 0 ? allTags.slice(0, 18) : POPULAR_TOPICS;

  const SORT_LABELS = { latest: "Latest", "most-helpful": "Most Helpful", "most-discussed": "Most Discussed" };

  return (
    <div className="flex h-full w-full overflow-hidden bg-cy-bg">

      {/* ── Feed column ─────────────────────────────────────────── */}
      <div className={`flex flex-col h-full overflow-hidden bg-cy-bg transition-all duration-300 ease-out shrink-0 ${isDetail ? "w-[280px] lg:w-[300px] border-r border-cy-ink/15" : "flex-1"}`}>

        {/* Board header */}
        {!isDetail && (
          <div className="px-6 md:px-8 pt-7 pb-0">
            <div className="flex items-start justify-between gap-4 pb-5">
              <div>
                <h1 className="font-display font-black text-[2rem] text-cy-ink leading-tight">Board</h1>
                <p className="font-sans text-[13px] text-cy-muted mt-0.5">
                  Real questions. Real builders. Real help.
                </p>
              </div>
              <Link
                to="/ask/new"
                className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase shrink-0
                           px-5 py-2.5 bg-cy-ink text-[var(--bg)] border-0
                           shadow-[3px_3px_0px_0px_var(--text)]
                           hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_var(--text)]
                           transition-all flex items-center gap-2"
              >
                + POST AN ASK
              </Link>
            </div>
          </div>
        )}

        {/* Compact header in detail mode */}
        {isDetail && (
          <div className="px-4 py-3.5 border-b border-cy-ink/15 sticky top-0 bg-cy-bg z-10">
            <p className="font-display font-black text-lg text-cy-ink">BOARD</p>
            <Link to="/ask/new" className="font-mono text-[9px] uppercase font-bold text-cy-orange hover:underline border-0">+ Post an Ask</Link>
          </div>
        )}

        {/* Type tabs row */}
        <div className={`px-6 md:px-8 border-b border-cy-ink/10 sticky ${isDetail ? "top-[68px]" : "top-0"} z-10 bg-cy-bg`}>
          <div className="flex items-center justify-between">
            {/* Tab buttons */}
            <div className="flex items-center gap-1" role="group">
              {TYPE_FILTERS.map(({ label, value, color }) => {
                const isActive = activeType === value;
                return (
                  <button
                    key={label}
                    onClick={() => { setActiveType(value); setActiveTag(null); }}
                    aria-pressed={isActive}
                    className={`font-mono font-bold text-[11px] tracking-[0.06em] uppercase px-3.5 py-2.5 border-b-[2.5px] transition-all duration-150 ${isDetail ? "px-2 py-2 text-[9px]" : ""}`}
                    style={isActive
                      ? { borderBottomColor: value === null ? "#111" : color, color: value === null ? "#111" : color, backgroundColor: "transparent" }
                      : { borderBottomColor: "transparent", color: "var(--text-muted)", backgroundColor: "transparent", border: "none", borderBottom: "2.5px solid transparent" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Sort + count */}
            {!isDetail && (
              <div className="flex items-center gap-4 py-1">
                {!loading && (
                  <span className="font-mono text-[10px] text-cy-muted">
                    {filteredAsks.length} asks
                  </span>
                )}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setShowSort((s) => !s)}
                    className="flex items-center gap-1 font-mono text-[11px] font-bold text-cy-ink border border-cy-ink/25 px-3 py-1.5 hover:border-cy-ink transition-colors"
                  >
                    {SORT_LABELS[sortBy]} ↓
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-full mt-1 bg-cy-bg border border-cy-ink/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 min-w-[160px]">
                      {Object.entries(SORT_LABELS).map(([val, lbl]) => (
                        <button key={val} onClick={() => { setSortBy(val); setShowSort(false); }}
                          className={`w-full text-left font-mono text-[10px] uppercase tracking-[0.06em] px-4 py-2.5 hover:bg-cy-ink/5 transition-colors border-0 ${sortBy === val ? "text-cy-orange font-bold" : "text-cy-ink"}`}
                        >{lbl}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter bar + topic chips */}
        {!isDetail && (
          <div className="px-6 md:px-8 py-2.5 border-b border-cy-ink/10 bg-cy-bg">
            {/* Filter dropdowns row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <button
                className={`flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] border px-2.5 py-1 transition-colors ${
                  hasFilters ? "border-cy-orange text-cy-orange" : "border-cy-ink/20 text-cy-muted hover:border-cy-ink hover:text-cy-ink"
                }`}
                onClick={() => { setActiveType(null); setActiveTag(null); setActiveCollege(null); }}
                title={hasFilters ? "Clear all filters" : "Filters"}
              >
                <FilterIcon size={11} /> {hasFilters ? `Filters (${[activeTag, activeCollege].filter(Boolean).length})` : "Filters"}
              </button>

              {/* College filter */}
              <div className="relative" ref={collegeRef}>
                <button
                  onClick={() => setShowCollegeFilter(s => !s)}
                  className={`font-mono text-[10px] uppercase tracking-[0.06em] border px-2.5 py-1 transition-colors ${
                    activeCollege ? "border-cy-ink text-cy-ink bg-cy-ink/5 font-bold" : "border-cy-ink/20 text-cy-muted hover:border-cy-ink hover:text-cy-ink"
                  }`}
                >
                  {activeCollege ? `College: ${activeCollege}` : "College ↓"}
                </button>
                {showCollegeFilter && (
                  <div className="absolute left-0 top-full mt-1 bg-cy-bg border border-cy-ink/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 min-w-[200px] max-h-52 overflow-y-auto">
                    {allColleges.length === 0 ? (
                      <p className="font-mono text-[10px] text-cy-muted px-4 py-3">No colleges found</p>
                    ) : allColleges.map((col) => (
                      <button key={col} onClick={() => { setActiveCollege(prev => prev === col ? null : col); setShowCollegeFilter(false); }}
                        className={`w-full text-left font-mono text-[10px] px-4 py-2 hover:bg-cy-ink/5 transition-colors border-0 truncate ${
                          activeCollege === col ? "text-cy-orange font-bold" : "text-cy-ink"
                        }`}
                      >{col}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag/skill filter — already handled by chips below, show active tag here */}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="font-mono text-[10px] uppercase tracking-[0.06em] border border-cy-orange text-cy-orange bg-cy-orange/5 px-2.5 py-1 transition-colors hover:bg-cy-orange/10"
                >
                  Tag: {activeTag} ✕
                </button>
              )}

              {(hasFilters || activeCollege) && (
                <button
                  onClick={() => { setActiveType(null); setActiveTag(null); setActiveCollege(null); }}
                  className="ml-auto font-mono text-[10px] uppercase text-cy-orange border-0 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Popular topic chips */}
            <div className="flex flex-wrap gap-1.5">
              {topicChips.slice(0, 18).map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag((prev) => prev === tag ? null : tag)}
                    aria-pressed={isActive}
                    className={`font-mono text-[9px] uppercase tracking-[0.04em] px-2 py-0.5 border transition-all duration-100 ${
                      isActive
                        ? "bg-cy-ink text-[var(--bg)] border-cy-ink"
                        : "border-cy-ink/25 text-cy-muted hover:border-cy-ink/60 hover:text-cy-ink"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {allTags.length > 18 && (
                <span className="font-mono text-[9px] text-cy-muted self-center">+ More</span>
              )}
            </div>
          </div>
        )}

        {/* Ask feed */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-8 py-4">
            <section aria-labelledby="asks-list" aria-live="polite">
              <h2 id="asks-list" className="sr-only">Asks</h2>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[160px] bg-cy-ink/5 border-l-4 border-cy-ink/10 animate-pulse" />
                  ))}
                </div>
              ) : filteredAsks.length === 0 ? (
                <div className="border border-cy-ink/20 p-12 text-center mt-4">
                  <p className="font-display font-bold text-xl text-cy-ink">Nothing here yet.</p>
                  <p className="font-sans text-sm text-cy-muted mt-2">Try another skill, college, or ask type.</p>
                  <button
                    onClick={() => { setActiveType(null); setActiveTag(null); }}
                    className="mt-5 font-mono text-xs tracking-[0.08em] uppercase text-cy-ink border border-cy-ink px-4 py-2 hover:bg-cy-ink hover:text-[var(--bg)] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {filteredAsks.map((ask) => (
                    <li key={ask.id}>
                      <BoardCard
                        ask={ask}
                        isSelected={isDetail && selectedAsk?.id === ask.id}
                        isCompact={isDetail}
                        onClick={() => setSelectedAsk(selectedAsk?.id === ask.id ? null : ask)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ── Detail Panel ──────────────────────────────────────── */}
      <div
        className={`h-full bg-cy-bg flex-1 overflow-hidden transition-all duration-300 ease-out ${
          isDetail
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "w-0 max-w-0 opacity-0 translate-x-6 pointer-events-none"
        }`}
        style={{ minWidth: isDetail ? 0 : 0 }}
      >
        {selectedAsk && (
          <DetailPanel key={selectedAsk.id} ask={selectedAsk} onClose={() => setSelectedAsk(null)} />
        )}
      </div>

      {/* ── Right Discovery Rail ──────────────────────────────── */}
      {!isDetail && <DiscoveryRail />}
    </div>
  );
}
