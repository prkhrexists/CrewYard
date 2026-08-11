import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
}

// ─────────────────────────────────────────────────────────────
//  Avatar + Dropdown
// ─────────────────────────────────────────────────────────────
function AvatarMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const navigate        = useNavigate();

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function handleLogout() {
    setOpen(false);
    onLogout();
    navigate("/");
  }

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        id="app-nav-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={user.name}
        className="flex items-center gap-1.5 group"
        style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-cy-ink
                        bg-cy-ink flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] font-bold text-white">
              {getInitials(user.name)}
            </span>
          )}
        </div>
        {/* Chevron rotates when open */}
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-cy-ink transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-44 bg-cy-bg border border-cy-ink z-50"
          style={{ borderWidth: "1.5px" }}
        >
          <Link
            to={`/u/${user.username}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs
                       tracking-[0.06em] uppercase text-cy-ink
                       hover:bg-cy-ink hover:text-white transition-colors duration-150"
          >
            Profile
          </Link>
          <div className="border-t border-cy-ink" style={{ borderTopWidth: "1px" }} />
          <button
            id="app-nav-logout-btn"
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5
                       font-mono text-xs tracking-[0.06em] uppercase text-cy-ink
                       hover:bg-cy-ink hover:text-white transition-colors duration-150"
            style={{ border: "none", background: "transparent" }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Nav links
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "BOARD",      to: "/board"      },
  { label: "SEARCH",     to: "/search"     },
  { label: "GROUPS",     to: "/groups"     },
  { label: "BUILD_LOGS", to: "/build-logs" },
  { label: "MESSAGES",   to: "/messages"   },
];

// ─────────────────────────────────────────────────────────────
//  AppNav — receives onMenuClick to coordinate with sidebar drawer
// ─────────────────────────────────────────────────────────────
export default function AppNav({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { pathname }            = useLocation();

  return (
    <header className="bg-cy-bg sticky top-0 z-40 border-b-2 border-cy-ink">
      <nav className="px-4 md:px-6 h-14 flex items-center gap-4 md:gap-8"
           aria-label="App navigation">

        {/* ── Hamburger — mobile only ────────────────────────── */}
        <button
          id="app-nav-hamburger"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex md:hidden items-center justify-center text-cy-ink
                     transition-opacity duration-150 hover:opacity-70"
          style={{ border: "none", background: "none", padding: "4px" }}
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* ── Wordmark ──────────────────────────────────────── */}
        <Link to="/board" aria-label="CrewYard home"
              className="flex items-baseline gap-0 shrink-0">
          <span className="font-display font-bold text-xl text-cy-ink leading-none tracking-tight">
            CREWYARD
          </span>
          <span className="font-display font-bold text-xl leading-none"
                style={{ color: "#E8542A" }} aria-hidden="true">.</span>
        </Link>

        {/* ── Nav links — hidden on mobile ──────────────────── */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "font-mono text-xs font-bold tracking-[0.1em] transition-colors duration-150",
                    isActive
                      ? "text-cy-orange"
                      : "text-cy-ink opacity-70 hover:opacity-100 hover:text-cy-orange",
                  ].join(" ")}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex-1" />

        {/* ── Avatar menu ───────────────────────────────────── */}
        {currentUser && <AvatarMenu user={currentUser} onLogout={logout} />}
      </nav>
    </header>
  );
}
