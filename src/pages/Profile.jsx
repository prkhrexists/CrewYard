import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ArrowRight,
  ChevronLeft,
  Edit2,
  X,
  Plus,
  MapPin,
  ExternalLink,
  Trash2,
  Save,
  Check
} from "lucide-react";
import { getUserByUsername, getAsks } from "../data/db";
import { useAuth } from "../context/AuthContext";
import { useCat } from "../context/CatContext";
import { formatRelativeTime, formatMonthYear } from "../utils/time";

// ─────────────────────────────────────────────────────────────
//  Helpers & Constants
// ─────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  help:      "var(--accent)",
  teammate:  "var(--cat-blue)",
  build_log: "var(--cat-green)",
};

const TYPE_VERB = {
  help:      "ASKED",
  teammate:  "ASKED",
  build_log: "BUILT", // Updated as requested for logs
};

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─────────────────────────────────────────────────────────────
//  Inline Icons
// ─────────────────────────────────────────────────────────────

function GithubIcon({ size = 13, className = "" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" width={size} height={size} className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  Reusable Editing Primitives
// ─────────────────────────────────────────────────────────────

function EditableSection({ isOwner, onEdit, children, label = "EDIT", className = "" }) {
  if (!isOwner) return <div className={className}>{children}</div>;
  
  return (
    <div className={`relative group transition-all duration-200 hover:-translate-y-[2px] ${className}`}>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--text)] group-hover:shadow-[4px_4px_0px_0px_var(--shadow)] pointer-events-none transition-all z-0" style={{ margin: "-8px", padding: "8px" }} />
      <div className="relative z-10">{children}</div>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
        className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg)] border-2 border-[var(--text)] px-2 py-1 flex items-center gap-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[var(--text)] shadow-[2px_2px_0px_0px_var(--shadow)] z-20 hover:bg-[var(--text)] hover:text-[var(--bg)]"
      >
        <Edit2 size={10} /> {label}
      </button>
    </div>
  );
}

function CrewModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--bg)] border-2 border-[var(--text)] shadow-[8px_8px_0px_0px_var(--shadow)] w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--text)] bg-[var(--surface-2)]">
          <h3 className="font-mono text-xs font-bold tracking-[0.1em] text-[var(--text)] uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:text-[var(--accent)] transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Profile V2 Page
// ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();
  const isOwner = currentUser?.username === username;

  // Local state for the profile we are viewing (syncs from DB + localStorage on mount)
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [allAsks, setAllAsks] = useState([]);
  const [asksLoading, setAsksLoading] = useState(true);

  // Filter state
  const [activityFilter, setActivityFilter] = useState("ALL"); // ALL, BUILDS, ASKS, ANSWERS

  // Modals state
  const [editModal, setEditModal] = useState(null); // 'bio', 'building', 'lookingFor', 'skills', 'availability', 'identity', 'reputation'
  
  // Temporary edit states
  const [editData, setEditData] = useState({});

  const { setContext } = useCat();
  useEffect(() => {
    setContext({ page: 'profile' });
  }, [setContext]);

  // ── Fetch user ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setUserLoading(true);
    
    // First, try to get from local storage if this is the owner (to persist demo edits)
    const localOverride = localStorage.getItem(`crewyard_profile_${username}`);
    
    getUserByUsername(username).then((dbUser) => {
      if (cancelled) return;
      if (dbUser) {
        if (localOverride) {
          // Merge local edits onto DB user
          setUser({ ...dbUser, ...JSON.parse(localOverride) });
        } else {
          setUser(dbUser);
        }
      } else {
        setUser(null);
      }
      setUserLoading(false);
    });
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAsksLoading(true);
    getAsks().then((asks) => {
      if (!cancelled) { setAllAsks(asks); setAsksLoading(false); }
    });
    return () => { cancelled = true; };
  }, [user]);

  // Save changes locally
  const saveEdits = (partialUpdate) => {
    const updatedUser = { ...user, ...partialUpdate };
    setUser(updatedUser);
    if (isOwner) {
      localStorage.setItem(`crewyard_profile_${username}`, JSON.stringify(updatedUser));
    }
    setEditModal(null);
  };

  // ── Derived Activity ──────────────────────────────────────
  const userActivity = useMemo(() => {
    if (!user) return [];
    let acts = allAsks.filter((a) => a.authorId === user.id);
    
    if (activityFilter === "BUILDS") acts = acts.filter(a => a.type === "build_log");
    if (activityFilter === "ASKS") acts = acts.filter(a => a.type === "help" || a.type === "teammate");
    
    return acts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allAsks, user, activityFilter]);

  if (userLoading) {
    return <p className="font-mono text-xs text-cy-muted tracking-[0.08em]">Loading profile…</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3 max-w-sm">
        <p className="font-display font-bold text-xl text-[var(--text)]">User not found.</p>
        <Link to="/board" className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--text)] hover:text-[var(--accent)] transition-colors w-fit mt-2">
          <ChevronLeft size={12} strokeWidth={2.5} /> Back to Board
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <Link to="/board" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-cy-muted hover:text-[var(--text)] transition-colors mb-8">
        <ChevronLeft size={12} strokeWidth={2.5} /> Back to Board
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
        
        {/* ══════════════════════════════════════════════════
            LEFT — Builder Identity Card
        ══════════════════════════════════════════════════ */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-20" aria-label="Builder Identity">
          
          <EditableSection isOwner={isOwner} onEdit={() => { setEditData({ name: user.name, college: user.college, year: user.year, major: user.major }); setEditModal('identity'); }}>
            {/* Avatar & Header */}
            <div className="flex flex-col gap-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--text)] bg-[var(--text)] flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-black text-3xl text-[var(--bg)]">{getInitials(user.name)}</span>
                )}
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); /* would open avatar picker */ }} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-[10px] uppercase tracking-wider font-bold">
                    Change
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <h1 className="font-display font-black text-3xl text-[var(--text)] leading-tight">{user.name}</h1>
                <p className="font-mono text-[12px] text-cy-muted">@{user.username}</p>
                <div className="mt-2 text-sm text-[var(--text)] leading-snug cursor-pointer hover:underline" onClick={() => navigate('/campuspods')}>
                  {user.college}
                </div>
                <p className="font-mono text-[11px] text-cy-muted tracking-[0.04em] mt-1">
                  {user.year}{user.year == 1 ? "st" : user.year == 2 ? "nd" : user.year == 3 ? "rd" : "th"} Year · {user.major}
                </p>
              </div>
            </div>
          </EditableSection>

          {/* Verification Badge */}
          {user.githubVerified && (
            <div className="inline-flex items-center gap-2 border-2 border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 w-fit cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors">
              <Check size={14} strokeWidth={3} />
              <span className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase">College Verified</span>
            </div>
          )}

          <div className="border-t border-[var(--text)] opacity-20" />

          {/* Bio */}
          <EditableSection isOwner={isOwner} onEdit={() => { setEditData({ bio: user.bio }); setEditModal('bio'); }}>
            <div>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.14em] text-cy-muted uppercase mb-2">What I'm Building</h3>
              <p className="font-sans text-sm text-[var(--text)] leading-relaxed">
                {user.bio || (isOwner ? <span className="text-cy-muted italic text-xs">Add a short bio about your current focus...</span> : "—")}
              </p>
            </div>
          </EditableSection>

          {/* Availability */}
          <EditableSection isOwner={isOwner} onEdit={() => { setEditData({ availability: user.availability }); setEditModal('availability'); }}>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-mono text-[10px] font-bold tracking-[0.14em] text-cy-muted uppercase">Availability</h3>
              <div className={`font-mono text-[10px] font-bold tracking-[0.1em] uppercase border-2 px-3 py-1.5 w-fit
                ${user.availability === 'OPEN TO BUILD' ? 'border-[var(--cat-green)] text-[var(--cat-green)] bg-[var(--cat-green)]/10' : 
                  user.availability === 'LOOKING FOR A TEAM' ? 'border-[var(--cat-blue)] text-[var(--cat-blue)] bg-[var(--cat-blue)]/10' :
                  'border-[var(--text)] text-[var(--text)] bg-[var(--surface-2)]'}`}
              >
                [{user.availability || 'BUSY'}]
              </div>
            </div>
          </EditableSection>

          {/* Reputation */}
          <div className="group cursor-pointer" onClick={() => setEditModal('reputation')}>
            <h3 className="font-mono text-[10px] font-bold tracking-[0.14em] text-cy-muted uppercase mb-1 flex items-center gap-2">
              Reputation <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:translate-x-1" />
            </h3>
            <p className="font-display font-black text-4xl text-[var(--accent)] group-hover:text-[var(--text)] transition-colors leading-none tracking-tight">
              {user.reputation.toLocaleString()}
            </p>
            <p className="font-sans text-xs text-cy-muted mt-2 leading-tight">Built from helpful answers, successful collaborations, and shipped work.</p>
          </div>

        </aside>

        {/* ══════════════════════════════════════════════════
            RIGHT — Activity & Proof of Work
        ══════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-10">
          
          {/* CURRENTLY BUILDING */}
          <EditableSection isOwner={isOwner} onEdit={() => { setEditData(user.building || { name: '', description: '', stack: [], status: 'BUILDING', repoUrl: '' }); setEditModal('building'); }}>
            <div className="flex flex-col gap-4">
              <h2 className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-[var(--text)]">Currently Building</h2>
              
              {user.building ? (
                <div className="border-2 border-[var(--text)] bg-[var(--surface-2)] p-6 shadow-[6px_6px_0px_0px_var(--shadow)] flex flex-col items-start gap-4 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_var(--shadow)] transition-all">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--bg)] bg-[var(--text)] px-2 py-1 uppercase">{user.building.status}</span>
                    <span className="font-mono text-[10px] text-cy-muted uppercase tracking-wider">{formatRelativeTime(user.building.lastUpdated)}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-display font-bold text-2xl text-[var(--text)] leading-tight">{user.building.name}</h3>
                    <p className="font-sans text-sm text-[var(--text)] leading-relaxed mt-2">{user.building.description}</p>
                  </div>

                  {user.building.stack?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.building.stack.map(tech => (
                        <span key={tech} className="font-mono text-[9px] tracking-[0.06em] text-[var(--text)] border border-[var(--text)] px-1.5 py-0.5">{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--text)] border-b-2 border-[var(--text)] uppercase hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                    View Build →
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--text)] opacity-70 p-6 flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-xs text-[var(--text)] uppercase tracking-wider font-bold">No builds yet.</span>
                  {isOwner && (
                    <button onClick={() => setEditModal('building')} className="font-mono text-[10px] tracking-[0.1em] font-bold border-2 border-[var(--text)] px-3 py-1.5 uppercase hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors mt-2">
                      + Add your first build
                    </button>
                  )}
                </div>
              )}
            </div>
          </EditableSection>

          <hr className="border-[var(--text)] opacity-10" />

          {/* PROOF OF WORK */}
          <div className="flex flex-col gap-4">
            <h2 className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-[var(--text)] flex items-center gap-2">
              Proof of Work
              {user.githubVerified ? (
                <span className="text-[var(--cat-green)] flex items-center gap-1 font-mono text-[9px] tracking-wider"><GithubIcon size={12}/> Synced</span>
              ) : (
                <span className="text-cy-muted flex items-center gap-1 font-mono text-[9px] tracking-wider"><GithubIcon size={12}/> Not Connected</span>
              )}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-[var(--text)] p-4 flex flex-col gap-1 cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted">Commits (Week)</span>
                <span className="font-mono font-bold text-2xl text-[var(--text)] mt-1">{user.commitsThisWeek}</span>
                <span className={`font-mono text-[9px] mt-1 ${user.commitsChangePercent >= 0 ? 'text-[var(--cat-green)]' : 'text-[var(--accent)]'}`}>
                  {user.commitsChangePercent >= 0 ? '↑' : '↓'} {Math.abs(user.commitsChangePercent)}% vs last week
                </span>
              </div>
              
              <div className="border border-[var(--text)] p-4 flex flex-col gap-1 cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted">Top Language</span>
                <span className="font-mono font-bold text-xl text-[var(--text)] mt-1 truncate">{user.topLanguage}</span>
                <span className="font-mono text-[9px] text-cy-muted mt-1">{user.topLanguagePercent}% of commits</span>
              </div>

              <div className="border border-[var(--text)] p-4 flex flex-col gap-1 col-span-2 justify-center items-center cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
                {user.githubVerified ? (
                  <>
                    <GithubIcon size={24} className="text-[var(--text)] mb-2" />
                    <span className="font-mono text-[10px] font-bold text-[var(--text)]">github.com/{user.githubUsername}</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-[10px] text-[var(--text)] font-bold uppercase tracking-wider mb-2">No verified activity yet.</span>
                    {isOwner ? (
                      <button className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase border-2 border-[var(--text)] px-4 py-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">Connect GitHub</button>
                    ) : (
                      <span className="font-mono text-[10px] text-cy-muted">Not Connected</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[var(--text)] opacity-10" />

          {/* LOOKING FOR & SKILLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EditableSection isOwner={isOwner} onEdit={() => { setEditData({ lookingFor: user.lookingFor || [], lookingForDetails: user.lookingForDetails || '' }); setEditModal('lookingFor'); }}>
              <div className="flex flex-col gap-3">
                <h2 className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-[var(--text)]">Looking For</h2>
                {user.lookingFor?.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {user.lookingFor.map(item => (
                        <span key={item} className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase border-2 border-[var(--accent)] text-[var(--accent)] px-2 py-1 cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors">[{item}]</span>
                      ))}
                    </div>
                    {user.lookingForDetails && <p className="font-sans text-sm text-[var(--text)] leading-relaxed mt-1">{user.lookingForDetails}</p>}
                  </>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="font-sans text-xs text-cy-muted">Not actively looking for teammates right now.</p>
                    {isOwner && (
                      <button onClick={() => setEditModal('lookingFor')} className="font-mono text-[10px] tracking-[0.1em] font-bold border-2 border-[var(--text)] px-2 py-1 uppercase hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
                        + Add Need
                      </button>
                    )}
                  </div>
                )}
              </div>
            </EditableSection>

            <EditableSection isOwner={isOwner} onEdit={() => { setEditData({ skills: user.skills || [] }); setEditModal('skills'); }}>
              <div className="flex flex-col gap-3">
                <h2 className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-[var(--text)]">Stack</h2>
                {user.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map(skill => (
                      <span key={skill} className="font-mono text-[10px] tracking-[0.06em] border border-[var(--text)] px-2 py-1 cursor-pointer hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors text-[var(--text)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="font-sans text-xs text-[var(--text)] font-bold uppercase tracking-wider">No skills added.</p>
                    {isOwner && (
                      <button onClick={() => setEditModal('skills')} className="font-mono text-[10px] tracking-[0.1em] font-bold border-2 border-[var(--text)] px-2 py-1 uppercase hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
                        + Add Skills
                      </button>
                    )}
                  </div>
                )}
              </div>
            </EditableSection>
          </div>

          <hr className="border-[var(--text)] opacity-10" />

          {/* RECENT BUILDS (Activity) */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-mono font-bold text-xs tracking-[0.16em] uppercase text-[var(--text)]">Recent Builds & Asks</h2>
              
              {/* Activity Filter */}
              <div className="flex gap-2">
                {["ALL", "BUILDS", "ASKS", "ANSWERS"].map(f => (
                  <button 
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`font-mono text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-1 border transition-colors ${activityFilter === f ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-transparent text-cy-muted hover:text-[var(--text)]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {userActivity.length === 0 ? (
              <div className="border border-dashed border-[var(--text)] opacity-50 p-10 flex items-center justify-center">
                <span className="font-mono text-xs text-[var(--text)] uppercase tracking-wider">No matching activity found.</span>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {userActivity.map((ask) => (
                  <ActivityCard key={ask.id} ask={ask} />
                ))}
              </ul>
            )}
          </section>

        </section>
      </div>

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      <CrewModal isOpen={editModal === 'bio'} onClose={() => setEditModal(null)} title="Edit Bio">
        <textarea 
          value={editData.bio || ''} 
          onChange={(e) => setEditData({...editData, bio: e.target.value})}
          className="w-full bg-[var(--bg)] border-2 border-[var(--text)] p-3 font-sans text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none"
          rows={4}
          placeholder="What are you focused on building?"
        />
        <button onClick={() => saveEdits({ bio: editData.bio })} className="mt-4 w-full bg-[var(--text)] text-[var(--bg)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:opacity-90">Save Changes</button>
      </CrewModal>

      <CrewModal isOpen={editModal === 'identity'} onClose={() => setEditModal(null)} title="Edit Identity">
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Full Name</label>
            <input type="text" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none" />
          </div>
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">College</label>
            <input type="text" value={editData.college || ''} onChange={e => setEditData({...editData, college: e.target.value})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Year</label>
              <input type="number" min={1} max={5} value={editData.year || 1} onChange={e => setEditData({...editData, year: parseInt(e.target.value)})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Branch/Major</label>
              <input type="text" value={editData.major || ''} onChange={e => setEditData({...editData, major: e.target.value})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none" />
            </div>
          </div>
          <button onClick={() => saveEdits({ name: editData.name, college: editData.college, year: editData.year, major: editData.major })} className="mt-2 w-full bg-[var(--text)] text-[var(--bg)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:opacity-90">Save Identity</button>
        </div>
      </CrewModal>

      <CrewModal isOpen={editModal === 'availability'} onClose={() => setEditModal(null)} title="Update Availability">
        <div className="flex flex-col gap-2">
          {["OPEN TO BUILD", "LOOKING FOR A TEAM", "BUSY"].map(status => (
            <button 
              key={status}
              onClick={() => saveEdits({ availability: status })}
              className={`font-mono text-[11px] font-bold tracking-[0.1em] uppercase border-2 p-4 text-left transition-all ${user.availability === status ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--text)] hover:bg-[var(--surface-2)] text-[var(--text)]'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </CrewModal>

      <CrewModal isOpen={editModal === 'skills'} onClose={() => setEditModal(null)} title="Manage Stack">
        <div className="flex flex-col gap-4">
          <p className="font-sans text-xs text-cy-muted">Add comma-separated skills you are proficient in. No progress bars, just the stack.</p>
          <textarea 
            value={(editData.skills || []).join(", ")} 
            onChange={(e) => setEditData({...editData, skills: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
            className="w-full bg-[var(--bg)] border-2 border-[var(--text)] p-3 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none"
            rows={4}
            placeholder="React, Python, OpenCV..."
          />
          <button onClick={() => saveEdits({ skills: editData.skills })} className="mt-2 w-full bg-[var(--text)] text-[var(--bg)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:opacity-90">Update Stack</button>
        </div>
      </CrewModal>

      <CrewModal isOpen={editModal === 'lookingFor'} onClose={() => setEditModal(null)} title="Looking For">
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Roles/Tags (Comma separated)</label>
            <input type="text" value={(editData.lookingFor || []).join(", ")} onChange={e => setEditData({...editData, lookingFor: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Embedded Systems, UI Designer" className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-mono text-sm text-[var(--text)] outline-none" />
          </div>
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Context</label>
            <textarea value={editData.lookingForDetails || ''} onChange={e => setEditData({...editData, lookingForDetails: e.target.value})} className="w-full bg-[var(--bg)] border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none resize-none" rows={3} placeholder="Explain what you need teammates for..." />
          </div>
          <button onClick={() => saveEdits({ lookingFor: editData.lookingFor, lookingForDetails: editData.lookingForDetails })} className="mt-2 w-full bg-[var(--text)] text-[var(--bg)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:opacity-90">Save Needs</button>
        </div>
      </CrewModal>

      <CrewModal isOpen={editModal === 'building'} onClose={() => setEditModal(null)} title="Currently Building">
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Project Name</label>
            <input type="text" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none font-bold" />
          </div>
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Description</label>
            <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} className="w-full bg-[var(--bg)] border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none resize-none" rows={2} />
          </div>
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Stack (Comma separated)</label>
            <input type="text" value={(editData.stack || []).join(", ")} onChange={e => setEditData({...editData, stack: e.target.value.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean)})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-mono text-sm text-[var(--text)] outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Status</label>
              <select value={editData.status || 'BUILDING'} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-mono text-sm text-[var(--text)] outline-none cursor-pointer">
                <option value="BUILDING">BUILDING</option>
                <option value="MAINTAINING">MAINTAINING</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted mb-1 block">Repository URL</label>
              <input type="text" value={editData.repoUrl || ''} onChange={e => setEditData({...editData, repoUrl: e.target.value})} placeholder="https://github.com/..." className="w-full bg-transparent border-2 border-[var(--text)] p-2 font-sans text-sm text-[var(--text)] outline-none" />
            </div>
          </div>
          <button onClick={() => saveEdits({ building: editData.name ? { ...editData, lastUpdated: new Date().toISOString() } : null })} className="mt-4 w-full bg-[var(--text)] text-[var(--bg)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:opacity-90">Save Build</button>
          {editData.name && (
             <button onClick={() => saveEdits({ building: null })} className="w-full border-2 border-[var(--text)] text-[var(--text)] font-mono text-[10px] font-bold tracking-[0.1em] uppercase py-3 hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-colors">Clear Current Build</button>
          )}
        </div>
      </CrewModal>

      <CrewModal isOpen={editModal === 'reputation'} onClose={() => setEditModal(null)} title="Reputation History">
        <div className="flex flex-col gap-2">
          {user.reputationHistory?.length > 0 ? (
            user.reputationHistory.map(item => (
              <div key={item.id} className="border-b border-[var(--text)] border-opacity-20 py-3 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-sm text-[var(--text)]">{item.event}</span>
                  <span className="font-mono text-[9px] text-cy-muted tracking-wider">{formatRelativeTime(item.date)}</span>
                </div>
                <span className="font-mono font-bold text-sm text-[var(--accent)]">+{item.points}</span>
              </div>
            ))
          ) : (
            <p className="font-sans text-xs text-cy-muted italic p-4 text-center">No reputation history to display.</p>
          )}
        </div>
      </CrewModal>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Activity Card
// ─────────────────────────────────────────────────────────────
function ActivityCard({ ask }) {
  const typeColor = TYPE_COLORS[ask.type] ?? "var(--text)";
  const verb      = TYPE_VERB[ask.type]   ?? "POSTED";
  const timeAgo   = formatRelativeTime(ask.createdAt);

  return (
    <li className="bg-[var(--bg)] border border-[var(--text)] border-l-[4px] flex flex-col hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_var(--shadow)] transition-all cursor-pointer" style={{ borderLeftColor: typeColor }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-white px-2 py-0.5" style={{ backgroundColor: typeColor }}>
          {verb}
        </span>
        <span className="font-mono text-[10px] text-cy-muted tracking-[0.05em]">{timeAgo}</span>
      </div>
      <h3 className="font-sans font-bold text-base leading-snug text-[var(--text)] px-4 pb-2 line-clamp-2">{ask.title}</h3>
      <p className="font-sans text-sm text-cy-muted leading-relaxed px-4 pb-3 line-clamp-3">{ask.details}</p>
      
      <footer className="border-t border-[var(--text)] border-opacity-20 px-4 py-2.5 flex items-center justify-between mt-auto">
        <span className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">View Original →</span>
        <div className="flex items-center gap-3.5 shrink-0">
          {typeof ask.likeCount === "number" && ask.likeCount >= 0 && (
            <span className="flex items-center gap-1 text-cy-muted"><ThumbsUp size={11} /><span className="font-mono text-[10px]">{ask.likeCount}</span></span>
          )}
          {typeof ask.commentCount === "number" && ask.commentCount >= 0 && (
            <span className="flex items-center gap-1 text-cy-muted"><MessageCircle size={11} /><span className="font-mono text-[10px]">{ask.commentCount}</span></span>
          )}
        </div>
      </footer>
    </li>
  );
}
