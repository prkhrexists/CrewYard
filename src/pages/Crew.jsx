import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
//  CREW BUILDER DATA
// ─────────────────────────────────────────────────────────────
const CREW_BUILDERS = [
  {
    id: "b1",
    name: "Priya Nair",
    username: "priya_builds",
    college: "KIIT Bhubaneswar",
    city: "Pilani",
    year: 4,
    avatarSeed: "priya_builds",
    bio: "Full-stack dev shipping real products. Love Supabase, Next.js, and shipping fast.",
    currentlyBuilding: "AI Study Planner (Next.js + GPT-4o)",
    lookingFor: ["accountability-partner", "code-reviewer", "project-collaborator"],
    skills: ["Python", "React", "Next.js", "Supabase", "TypeScript"],
    technologies: ["Next.js", "Supabase", "Python", "TypeScript", "Vercel"],
    goals: ["ship-side-project", "learn-react", "contribute-to-oss"],
    preferredCadence: "3x-week",
    githubStats: { commitsThisMonth: 51, buildLogs: 4, helpfulAnswers: 18, streak: 12 },
    activityStatus: "active-today",
    campusPod: "KIIT Bhubaneswar",
    groups: ["Next.js & Full-Stack India", "GSoC Aspirants India"],
  },
  {
    id: "b2",
    name: "Karan Mehta",
    username: "karan_hacks",
    college: "UPES Dehradun",
    city: "Hyderabad",
    year: 4,
    avatarSeed: "karan_hacks",
    bio: "Building OSS tools for devs. 80 stars on my first project. Go, Python, systems nerd.",
    currentlyBuilding: "MockMate — AI interview CLI (open source)",
    lookingFor: ["hackathon-teammate", "open-source-buddy", "co-founder"],
    skills: ["Go", "Python", "TypeScript", "Docker", "Kubernetes"],
    technologies: ["Go", "Python", "Docker", "CLI", "OpenAI API"],
    goals: ["ship-side-project", "build-startup", "contribute-to-oss"],
    preferredCadence: "daily",
    githubStats: { commitsThisMonth: 63, buildLogs: 6, helpfulAnswers: 44, streak: 21 },
    activityStatus: "active-today",
    campusPod: "UPES Dehradun",
    groups: ["SIH 2025 Builders", "Campus Founders & Micro-SaaS"],
  },
  {
    id: "b3",
    name: "Divya Krishnan",
    username: "divya_fs",
    college: "VIT Vellore",
    city: "Vellore",
    year: 3,
    avatarSeed: "divya_fs",
    bio: "Building campus tools with Next.js + Supabase. Love shipping things people actually use.",
    currentlyBuilding: "Campus Marketplace for VIT students",
    lookingFor: ["project-collaborator", "open-source-buddy", "study-partner"],
    skills: ["JavaScript", "React", "Next.js", "Supabase", "Tailwind"],
    technologies: ["Next.js", "Supabase", "React", "Vercel"],
    goals: ["ship-side-project", "learn-react"],
    preferredCadence: "3x-week",
    githubStats: { commitsThisMonth: 22, buildLogs: 3, helpfulAnswers: 12, streak: 8 },
    activityStatus: "active-this-week",
    campusPod: "VIT Vellore",
    groups: ["Next.js & Full-Stack India"],
  },
  {
    id: "b4",
    name: "Arjun Sharma",
    username: "arjun_dev",
    college: "Jaypee Institute",
    city: "Tiruchirappalli",
    year: 3,
    avatarSeed: "arjun_dev",
    bio: "TypeScript enthusiast. Building tools for developers. Interested in OSS and GSoC.",
    currentlyBuilding: "Kubernetes operator for multi-tenant apps",
    lookingFor: ["accountability-partner", "open-source-buddy", "hackathon-teammate"],
    skills: ["TypeScript", "Go", "Kubernetes", "React", "Node.js"],
    technologies: ["TypeScript", "Go", "Kubernetes", "CNCF", "Node.js"],
    goals: ["contribute-to-oss", "solve-dsa-daily", "ship-side-project"],
    preferredCadence: "daily",
    githubStats: { commitsThisMonth: 34, buildLogs: 2, helpfulAnswers: 22, streak: 14 },
    activityStatus: "active-today",
    campusPod: "Jaypee Institute",
    groups: ["GSoC Aspirants India", "Next.js & Full-Stack India"],
  },
  {
    id: "b5",
    name: "Rohan Gupta",
    username: "rohan_ml",
    college: "PES University",
    city: "Mumbai",
    year: 2,
    avatarSeed: "rohan_ml",
    bio: "ML engineer in training. Working through fast.ai, contributing to MLflow.",
    currentlyBuilding: "MLflow custom logging plugin",
    lookingFor: ["study-partner", "accountability-partner", "mentor"],
    skills: ["Python", "PyTorch", "Scikit-learn", "SQL", "Pandas"],
    technologies: ["Python", "PyTorch", "MLflow", "Hugging Face", "Jupyter"],
    goals: ["contribute-to-oss", "learn-react", "solve-dsa-daily"],
    preferredCadence: "3x-week",
    githubStats: { commitsThisMonth: 8, buildLogs: 1, helpfulAnswers: 7, streak: 5 },
    activityStatus: "active-this-week",
    campusPod: "PES University",
    groups: ["GSoC Aspirants India", "ML / AI Builders"],
  },
  {
    id: "b6",
    name: "Sneha Reddy",
    username: "sneha_404",
    college: "Chandigarh University",
    city: "Bangalore",
    year: 2,
    avatarSeed: "sneha_404",
    bio: "Backend dev learning the ropes. Java + Spring Boot. Trying to ship my first real project.",
    currentlyBuilding: "Attendance management REST API",
    lookingFor: ["study-partner", "code-reviewer", "mentor"],
    skills: ["Java", "Spring Boot", "SQL", "Python", "REST APIs"],
    technologies: ["Java", "Spring Boot", "MySQL", "Docker"],
    goals: ["learn-react", "ship-side-project", "solve-dsa-daily"],
    preferredCadence: "weekly",
    githubStats: { commitsThisMonth: 5, buildLogs: 1, helpfulAnswers: 3, streak: 3 },
    activityStatus: "active-this-week",
    campusPod: "Chandigarh University",
    groups: ["Next.js & Full-Stack India"],
  },
  {
    id: "b7",
    name: "Tanvi Shah",
    username: "tanvi_builds",
    college: "NMIMS MPSTME Shirpur",
    city: "Shirpur",
    year: 3,
    avatarSeed: "tanvi_builds",
    bio: "AI/ML developer building real-world tools. FastAPI + Transformers stack.",
    currentlyBuilding: "AI Resume Analyzer with LLM explainability",
    lookingFor: ["project-collaborator", "hackathon-teammate", "accountability-partner"],
    skills: ["Python", "FastAPI", "Transformers", "React", "Docker"],
    technologies: ["Python", "FastAPI", "Hugging Face", "Docker", "Streamlit"],
    goals: ["ship-side-project", "build-startup", "contribute-to-oss"],
    preferredCadence: "3x-week",
    githubStats: { commitsThisMonth: 38, buildLogs: 3, helpfulAnswers: 15, streak: 9 },
    activityStatus: "active-today",
    campusPod: "NMIMS MPSTME Shirpur",
    groups: ["ML / AI Builders", "SIH 2025 Builders"],
  },
];

