import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCat } from "../context/CatContext";

// ─────────────────────────────────────────────────────────────
//  Mock Data
// ─────────────────────────────────────────────────────────────
const MY_POD = {
  id: "pod-nmims",
  name: "NMIMS MPSTME Shirpur",
  shortName: "NMIMS MPSTME",
  location: "Shirpur, Maharashtra",
  memberCount: 142,
  rank: 9,
  points: 2450,
  battlesWon: 7,
  activeBuilders: 38,
  winsThisMonth: 3,
  streak: 5,
  motto: "The official CrewYard builder clan of our campus. Build together. Win together.",
  activeNow: [
    { name: "Prakhar Jaiswal", avatarUrl: "/avatars/avatar_01.jpg" },
    { name: "Arjun Sharma",    avatarUrl: "/avatars/avatar_07.jpg" },
    { name: "Divya Krishnan",  avatarUrl: "/avatars/avatar_04.jpg" },
    { name: "Rohan Gupta",     avatarUrl: "/avatars/avatar_03.jpg" },
    { name: "Sneha Reddy",     avatarUrl: "/avatars/avatar_06.jpg" },
  ],
  activeNowExtra: 33,
};

const LEADERBOARD = [
  { rank: 1,  name: "VIT Vellore",             points: 5680, delta: "+120" },
  { rank: 2,  name: "KIIT Bhubaneswar",         points: 5120, delta: "+80"  },
  { rank: 3,  name: "Thapar University",        points: 4760, delta: "+95"  },
  { rank: 4,  name: "PES University",           points: 4420, delta: "+60"  },
  { rank: 5,  name: "Chandigarh University",    points: 4080, delta: "+45"  },
  { rank: 6,  name: "Manipal University Jaipur",points: 3740, delta: "+70"  },
  { rank: 7,  name: "UPES Dehradun",            points: 3510, delta: "+30"  },
  { rank: 8,  name: "Jaypee Institute",         points: 3260, delta: "+55"  },
  { rank: 9,  name: "NMIMS MPSTME Shirpur",     points: 2450, delta: "+120", isMyPod: true },
  { rank: 10, name: "REVA University",          points: 2210, delta: "+40"  },
  { rank: 11, name: "Galgotias University",     points: 1980, delta: "+25"  },
  { rank: 12, name: "MIT-WPU Pune",             points: 1840, delta: "+35"  },
];

const CHALLENGE_TYPES = [
  { id: "dsa",       label: "DSA DUEL",         color: "var(--cat-blue)", desc: "Competitive programming battle", icon: "⟨/⟩" },
  { id: "web",       label: "WEB BUILD",         color: "var(--accent)", desc: "Build and showcase a project",   icon: "⬡" },
  { id: "aiml",      label: "AI / ML",           color: "var(--cat-green)", desc: "Model / dataset challenge",      icon: "⊕" },
  { id: "bughunt",   label: "BUG HUNT",          color: "#9B2335", desc: "Find bugs, earn points",         icon: "⬤" },
  { id: "oss",       label: "OPEN SOURCE",       color: "#5B3FA6", desc: "Contribute together",             icon: "◈" },
  { id: "custom",    label: "CUSTOM",            color: "var(--text)", desc: "Design your own challenge",       icon: "✦" },
];

const LIVE_CHALLENGES = [
  {
    id: "ch1",
    type: "dsa",
    label: "DSA DUEL",
    color: "var(--cat-blue)",
    icon: "⟨/⟩",
    opponent: "VIT Vellore",
    details: "20 problems · 60 min · Rated",
    endsIn: { days: 2, hours: 14, mins: 32 },
    status: "pending",
  },
  {
    id: "ch2",
    type: "web",
    label: "WEB BUILD BATTLE",
    color: "var(--accent)",
    icon: "⬡",
    opponent: "Jaypee Institute",
    details: "Build a fullstack project · 7 days",
    endsIn: { days: 4, hours: 9, mins: 11 },
    status: "pending",
  },
  {
    id: "ch3",
    type: "aiml",
    label: "AI/ML SHOWDOWN",
    color: "var(--cat-green)",
    icon: "⊕",
    opponent: "IIIT Bangalore",
    details: "Model accuracy challenge · 5 days",
    endsIn: { days: 5, hours: 7, mins: 45 },
    status: "pending",
  },
];

