import { Link, useLocation } from "react-router-dom";
import { X, LayoutGrid, Hash, Users, FileText,
         Plus, Bookmark, Info, HelpCircle, Swords, Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCat } from "../context/CatContext";

// ─────────────────────────────────────────────────────────────
//  Link group configs
// ─────────────────────────────────────────────────────────────
const MAIN_LINKS = [
  { label: "BOARD",      to: "/board",       Icon: LayoutGrid },
  { label: "GROUPS",     to: "/groups",      Icon: Hash       },
  { label: "CAMPUSPODS", to: "/campus-pods", Icon: Swords     },
  { label: "CREW",       to: "/crew",        Icon: Users      },
  { label: "SIGNALS",    to: "/signals",     Icon: Radio      },
];

const MY_STUFF_LINKS = [
  { label: "POST AN ASK", to: "/ask/new", Icon: Plus,     primary: true  },
  { label: "MY ASKS",     to: "/my-asks", Icon: FileText, primary: false },
  { label: "SAVED",       to: "/saved",   Icon: Bookmark, primary: false },
];

const BOTTOM_LINKS = [
  { label: "ABOUT CREWYARD", to: "/about",   Icon: Info       },
  { label: "SUPPORT",        to: "/support", Icon: HelpCircle },
];

// ─────────────────────────────────────────────────────────────
//  Single sidebar link row (shared between desktop + mobile)
// ─────────────────────────────────────────────────────────────
function SidebarLink({ to, label, Icon, primary = false, onClose }) {
  const { pathname } = useLocation();
  const isActive     = pathname === to;
  const isOrange     = primary || isActive;

  return (
    <li>
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        onClick={onClose}
        className={[
          "flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 group",
          isActive && !primary ? "bg-cy-ink/5" : "",
          !isOrange ? "hover:bg-cy-ink/5" : "",
        ].join(" ")}
      >
        <Icon
          size={16}
          strokeWidth={isOrange ? 2.5 : 1.75}
          className={isOrange
            ? "text-cy-orange"
            : "text-cy-ink opacity-50 group-hover:opacity-100 transition-opacity duration-150"}
        />
        <span className={[
          "font-mono text-[13px] tracking-[0.06em] transition-colors duration-150",
          isOrange
            ? "text-cy-orange font-bold"
            : "text-cy-ink opacity-70 group-hover:opacity-100",
        ].join(" ")}>
          {label}
        </span>
      </Link>
    </li>
  );
}

