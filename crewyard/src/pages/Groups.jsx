import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { mockGroups, mockAsks, mockUsers } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useCat } from "../context/CatContext";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { label: "ALL",         value: null },
  { label: "HACKATHONS",  value: "hackathons" },
  { label: "OPEN SOURCE", value: "open-source" },
  { label: "WEB",         value: "web" },
  { label: "AI / ML",     value: "ai-ml" },
  { label: "COLLEGE",     value: "college" },
  { label: "OTHER",       value: "other" },
];

const TYPE_META = {
  help:      { label: "HELP",      color: "var(--accent)" },
  teammate:  { label: "TEAMMATE",  color: "var(--cat-blue)" },
  build_log: { label: "BUILD_LOG", color: "var(--cat-green)" },
};

const TYPE_FILTERS = [
  { label: "ALL",       value: null },
  { label: "HELP",      value: "help",      color: "var(--accent)" },
  { label: "TEAMMATE",  value: "teammate",  color: "var(--cat-blue)" },
  { label: "BUILD_LOG", value: "build_log", color: "var(--cat-green)" },
];

const GROUP_SECTIONS = ["OVERVIEW", "OPEN ASKS", "DISCUSSION", "MEMBERS", "RESOURCES"];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function formatRelative(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
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

// Enrich asks with author data
function enrichAsk(ask) {
  const author = mockUsers.find((u) => u.id === ask.authorId);
  return { ...ask, author };
}

// ─────────────────────────────────────────────────────────────
//  Avatar
// ─────────────────────────────────────────────────────────────
function Avatar({ url, name, size = "sm" }) {
  const dim = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-6 h-6";
  const text = size === "lg" ? "text-[10px]" : "text-[8px]";
  return (
    <div className={`${dim} rounded-full overflow-hidden border-2 border-cy-ink flex items-center justify-center bg-cy-ink shrink-0`}>
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover" />
        : <span className={`font-mono ${text} font-bold text-white`}>{getInitials(name ?? "?")}</span>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Mini FeedCard (used inside group workspace)
// ─────────────────────────────────────────────────────────────
function MiniAskCard({ ask, isSelected, isCompact, onClick }) {
  const meta   = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "var(--text)" };
  const author = ask.author;
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
      ].join(" ")}
      style={isSelected
        ? { borderLeftColor: "var(--accent)", borderLeftWidth: "6px" }
        : { borderLeftColor: meta.color, borderLeftWidth: "4px" }}
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

      <h3 className={`font-sans font-bold leading-tight text-cy-ink px-3 ${isCompact ? "text-[12px] pb-2 line-clamp-2" : "text-[14px] pb-2 line-clamp-2"}`}>
        {ask.title}
      </h3>

      {!isCompact && (
        <>
          <p className="font-sans text-sm text-cy-muted leading-relaxed px-3 pb-3 line-clamp-2">
            {stripMarkdown(ask.details)}
          </p>
          {ask.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 px-3 pb-3">
              {ask.tags.slice(0,3).map((tag) => (
                <li key={tag} className="font-mono text-[8px] tracking-[0.06em] uppercase border border-cy-ink px-1.5 py-0.5 text-cy-ink">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <footer className={`flex items-center gap-3 px-3 py-2 border-t ${isSelected ? "border-cy-orange/30" : "border-cy-ink/20"}`}>
        {!isCompact && author && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar url={author.avatarUrl} name={author.name} size="sm" />
            <span className="font-mono text-[10px] font-bold text-cy-ink truncate">{author.name}</span>
          </div>
        )}
        <div className={`flex items-center gap-3 shrink-0 text-cy-muted ${isCompact ? "w-full justify-start" : ""}`}>
          <span className="font-mono text-[9px]">💬 {ask.commentCount ?? 0}</span>
          <span className="font-mono text-[9px]">▲ {ask.likeCount ?? 0}</span>
        </div>
      </footer>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  Ask Detail Panel (lifted from Board, self-contained)
// ─────────────────────────────────────────────────────────────
const MOCK_COMMENTS = {
  a1: [
    { id: "c1", author: { name: "Priya Nair", college: "KIIT Bhubaneswar", avatarUrl: "/avatars/avatar_02.jpg" }, body: "You're using `req.text()` but Razorpay expects the raw body buffer. Try using `Buffer.from(await req.text())` directly.", createdAt: "2025-08-10T10:20:00Z", upvotes: 18 },
  ],
  a2: [
    { id: "c2", author: { name: "Rohan Gupta", college: "PES University", avatarUrl: "/avatars/avatar_03.jpg" }, body: "I have 1.5 yrs PyTorch + YOLO experience and can do model fine-tuning. Drop me a DM!", createdAt: "2025-08-09T15:00:00Z", upvotes: 12 },
  ],
  a5: [
    { id: "c3", author: { name: "Karan Mehta", college: "UPES Dehradun", avatarUrl: "/avatars/avatar_05.jpg" }, body: "I went through this exact process for GSoC 2025 with MLflow. Happy to do weekly syncs. DM me.", createdAt: "2025-08-06T18:00:00Z", upvotes: 22 },
  ],
};

function AskDetailPanel({ ask, onClose }) {
  const meta    = TYPE_META[ask.type] ?? { label: ask.type?.toUpperCase(), color: "var(--text)" };
  const author  = ask.author;
  const timeAgo = ask.createdAt ? formatRelative(ask.createdAt) : "";
  const comments = MOCK_COMMENTS[ask.id] ?? [];

  const [upvotes,    setUpvotes]    = useState(ask.likeCount ?? 0);
  const [voted,      setVoted]      = useState(null);
  const [comment,    setComment]    = useState("");
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
    setAllComments((prev) => [{
      id: `new-${Date.now()}`,
      author: { name: profile?.name ?? "You", college: profile?.college ?? "", avatarUrl: profile?.avatarUrl },
      body: comment.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
    }, ...prev]);
    setComment("");
  }

  const renderDetails = (text = "") => {
    let inCodeBlock = false;
    let codeContent = [];
    const elements = [];
    text.split("\n").forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${i}`} className="my-4 border-2 border-cy-ink bg-[var(--text)] p-4 text-white overflow-x-auto shadow-[4px_4px_0px_0px_var(--shadow)]">
              <pre className="font-mono text-[12px] leading-relaxed"><code>{codeContent.join("\n")}</code></pre>
            </div>
          );
          codeContent = []; inCodeBlock = false;
        } else { inCodeBlock = true; }
        return;
      }
      if (inCodeBlock) { codeContent.push(line); return; }
      if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(<p key={i} className="font-sans font-bold text-[14px] text-cy-ink mt-4 mb-1">{line.replace(/\*\*/g, "")}</p>);
      } else if (line.startsWith("• ") || line.startsWith("- ")) {
        elements.push(<p key={i} className="font-sans text-[14px] text-cy-ink pl-4 leading-relaxed relative before:content-['•'] before:absolute before:left-0">{line.slice(2)}</p>);
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} className="font-sans text-[14px] text-cy-ink leading-relaxed">{line}</p>);
      }
    });
    return elements;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-cy-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-10 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase text-white px-3 py-1.5" style={{ backgroundColor: meta.color }}>
              {meta.label}
            </span>
            <button onClick={onClose} className="font-mono text-[11px] font-bold tracking-[0.08em] text-cy-ink hover:text-cy-orange transition-colors flex items-center gap-1 bg-cy-bg border-2 border-transparent hover:border-cy-orange px-2 py-1 uppercase">
              ✕ CLOSE
            </button>
          </div>

          <div className="flex gap-4">
            {/* Voting */}
            <div className="flex flex-col items-center gap-1 pt-1 shrink-0 w-8">
              <button onClick={() => handleVote("up")} className={`text-xl hover:text-cy-orange transition-colors leading-none ${voted === "up" ? "text-cy-orange" : "text-cy-muted"}`}>▲</button>
              <span className="font-mono text-[13px] font-bold text-cy-ink">{upvotes}</span>
              <button onClick={() => handleVote("down")} className={`text-xl hover:text-cy-ink transition-colors leading-none ${voted === "down" ? "text-cy-ink" : "text-cy-muted"}`}>▼</button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <h2 className="font-display font-black text-xl md:text-2xl leading-tight tracking-tight text-cy-ink mb-3">
                {ask.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cy-ink pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar url={author?.avatarUrl} name={author?.name} size="md" />
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[13px] text-cy-ink">{author?.name ?? "You"}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-cy-muted mt-0.5">
                      {author?.college && <span>{author.college}</span>}
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">SAVE</button>
                  <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all">REPLY</button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">{renderDetails(ask.details)}</div>

              {ask.tags?.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-5">
                  {ask.tags.map((tag) => (
                    <li key={tag} className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase border-2 border-cy-ink px-3 py-1 text-cy-ink">{tag}</li>
                  ))}
                </ul>
              )}

              <hr className="border-t-2 border-cy-ink mt-5 mb-4" />

              {/* Comments */}
              <form onSubmit={handleComment} className="flex flex-col gap-2 mb-5">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-cy-muted">Add a comment</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full font-sans text-sm text-cy-ink bg-cy-bg border-2 border-cy-ink px-3 py-2 resize-none focus:outline-none focus:border-cy-orange transition-colors"
                />
                <button type="submit" className="self-end font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-colors">
                  Post →
                </button>
              </form>

              {allComments.length > 0 && (
                <div className="flex flex-col gap-4">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-cy-muted">{allComments.length} comment{allComments.length !== 1 ? "s" : ""}</p>
                  {allComments.map((c) => (
                    <div key={c.id} className="border-l-2 border-cy-ink/30 pl-3 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar url={c.author?.avatarUrl} name={c.author?.name} size="sm" />
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
//  GroupCard — discovery list card
// ─────────────────────────────────────────────────────────────
function GroupCard({ group, isSelected, isCompact, onClick, joined, onJoin }) {
  return (
    <li
      className={[
        "bg-cy-bg border-2 flex flex-col transition-all duration-300 ease-out cursor-pointer",
        isSelected
          ? "border-cy-orange shadow-[4px_4px_0px_0px_var(--accent)] -translate-y-px -translate-x-px"
          : "border-cy-ink hover:-translate-y-px hover:-translate-x-px hover:shadow-[4px_4px_0px_0px_var(--text)]",
      ].join(" ")}
      onClick={onClick}
      style={isSelected ? { borderLeftColor: "var(--accent)", borderLeftWidth: "6px" } : { borderLeftColor: "var(--text)", borderLeftWidth: "4px" }}
    >
      {/* Top meta row */}
      <div className={`flex items-center justify-between ${isCompact ? "px-3 pt-3 pb-1" : "px-4 pt-4 pb-2"}`}>
        <span className={`font-mono font-bold tracking-[0.12em] uppercase text-cy-orange ${isCompact ? "text-[8px]" : "text-[9px]"}`}>
          {group.category?.replace("-", " ").toUpperCase() ?? "GROUP"}
        </span>
        {group.activeThisWeek && !isCompact && (
          <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-[var(--cat-green)] border border-[var(--cat-green)] px-2 py-0.5">
            ACTIVE THIS WEEK
          </span>
        )}
      </div>

      {/* Name + members */}
      <div className={`flex items-start justify-between gap-3 ${isCompact ? "px-3 pb-2" : "px-4 pb-2"}`}>
        <div className="min-w-0">
          <h2 className={`font-sans font-bold text-cy-ink leading-snug ${isCompact ? "text-[13px]" : "text-base"}`}>
            {group.name}
          </h2>
          <p className={`font-mono text-cy-muted tracking-[0.06em] mt-0.5 ${isCompact ? "text-[9px]" : "text-[10px]"}`}>
            {group.memberCount.toLocaleString("en-IN")} MEMBERS
          </p>
        </div>
        {!isCompact && (
          <button
            id={`group-join-btn-${group.id}`}
            onClick={(e) => { e.stopPropagation(); onJoin(); }}
            aria-pressed={joined}
            className="shrink-0 font-mono text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all duration-200"
            style={joined
              ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" }
              : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
            }
          >
            {joined ? "JOINED ✓" : "JOIN"}
          </button>
        )}
      </div>

      {/* Description */}
      {!isCompact && (
        <p className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3 line-clamp-2">
          {group.description}
        </p>
      )}

      {/* Tags */}
      {!isCompact && group.tags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Activity footer */}
      {!isCompact && (
        <footer className="border-t border-cy-ink px-4 py-2.5 flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.06em] text-cy-ink">
            {group.openAsks} <span className="text-cy-muted">OPEN ASKS</span>
          </span>
          <span className="font-mono text-[9px] tracking-[0.06em] text-cy-ink">
            {group.activeBuilders} <span className="text-cy-muted">BUILDERS ACTIVE</span>
          </span>
        </footer>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  GroupWorkspace — header, nav, body
// ─────────────────────────────────────────────────────────────
function GroupWorkspace({ group, joined, onJoin }) {
  const { setContext, react } = useCat();
  const [activeSection, setActiveSection] = useState("OVERVIEW");
  const [selectedAsk,   setSelectedAsk]   = useState(null);
  const [activeType,    setActiveType]    = useState(null);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [discussions,   setDiscussions]   = useState(group.discussions ?? []);

  useEffect(() => {
    setContext({ page: 'groups' });
  }, [setContext]);

  // Get enriched asks for this group
  const groupAsks = useMemo(() => {
    return (group.askIds ?? [])
      .map((id) => mockAsks.find((a) => a.id === id))
      .filter(Boolean)
      .map(enrichAsk);
  }, [group.askIds]);

  const filteredAsks = useMemo(() => {
    if (!activeType) return groupAsks;
    return groupAsks.filter((a) => a.type === activeType);
  }, [groupAsks, activeType]);

  // Get member objects
  const members = useMemo(() => {
    return (group.memberIds ?? [])
      .map((id) => mockUsers.find((u) => u.id === id))
      .filter(Boolean);
  }, [group.memberIds]);

  // Pinned announcement author
  const pinnedAuthor = mockUsers.find((u) => u.id === group.pinnedAnnouncement?.postedBy);

  // When switching sections, clear selected ask
  function handleSectionChange(section) {
    setActiveSection(section);
    setSelectedAsk(null);
  }

  function handleDiscussionPost(e) {
    e.preventDefault();
    if (!newDiscussion.trim()) return;
    setDiscussions((prev) => [{
      id: `d-new-${Date.now()}`,
      author: { name: "You", college: "", avatarUrl: undefined },
      body: newDiscussion.trim(),
      time: new Date().toISOString(),
      replyCount: 0,
    }, ...prev]);
    setNewDiscussion("");
  }

  const isAskDetail = selectedAsk !== null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Group Header ── */}
      <div className="border-b-2 border-cy-ink px-6 py-4 bg-cy-bg shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-black text-2xl md:text-3xl text-cy-ink leading-tight tracking-tight uppercase">
                {group.name}
              </h1>
              {group.activeThisWeek && (
                <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-[var(--cat-green)] border border-[var(--cat-green)] px-2 py-1 shrink-0">
                  ACTIVE THIS WEEK
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-cy-muted tracking-[0.06em] mt-1">
              {group.memberCount.toLocaleString("en-IN")} MEMBERS
            </p>
            <p className="font-sans text-sm text-cy-muted leading-relaxed mt-2 max-w-2xl">
              {group.description}
            </p>
            {group.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.tags.map((tag) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => {
                if (!joined) react('group-joined');
                onJoin();
              }}
              className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2.5 border-2 transition-all duration-200 shadow-[3px_3px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
              style={joined
                ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" }
                : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
              }
            >
              {joined ? "JOINED ✓" : "JOIN GROUP"}
            </button>
            <div className="flex items-center gap-2">
              <Link
                to="/ask/new"
                className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all"
              >
                + POST AN ASK
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Group Navigation ── */}
      <div className="border-b-2 border-cy-ink px-6 bg-cy-bg shrink-0">
        <nav className="flex items-center gap-0" role="tablist">
          {GROUP_SECTIONS.map((section) => {
            const isActive = activeSection === section;
            return (
              <button
                key={section}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSectionChange(section)}
                className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-3 border-b-2 transition-all duration-150 relative"
                style={isActive
                  ? { borderBottomColor: "var(--accent)", color: "var(--accent)" }
                  : { borderBottomColor: "transparent", color: "#6B6B6B" }
                }
              >
                {section}
                {section === "OPEN ASKS" && (
                  <span className="ml-1.5 font-mono text-[8px] px-1 py-0.5 bg-cy-ink text-[var(--bg)]">
                    {groupAsks.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Section Body ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── OVERVIEW ── */}
        {activeSection === "OVERVIEW" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

            {/* Pinned Announcement */}
            {group.pinnedAnnouncement && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase text-cy-orange border border-cy-orange px-2 py-0.5">
                    📌 PINNED
                  </span>
                </div>
                <div className="border-2 border-cy-ink bg-cy-bg p-5 shadow-[4px_4px_0px_0px_var(--shadow)]">
                  <h3 className="font-sans font-bold text-[16px] text-cy-ink leading-snug">
                    {group.pinnedAnnouncement.title}
                  </h3>
                  <p className="font-sans text-sm text-cy-muted leading-relaxed mt-2">
                    {group.pinnedAnnouncement.body}
                  </p>
                  {pinnedAuthor && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cy-ink/20">
                      <Avatar url={pinnedAuthor.avatarUrl} name={pinnedAuthor.name} size="sm" />
                      <span className="font-mono text-[10px] text-cy-muted">{pinnedAuthor.name} · {formatRelative(group.pinnedAnnouncement.date)}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Open Asks Preview */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">
                  OPEN ASKS
                </h2>
                <button
                  onClick={() => handleSectionChange("OPEN ASKS")}
                  className="font-mono text-[9px] tracking-[0.08em] uppercase text-cy-orange hover:underline transition-colors"
                >
                  View all {groupAsks.length} →
                </button>
              </div>
              {groupAsks.length === 0 ? (
                <div className="border-2 border-cy-ink/30 border-dashed p-8 text-center">
                  <p className="font-display font-bold text-base text-cy-ink">No open asks yet.</p>
                  <p className="font-sans text-sm text-cy-muted mt-1">Be the first builder to ask something.</p>
                  <Link to="/ask/new" className="mt-4 inline-block font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all">
                    + POST AN ASK
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {groupAsks.slice(0, 3).map((ask) => (
                    <li key={ask.id}>
                      <MiniAskCard
                        ask={ask}
                        isSelected={false}
                        isCompact={false}
                        onClick={() => { handleSectionChange("OPEN ASKS"); }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent Builds */}
            {group.recentBuilds?.length > 0 && (
              <section>
                <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink mb-3">
                  RECENT BUILDS
                </h2>
                <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                  {group.recentBuilds.map((build, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 px-4 py-3 ${i < group.recentBuilds.length - 1 ? "border-b border-cy-ink" : ""}`}
                    >
                      <span className="font-mono text-[9px] text-cy-orange font-bold tracking-[0.08em] uppercase pt-0.5 shrink-0">BUILD</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-bold text-cy-ink leading-snug">{build.what}</p>
                        <p className="font-mono text-[10px] text-cy-muted mt-0.5">{build.builder} · {build.college} · {formatRelative(build.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── OPEN ASKS ── */}
        {activeSection === "OPEN ASKS" && (
          <div className="flex h-full flex-1 overflow-hidden">
            {/* Ask list */}
            <div className={`flex flex-col h-full overflow-y-auto bg-cy-bg transition-all duration-300 ease-out shrink-0 ${isAskDetail ? "w-[240px] border-r-2 border-cy-ink" : "flex-1"}`}>
              {/* Type filter bar */}
              <div className="px-4 py-3 border-b-2 border-cy-ink flex items-center gap-2 flex-wrap bg-cy-bg sticky top-0 z-10">
                {TYPE_FILTERS.map(({ label, value, color }) => {
                  const isActive = activeType === value;
                  const c = value === null ? "var(--text)" : color;
                  return (
                    <button
                      key={label}
                      onClick={() => { setActiveType(value); setSelectedAsk(null); }}
                      aria-pressed={isActive}
                      className={`font-mono font-bold tracking-[0.1em] uppercase transition-all duration-150 ${isAskDetail ? "text-[8px] px-2 py-0.5 border" : "text-[10px] px-3 py-1 border-2"}`}
                      style={isActive
                        ? { backgroundColor: c, borderColor: c, color: "#fff" }
                        : { backgroundColor: "transparent", borderColor: c, color: c }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
                {!isAskDetail && (
                  <span className="ml-auto font-mono text-[9px] text-cy-muted">{filteredAsks.length} asks</span>
                )}
              </div>

              {/* Ask cards */}
              <div className="px-4 py-4">
                {filteredAsks.length === 0 ? (
                  <div className="border-2 border-dashed border-cy-ink/30 p-8 text-center">
                    <p className="font-display font-bold text-base text-cy-ink">No open asks yet.</p>
                    <Link to="/ask/new" className="mt-3 inline-block font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all">
                      + POST AN ASK
                    </Link>
                  </div>
                ) : (
                  <ul className={`flex flex-col ${isAskDetail ? "gap-2" : "gap-4"}`}>
                    {filteredAsks.map((ask) => (
                      <li key={ask.id}>
                        <MiniAskCard
                          ask={ask}
                          isSelected={selectedAsk?.id === ask.id}
                          isCompact={isAskDetail}
                          onClick={() => setSelectedAsk(selectedAsk?.id === ask.id ? null : ask)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Ask detail */}
            <div className={`h-full bg-cy-bg transition-all duration-300 ease-out overflow-hidden ${isAskDetail ? "flex-1 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"}`}>
              {selectedAsk && (
                <AskDetailPanel ask={selectedAsk} onClose={() => setSelectedAsk(null)} />
              )}
            </div>
          </div>
        )}

        {/* ── DISCUSSION ── */}
        {activeSection === "DISCUSSION" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">DISCUSSION</h2>
            </div>

            {discussions.length === 0 ? (
              <div className="border-2 border-dashed border-cy-ink/30 p-10 text-center">
                <p className="font-display font-bold text-base text-cy-ink">No discussions yet.</p>
                <p className="font-sans text-sm text-cy-muted mt-1">Start the first conversation.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                {discussions.map((disc, i) => (
                  <div
                    key={disc.id}
                    className={`px-5 py-4 ${i < discussions.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar url={disc.author.avatarUrl} name={disc.author.name} size="sm" />
                      <div>
                        <span className="font-sans font-bold text-[13px] text-cy-ink">{disc.author.name}</span>
                        {disc.author.college && <span className="font-mono text-[10px] text-cy-muted ml-2">· {disc.author.college}</span>}
                        <span className="font-mono text-[10px] text-cy-muted ml-2">· {formatRelative(disc.time)}</span>
                      </div>
                    </div>
                    <p className="font-sans text-sm text-cy-ink leading-relaxed">{disc.body}</p>
                    <div className="mt-2">
                      <span className="font-mono text-[9px] text-cy-muted hover:text-cy-orange transition-colors cursor-pointer">
                        {disc.replyCount} {disc.replyCount === 1 ? "reply" : "replies"} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Start discussion */}
            <div className="border-t-2 border-cy-ink pt-4 mt-2">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-cy-muted mb-2">START A DISCUSSION</p>
              <form onSubmit={handleDiscussionPost} className="flex flex-col gap-2">
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="What's on your mind? Ask a question, share progress..."
                  rows={3}
                  className="w-full font-sans text-sm text-cy-ink bg-cy-bg border-2 border-cy-ink px-3 py-2 resize-none focus:outline-none focus:border-cy-orange transition-colors max-w-2xl"
                />
                <button type="submit" className="self-start font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-colors">
                  POST
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── MEMBERS ── */}
        {activeSection === "MEMBERS" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">
              MEMBERS · {group.memberCount.toLocaleString("en-IN")}
            </h2>
            {members.length === 0 ? (
              <div className="border-2 border-dashed border-cy-ink/30 p-10 text-center">
                <p className="font-display font-bold text-base text-cy-ink">No members yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                {members.map((member, i) => (
                  <div
                    key={member.id}
                    className={`flex items-start gap-4 px-5 py-4 ${i < members.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}
                  >
                    <Avatar url={member.avatarUrl} name={member.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-sans font-bold text-[14px] text-cy-ink">{member.name}</p>
                          <p className="font-mono text-[10px] text-cy-muted">{member.college} · Year {member.year}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[9px] text-cy-muted">{member.reputation} rep</span>
                          <Link
                            to={`/profile/${member.username}`}
                            className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase border-2 border-cy-ink px-2 py-1 hover:bg-cy-ink hover:text-[var(--bg)] transition-all"
                          >
                            VIEW PROFILE
                          </Link>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                        <div>
                          <p className="font-mono text-[8px] tracking-[0.1em] uppercase text-cy-orange">LANGUAGE</p>
                          <p className="font-sans text-[12px] text-cy-ink">{member.topLanguage} · {member.topLanguagePercent}%</p>
                        </div>
                        <div>
                          <p className="font-mono text-[8px] tracking-[0.1em] uppercase text-cy-muted">COMMITS THIS WEEK</p>
                          <p className="font-sans text-[12px] text-cy-ink">{member.commitsThisWeek}</p>
                        </div>
                        {member.githubVerified && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[9px] text-[var(--cat-green)] border border-[var(--cat-green)] px-1.5 py-0.5">GitHub ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESOURCES ── */}
        {activeSection === "RESOURCES" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">RESOURCES</h2>
            {!group.resources?.length ? (
              <div className="border-2 border-dashed border-cy-ink/30 p-10 text-center">
                <p className="font-display font-bold text-base text-cy-ink">No resources yet.</p>
                <p className="font-sans text-sm text-cy-muted mt-1">Share useful links, templates, or guides.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                {group.resources.map((res, i) => {
                  const addedByUser = mockUsers.find((u) => u.id === res.addedBy);
                  return (
                    <div
                      key={res.id}
                      className={`px-5 py-4 ${i < group.resources.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}
                    >
                      <p className="font-sans font-bold text-[14px] text-cy-ink">{res.title}</p>
                      <p className="font-sans text-sm text-cy-muted mt-0.5 leading-relaxed">{res.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {addedByUser && (
                          <span className="font-mono text-[9px] text-cy-muted">
                            Added by {addedByUser.name}
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-cy-muted">
                          · {formatRelative(res.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Groups page — two-state layout
// ─────────────────────────────────────────────────────────────
export default function Groups() {
  const [selectedGroup,  setSelectedGroup]  = useState(null);
  const [joinedGroups,   setJoinedGroups]   = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");

  const isWorkspaceMode = selectedGroup !== null;

  const filteredGroups = useMemo(() => {
    return mockGroups.filter((g) => {
      const catMatch   = activeCategory === null || g.category === activeCategory;
      const searchMatch = searchQuery === "" || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [activeCategory, searchQuery]);

  function toggleJoin(groupId, e) {
    e?.stopPropagation();
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <div className="flex h-full w-full relative overflow-hidden -m-6 md:-m-8 transition-all duration-300 ease-out bg-cy-bg">

      {/* ── Groups list column ── */}
      <div className={`flex flex-col h-full overflow-y-auto bg-cy-bg transition-all duration-300 ease-out shrink-0 ${isWorkspaceMode ? "w-[260px] border-r-2 border-cy-ink" : "w-full flex-1"}`}>

        {/* Header (full mode) */}
        <div className={`px-4 md:px-6 pt-6 md:pt-8 pb-0 ${isWorkspaceMode ? "hidden" : "block"}`}>
          <header className="pb-5">
            <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">Groups</h1>
            <p className="font-sans text-sm text-cy-muted mt-1">
              Find your people. Build around a shared goal.
            </p>
          </header>
        </div>

        {/* Compact header (workspace mode) */}
        {isWorkspaceMode && (
          <div className="px-4 py-4 border-b-2 border-cy-ink bg-cy-bg sticky top-0 z-10">
            <button
              onClick={() => setSelectedGroup(null)}
              className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-cy-ink hover:text-cy-orange transition-colors flex items-center gap-1"
            >
              ← GROUPS
            </button>
          </div>
        )}

        {/* Category filters */}
        <div className={`border-b-2 border-cy-ink bg-cy-bg sticky ${isWorkspaceMode ? "top-[56px]" : "top-0"} z-10`}>
          {!isWorkspaceMode && (
            <>
              <div className="px-4 md:px-6 pt-3 flex flex-wrap gap-1.5">
                {CATEGORY_FILTERS.map(({ label, value }) => {
                  const isActive = activeCategory === value;
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveCategory(value)}
                      aria-pressed={isActive}
                      className="font-mono font-bold text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all duration-150"
                      style={isActive
                        ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" }
                        : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 md:px-6 py-3">
                <input
                  type="text"
                  placeholder="SEARCH GROUPS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-mono text-[11px] tracking-[0.08em] text-cy-ink bg-cy-bg border-2 border-cy-ink px-3 py-2 focus:outline-none focus:border-cy-orange transition-colors placeholder:text-cy-muted"
                />
              </div>
            </>
          )}
        </div>

        {/* Groups list */}
        <div className="px-4 md:px-6 py-5">
          {filteredGroups.length === 0 ? (
            <div className="border-2 border-cy-ink p-10 text-center shadow-[6px_6px_0px_0px_var(--shadow)]">
              <p className="font-display font-bold text-lg text-cy-ink">No groups found.</p>
              <button
                onClick={() => { setActiveCategory(null); setSearchQuery(""); }}
                className="mt-4 font-mono text-xs tracking-[0.1em] uppercase text-cy-ink hover:text-cy-orange transition-colors border-b-2 border-cy-orange pb-px"
              >
                → Clear filters
              </button>
            </div>
          ) : (
            <ul className={`flex flex-col ${isWorkspaceMode ? "gap-2" : "gap-5"}`}>
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isSelected={selectedGroup?.id === group.id}
                  isCompact={isWorkspaceMode}
                  onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
                  joined={joinedGroups.has(group.id)}
                  onJoin={(e) => toggleJoin(group.id, e)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Group Workspace Panel ── */}
      <div className={`h-full bg-cy-bg transition-all duration-300 ease-out overflow-hidden ${isWorkspaceMode ? "flex-1 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-12 pointer-events-none"}`}>
        {selectedGroup && (
          <GroupWorkspace
            key={selectedGroup.id}
            group={selectedGroup}
            joined={joinedGroups.has(selectedGroup.id)}
            onJoin={() => toggleJoin(selectedGroup.id)}
          />
        )}
      </div>

    </div>
  );
}
