import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Search } from "lucide-react";
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
  const ref = useRef(null);
  const navigate = useNavigate();

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
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-cy-ink transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

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
//  AppNav — search bar replaces section nav links
// ─────────────────────────────────────────────────────────────
export default function AppNav({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-cy-bg sticky top-0 z-40 border-b-2 border-cy-ink shrink-0">
      <nav className="px-4 md:px-6 h-14 flex items-center gap-4"
        aria-label="App navigation">

        {/* Hamburger — mobile only */}
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

        {/* Wordmark */}
        <Link to="/board" aria-label="CrewYard home"
          className="flex items-baseline gap-0 shrink-0">
          <span className="font-display font-bold text-xl text-cy-ink leading-none tracking-tight">
            CREWYARD
          </span>
          <span className="font-display font-bold text-xl leading-none"
            style={{ color: "#E8542A" }} aria-hidden="true">.</span>
        </Link>

        {/* Spacer pushes search + avatar to the right */}
        <div className="flex-1" />

        {/* Search rectangle */}
        <div className="relative hidden md:flex items-center mr-3">
          <input
            id="app-nav-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, users, tags..."
            aria-label="Search"
            className="font-mono text-xs text-cy-ink bg-cy-bg
                       border-2 border-cy-ink pl-4 pr-10 py-2 w-72
                       focus:outline-none focus:border-cy-orange transition-colors duration-150"
            style={{ borderRadius: 0 }}
          />
          <Search
            size={13}
            strokeWidth={2}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cy-muted pointer-events-none"
          />
        </div>

        {/* Avatar menu */}
        {currentUser && <AvatarMenu user={currentUser} onLogout={logout} />}
      </nav>
    </header>
  );
}
