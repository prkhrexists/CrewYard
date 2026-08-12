import { useEffect, useState, useMemo } from "react";
import { getAsks } from "../data/db";
import AskCard from "../components/AskCard";

export default function Search() {
  const [allAsks, setAllAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAsks().then((asks) => {
      if (!cancelled) { setAllAsks(asks); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  // Case-insensitive substring match across title, details, and tags
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allAsks.filter((ask) => {
      return (
        ask.title.toLowerCase().includes(q)  ||
        ask.details.toLowerCase().includes(q) ||
        ask.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allAsks, query]);

  const hasQuery   = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Heading */}
      <header>
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">
          Search
        </h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          Find asks, builders, and skills across CrewYard.
        </p>
      </header>

      {/* Search input */}
      <div className="relative">
        {/* Magnifying glass icon */}
        <svg
          aria-hidden="true"
          width="14" height="14" viewBox="0 0 16 16"
          fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cy-muted pointer-events-none"
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <line x1="10.5" y1="10.5" x2="15" y2="15" />
        </svg>

        <label className="sr-only" htmlFor="search-input">Search CrewYard</label>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search asks, skills, or colleges..."
          autoFocus
          className="w-full bg-cy-bg font-mono text-sm text-cy-ink
                     pl-10 pr-4 py-3"
          style={{ border: "1.5px solid #111111", borderRadius: 0, outline: "none" }}
          onFocus={(e)  => { e.target.style.borderColor = "#E8542A"; }}
          onBlur={(e)   => { e.target.style.borderColor = "#111111"; }}
        />
      </div>

      {/* Results / states */}
      {loading ? (
        <p className="font-mono text-xs text-cy-muted">Loading…</p>
      ) : !hasQuery ? (
        <p className="font-mono text-xs text-cy-muted tracking-[0.06em]">
          Start typing to search all asks.
        </p>
      ) : !hasResults ? (
        <div className="border border-cy-ink p-10 text-center">
          <p className="font-display font-bold text-lg text-cy-ink">
            No results for &ldquo;{query}&rdquo;.
          </p>
          <p className="font-sans text-sm text-cy-muted mt-1">
            Try different keywords or check your spelling.
          </p>
        </div>
      ) : (
        <>
          <p className="font-mono text-[10px] text-cy-muted tracking-[0.08em]">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <ul className="flex flex-col gap-4">
            {results.map((ask) => (
              <AskCard
                key={ask.id}
                ask={ask}
                onClick={() => console.log("Ask clicked:", ask.id)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