const RECENT_WINS = [
  { opponent: "VIT Chennai",    type: "DSA DUEL",    date: "15 Jul 2026", pts: 320 },
  { opponent: "PES University", type: "Bug Hunt",    date: "10 Jul 2026", pts: 280 },
  { opponent: "RVCE Bangalore", type: "Code Sprint", date: "05 Jul 2026", pts: 250 },
];

const RECENT_BUILDS = [
  { title: "Authentication Microservice", builder: "Aditya Patil",  stack: "Node.js · Express · PostgreSQL", when: "2h ago", avatarSeed: "aditya_pat" },
  { title: "AI Resume Analyzer",          builder: "Tanvi Shah",    stack: "Python · FastAPI · Transformers", when: "5h ago", avatarSeed: "tanvi_shah" },
  { title: "Campus Bus Tracker",          builder: "Rohan Kulkarni", stack: "Flutter · Firebase · Maps API",  when: "1d ago", avatarSeed: "rohan_kul" },
];

const MEMBERS = [
  { name: "Aditya Patil",    project: "Authentication Microservice", rep: 1240, avatarSeed: "aditya_pat",  building: true  },
  { name: "Tanvi Shah",      project: "AI Resume Analyzer",          rep: 980,  avatarSeed: "tanvi_shah",  building: true  },
  { name: "Rohan Kulkarni",  project: "Open-source contributor",     rep: 1680, avatarSeed: "rohan_kul",  building: false },
  { name: "Prakhar Jaiswal", project: "FORGE — Multi-agent AI",      rep: 1420, avatarSeed: "prkhr_exists",building: true  },
  { name: "Sneha Reddy",     project: "Java micro-services",         rep: 210,  avatarSeed: "sneha_404",  building: false },
];

const ACTIVITY_LOG = [
  { text: "Aditya Patil won a DSA Duel against VIT Vellore",    time: "2h ago",  emoji: "🏆" },
  { text: "Tanvi Shah shipped an AI Resume Analyzer",           time: "5h ago",  emoji: "🚢" },
  { text: "4 new builders joined the Pod",                      time: "1d ago",  emoji: "👋" },
  { text: "NMIMS MPSTME accepted a Web Build Battle vs Jaypee Institute", time: "1d ago", emoji: "⚔️" },
  { text: "Pod hosted a 24-hour mini hackathon — 18 participants", time: "3d ago", emoji: "🏕️" },
  { text: "Rohan Kulkarni opened first PR to Apache Kafka",     time: "4d ago",  emoji: "📦" },
  { text: "Pod climbed from #11 to #9 on the leaderboard",      time: "5d ago",  emoji: "📈" },
];

