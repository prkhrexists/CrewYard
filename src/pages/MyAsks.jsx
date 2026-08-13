import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Filter } from "lucide-react";
import { getMyAsks } from "../data/db";
import { useAuth } from "../context/AuthContext";
import AskCard from "../components/AskCard";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "ALL",       value: null,        color: "var(--text)" },
  { label: "HELP",      value: "help",      color: "var(--accent)" },
  { label: "TEAMMATE",  value: "teammate",  color: "var(--cat-blue)" },
  { label: "BUILD_LOG", value: "build_log", color: "var(--cat-green)" },
];

// ─────────────────────────────────────────────────────────────
//  Skeleton loader
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="border-2 border-cy-ink/10 animate-pulse" aria-hidden="true">
      <div className="px-4 pt-4 pb-2 flex justify-between">
        <div className="h-5 w-20 bg-cy-ink/10" />
        <div className="h-4 w-14 bg-cy-ink/10" />
      </div>
      <div className="px-4 pb-2 space-y-2">
        <div className="h-5 w-3/4 bg-cy-ink/10" />
        <div className="h-4 w-full bg-cy-ink/8" />
        <div className="h-4 w-2/3 bg-cy-ink/8" />
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <div className="h-4 w-16 bg-cy-ink/8" />
        <div className="h-4 w-16 bg-cy-ink/8" />
      </div>
      <div className="px-4 py-3 border-t border-cy-ink/10 flex justify-between">
        <div className="h-4 w-32 bg-cy-ink/10" />
        <div className="h-4 w-24 bg-cy-ink/10" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Empty state