// ─────────────────────────────────────────────────────────────
//  MY CREW (mock persistent collaborators)
// ─────────────────────────────────────────────────────────────
const INITIAL_MY_CREW = [
  { builderId: "b1", context: "Accountability partner", lastActive: "Active today" },
  { builderId: "b2", context: "Hackathon teammate", lastActive: "Active today" },
  { builderId: "b3", context: "Open-source collaborator", lastActive: "2 days ago" },
];

// ─────────────────────────────────────────────────────────────
//  INTENT CONFIG
// ─────────────────────────────────────────────────────────────
const INTENTS = [
  { id: "hackathon-teammate", label: "HACKATHON TEAMMATE" },
  { id: "accountability-partner", label: "ACCOUNTABILITY PARTNER" },
  { id: "project-collaborator", label: "PROJECT COLLABORATOR" },
  { id: "open-source-buddy", label: "OPEN-SOURCE BUDDY" },
  { id: "code-reviewer", label: "CODE REVIEWER" },
  { id: "study-partner", label: "STUDY PARTNER" },
  { id: "co-founder", label: "CO-FOUNDER" },
  { id: "mentor", label: "MENTOR" },
  { id: "just-meet-builders", label: "JUST MEET BUILDERS" },
];

const ACCOUNTABILITY_GOALS = [
  { id: "ship-portfolio", label: "Ship my portfolio" },
  { id: "learn-react", label: "Learn React" },
  { id: "solve-dsa-daily", label: "Solve DSA daily" },
  { id: "contribute-to-oss", label: "Contribute to OSS" },
  { id: "build-startup", label: "Build a startup" },
  { id: "placement-prep", label: "Prepare for placements" },
  { id: "ship-side-project", label: "Ship a side project" },
];

const HACKATHON_EVENTS = ["SIH", "Smart India Hackathon", "College Hackathon", "Other"];
const HACKATHON_ROLES = ["Frontend", "Backend", "ML", "DevOps", "Designer", "Hardware", "Product"];
const SKILL_CHIPS = ["React", "Next.js", "Python", "Go", "TypeScript", "Java", "Flutter", "Docker", "Kubernetes", "FastAPI"];