function SectionLabel({ id, children }) {
  return (
    <p id={id} className="px-4 mb-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-cy-muted">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
//  Inner content — shared between desktop static + mobile drawer
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function SidebarContent({ onClose, showCloseButton = false }) {
  const { profile, signOut } = useAuth();
  const { react } = useCat();

  return (
    <div className="flex flex-col flex-1 py-5 overflow-y-auto">

      {/* Close button — mobile drawer only */}
      {showCloseButton && (
        <div className="flex items-center justify-between px-3 mb-4">
          <span className="font-display font-bold text-lg text-cy-ink leading-none">
            CREWYARD<span style={{ color: "var(--accent)" }}>.</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="text-cy-ink hover:text-cy-orange transition-colors duration-150"
            style={{ border: "none", background: "none", padding: "4px", cursor: "pointer" }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* MAIN group */}
      <nav aria-labelledby="sidebar-main-heading" className="mb-1">
        <SectionLabel id="sidebar-main-heading">Main</SectionLabel>
        <ul className="flex flex-col gap-0.5" role="list">
          {MAIN_LINKS.map((link) => (
            <SidebarLink key={link.to} {...link} onClose={onClose} />
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-3 my-4 border-t border-cy-ink"
           style={{ borderTopWidth: "1px", opacity: 0.15 }} role="separator" />

      {/* MY STUFF group */}
      <nav aria-labelledby="sidebar-mystuff-heading">
        <SectionLabel id="sidebar-mystuff-heading">My Stuff</SectionLabel>
        <ul className="flex flex-col gap-0.5" role="list">
          {MY_STUFF_LINKS.map((link) => (
            <SidebarLink key={link.to} {...link} onClose={onClose} />
          ))}
        </ul>
      </nav>

      {/* Cat Home Container */}
      <div id="cat-home-bounds" className="mx-3 mt-4 flex-1 min-h-[90px] relative border-b-2 border-cy-ink/20 flex flex-col justify-end items-end p-2 pb-0">
        
        {/* Clickable Minecraft style sign */}
        <button
          onClick={() => react('eat')}
          className="bg-[#8b5a2b] border-[3px] border-[#5c3a21] px-2 py-1 shadow-[3px_3px_0_0_var(--text)] hover:scale-105 active:scale-95 transition-transform cursor-pointer relative z-10 mb-2 mr-2"
          title="Feed the cat"
        >
          <p className="font-mono text-[9px] font-black text-[#f5d6a3] uppercase tracking-wider text-center" style={{ textShadow: '1px 1px 0 #3b2515' }}>
            Feed the<br/>CrewCat
          </p>
        </button>
      </div>

      {/* User summary card */}
      {profile && (
        <div className="mx-3 mt-auto">
          <div className="mx-0 mb-3 border-t border-cy-ink"
               style={{ borderTopWidth: "1px", opacity: 0.15 }} role="separator" />
          <div className="border-2 border-cy-ink p-3 flex items-center gap-3 shadow-[3px_3px_0px_0px_var(--shadow)]">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-cy-ink flex items-center justify-center bg-cy-ink">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-[10px] font-bold text-white">
                  {getInitials(profile.name ?? "?")}
                </span>
              )}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] font-bold text-cy-ink truncate">
                {profile.name ?? profile.username ?? "Builder"}
              </p>
              {profile.college && (
                <p className="font-mono text-[9px] text-cy-muted truncate">{profile.college}</p>
              )}
              <p className="font-mono text-[9px] tracking-[0.04em] mt-0.5" style={{ color: "var(--accent)" }}>
                {(profile.reputation ?? 0).toLocaleString("en-IN")} rep
              </p>
            </div>
          </div>
          {/* Sign out */}
          <button
            onClick={signOut}
            className="w-full mt-2 font-mono text-[9px] tracking-[0.1em] uppercase text-cy-muted
                       hover:text-cy-orange transition-colors duration-150 text-left px-1 py-1"
          >
            → Sign out
          </button>
        </div>
      )}

      {/* Bottom utility links */}
      {!profile && (
        <div className="mt-auto pt-4">
          <div className="mx-3 mb-3 border-t border-cy-ink"
               style={{ borderTopWidth: "1px", opacity: 0.15 }} role="separator" />
          <nav aria-label="Utility links">
            <ul className="flex flex-col gap-0.5" role="list">
              {BOTTOM_LINKS.map((link) => (
                <SidebarLink key={link.to} {...link} onClose={onClose} />
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AppSidebar
//  Props:
//    mobileOpen  — boolean, controls drawer visibility on mobile
//    onClose     — callback to close the drawer
// ─────────────────────────────────────────────────────────────
export default function AppSidebar({ mobileOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* ── Desktop: static sidebar (md+) ───────────────── */}
      <aside
        className="hidden md:flex flex-col w-72 border-r border-cy-ink bg-cy-bg h-full overflow-y-auto shrink-0"
        style={{ borderRightWidth: "1.5px" }}
        aria-label="Sidebar navigation"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: slide-over drawer ────────────────────── */}
      {/* Backdrop — fades in/out */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 md:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ backgroundColor: "var(--shadow)" }}
      />

      {/* Drawer panel — slides in from left */}
      <aside
        className={[
          "fixed left-0 top-0 h-full w-64 bg-cy-bg z-50 md:hidden flex flex-col",
          "border-r-2 border-cy-ink shadow-brutal",
          "transform transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Mobile navigation drawer"
        aria-modal={mobileOpen}
      >
        <SidebarContent onClose={onClose} showCloseButton />
      </aside>
    </>
  );
}
