import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAsks } from "../data/db";
import { useAuth } from "../context/AuthContext";
import { useCat } from "../context/CatContext";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "ALL",       value: null,        color: "var(--text)" },
  { label: "HELP",      value: "help",      color: "var(--accent)" },
  { label: "TEAMMATE",  value: "teammate",  color: "var(--cat-blue)" },
  { label: "BUILD_LOG", value: "build_log", color: "var(--cat-green)" },
];

const TYPE_META = {
  help:      { label: "HELP",      color: "var(--accent)" },
  teammate:  { label: "TEAMMATE",  color: "var(--cat-blue)" },
  build_log: { label: "BUILD_LOG", color: "var(--cat-green)" },
};

// Mock comments per ask for prototype
const MOCK_COMMENTS = {
  a1: [
    { id: "c1", author: { name: "Priya Nair", college: "KIIT Bhubaneswar", avatarUrl: "/avatars/avatar_02.jpg" }, body: "You're using `req.text()` but Razorpay expects the raw body buffer. In Next.js App Router, make sure you're not parsing the body before verifying. Try using `Buffer.from(await req.text())` directly.", createdAt: "2025-08-10T10:20:00Z", upvotes: 18 },
    { id: "c2", author: { name: "Karan Mehta", college: "UPES Dehradun", avatarUrl: "/avatars/avatar_05.jpg" }, body: "Also double check that your webhook secret in `.env` doesn't have extra whitespace. Caught me off guard once.", createdAt: "2025-08-10T11:00:00Z", upvotes: 7 },
  ],
  a2: [
    { id: "c3", author: { name: "Rohan Gupta", college: "PES University", avatarUrl: "/avatars/avatar_03.jpg" }, body: "I have 1.5 yrs PyTorch + YOLO experience and can do model fine-tuning. Drop me a DM!", createdAt: "2025-08-09T15:00:00Z", upvotes: 12 },
    { id: "c4", author: { name: "Sneha Reddy", college: "Chandigarh University", avatarUrl: "/avatars/avatar_06.jpg" }, body: "What's the timeline for final submission? Also is this open to non-NIT colleges?", createdAt: "2025-08-09T16:30:00Z", upvotes: 3 },
  ],
  a3: [
    { id: "c5", author: { name: "Prakhar Jaiswal", college: "NMIMS MPSTME Shirpur", avatarUrl: "/avatars/avatar_01.jpg" }, body: "The Supabase Realtime approach is underrated. I used the same pattern for a live polling app. Solid choice.", createdAt: "2025-08-07T19:00:00Z", upvotes: 22 },
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
function FeedCard({ ask, isSelected, isCompact, onClick }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "var(--text)" };
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
          ? "border-cy-orange bg-cy-orange/5 shadow-[4px_4px_0px_0px_var(--accent)] -translate-y-px -translate-x-px"
          : "border-cy-ink bg-cy-bg hover:-translate-y-px hover:-translate-x-px hover:shadow-[4px_4px_0px_0px_var(--text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cy-orange",
      ].join(" ")}
      style={isSelected ? { borderLeftColor: "var(--accent)", borderLeftWidth: "6px" } : { borderLeftColor: meta.color, borderLeftWidth: "4px" }}
    >
      <div className={`flex items-start justify-between px-3 ${isCompact ? "pt-2 pb-1" : "pt-3 pb-2"}`}>
        <span
          className={`font-mono font-bold tracking-[0.14em] uppercase text-white ${isCompact ? "text-[8px] px-2 py-0.5" : "text-[9px] px-2.5 py-1"}`}
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
        {timeAgo && (
          <span className={`font-mono text-cy-muted tracking-[0.04em] ${isCompact ? "text-[8px]" : "text-[10px]"}`}>{timeAgo}</span>
        )}
      </div>

      <h3
        className={`font-sans font-bold leading-tight text-cy-ink px-3 ${isCompact ? "text-[12px] pb-2 line-clamp-2" : "text-[15px] pb-2 line-clamp-2"}`}
      >
        {ask.title}
      </h3>

      {!isCompact && (
        <>
          <p className="font-sans text-sm text-cy-muted leading-relaxed px-3 pb-3 line-clamp-2">
            {stripMarkdown(ask.details)}
          </p>
          {ask.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 px-3 pb-3">
              {ask.tags.map((tag) => (
                <li key={tag} className="font-mono text-[8px] tracking-[0.06em] uppercase border border-cy-ink px-1.5 py-0.5 text-cy-ink">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <footer className={`flex items-center justify-between gap-3 px-3 py-2 border-t ${isSelected ? 'border-cy-orange/30' : 'border-cy-ink/20'}`}>
        {!isCompact && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-cy-ink flex items-center justify-center bg-cy-ink" aria-hidden="true">
              {author?.avatarUrl
                ? <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                : <span className="font-mono text-[8px] font-bold text-white">{getInitials(author?.name ?? "?")}</span>
              }
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] font-bold text-cy-ink truncate block">{author?.name ?? "You"}</span>
            </div>
          </div>
        )}
        <div className={`flex items-center gap-3 shrink-0 text-cy-muted ${isCompact ? "w-full justify-start" : ""}`}>
          {!isCompact && typeof ask.commitsThisMonth === "number" && ask.commitsThisMonth > 0 && (
            <span className="flex items-center gap-1 font-mono text-[9px]"><GitHubIcon /> {ask.commitsThisMonth}</span>
          )}
          <span className="font-mono text-[9px]">💬 {ask.commentCount ?? 0}</span>
          <span className="font-mono text-[9px]">▲ {ask.likeCount ?? 0}</span>
        </div>
      </footer>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  DetailPanel — Reddit-style post view
// ─────────────────────────────────────────────────────────────
function DetailPanel({ ask, onClose }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "var(--text)" };
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
    let inCodeBlock = false;
    let codeContent = [];
    const elements = [];
    
    text.split("\n").forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${i}`} className="my-5 border-2 border-cy-ink bg-[var(--text)] p-5 text-white overflow-x-auto shadow-[4px_4px_0px_0px_var(--shadow)]">
              <pre className="font-mono text-[13px] leading-relaxed">
                <code>{codeContent.join("\n")}</code>
              </pre>
            </div>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }
      
      if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(<p key={i} className="font-sans font-bold text-[15px] text-cy-ink mt-5 mb-2">{line.replace(/\*\*/g, "")}</p>);
      } else if (line.startsWith("• ") || line.startsWith("- ")) {
        elements.push(<p key={i} className="font-sans text-[15px] text-cy-ink pl-4 leading-relaxed relative before:content-['•'] before:absolute before:left-0 before:text-cy-ink">{line.slice(2)}</p>);
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-3" />);
      } else {
        elements.push(<p key={i} className="font-sans text-[15px] text-cy-ink leading-relaxed">{line}</p>);
      }
    });
    
    // Catch unclosed code blocks
    if (inCodeBlock) {
      elements.push(
        <div key={`code-end`} className="my-5 border-2 border-cy-ink bg-[var(--text)] p-5 text-white overflow-x-auto shadow-[4px_4px_0px_0px_var(--shadow)]">
          <pre className="font-mono text-[13px] leading-relaxed">
            <code>{codeContent.join("\n")}</code>
          </pre>
        </div>
      );
    }
    
    return elements;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-cy-bg">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-10 pt-6 pb-12 flex flex-col">

          {/* Type Badge & Close Button */}
          <div className="flex items-start justify-between mb-4">
            <span
              className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase text-white px-3 py-1.5"
              style={{ backgroundColor: meta.color }}
            >
              {meta.label}
            </span>
            <button
              onClick={onClose}
              className="font-mono text-[11px] font-bold tracking-[0.08em] text-cy-ink hover:text-cy-orange transition-colors flex items-center gap-1 bg-cy-bg border-2 border-transparent hover:border-cy-orange px-2 py-1 uppercase"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="flex gap-4 sm:gap-6">
            {/* Voting Column (Reddit Style) */}
            <div className="flex flex-col items-center gap-1 pt-1 shrink-0 w-8">
              <button onClick={() => handleVote("up")} className={`text-xl hover:text-cy-orange transition-colors leading-none ${voted === 'up' ? 'text-cy-orange' : 'text-cy-muted'}`}>▲</button>
              <span className="font-mono text-[13px] font-bold text-cy-ink">{upvotes}</span>
              <button onClick={() => handleVote("down")} className={`text-xl hover:text-cy-ink transition-colors leading-none ${voted === 'down' ? 'text-cy-ink' : 'text-cy-muted'}`}>▼</button>
            </div>

            {/* Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Title */}
              <h2 className="font-display font-black text-2xl md:text-3xl leading-tight tracking-tight text-cy-ink mb-4 max-w-3xl">
                {ask.title}
              </h2>

              {/* Author row & Actions */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b-2 border-cy-ink pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cy-ink flex items-center justify-center bg-cy-ink shrink-0">
                    {author?.avatarUrl
                      ? <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                      : <span className="font-mono text-xs font-bold text-white">{getInitials(author?.name ?? "?")}</span>
                    }
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[14px] text-cy-ink">{author?.name ?? "You"}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-cy-muted mt-0.5">
                      {author?.college && <span>{author.college}</span>}
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons (Right-aligned) */}
                <div className="flex items-center gap-2">
                  <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all shadow-[2px_2px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5">
                    SAVE
                  </button>
                  <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all shadow-[2px_2px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5">
                    SHARE
                  </button>
                  <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all shadow-[2px_2px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5">
                    REPLY
                  </button>
                </div>
              </div>

              {/* Full body */}
              <div className="flex flex-col gap-2 max-w-3xl">
                {renderDetails(ask.details)}
              </div>

              {/* Tags */}
              {ask.tags?.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-6">
                  {ask.tags.map((tag) => (
                    <li key={tag} className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase border-2 border-cy-ink px-3 py-1 text-cy-ink">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {/* Engagement */}
              <div className="flex items-center gap-4 font-mono text-[11px] text-cy-muted mt-6 max-w-3xl">
                <span>{allComments.length} comments</span>
                <span>{Math.floor(Math.random() * 5 + 1)}.{Math.floor(Math.random() * 9)}k views</span>
              </div>

              <hr className="border-t-2 border-cy-ink mt-6 mb-6 max-w-3xl" />

              {/* TOP ANSWER Section */}
              {allComments.length > 0 && (
                <div className="flex flex-col gap-4 max-w-3xl">
                  <div className="flex items-center gap-2 text-[var(--cat-green)]">
                    <span className="font-mono text-[13px] font-bold">✓</span>
                    <span className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase">Top Answer</span>
                  </div>
                  
                  <div className="border-2 border-[var(--cat-green)] bg-[var(--cat-green)]/5 p-5 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(30,138,90,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cy-ink flex items-center justify-center bg-cy-ink shrink-0">
                        {allComments[0].author?.avatarUrl
                          ? <img src={allComments[0].author.avatarUrl} alt={allComments[0].author.name} className="w-full h-full object-cover" />
                          : <span className="font-mono text-[9px] font-bold text-white">{getInitials(allComments[0].author?.name ?? "?")}</span>
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-[14px] text-cy-ink">{allComments[0].author?.name}</span>
                        <span className="font-mono text-[10px] text-cy-muted mt-0.5">{allComments[0].author?.college}</span>
                      </div>
                    </div>
                    <p className="font-sans text-[14px] text-cy-ink leading-relaxed">
                      {allComments[0].body}
                    </p>
                  </div>
                </div>
              )}

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
                         px-4 py-2 border-2 border-cy-ink bg-cy-ink text-[var(--bg)]
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
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Board page
// ─────────────────────────────────────────────────────────────
export default function Board() {
  const { profile } = useAuth();
  const { setContext, react } = useCat();

  const [allAsks,     setAllAsks]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeType,  setActiveType]  = useState(null);
  const [activeTag,   setActiveTag]   = useState(null);
  const [selectedAsk, setSelectedAsk] = useState(null);

  useEffect(() => {
    setContext({ page: 'board' });
  }, [setContext]);

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

  const isDetailMode = selectedAsk !== null;

  return (
    <div className="flex h-full w-full relative overflow-hidden -m-6 md:-m-8 transition-all duration-300 ease-out bg-cy-bg">
      
      {/* ── Feed column (Compact or Full) ────────────────────── */}
      <div 
        className={`flex flex-col h-full overflow-y-auto border-cy-ink bg-cy-bg transition-all duration-300 ease-out shrink-0
          ${isDetailMode ? "w-[250px] lg:w-[280px] border-r-2" : "w-full flex-1"}`}
      >
        <div className={`px-4 md:px-6 pt-6 md:pt-8 pb-0 ${isDetailMode ? "hidden" : "block"}`}>
          {/* Detailed Header (hidden in compact mode) */}
          <header className="flex items-start justify-between gap-4 flex-wrap pb-5 transition-opacity duration-300">
            <div>
              <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">Board</h1>
              <p className="font-mono text-xs text-cy-muted mt-1 tracking-[0.04em]">
                What builders at Indian colleges are working on right now.
              </p>
            </div>
            <Link
              to="/ask/new"
              className="font-mono text-xs font-bold tracking-[0.1em] uppercase
                         px-4 py-2.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] shrink-0
                         shadow-[4px_4px_0px_0px_var(--shadow)]
                         hover:translate-x-0.5 hover:translate-y-0.5
                         hover:shadow-[2px_2px_0px_0px_var(--shadow)]
                         active:translate-x-1 active:translate-y-1 active:shadow-none
                         transition-all flex items-center gap-2"
            >
              + Post an Ask
            </Link>
          </header>
        </div>

        {/* Compact Header (only shown in compact mode) */}
        {isDetailMode && (
          <div className="px-4 py-4 border-b-2 border-cy-ink bg-cy-bg sticky top-0 z-10">
            <h2 className="font-display font-black text-xl text-cy-ink leading-tight">BOARD</h2>
            <Link to="/ask/new" className="font-mono text-[10px] uppercase font-bold text-cy-orange mt-1 inline-block hover:underline">
              + Post an Ask
            </Link>
          </div>
        )}

        {/* Filter bar */}
        <section aria-labelledby="filter-heading" className={`border-b-2 border-cy-ink px-4 md:px-6 py-3 flex flex-col gap-3 mb-4 bg-cy-bg sticky ${isDetailMode ? "top-[76px]" : "top-0"} z-10 transition-all`}>
          <h2 id="filter-heading" className="sr-only">Filters</h2>
          <div className={`flex items-center gap-1.5 flex-wrap ${isDetailMode ? "justify-start" : ""}`} role="group" aria-label="Filter by type">
            {TYPE_FILTERS.map(({ label, value, color }) => {
              const isActive = activeType === value;
              return (
                <button
                  key={label}
                  id={`filter-type-${label.toLowerCase()}`}
                  onClick={() => { setActiveType(value); setActiveTag(null); }}
                  aria-pressed={isActive}
                  className={`font-mono font-bold tracking-[0.1em] uppercase transition-all duration-150 hover:-translate-y-px
                              ${isDetailMode ? "text-[8px] px-2 py-1 border" : "text-[10px] px-4 py-1.5 border-2"}`}
                  style={
                    isActive
                      ? { backgroundColor: value === null ? "var(--text)" : color, borderColor: color, color: "#ffffff", boxShadow: isDetailMode ? 'none' : `3px 3px 0 0 ${color}66` }
                      : { backgroundColor: "transparent", borderColor: color, color: color }
                  }
                >
                  {isDetailMode ? (value === null ? "ALL" : TYPE_META[value]?.label) : label}
                </button>
              );
            })}
            {!loading && !isDetailMode && (
              <span className="ml-auto font-mono text-[9px] text-cy-muted tracking-[0.08em] uppercase">
                {filteredAsks.length} ask{filteredAsks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {!isDetailMode && allTags.length > 0 && (
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
                          ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" }
                          : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
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

        {/* Ask feed */}
        <div className="px-4 md:px-6 pb-12">
          <section aria-labelledby="asks-list-heading" aria-live="polite">
            <h2 id="asks-list-heading" className="sr-only">Asks</h2>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-cy-ink/5 border-2 border-cy-ink/10 animate-pulse" />
                ))}
              </div>
            ) : filteredAsks.length === 0 ? (
              <div className="border-2 border-cy-ink p-10 text-center shadow-[6px_6px_0px_0px_var(--shadow)]">
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
              <ul className={`flex flex-col ${isDetailMode ? "gap-2" : "gap-5"}`}>
                {filteredAsks.map((ask) => (
                  <li key={ask.id}>
                    <FeedCard
                      ask={ask}
                      isSelected={selectedAsk?.id === ask.id}
                      isCompact={isDetailMode}
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
      <div 
        className={`h-full bg-cy-bg transition-all duration-300 ease-out overflow-hidden
          ${isDetailMode ? "flex-1 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"}`}
      >
        {selectedAsk && (
          <DetailPanel
            ask={selectedAsk}
            onClose={() => setSelectedAsk(null)}
          />
        )}
      </div>
    </div>
  );
}