// ─────────────────────────────────────────────────────────────
//  MESSAGES (preserved from original Messages.jsx)
// ─────────────────────────────────────────────────────────────
const INITIAL_THREADS = [
  {
    id: "t1", participantName: "Priya Nair", participantUsername: "priya_builds",
    avatarSeed: "priya_builds", college: "KIIT Bhubaneswar", connectedThrough: "Project Collaborator",
    lastMessage: "Yeah, let me know if the Supabase realtime approach works for you!", lastTime: "11m ago",
    messages: [
      { id: "m1", from: "priya_builds", text: "Hey! Saw your Razorpay webhook question on the board.", time: "9:41 AM" },
      { id: "m2", from: "me", text: "Yeah, been stuck on it for two days now 😅", time: "9:42 AM" },
      { id: "m3", from: "priya_builds", text: "The issue is probably the body parsing — Next.js App Router reads the stream once. You need to call req.text() before any middleware touches it.", time: "9:44 AM" },
      { id: "m4", from: "me", text: "Oh wait, I think that's exactly it. Let me try.", time: "9:45 AM" },
      { id: "m5", from: "priya_builds", text: "Yeah, let me know if the Supabase realtime approach works for you!", time: "9:50 AM" },
    ],
  },
  {
    id: "t2", participantName: "Karan Mehta", participantUsername: "karan_hacks",
    avatarSeed: "karan_hacks", college: "UPES Dehradun", connectedThrough: "Hackathon Teammate",
    lastMessage: "We're doing standups at 9pm IST, works?", lastTime: "2h ago",
    messages: [
      { id: "m1", from: "karan_hacks", text: "Saw you're interested in the SIH agriculture team!", time: "7:15 PM" },
      { id: "m2", from: "me", text: "Yes! ML + drone imagery is right up my alley. What's the dataset size?", time: "7:18 PM" },
      { id: "m3", from: "karan_hacks", text: "Around 8k labelled images. We have AWS Educate credits too.", time: "7:20 PM" },
      { id: "m4", from: "karan_hacks", text: "We're doing standups at 9pm IST, works?", time: "7:22 PM" },
    ],
  },
  {
    id: "t3", participantName: "Divya Krishnan", participantUsername: "divya_fs",
    avatarSeed: "divya_fs", college: "VIT Vellore", connectedThrough: "Open-Source Collaborator",
    lastMessage: "Cloudinary free tier is more than enough for campus scale 👍", lastTime: "Yesterday",
    messages: [
      { id: "m1", from: "divya_fs", text: "Loved your build log for the lost & found app!", time: "Yesterday" },
      { id: "m2", from: "me", text: "Thanks! How did you handle image upload costs?", time: "Yesterday" },
      { id: "m3", from: "divya_fs", text: "Cloudinary free tier is more than enough for campus scale 👍", time: "Yesterday" },
    ],
  },
  {
    id: "t4", participantName: "Sneha Reddy", participantUsername: "sneha_404",
    avatarSeed: "sneha_404", college: "Chandigarh University", connectedThrough: "Code Reviewer",
    lastMessage: "useRef flag is the cleanest solution tbh", lastTime: "3d ago",
    messages: [
      { id: "m1", from: "sneha_404", text: "For the useEffect double-fire — just use a ref flag.", time: "3d ago" },
      { id: "m2", from: "me", text: "Like `const ran = useRef(false)` at the top?", time: "3d ago" },
      { id: "m3", from: "sneha_404", text: "Exactly. Check the flag before running the POST, then set it to true.", time: "3d ago" },
      { id: "m4", from: "me", text: "Clean. Thanks!", time: "3d ago" },
      { id: "m5", from: "sneha_404", text: "useRef flag is the cleanest solution tbh", time: "3d ago" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  MATCHING ENGINE  (pure functions, no UI coupling)
// ─────────────────────────────────────────────────────────────
const MY_SKILLS = ["React", "Next.js", "Python", "TypeScript", "Node.js"];
const MY_INTENTS_DEFAULT = [];

function computeMatchScore(myIntents, mySkills, builder) {
  let score = 0;
  // Shared intent (+3 each)
  myIntents.forEach((intent) => {
    if (builder.lookingFor.includes(intent)) score += 3;
  });
  // Shared skills (+2 each, max 6)
  const sharedSkills = mySkills.filter((s) =>
    builder.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
  );
  score += Math.min(sharedSkills.length * 2, 6);
  // Activity bonus
  if (builder.activityStatus === "active-today") score += 2;
  if (builder.activityStatus === "active-this-week") score += 1;
  // Shared goals (+1 each)
  builder.goals.forEach((g) => {
    if (["ship-side-project", "contribute-to-oss"].includes(g)) score += 1;
  });
  return score;
}

function getMatchLabel(score) {
  if (score >= 10) return "STRONG MATCH";
  if (score >= 6) return "GOOD FIT";
  return "RELEVANT BUILDER";
}

function getMatchLabelColor(score) {
  if (score >= 10) return "var(--cat-green)";
  if (score >= 6) return "var(--accent)";
  return "#6B6B6B";
}

function getMatchReasons(myIntents, mySkills, builder) {
  const reasons = [];
  const sharedSkills = mySkills.filter((s) =>
    builder.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
  );
  if (sharedSkills.length > 0)
    reasons.push(`Both work with ${sharedSkills.slice(0, 2).join(" & ")}`);
  myIntents.forEach((intent) => {
    if (builder.lookingFor.includes(intent)) {
      const label = INTENTS.find((i) => i.id === intent)?.label ?? intent;
      reasons.push(`Both looking for ${label.toLowerCase()}`);
    }
  });
  if (builder.activityStatus === "active-today") reasons.push("Active today");
  if (builder.githubStats.helpfulAnswers > 10) reasons.push(`${builder.githubStats.helpfulAnswers} helpful answers on Board`);
  return reasons.slice(0, 4);
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function Avatar({ seed, name, size = "sm" }) {
  const dim = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-7 h-7";
  const text = size === "lg" ? "text-[10px]" : "text-[8px]";
  return (
    <div className={`${dim} rounded-full overflow-hidden border-2 border-cy-ink bg-cy-ink flex items-center justify-center shrink-0`} aria-hidden="true">
      <img src={`/avatars/avatar_09.jpg`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
      <span className={`font-mono ${text} font-bold text-white absolute`}>{getInitials(name)}</span>
    </div>
  );
}

function IntentBadge({ label }) {
  return (
    <span className="font-mono text-[8px] font-bold tracking-[0.1em] uppercase border border-cy-ink px-2 py-0.5 text-cy-ink">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  BuilderCard
// ─────────────────────────────────────────────────────────────
function BuilderCard({ builder, myIntents, mySkills, onMessage, compact = false }) {
  const score = computeMatchScore(myIntents, mySkills, builder);
  const label = getMatchLabel(score);
  const color = getMatchLabelColor(score);
  const reasons = getMatchReasons(myIntents, mySkills, builder);

  return (
    <article className="border-2 border-cy-ink bg-cy-bg shadow-[4px_4px_0px_0px_var(--shadow)] flex flex-col hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_var(--shadow)] transition-all duration-150">
      {/* Match label */}
      {!compact && (myIntents.length > 0 || mySkills.length > 0) && (
        <div className="border-b-2 border-cy-ink px-4 py-2 flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color }}>
            ● {label}
          </span>
        </div>
      )}

      <div className="px-5 py-4 flex items-start gap-4">
        <Avatar seed={builder.avatarSeed} name={builder.name} size="md" />
        <div className="flex-1 min-w-0">
          {/* Identity */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-sans font-bold text-[15px] text-cy-ink">{builder.name}</h3>
              <p className="font-mono text-[10px] text-cy-muted">{builder.college} · Year {builder.year}</p>
            </div>
            <span className={`font-mono text-[8px] font-bold tracking-[0.1em] uppercase border px-2 py-1 shrink-0 ${builder.activityStatus === "active-today" ? "border-[var(--cat-green)] text-[var(--cat-green)]" : "border-cy-muted text-cy-muted"}`}>
              {builder.activityStatus === "active-today" ? "ACTIVE TODAY" : "ACTIVE THIS WEEK"}
            </span>
          </div>

          {/* Building */}
          <div className="mt-3">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-orange font-bold">BUILDING</p>
            <p className="font-sans text-[13px] text-cy-ink mt-0.5">{builder.currentlyBuilding}</p>
          </div>

          {/* Looking for */}
          <div className="mt-2">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted font-bold">LOOKING FOR</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {builder.lookingFor.map((lf) => (
                <IntentBadge key={lf} label={INTENTS.find((i) => i.id === lf)?.label ?? lf} />
              ))}
            </div>
          </div>

          {/* Skills */}
          {!compact && (
            <div className="mt-2">
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted font-bold">SKILLS</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {builder.skills.slice(0, 5).map((s) => {
                  const matched = mySkills.map((x) => x.toLowerCase()).includes(s.toLowerCase());
                  return (
                    <span key={s} className={`font-mono text-[9px] border px-2 py-0.5 transition-colors ${matched ? "border-cy-orange text-cy-orange bg-cy-orange/5 font-bold" : "border-cy-ink text-cy-ink"}`}>
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Proof */}
          {!compact && (
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <span className="font-mono text-[9px] text-cy-muted">{builder.githubStats.commitsThisMonth} commits/mo</span>
              <span className="font-mono text-[9px] text-cy-muted">{builder.githubStats.buildLogs} builds shipped</span>
              <span className="font-mono text-[9px] text-cy-muted">{builder.githubStats.helpfulAnswers} helpful answers</span>
              {builder.githubStats.streak > 0 && (
                <span className="font-mono text-[9px] text-cy-orange">{builder.githubStats.streak}d streak</span>
              )}
            </div>
          )}

          {/* Match reasons */}
          {!compact && reasons.length > 0 && (myIntents.length > 0 || mySkills.length > 0) && (
            <div className="mt-3 border-t border-cy-ink/20 pt-3">
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted font-bold mb-1.5">MATCHED BECAUSE</p>
              <ul className="flex flex-col gap-0.5">
                {reasons.map((r, i) => (
                  <li key={i} className="font-sans text-[12px] text-cy-muted flex items-start gap-1.5">
                    <span className="text-[var(--cat-green)] font-bold shrink-0">✓</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t-2 border-cy-ink px-5 py-3 flex items-center gap-3">
        <Link
          to={`/u/${builder.username}`}
          className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all shadow-[2px_2px_0px_0px_var(--shadow)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
        >
          VIEW PROFILE
        </Link>
        <button
          onClick={() => onMessage(builder)}
          className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all shadow-[2px_2px_0px_0px_var(--accent)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
        >
          MESSAGE
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
//  Message Composer (contextual inline panel)
// ─────────────────────────────────────────────────────────────
function MessageComposer({ builder, myIntents, mySkills, onClose, onSend }) {
  const sharedSkills = mySkills.filter((s) =>
    builder.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
  );
  const primaryIntent = myIntents.find((i) => builder.lookingFor.includes(i));
  const intentLabel = INTENTS.find((i) => i.id === primaryIntent)?.label?.toLowerCase() ?? "build together";

  const suggested = sharedSkills.length > 0
    ? `Hey ${builder.name.split(" ")[0]} — saw you're looking for ${intentLabel}. I'm also working with ${sharedSkills.slice(0, 2).join(" & ")}. Want to connect and ${primaryIntent === "accountability-partner" ? "keep each other on track" : "collaborate"}?`
    : `Hey ${builder.name.split(" ")[0]} — saw your profile on CrewYard. I'm working on something similar and would love to connect.`;

  const [draft, setDraft] = useState(suggested);
  const [sent, setSent] = useState(false);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSent(true);
    setTimeout(() => { onSend(builder, draft); onClose(); }, 900);
  }

  return (
    <div className="border-2 border-cy-ink bg-cy-bg shadow-[6px_6px_0px_0px_var(--shadow)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">
          {sent ? "MESSAGE SENT ✓" : `START A CONVERSATION WITH ${builder.name.split(" ")[0].toUpperCase()}`}
        </h3>
        {!sent && (
          <button onClick={onClose} className="font-mono text-[11px] text-cy-muted hover:text-cy-orange transition-colors border-2 border-transparent hover:border-cy-orange px-2 py-1">✕</button>
        )}
      </div>

      {!sent ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono text-[9px] text-cy-muted tracking-[0.06em]">You found {builder.name.split(" ")[0]} through:</p>
            {myIntents.slice(0, 2).map((i) => (
              <IntentBadge key={i} label={INTENTS.find((x) => x.id === i)?.label ?? i} />
            ))}
            {sharedSkills.slice(0, 2).map((s) => (
              <IntentBadge key={s} label={s} />
            ))}
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full font-sans text-[13px] text-cy-ink bg-cy-bg border-2 border-cy-ink px-3 py-2.5 resize-none focus:outline-none focus:border-cy-orange transition-colors leading-relaxed"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-2.5 border-2 border-cy-ink bg-cy-ink text-[var(--bg)] hover:bg-transparent hover:text-cy-ink transition-all">
                SEND MESSAGE →
              </button>
              <button type="button" onClick={onClose} className="font-mono text-[10px] tracking-[0.1em] uppercase px-4 py-2.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
                CANCEL
              </button>
            </div>
          </form>
        </>
      ) : (
        <p className="font-sans text-sm text-cy-muted">Your message has been sent. It'll appear in your MESSAGES tab.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FIND CREW tab
// ─────────────────────────────────────────────────────────────
function FindCrew({ onMessage }) {
  const [selectedIntents, setSelectedIntents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [accountGoal, setAccountGoal] = useState(null);
  const [acctCadence, setAcctCadence] = useState(null);
  const [hackEvent, setHackEvent] = useState(null);
  const [hackRoles, setHackRoles] = useState([]);
  const [hackSkills, setHackSkills] = useState([]);
  const [composerTarget, setComposerTarget] = useState(null);

  const wantsAccountability = selectedIntents.includes("accountability-partner");
  const wantsHackathon = selectedIntents.includes("hackathon-teammate");

  function toggleIntent(id) {
    setSelectedIntents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }
  function toggleSkillFilter(s) {
    setSkillFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  // Filtered + ranked builders
  const rankedBuilders = useMemo(() => {
    let list = CREW_BUILDERS.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.college.toLowerCase().includes(q) ||
        b.skills.some((s) => s.toLowerCase().includes(q)) ||
        b.technologies.some((t) => t.toLowerCase().includes(q)) ||
        b.currentlyBuilding.toLowerCase().includes(q) ||
        b.lookingFor.some((lf) => lf.includes(q));

      const matchesIntent = selectedIntents.length === 0 ||
        selectedIntents.some((i) => b.lookingFor.includes(i));

      const matchesSkill = skillFilter.length === 0 ||
        skillFilter.some((s) => b.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()));

      const matchesCollege = !collegeFilter ||
        b.college.toLowerCase().includes(collegeFilter.toLowerCase());

      return matchesSearch && matchesIntent && matchesSkill && matchesCollege;
    });

    return list
      .map((b) => ({ ...b, _score: computeMatchScore(selectedIntents, MY_SKILLS, b) }))
      .sort((a, b) => b._score - a._score);
  }, [searchQuery, selectedIntents, skillFilter, collegeFilter]);

  const showDefaultState = !searchQuery && selectedIntents.length === 0 && skillFilter.length === 0;

  function handleMessage(builder) {
    setComposerTarget(builder);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Composer panel (appears at top when active) */}
      {composerTarget && (
        <MessageComposer
          builder={composerTarget}
          myIntents={selectedIntents}
          mySkills={MY_SKILLS}
          onClose={() => setComposerTarget(null)}
          onSend={(builder, text) => {
            console.log("Message to", builder.name, ":", text);
            setComposerTarget(null);
          }}
        />
      )}

      {/* Intent selector */}
      <section>
        <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink mb-3">
          WHO ARE YOU LOOKING FOR?
        </h2>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map(({ id, label }) => {
            const isActive = selectedIntents.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleIntent(id)}
                aria-pressed={isActive}
                className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 transition-all duration-150"
                style={isActive
                  ? { backgroundColor: "var(--accent)18", borderColor: "var(--accent)", color: "var(--accent)" }
                  : { backgroundColor: "transparent", borderColor: "var(--text)", color: "var(--text)" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Accountability mode expansion */}
      {wantsAccountability && (
        <section className="border-2 border-cy-orange/40 bg-cy-orange/5 p-4 flex flex-col gap-4">
          <p className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-cy-orange">
            ACCOUNTABILITY PARTNER — SET YOUR GOAL
          </p>
          <div>
            <p className="font-mono text-[9px] text-cy-muted uppercase tracking-[0.08em] mb-2">MY GOAL</p>
            <div className="flex flex-wrap gap-2">
              {ACCOUNTABILITY_GOALS.map((g) => (
                <button key={g.id} onClick={() => setAccountGoal(accountGoal === g.id ? null : g.id)}
                  className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all"
                  style={accountGoal === g.id ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" } : { borderColor: "var(--text)", color: "var(--text)" }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] text-cy-muted uppercase tracking-[0.08em] mb-2">CADENCE</p>
            <div className="flex gap-2">
              {["DAILY", "3× WEEK", "WEEKLY"].map((c) => (
                <button key={c} onClick={() => setAcctCadence(acctCadence === c ? null : c)}
                  className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-1.5 border-2 transition-all"
                  style={acctCadence === c ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" } : { borderColor: "var(--text)", color: "var(--text)" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hackathon mode expansion */}
      {wantsHackathon && (
        <section className="border-2 border-[var(--cat-blue)]/40 bg-[var(--cat-blue)]/5 p-4 flex flex-col gap-4">
          <p className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--cat-blue)]">
            HACKATHON TEAMMATE — TELL US WHAT YOU NEED
          </p>
          <div>
            <p className="font-mono text-[9px] text-cy-muted uppercase tracking-[0.08em] mb-2">EVENT</p>
            <div className="flex flex-wrap gap-2">
              {HACKATHON_EVENTS.map((e) => (
                <button key={e} onClick={() => setHackEvent(hackEvent === e ? null : e)}
                  className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all"
                  style={hackEvent === e ? { backgroundColor: "var(--cat-blue)", borderColor: "var(--cat-blue)", color: "var(--bg)" } : { borderColor: "var(--cat-blue)", color: "var(--cat-blue)" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] text-cy-muted uppercase tracking-[0.08em] mb-2">ROLE NEEDED</p>
            <div className="flex flex-wrap gap-2">
              {HACKATHON_ROLES.map((r) => (
                <button key={r} onClick={() => setHackRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])}
                  className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all"
                  style={hackRoles.includes(r) ? { backgroundColor: "var(--cat-blue)", borderColor: "var(--cat-blue)", color: "var(--bg)" } : { borderColor: "var(--cat-blue)", color: "var(--cat-blue)" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] text-cy-muted uppercase tracking-[0.08em] mb-2">TECH STACK</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_CHIPS.map((s) => (
                <button key={s} onClick={() => setHackSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                  className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 border-2 transition-all"
                  style={hackSkills.includes(s) ? { backgroundColor: "var(--cat-blue)", borderColor: "var(--cat-blue)", color: "var(--bg)" } : { borderColor: "var(--cat-blue)", color: "var(--cat-blue)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search + Filters */}
      <section>
        <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink mb-2">
          FIND A BUILDER
        </h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Try React, college, project, GitHub, hackathon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 font-sans text-sm text-cy-ink bg-cy-bg border-2 border-cy-ink px-4 py-2.5 focus:outline-none focus:border-cy-orange transition-colors placeholder:text-cy-muted"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2.5 border-2 border-cy-ink transition-all"
            style={showFilters ? { backgroundColor: "var(--text)", color: "var(--bg)" } : { backgroundColor: "transparent", color: "var(--text)" }}
          >
            FILTERS {showFilters ? "↑" : "↓"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 border-2 border-cy-ink p-4 flex flex-col gap-4 shadow-[3px_3px_0px_0px_var(--shadow)]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-2">SKILL</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CHIPS.map((s) => (
                  <button key={s} onClick={() => toggleSkillFilter(s)}
                    className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-1 border transition-all"
                    style={skillFilter.includes(s) ? { backgroundColor: "var(--text)", borderColor: "var(--text)", color: "var(--bg)" } : { borderColor: "var(--text)", color: "var(--text)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1">COLLEGE</p>
              <input
                type="text"
                placeholder="VIT, BITS, NIT..."
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                className="font-sans text-sm bg-cy-bg border-2 border-cy-ink px-3 py-2 w-full focus:outline-none focus:border-cy-orange transition-colors"
              />
            </div>
            {(skillFilter.length > 0 || collegeFilter) && (
              <button onClick={() => { setSkillFilter([]); setCollegeFilter(""); }} className="self-start font-mono text-[9px] tracking-[0.08em] uppercase text-cy-orange hover:underline">
                CLEAR FILTERS
              </button>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      {showDefaultState ? (
        <>
          {/* Active this week */}
          <section>
            <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink mb-3">
              BUILDERS ACTIVE THIS WEEK
            </h2>
            <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[3px_3px_0px_0px_var(--shadow)]">
              {CREW_BUILDERS.filter(b => b.activityStatus === "active-today").map((b, i, arr) => (
                <div key={b.id} className={`flex items-start gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}>
                  <Avatar seed={b.avatarSeed} name={b.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-[13px] text-cy-ink">{b.name}</p>
                    <p className="font-mono text-[10px] text-cy-muted">{b.college}</p>
                    <p className="font-sans text-[12px] text-cy-muted mt-0.5">Shipping: {b.currentlyBuilding}</p>
                  </div>
                  <button onClick={() => handleMessage(b)} className="shrink-0 font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all">
                    MESSAGE
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* People you might build with */}
          <section>
            <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink mb-1">
              PEOPLE YOU MIGHT BUILD WITH
            </h2>
            <p className="font-sans text-sm text-cy-muted mb-3">Based on your profile and skills.</p>
            <div className="flex flex-col gap-5">
              {CREW_BUILDERS.slice(0, 3).map((b) => (
                <BuilderCard key={b.id} builder={b} myIntents={[]} mySkills={MY_SKILLS} onMessage={handleMessage} />
              ))}
            </div>
          </section>
        </>
      ) : rankedBuilders.length === 0 ? (
        <div className="border-2 border-dashed border-cy-ink/30 p-10 text-center flex flex-col gap-4 items-center">
          <p className="font-display font-bold text-lg text-cy-ink">No strong matches yet.</p>
          <p className="font-sans text-sm text-cy-muted">Try widening your search or clearing some filters.</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {selectedIntents.length > 0 && <button onClick={() => setSelectedIntents([])} className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">CLEAR INTENTS</button>}
            {searchQuery && <button onClick={() => setSearchQuery("")} className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">CLEAR SEARCH</button>}
            <button onClick={() => { setSearchQuery(""); setSelectedIntents([]); setSkillFilter([]); setCollegeFilter(""); }} className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all">BROADEN SEARCH</button>
          </div>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">
              BUILDER MATCHES
            </h2>
            <span className="font-mono text-[9px] text-cy-muted">{rankedBuilders.length} found</span>
          </div>
          <div className="flex flex-col gap-5">
            {rankedBuilders.map((b) => (
              <BuilderCard key={b.id} builder={b} myIntents={selectedIntents} mySkills={MY_SKILLS} onMessage={handleMessage} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MESSAGES tab (full preserved Messages experience)
// ─────────────────────────────────────────────────────────────
function CrewMessages() {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeId, setActiveId] = useState(INITIAL_THREADS[0].id);
  const [draft, setDraft] = useState("");
  const { profile } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, threads]);

  const activeThread = threads.find((t) => t.id === activeId);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setThreads((prev) => prev.map((t) => t.id !== activeId ? t : {
      ...t, lastMessage: text, lastTime: "Just now",
      messages: [...t.messages, { id: `m${Date.now()}`, from: "me", text, time: timeStr }],
    }));
    setDraft("");
  }

  return (
    <div className="flex border-2 border-cy-ink overflow-hidden" style={{ height: "calc(100vh - 14rem)" }}>
      {/* Thread list */}
      <nav className="w-64 shrink-0 border-r-2 border-cy-ink flex flex-col overflow-y-auto bg-cy-bg" aria-label="Conversations">
        <p className="px-4 py-2.5 font-mono text-[9px] tracking-[0.16em] uppercase text-cy-muted border-b border-cy-ink">
          CONVERSATIONS
        </p>
        <ul role="list">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                onClick={() => setActiveId(thread.id)}
                aria-pressed={thread.id === activeId}
                className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-cy-ink/30 transition-colors hover:bg-cy-ink/5"
                style={{ backgroundColor: thread.id === activeId ? "var(--surface-2)" : "transparent" }}
              >
                <Avatar seed={thread.avatarSeed} name={thread.participantName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-sans font-semibold text-sm text-cy-ink truncate">{thread.participantName}</span>
                    <span className="font-mono text-[9px] text-cy-muted shrink-0">{thread.lastTime}</span>
                  </div>
                  <p className="font-sans text-xs text-cy-muted truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Chat area */}
      {activeThread ? (
        <div className="flex flex-col flex-1 min-w-0 bg-cy-bg">
          <header className="px-5 py-3 border-b-2 border-cy-ink flex items-center gap-3 shrink-0">
            <Avatar seed={activeThread.avatarSeed} name={activeThread.participantName} size="md" />
            <div>
              <p className="font-sans font-bold text-[14px] text-cy-ink">{activeThread.participantName}</p>
              <div className="flex items-center gap-2 font-mono text-[10px] text-cy-muted">
                <span>{activeThread.college}</span>
                {activeThread.connectedThrough && (
                  <>
                    <span>·</span>
                    <span>Connected through: <span className="font-bold">{activeThread.connectedThrough}</span></span>
                  </>
                )}
              </div>
            </div>
            <Link to={`/u/${activeThread.participantUsername}`} className="ml-auto font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all">
              VIEW PROFILE
            </Link>
          </header>

          <section className="flex-1 overflow-y-auto px-5 py-5" aria-label="Message history">
            <ul className="flex flex-col gap-3">
              {activeThread.messages.map((msg) => {
                const isMe = msg.from === "me";
                return (
                  <li key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-sm font-sans text-sm px-4 py-2.5 ${isMe ? "bg-cy-ink text-[var(--bg)]" : "bg-cy-bg border-2 border-cy-ink text-cy-ink"}`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className={`font-mono text-[9px] mt-1.5 ${isMe ? "text-white/60" : "text-cy-muted"}`}>{msg.time}</p>
                    </div>
                  </li>
                );
              })}
              <li ref={messagesEndRef} aria-hidden="true" />
            </ul>
          </section>

          <form onSubmit={handleSend} className="border-t-2 border-cy-ink px-4 py-3 flex items-center gap-3 shrink-0 bg-cy-bg" aria-label="Send a message">
            <input
              id="crew-message-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${activeThread.participantName}…`}
              className="flex-1 bg-cy-bg font-sans text-sm text-cy-ink px-4 py-2.5 border-2 border-cy-ink focus:outline-none focus:border-cy-orange transition-colors"
            />
            <button type="submit" disabled={!draft.trim()} className="btn-primary flex items-center gap-2 font-mono text-xs tracking-[0.08em] uppercase disabled:opacity-40 px-4 py-2.5">
              SEND <Send size={12} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-xs text-cy-muted tracking-[0.06em]">Select a conversation to start messaging.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MY CREW tab
// ─────────────────────────────────────────────────────────────
function MyCrew({ onMessage }) {
  const myCrew = INITIAL_MY_CREW.map((entry) => ({
    ...entry,
    builder: CREW_BUILDERS.find((b) => b.id === entry.builderId),
  })).filter((e) => e.builder);

  if (myCrew.length === 0) {
    return (
      <div className="border-2 border-dashed border-cy-ink/30 p-12 text-center flex flex-col gap-4 items-center">
        <p className="font-display font-bold text-xl text-cy-ink">Your crew is empty.</p>
        <p className="font-sans text-sm text-cy-muted">Find builders worth building with in FIND CREW.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-cy-ink">
        MY CREW · {myCrew.length}
      </h2>
      <div className="flex flex-col gap-0 border-2 border-cy-ink shadow-[4px_4px_0px_0px_var(--shadow)]">
        {myCrew.map((entry, i) => {
          const b = entry.builder;
          return (
            <div key={entry.builderId} className={`flex items-start gap-4 px-5 py-4 ${i < myCrew.length - 1 ? "border-b border-cy-ink" : ""} hover:bg-cy-ink/[0.03] transition-colors`}>
              <Avatar seed={b.avatarSeed} name={b.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-bold text-[14px] text-cy-ink">{b.name}</p>
                <p className="font-mono text-[10px] text-cy-muted">{b.college}</p>
                <p className="font-mono text-[10px] text-cy-orange mt-0.5">{entry.context}</p>
                <p className="font-sans text-[12px] text-cy-muted mt-1">Building: {b.currentlyBuilding}</p>
                <p className="font-mono text-[9px] text-cy-muted/70 mt-0.5">{entry.lastActive}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => onMessage(b)} className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-orange text-cy-orange hover:bg-cy-orange hover:text-white transition-all">
                  MESSAGE
                </button>
                <Link to={`/u/${b.username}`} className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 border-2 border-cy-ink text-cy-ink hover:bg-cy-ink hover:text-[var(--bg)] transition-all text-center">
                  PROFILE
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CREW Page
// ─────────────────────────────────────────────────────────────
const CREW_TABS = ["FIND CREW", "MESSAGES", "MY CREW"];

export default function Crew() {
  const [activeTab, setActiveTab] = useState("FIND CREW");

  function handleMessageFromMyCrew(builder) {
    setActiveTab("FIND CREW"); // composer will appear in Find Crew
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <header className="pb-5">
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">Crew</h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          Find people worth building with.
        </p>
        <p className="font-sans text-sm text-cy-muted mt-0.5">
          Hackathon teammate, accountability partner, collaborator, code reviewer — find builders who fit what you're trying to do.
        </p>
      </header>

      {/* Tabs */}
      <div className="border-b-2 border-cy-ink bg-cy-bg mb-6">
        <nav className="flex items-center gap-0" role="tablist">
          {CREW_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-5 py-3 border-b-2 transition-all duration-150"
                style={isActive
                  ? { borderBottomColor: "var(--accent)", color: "var(--accent)" }
                  : { borderBottomColor: "transparent", color: "#6B6B6B" }
                }
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="transition-all duration-200 ease-out">
        {activeTab === "FIND CREW" && <FindCrew onMessage={(b) => { /* composer handled inside */ }} />}
        {activeTab === "MESSAGES" && <CrewMessages />}
        {activeTab === "MY CREW" && <MyCrew onMessage={handleMessageFromMyCrew} />}
      </div>
    </div>
  );
}
