import { useEffect, useState } from "react";
import { getAsks } from "../data/db";
import AskCard from "../components/AskCard";

export default function BuildLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAsks("build_log").then((asks) => {
      if (!cancelled) {
        const sorted = [...asks].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLogs(sorted);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      <header>
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">
          Build Logs
        </h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          What builders shipped. Real projects, real timelines.
        </p>
      </header>

      {loading ? (
        <p className="font-mono text-xs text-cy-muted tracking-[0.06em]">
          Loading build logs…
        </p>
      ) : logs.length === 0 ? (
        <div className="border border-cy-ink p-10 text-center">
          <p className="font-display font-bold text-lg text-cy-ink">No build logs yet.</p>
          <p className="font-sans text-sm text-cy-muted mt-1">Be the first to ship something.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {logs.map((log) => (
            <AskCard
              key={log.id}
              ask={log}
              onClick={() => console.log("Build log clicked:", log.id)}
            />
          ))}
        </ul>
      )}

    </div>
  );
}