// ─────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onClear }) {
  if (hasFilter) {
    return (
      <div className="border-2 border-cy-ink p-10 text-center shadow-[6px_6px_0px_0px_var(--shadow)]">
        <FileText size={32} className="text-cy-muted mx-auto mb-4" strokeWidth={1.5} />
        <p className="font-display font-bold text-lg text-cy-ink">No asks match this filter.</p>
        <button
          onClick={onClear}
          className="mt-5 font-mono text-xs tracking-[0.1em] uppercase text-cy-ink
                     hover:text-cy-orange transition-colors border-b-2 border-cy-orange pb-px"
        >
          → Clear filter
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-cy-ink p-12 text-center shadow-[6px_6px_0px_0px_var(--shadow)]">
      <FileText size={40} className="text-cy-muted mx-auto mb-4" strokeWidth={1.25} />
      <p className="font-display font-bold text-xl text-cy-ink mb-2">
        You haven't posted any asks yet.
      </p>
      <p className="font-mono text-xs text-cy-muted mb-6 max-w-sm mx-auto leading-relaxed">
        Ask for help, look for teammates, or share a build log with the community.
      </p>
      <Link
        to="/ask/new"
        className="inline-flex items-center gap-2 font-mono text-xs font-bold
                   tracking-[0.1em] uppercase px-5 py-2.5 border-2 border-cy-ink
                   bg-cy-ink text-[var(--bg)] shadow-[4px_4px_0px_0px_var(--shadow)]
                   hover:translate-x-0.5 hover:translate-y-0.5
                   hover:shadow-[2px_2px_0px_0px_var(--shadow)]
                   active:translate-x-1 active:translate-y-1 active:shadow-none
                   transition-all"
      >
        <Plus size={14} strokeWidth={2.5} />
        Post your first ask
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Stats bar
// ─────────────────────────────────────────────────────────────
function StatsBar({ asks }) {
  const counts = asks.reduce(
    (acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; },
    {}
  );
  const totalLikes    = asks.reduce((s, a) => s + (a.likeCount    ?? 0), 0);
  const totalComments = asks.reduce((s, a) => s + (a.commentCount ?? 0), 0);

  const stats = [
    { label: "Total asks",  value: asks.length },
    { label: "Help",        value: counts.help      ?? 0, color: "var(--accent)" },
    { label: "Teammate",    value: counts.teammate  ?? 0, color: "var(--cat-blue)" },
    { label: "Build logs",  value: counts.build_log ?? 0, color: "var(--cat-green)" },
    { label: "▲ Likes",     value: totalLikes },
    { label: "💬 Comments", value: totalComments },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="border border-cy-ink/20 bg-cy-ink/3 px-4 py-2.5 flex flex-col gap-0.5 min-w-[80px]"
        >
          <span
            className="font-display font-black text-2xl leading-none"
            style={{ color: color ?? "var(--text)" }}
          >
            {value}
          </span>
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MyAsks page
// ─────────────────────────────────────────────────────────────
export default function MyAsks() {
  const { profile } = useAuth();

  const [asks,       setAsks]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeType, setActiveType] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyAsks()
      .then((data) => {
        if (!cancelled) { setAsks(data); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message ?? "Failed to load your asks."); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!activeType) return asks;
    return asks.filter((a) => a.type === activeType);
  }, [asks, activeType]);

  return (
    /* Escape the layout's p-6 md:p-8, fill full height — same pattern as Board/Groups */
    <div className="flex flex-col h-full w-full overflow-hidden -m-6 md:-m-8 bg-cy-bg">

      {/* ── Sticky header + filters ──────────────────────────── */}
      <div className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-0 bg-cy-bg">
        {/* Page header */}
        <header className="flex items-start justify-between gap-4 flex-wrap pb-5 border-b-2 border-cy-ink">
          <div>
            <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">My Asks</h1>
            <p className="font-mono text-xs text-cy-muted mt-1 tracking-[0.04em]">
              Everything you've posted to the board.
            </p>
          </div>
          <Link
            to="/ask/new"
            id="my-asks-post-btn"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold
                       tracking-[0.1em] uppercase px-4 py-2.5 border-2 border-cy-ink
                       bg-cy-ink text-[var(--bg)] shrink-0
                       shadow-[4px_4px_0px_0px_var(--shadow)]
                       hover:translate-x-0.5 hover:translate-y-0.5
                       hover:shadow-[2px_2px_0px_0px_var(--shadow)]
                       active:translate-x-1 active:translate-y-1 active:shadow-none
                       transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            Post an Ask
          </Link>
        </header>

        {/* Filter bar — shown once data is loaded */}
        {!loading && !error && (
          <div className="flex items-center gap-2 flex-wrap py-3 border-b-2 border-cy-ink/15">
            <Filter size={12} className="text-cy-muted shrink-0" strokeWidth={2} />
            {TYPE_FILTERS.map(({ label, value, color }) => {
              const isActive = activeType === value;
              return (
                <button
                  key={label}
                  id={`my-asks-filter-${label.toLowerCase()}`}
                  onClick={() => setActiveType(value)}
                  aria-pressed={isActive}
                  className="font-mono font-bold tracking-[0.1em] uppercase text-[10px]
                             px-3 py-1 border-2 transition-all duration-150 hover:-translate-y-px"
                  style={
                    isActive
                      ? { backgroundColor: value === null ? "var(--text)" : color, borderColor: value === null ? "var(--text)" : color, color: "#fff" }
                      : { backgroundColor: "transparent", borderColor: color, color }
                  }
                >
                  {label}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[9px] text-cy-muted tracking-[0.08em]">
              {filtered.length} ask{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-6 pb-12">

        {/* Stats bar */}
        {!loading && !error && asks.length > 0 && <StatsBar asks={asks} />}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-5 max-w-3xl">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="border-2 border-red-400 p-8 text-center max-w-xl">
            <p className="font-mono text-sm text-red-500 font-bold">⚠ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 font-mono text-xs tracking-[0.1em] uppercase text-cy-ink
                         border-b-2 border-cy-orange hover:text-cy-orange transition-colors"
            >
              → Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="max-w-xl">
            <EmptyState hasFilter={activeType !== null} onClear={() => setActiveType(null)} />
          </div>
        ) : (
          <ul className="flex flex-col gap-5 max-w-3xl" aria-label="Your asks">
            {filtered.map((ask) => (
              <AskCard key={ask.id} ask={ask} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
