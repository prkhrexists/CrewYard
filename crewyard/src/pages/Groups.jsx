import { useState } from "react";

// ─────────────────────────────────────────────────────────────
//  Static mock groups
// ─────────────────────────────────────────────────────────────
const MOCK_GROUPS = [
  {
    id: "g1",
    name: "SIH 2025 Builders",
    description:
      "A space for teams actively working on Smart India Hackathon 2025 problem statements. Share updates, find teammates, and troubleshoot together.",
    memberCount: 312,
    tags: ["hackathon", "SIH2025"],
  },
  {
    id: "g2",
    name: "GSoC Aspirants India",
    description:
      "For students planning to apply to Google Summer of Code. Discuss orgs, proposals, and OSS contribution strategies.",
    memberCount: 874,
    tags: ["gsoc", "open-source"],
  },
  {
    id: "g3",
    name: "Next.js & Full-Stack India",
    description:
      "Debugging sessions, project showcases, and deployment tips for Next.js projects built by Indian college students.",
    memberCount: 1203,
    tags: ["next.js", "full-stack", "react"],
  },
  {
    id: "g4",
    name: "ML / AI Builders",
    description:
      "PyTorch, Hugging Face, Kaggle, and research paper discussions. Open to all skill levels — share your projects and get feedback.",
    memberCount: 641,
    tags: ["machine-learning", "python", "ai"],
  },
  {
    id: "g5",
    name: "Campus Founders & Micro-SaaS",
    description:
      "Students shipping and monetising real products while in college. Build logs, MRR updates, and founder war stories.",
    memberCount: 289,
    tags: ["startup", "saas", "indie-hacker"],
  },
];

// ─────────────────────────────────────────────────────────────
//  GroupCard
// ─────────────────────────────────────────────────────────────
function GroupCard({ group }) {
  const [joined, setJoined] = useState(false);

  return (
    <li className="bg-cy-bg border border-cy-ink flex flex-col">

      {/* Card header */}
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div className="min-w-0">
          <h2 className="font-sans font-bold text-base text-cy-ink leading-snug">
            {group.name}
          </h2>
          <p className="font-mono text-[10px] text-cy-muted tracking-[0.06em] mt-0.5">
            {group.memberCount.toLocaleString("en-IN")} members
          </p>
        </div>

        {/* Join / Joined toggle */}
        <button
          id={`group-join-btn-${group.id}`}
          onClick={() => setJoined((v) => !v)}
          aria-pressed={joined}
          className="shrink-0 font-mono text-[10px] font-bold tracking-[0.1em]
                     uppercase px-4 py-2 transition-colors duration-150"
          style={
            joined
              ? { backgroundColor: "#111111", borderColor: "#111111",
                  borderWidth: "1.5px", color: "#FBF8F2" }
              : { backgroundColor: "transparent", borderColor: "#111111",
                  borderWidth: "1.5px", color: "#111111" }
          }
        >
          {joined ? "Joined ✓" : "Join"}
        </button>
      </div>

      {/* Description */}
      <p className="font-sans text-sm text-cy-muted leading-relaxed px-5 pb-4">
        {group.description}
      </p>

      {/* Tags */}
      {group.tags?.length > 0 && (
        <footer className="border-t border-cy-ink px-5 py-3 flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </footer>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  Groups page
// ─────────────────────────────────────────────────────────────
export default function Groups() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      <header>
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">
          Groups
        </h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          Find your niche. Join communities of builders working on similar things.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {MOCK_GROUPS.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </ul>

    </div>
  );
}
