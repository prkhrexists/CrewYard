import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAsks } from "../data/mockDb";
import AskCard from "../components/AskCard";

// ─────────────────────────────────────────────────────────────
//  Design constants — mirror PostAsk type colours
// ─────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "ALL",       value: null,        color: "#111111" },
  { label: "HELP",      value: "help",      color: "#E8542A" },
  { label: "TEAMMATE",  value: "teammate",  color: "#2D5FE0" },
  { label: "BUILD_LOG", value: "build_log", color: "#1E8A5A" },
];

// ─────────────────────────────────────────────────────────────
//  Board
// ─────────────────────────────────────────────────────────────
export default function Board() {
  const [allAsks,   setAllAsks]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeType, setActiveType] = useState(null);   // null = "All"
  const [activeTag,  setActiveTag]  = useState(null);   // null = none

  // Fetch once on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAsks().then((asks) => {
      if (!cancelled) { setAllAsks(asks); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  // Derive unique sorted tag list from full dataset
  const allTags = useMemo(() => {
    const tagSet = new Set();
    allAsks.forEach((ask) => ask.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [allAsks]);

  // Client-side filtering (no refetch)
  const filteredAsks = useMemo(() => {
    return allAsks.filter((ask) => {
      const typeMatch = activeType === null || ask.type === activeType;
      const tagMatch  = activeTag  === null || ask.tags?.includes(activeTag);
      return typeMatch && tagMatch;
    });
  }, [allAsks, activeType, activeTag]);

  function handleTypeFilter(value) {
    setActiveType(value);
    setActiveTag(null); // reset tag filter on type change
  }

  function handleTagFilter(tag) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  function handleCardClick(ask) {
    console.log("Ask clicked:", ask.id, ask.title);
  }

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Page heading */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">
            Board
          </h1>
          <p className="font-sans text-sm text-cy-muted mt-1">
            What builders at Indian colleges are working on right now.
          </p>
        </div>

        {/* Post an Ask shortcut */}
        <Link
          to="/ask/new"
          className="btn-primary font-mono text-xs tracking-[0.08em] uppercase
                     flex items-center gap-2 shrink-0"
        >
          + Post an Ask
        </Link>
      </header>

      {/* Filter controls */}
      <section aria-labelledby="filter-heading" className="flex flex-col gap-4">
        <h2 id="filter-heading" className="sr-only">Filters</h2>

        {/* ── Type buttons (same style as PostAsk selector) ── */}
        <div
          className="flex items-center gap-2 flex-wrap"
          role="group"
          aria-label="Filter by type"
        >
          {TYPE_FILTERS.map(({ label, value, color }) => {
            const isActive = activeType === value;
            return (
              <button
                key={label}
                id={`filter-type-${label.toLowerCase()}`}
                onClick={() => handleTypeFilter(value)}
                aria-pressed={isActive}
                className="font-mono text-[10px] font-bold tracking-[0.1em]
                           px-4 py-2 transition-colors duration-150"
                style={
                  isActive
                    ? { backgroundColor: color, borderColor: color,
                        borderWidth: "1.5px", color: "#FBF8F2" }
                    : { backgroundColor: "transparent", borderColor: color,
                        borderWidth: "1.5px", color: color }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tag filter pills ──────────────────────────────── */}
        {allTags.length > 0 && (
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] uppercase
                          text-cy-muted mb-2">
              Filter by tag:
            </p>
            <ul className="flex flex-wrap gap-1.5" aria-label="Tag filters" role="list">
              {allTags.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <li key={tag}>
                    <button
                      id={`filter-tag-${tag}`}
                      onClick={() => handleTagFilter(tag)}
                      aria-pressed={isActive}
                      className="font-mono text-[10px] tracking-[0.04em]
                                 px-2 py-0.5 transition-colors duration-150"
                      style={
                        isActive
                          ? { backgroundColor: "#111111", borderColor: "#111111",
                              borderWidth: "1.5px", color: "#FBF8F2" }
                          : { backgroundColor: "transparent", borderColor: "#111111",
                              borderWidth: "1.5px", color: "#111111" }
                      }
                    >
                      {tag}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Ask list */}
      <section aria-labelledby="asks-list-heading" aria-live="polite">
        <h2 id="asks-list-heading" className="sr-only">Asks</h2>

        {loading ? (
          <p className="font-mono text-xs text-cy-muted tracking-[0.06em]">
            Loading board…
          </p>
        ) : filteredAsks.length === 0 ? (
          <div className="border border-cy-ink p-10 text-center">
            <p className="font-display font-bold text-lg text-cy-ink">
              No asks match these filters.
            </p>
            <p className="font-sans text-sm text-cy-muted mt-1">
              Try clearing the type or tag filter.
            </p>
            <button
              onClick={() => { setActiveType(null); setActiveTag(null); }}
              className="mt-5 font-mono text-xs tracking-[0.1em] uppercase
                         text-cy-ink hover:text-cy-orange transition-colors duration-150"
              style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
            >
              → Clear all filters
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {filteredAsks.map((ask) => (
              <AskCard
                key={ask.id}
                ask={ask}
                onClick={() => handleCardClick(ask)}
              />
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
