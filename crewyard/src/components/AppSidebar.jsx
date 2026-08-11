import { Link, useLocation } from "react-router-dom";
import { X, LayoutGrid, Search, Hash, MessageCircle, FileText,
         Plus, Bookmark, Info, HelpCircle } from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Link group configs
// ─────────────────────────────────────────────────────────────
const MAIN_LINKS = [
  { label: "BOARD",      to: "/board",      Icon: LayoutGrid    },
  { label: "SEARCH",     to: "/search",     Icon: Search        },
  { label: "GROUPS",     to: "/groups",     Icon: Hash          },
  { label: "MESSAGES",   to: "/messages",   Icon: MessageCircle },
  { label: "BUILD_LOGS", to: "/build-logs", Icon: FileText      },
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
        onClick={onClose}          // close mobile drawer on nav
        className={[
          "flex items-center gap-3 px-3 py-2 transition-colors duration-150 group",
          isActive && !primary ? "bg-cy-ink/5" : "",
          !isOrange ? "hover:bg-cy-ink/5" : "",
        ].join(" ")}
      >
        <Icon
          size={14}
          strokeWidth={isOrange ? 2.5 : 1.75}
          className={isOrange
            ? "text-cy-orange"
            : "text-cy-ink opacity-50 group-hover:opacity-100 transition-opacity duration-150"}
        />
        <span className={[
          "font-mono text-[11px] tracking-[0.08em] transition-colors duration-150",
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
    <p id={id} className="px-3 mb-1 font-mono text-[9px] tracking-[0.18em] uppercase text-cy-muted">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
//  Inner content — shared between desktop static + mobile drawer
// ─────────────────────────────────────────────────────────────
function SidebarContent({ onClose, showCloseButton = false }) {
  return (
    <div className="flex flex-col flex-1 py-5 overflow-y-auto">

      {/* Close button — mobile drawer only */}
      {showCloseButton && (
        <div className="flex items-center justify-between px-3 mb-4">
          <span className="font-display font-bold text-lg text-cy-ink leading-none">
            CREWYARD<span style={{ color: "#E8542A" }}>.</span>
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

      {/* Bottom utility links */}
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
        className="hidden md:flex flex-col w-56 border-r border-cy-ink bg-cy-bg"
        style={{ borderRightWidth: "1.5px", minHeight: "calc(100vh - 3.5rem)" }}
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
        style={{ backgroundColor: "rgba(17,17,17,0.35)" }}
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