const DISCOVERY_PODS = [
  { name: "MIT-WPU",           location: "Pune, Maharashtra",     rank: 12, points: 1840, builders: 24 },
  { name: "SRM Institute",     location: "Chennai, Tamil Nadu",   rank: 13, points: 1720, builders: 31 },
  { name: "Amity University",  location: "Noida, Uttar Pradesh",  rank: 14, points: 1590, builders: 18 },
  { name: "LNMIIT",            location: "Jaipur, Rajasthan",     rank: 15, points: 1430, builders: 14 },
  { name: "DAIICT",            location: "Gandhinagar, Gujarat",  rank: 16, points: 1310, builders: 22 },
  { name: "IIIT Allahabad",    location: "Prayagraj, UP",         rank: 17, points: 1190, builders: 29 },
  { name: "Symbiosis Pune",    location: "Pune, Maharashtra",     rank: 18, points: 1080, builders: 17 },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function Avatar({ seed, name, size = "sm" }) {
  const dim  = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-6 h-6";
  const text = size === "lg" ? "text-[10px]" : "text-[8px]";
  const url  = `/avatars/avatar_09.jpg`;
  return (
    <div className={`${dim} rounded-full overflow-hidden border-2 border-cy-ink flex items-center justify-center bg-cy-ink shrink-0`}>
      <img src={url} alt={name} className="w-full h-full object-cover" />
    </div>
  );
}

function Countdown({ days, hours, mins }) {
  return (
    <span className="font-mono text-[13px] font-bold text-cy-orange tracking-widest">
      {String(days).padStart(2, "0")}d {String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  CampusLeaderboard (right panel)
// ─────────────────────────────────────────────────────────────
function CampusLeaderboard({ showFull, onToggle }) {
  const shown = showFull ? LEADERBOARD : LEADERBOARD.slice(0, 8);
  return (
    <div className="border-2 border-cy-ink bg-cy-bg shadow-[4px_4px_0px_0px_var(--shadow)]">
      <div className="border-b-2 border-cy-ink px-4 py-3">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">
          CAMPUS LEADERBOARD
        </h2>
      </div>
      <ul className="flex flex-col">
        {shown.map((pod) => (
          <li
            key={pod.rank}
            className={[
              "flex items-center justify-between px-4 py-2.5 border-b border-cy-ink/15 transition-colors",
              pod.isMyPod ? "bg-cy-orange/5 border-l-4 border-l-cy-orange" : "hover:bg-cy-ink/[0.03]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`font-mono text-[10px] font-bold w-6 shrink-0 ${pod.isMyPod ? "text-cy-orange" : "text-cy-muted"}`}>
                #{String(pod.rank).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className={`font-sans text-[12px] font-bold leading-snug truncate ${pod.isMyPod ? "text-cy-orange" : "text-cy-ink"}`}>
                  {pod.name}
                </p>
                {pod.isMyPod && (
                  <p className="font-mono text-[9px] text-cy-orange tracking-[0.08em]">← YOUR POD</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className={`font-mono text-[11px] font-bold ${pod.isMyPod ? "text-cy-orange" : "text-cy-ink"}`}>
                {pod.points.toLocaleString()} pts
              </p>
              <p className="font-mono text-[8px] text-[var(--cat-green)]">{pod.delta} this week</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-cy-orange hover:bg-cy-orange/5 transition-colors border-t border-cy-ink/20 text-center"
      >
        {showFull ? "COLLAPSE ↑" : "VIEW FULL LEADERBOARD →"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ChallengeCard
// ─────────────────────────────────────────────────────────────
function ChallengeCard({ ch, onAccept }) {
  const [status, setStatus] = useState(ch.status);
  function handleAccept() {
    setStatus("accepted");
    onAccept?.(ch.id);
  }
  return (
    <div
      className="border-2 border-cy-ink bg-cy-bg flex flex-col gap-0 shadow-[3px_3px_0px_0px_var(--shadow)] hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_var(--shadow)] transition-all duration-150"
    >
      {/* Type header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-cy-ink"
        style={{ backgroundColor: ch.color + "18" }}
      >
        <span
          className="font-mono text-[14px] font-bold w-7 h-7 flex items-center justify-center border-2 shrink-0"
          style={{ borderColor: ch.color, color: ch.color }}
        >
          {ch.icon}
        </span>
        <span className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: ch.color }}>
          {ch.label}
        </span>
      </div>

      {/* Matchup */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans font-bold text-[13px] text-cy-ink">{MY_POD.shortName}</span>
          <span className="font-mono text-[10px] text-cy-orange font-bold tracking-[0.12em]">VS</span>
          <span className="font-sans font-bold text-[13px] text-cy-ink">{ch.opponent}</span>
        </div>
        <p className="font-sans text-[12px] text-cy-muted mt-1">{ch.details}</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-cy-ink/20 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-mono text-[8px] tracking-[0.1em] uppercase text-cy-muted mb-0.5">ENDS IN</p>
          <Countdown {...ch.endsIn} />
        </div>
        {status === "accepted" ? (
          <span className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-[var(--cat-green)] text-[var(--cat-green)]">
            ACCEPTED ✓
          </span>
        ) : (
          <button
            onClick={handleAccept}
            className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all duration-200 shadow-[2px_2px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
          >
            ACCEPT CHALLENGE
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HostChallenge panel (right side)
// ─────────────────────────────────────────────────────────────
function HostChallengePanel() {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", start: "", end: "", teamSize: "", stack: "", points: "", rules: "" });

  return (
    <div className="border-2 border-cy-ink bg-cy-bg shadow-[4px_4px_0px_0px_var(--shadow)]">
      <div className="border-b-2 border-cy-ink px-4 py-3">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">HOST A CHALLENGE</h2>
      </div>
      <ul className="flex flex-col">
        {CHALLENGE_TYPES.filter(ct => ct.id !== "custom").map((ct) => (
          <li
            key={ct.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-cy-ink/15 hover:bg-cy-ink/[0.03] cursor-pointer transition-colors group"
            onClick={() => setExpanded(ct.id)}
          >
            <span
              className="font-mono text-[13px] w-6 h-6 flex items-center justify-center border shrink-0"
              style={{ borderColor: ct.color, color: ct.color, backgroundColor: ct.color + "15" }}
            >
              {ct.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-[12px] text-cy-ink">{ct.label}</p>
              <p className="font-mono text-[9px] text-cy-muted">{ct.desc}</p>
            </div>
            <span className="font-mono text-[12px] text-cy-muted group-hover:text-cy-orange transition-colors">›</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setExpanded("mini")}
        className="w-full px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-cy-orange hover:bg-cy-orange/5 transition-colors border-t border-cy-ink/20 text-center"
      >
        + MINI HACKATHON →
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t-2 border-cy-ink px-4 py-4 flex flex-col gap-3">
          <p className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-cy-orange">
            {expanded === "mini" ? "MINI HACKATHON" : CHALLENGE_TYPES.find(c => c.id === expanded)?.label}
          </p>
          {expanded === "mini" && (
            <>
              {[["Title", "title"],["Description", "desc"],["Start Date", "start"],["End Date","end"],["Team Size","teamSize"],["Tech Stack","stack"],["Prize / Pod Points","points"]].map(([label, key]) => (
                <div key={key}>
                  <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1">{label}</p>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full font-sans text-[13px] bg-cy-bg border-2 border-cy-ink px-3 py-2 focus:outline-none focus:border-cy-orange transition-colors"
                  />
                </div>
              ))}
              <div>
                <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1">Rules</p>
                <textarea rows={3} value={form.rules} onChange={(e) => setForm(f => ({ ...f, rules: e.target.value }))}
                  className="w-full font-sans text-[13px] bg-cy-bg border-2 border-cy-ink px-3 py-2 resize-none focus:outline-none focus:border-cy-orange transition-colors"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button className="flex-1 font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-2.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all">
              PUBLISH CHALLENGE
            </button>
            <button onClick={() => setExpanded(false)} className="font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-2.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Challenge Opponent picker
// ─────────────────────────────────────────────────────────────
function ChallengeOpponentPanel({ onClose }) {
  const [step, setStep]           = useState(1); // 1=choose campus, 2=choose type
  const [searchCampus, setSearch] = useState("");
  const [chosen, setChosen]       = useState(null);
  const [type, setType]           = useState(null);
  const [sent, setSent]           = useState(false);

  const filtered = useMemo(() => {
    if (!searchCampus) return LEADERBOARD.filter(l => !l.isMyPod).slice(0, 7);
    return LEADERBOARD.filter(l => !l.isMyPod && l.name.toLowerCase().includes(searchCampus.toLowerCase()));
  }, [searchCampus]);

  function handleSend() {
    if (!chosen || !type) return;
    setSent(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="border-2 border-cy-ink bg-cy-bg shadow-[6px_6px_0px_0px_var(--shadow)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">
          {sent ? "CHALLENGE SENT ✓" : step === 1 ? "CHOOSE YOUR OPPONENT" : "CHOOSE CHALLENGE TYPE"}
        </h3>
        <button onClick={onClose} className="font-mono text-[11px] text-cy-muted hover:text-cy-orange transition-colors border-2 border-transparent hover:border-cy-orange px-2 py-1">✕</button>
      </div>

      {sent ? (
        <p className="font-sans text-sm text-cy-muted">Challenge sent to <strong>{chosen}</strong>. They'll respond within 48 hours.</p>
      ) : step === 1 ? (
        <>
          <input
            type="text"
            placeholder="Search campus..."
            value={searchCampus}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full font-mono text-[11px] bg-cy-bg border-2 border-cy-ink px-3 py-2 focus:outline-none focus:border-cy-orange transition-colors"
          />
          <ul className="flex flex-col gap-0 border-2 border-cy-ink">
            {filtered.map((pod) => (
              <li
                key={pod.rank}
                onClick={() => { setChosen(pod.name); setStep(2); }}
                className={`px-4 py-2.5 border-b border-cy-ink/20 last:border-b-0 cursor-pointer transition-colors hover:bg-cy-ink/5 flex items-center justify-between ${chosen === pod.name ? "bg-cy-orange/5" : ""}`}
              >
                <span className="font-sans text-[13px] font-bold text-cy-ink">{pod.name}</span>
                <span className="font-mono text-[9px] text-cy-muted">{pod.points.toLocaleString()} pts</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="font-mono text-[10px] text-cy-muted tracking-[0.06em]">vs. <strong>{chosen}</strong></p>
          <ul className="flex flex-col gap-2">
            {CHALLENGE_TYPES.map((ct) => (
              <li
                key={ct.id}
                onClick={() => setType(ct.id)}
                className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-all ${type === ct.id ? "border-cy-orange bg-cy-orange/5" : "border-cy-ink hover:bg-cy-ink/5"}`}
              >
                <span className="font-mono text-[14px]" style={{ color: ct.color }}>{ct.icon}</span>
                <span className="font-sans font-bold text-[13px] text-cy-ink">{ct.label}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
              ← BACK
            </button>
            <button
              onClick={handleSend}
              disabled={!type}
              className="flex-1 font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-2.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SEND CHALLENGE →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PodStatBadge
// ─────────────────────────────────────────────────────────────
function PodStatBadge({ label, value, accent = false }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <p className="font-mono text-[8px] tracking-[0.12em] uppercase text-cy-muted">{label}</p>
      <p className={`font-mono text-[18px] font-bold leading-none ${accent ? "text-cy-orange" : "text-cy-ink"}`}>
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CampusPods page
// ─────────────────────────────────────────────────────────────
const SECTIONS = ["OVERVIEW", "CHALLENGES", "HOST", "MEMBERS", "ACTIVITY"];

export default function CampusPods() {
  const { setContext } = useCat();
  const [activeSection,    setActiveSection]    = useState("OVERVIEW");
  const [showFullLB,       setShowFullLB]       = useState(false);
  const [showOpponentPicker, setShowOpponent]   = useState(false);
  const [searchDiscover,   setSearchDiscover]   = useState("");
  const [activeTab,        setActiveTab]        = useState("CHALLENGES"); // inside CHALLENGES section

  useEffect(() => {
    setContext({ page: 'campuspods' });
  }, [setContext]);

  const filteredPods = useMemo(() => {
    if (!searchDiscover) return DISCOVERY_PODS;
    return DISCOVERY_PODS.filter(p =>
      p.name.toLowerCase().includes(searchDiscover.toLowerCase()) ||
      p.location.toLowerCase().includes(searchDiscover.toLowerCase())
    );
  }, [searchDiscover]);

  return (
    <div className="flex flex-col gap-0 max-w-full">

      {/* ── Page Header ── */}
      <header className="pb-5">
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">CampusPods</h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          Clans of your campus. Compete, collaborate, and conquer together.
        </p>
      </header>

      {/* ── 3-column grid: Pod | Main | Leaderboard ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr_1fr] gap-5">

        {/* ── LEFT: YOUR POD card ── */}
        <div className="flex flex-col gap-5">
          <div className="border-2 border-cy-ink bg-cy-bg shadow-[4px_4px_0px_0px_var(--shadow)]">
            {/* Pod header */}
            <div className="border-b-2 border-cy-ink px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-cy-orange border border-cy-orange px-2 py-0.5">
                YOUR POD
              </span>
              <Link
                to="#"
                className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all"
              >
                VIEW POD PROFILE
              </Link>
            </div>

            {/* Pod identity */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-4">
              {/* Pixel crest */}
              <div className="w-14 h-14 shrink-0 border-2 border-cy-ink flex items-center justify-center bg-cy-ink shadow-[3px_3px_0px_0px_var(--accent)]">
                <span className="font-display font-black text-white text-[18px] leading-none">N</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-black text-[18px] text-cy-ink leading-tight">{MY_POD.name}</h2>
                <p className="font-mono text-[10px] text-cy-muted mt-0.5">{MY_POD.location}</p>
                <p className="font-mono text-[10px] text-cy-muted">{MY_POD.memberCount} members</p>
              </div>
            </div>

            <p className="font-sans text-sm text-cy-muted px-4 pb-4 leading-relaxed">{MY_POD.motto}</p>

            {/* Stats row */}
            <div className="border-t-2 border-cy-ink px-4 py-3 grid grid-cols-4 gap-3">
              <PodStatBadge label="RANK"            value={`#${MY_POD.rank}`}           accent />
              <PodStatBadge label="POD POINTS"      value={MY_POD.points.toLocaleString()} />
              <PodStatBadge label="BATTLES WON"     value={String(MY_POD.battlesWon).padStart(2, "0")} />
              <PodStatBadge label="ACTIVE BUILDERS" value={MY_POD.activeBuilders} />
            </div>
            <div className="border-t border-cy-ink/20 px-4 py-3">
              <PodStatBadge label="WINS THIS MONTH" value={String(MY_POD.winsThisMonth).padStart(2, "0")} accent />
            </div>

            {/* Active now */}
            <div className="border-t-2 border-cy-ink px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-cy-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--cat-green)] animate-pulse inline-block"></span>
                  ACTIVE NOW
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {MY_POD.activeNow.map((u) => (
                  <div key={u.name} title={u.name} className="w-7 h-7 rounded-full overflow-hidden border-2 border-cy-bg ring-1 ring-cy-ink shrink-0">
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                <span className="font-mono text-[9px] text-cy-muted ml-1">+{MY_POD.activeNowExtra} more online</span>
              </div>
            </div>

            {/* Current streak */}
            <div className="border-t-2 border-cy-ink px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-cy-muted">CURRENT STREAK</span>
              <span className="font-mono text-[16px] font-bold text-cy-orange">{MY_POD.streak} weeks 🔥</span>
            </div>
          </div>

          {/* Challenge a campus CTA */}
          <button
            onClick={() => setShowOpponent(!showOpponentPicker)}
            className="w-full font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all duration-200 shadow-[3px_3px_0px_0px_var(--accent)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
          >
            + CHALLENGE A CAMPUS
          </button>

          {showOpponentPicker && (
            <ChallengeOpponentPanel onClose={() => setShowOpponent(false)} />
          )}
        </div>

        {/* ── CENTRE: Main content ── */}
        <div className="flex flex-col gap-5">
          {/* Section nav */}
          <div className="border-b-2 border-cy-ink bg-cy-bg">
            <nav className="flex items-center gap-0">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    aria-selected={isActive}
                    className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-3 border-b-2 transition-all duration-150"
                    style={isActive
                      ? { borderBottomColor: "var(--accent)", color: "var(--accent)" }
                      : { borderBottomColor: "transparent", color: "#6B6B6B" }
                    }
                  >
                    {section}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── OVERVIEW ── */}
          {activeSection === "OVERVIEW" && (
            <div className="flex flex-col gap-6">
              {/* Live Challenges */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">LIVE CHALLENGES</h2>
                  <button onClick={() => setActiveSection("CHALLENGES")} className="font-mono text-[9px] tracking-[0.08em] uppercase text-cy-orange hover:underline">VIEW ALL →</button>
                </div>
                <div className="flex flex-col gap-4">
                  {LIVE_CHALLENGES.map((ch) => (
                    <ChallengeCard key={ch.id} ch={ch} />
                  ))}
                  <p className="font-mono text-[9px] text-cy-muted tracking-[0.06em]">+ MORE CHALLENGES COMING SOON</p>
                </div>
              </section>

              {/* Recent Wins */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">RECENT WINS</h2>
                  <button className="font-mono text-[9px] tracking-[0.08em] uppercase text-cy-orange hover:underline">VIEW ALL →</button>
                </div>
                <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[3px_3px_0px_0px_var(--shadow)]">
                  {RECENT_WINS.map((win, i) => (
                    <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i < RECENT_WINS.length - 1 ? "border-b border-cy-ink" : ""}`}>
                      <span className="text-[20px]">🏆</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-[13px] text-cy-ink">Beat {win.opponent}</p>
                        <p className="font-mono text-[10px] text-cy-muted">{win.type} · {win.date}</p>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-[var(--cat-green)] shrink-0">+{win.pts} pts</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Builds */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">RECENT BUILDS</h2>
                  <button className="font-mono text-[9px] tracking-[0.08em] uppercase text-cy-orange hover:underline">VIEW ALL →</button>
                </div>
                <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[3px_3px_0px_0px_var(--shadow)]">
                  {RECENT_BUILDS.map((build, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < RECENT_BUILDS.length - 1 ? "border-b border-cy-ink" : ""}`}>
                      <Avatar seed={build.avatarSeed} name={build.builder} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-[13px] text-cy-ink">{build.title}</p>
                        <p className="font-mono text-[9px] text-cy-muted">{build.stack}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-[10px] font-bold text-cy-ink">by {build.builder}</p>
                        <p className="font-mono text-[9px] text-cy-muted">{build.when}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── CHALLENGES ── */}
          {activeSection === "CHALLENGES" && (
            <div className="flex flex-col gap-5">
              {/* Sub-tabs */}
              <div className="flex gap-2 flex-wrap">
                {["CHALLENGES", "FIND A CAMPUS"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 transition-all"
                    style={activeTab === tab
                      ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" }
                      : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "CHALLENGES" ? (
                <div className="flex flex-col gap-4">
                  {LIVE_CHALLENGES.map((ch) => <ChallengeCard key={ch.id} ch={ch} />)}
                  <button
                    onClick={() => setShowOpponent(true)}
                    className="self-start font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all"
                  >
                    + CHALLENGE A CAMPUS
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Search by college, city, or state..."
                    value={searchDiscover}
                    onChange={(e) => setSearchDiscover(e.target.value)}
                    className="w-full font-mono text-[11px] bg-cy-bg border-2 border-cy-ink px-3 py-2 focus:outline-none focus:border-cy-orange transition-colors"
                  />
                  <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[3px_3px_0px_0px_var(--shadow)]">
                    {filteredPods.map((pod, i) => (
                      <div key={pod.name} className={`flex items-center gap-4 px-4 py-3 ${i < filteredPods.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}>
                        <div className="w-10 h-10 shrink-0 border-2 border-cy-ink flex items-center justify-center bg-cy-ink">
                          <span className="font-mono font-bold text-white text-[12px]">{pod.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-bold text-[13px] text-cy-ink">{pod.name}</p>
                          <p className="font-mono text-[10px] text-cy-muted">{pod.location}</p>
                          <p className="font-mono text-[9px] text-cy-muted">Rank #{pod.rank} · {pod.points.toLocaleString()} pts · {pod.builders} active builders</p>
                        </div>
                        <button
                          onClick={() => setShowOpponent(true)}
                          className="shrink-0 font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-2 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all"
                        >
                          VIEW POD
                        </button>
                      </div>
                    ))}
                    {filteredPods.length === 0 && (
                      <div className="px-4 py-8 text-center">
                        <p className="font-display font-bold text-base text-cy-ink">No campuses found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showOpponentPicker && (
                <ChallengeOpponentPanel onClose={() => setShowOpponent(false)} />
              )}
            </div>
          )}

          {/* ── HOST ── */}
          {activeSection === "HOST" && (
            <div className="flex flex-col gap-4">
              <div className="border-2 border-cy-ink p-5 shadow-[4px_4px_0px_0px_var(--shadow)]">
                <h2 className="font-sans font-bold text-[16px] text-cy-ink mb-1">Host a Challenge</h2>
                <p className="font-sans text-sm text-cy-muted leading-relaxed">
                  Create a DSA duel, web build battle, AI/ML showdown, bug hunt, open-source sprint, or a full mini hackathon. Winning earns your Pod points and climbs the leaderboard.
                </p>
              </div>
              <HostChallengePanel />
            </div>
          )}

          {/* ── MEMBERS ── */}
          {activeSection === "MEMBERS" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">
                ACTIVE BUILDERS · {MY_POD.memberCount}
              </h2>
              <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                {MEMBERS.map((member, i) => (
                  <div key={member.name} className={`flex items-center gap-4 px-4 py-4 ${i < MEMBERS.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}>
                    <Avatar seed={member.avatarSeed} name={member.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-bold text-[14px] text-cy-ink">{member.name}</p>
                      <p className="font-sans text-[12px] text-cy-muted">{member.project}</p>
                      <p className="font-mono text-[10px] text-cy-orange mt-0.5">{member.rep.toLocaleString()} rep</p>
                    </div>
                    {member.building && (
                      <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-[var(--cat-green)] border border-[var(--cat-green)] px-2 py-0.5 shrink-0">BUILDING</span>
                    )}
                    <Link to="#" className="shrink-0 font-mono text-[9px] font-bold tracking-[0.08em] uppercase border-2 border-cy-ink px-3 py-1.5 hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
                      PROFILE
                    </Link>
                  </div>
                ))}
              </div>
              <button className="self-start font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
                VIEW ALL {MY_POD.memberCount} MEMBERS →
              </button>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {activeSection === "ACTIVITY" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-cy-ink">POD ACTIVITY</h2>
              <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
                {ACTIVITY_LOG.map((entry, i) => (
                  <div key={i} className={`flex items-start gap-4 px-4 py-3.5 ${i < ACTIVITY_LOG.length - 1 ? "border-b border-cy-ink" : ""}`}>
                    <span className="text-[18px] shrink-0 mt-0.5">{entry.emoji}</span>
                    <p className="flex-1 font-sans text-sm text-cy-ink leading-relaxed">{entry.text}</p>
                    <span className="font-mono text-[9px] text-cy-muted shrink-0 mt-0.5">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Leaderboard + Host ── */}
        <div className="flex flex-col gap-5">
          <CampusLeaderboard showFull={showFullLB} onToggle={() => setShowFullLB(!showFullLB)} />
          <HostChallengePanel />
        </div>

      </div>
    </div>
  );
}
