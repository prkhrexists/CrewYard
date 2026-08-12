/**
 * AuthContext.jsx
 *
 * Supabase magic-link auth with full DEMO MODE fallback.
 *
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set (isDemoMode=true):
 *   - loading resolves immediately to false
 *   - signInWithEmail() sets a mock user locally — no network call
 *   - signOut() clears local mock user
 *   - All auth state works perfectly for local prototype demos
 *
 * When credentials ARE set (production / staging):
 *   - Uses real supabase.auth.signInWithOtp (magic link)
 *   - Syncs user + profile via onAuthStateChange
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase, isDemoMode } from "../lib/supabaseClient.js";
import { mockUsers } from "../data/mockData.js";

// ─────────────────────────────────────────────────────────────
//  Allowed college email domain suffixes
// ─────────────────────────────────────────────────────────────
export const ALLOWED_EMAIL_SUFFIXES = [
  ".ac.in",
  ".edu",
  ".edu.in",
  ".ernet.in",
];

export function isCollegeEmail(email) {
  if (!email || !email.includes("@")) return false;
  const lower = email.toLowerCase();
  return ALLOWED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

// ─────────────────────────────────────────────────────────────
//  Demo-mode mock user (always logged in as Prakhar Jaiswal)
// ─────────────────────────────────────────────────────────────
const DEMO_USER = {
  id:                   "u1",
  username:             "prkhr_exists",
  name:                 "Prakhar Jaiswal",
  college:              "NMIMS MPSTME Shirpur",
  year:                 "2",
  major:                "Computer Science",
  githubVerified:       true,
  githubUsername:       "prkhrexists",
  reputation:           1420,
  commitsThisWeek:      34,
  commitsChangePercent: 12,
  topLanguage:          "Python",
  topLanguagePercent:   64,
  avatarUrl:            "/avatars/avatar_01.jpg",
  email:                "prkhr.exists@gmail.com",
  joinedDate:           "2024-08-15T00:00:00Z",
  bio:                  "Building autonomous systems, AI tools and products that solve problems outside the classroom.",
  availability:         "OPEN TO BUILD",
  skills:               ["Python", "C++", "ROS 2", "Docker", "OpenCV", "React", "FastAPI", "PyTorch"],
  lookingFor:           ["Embedded Systems", "ROS", "Computer Vision"],
  lookingForDetails:    "Looking for 1 Embedded Systems builder for autonomous infrastructure inspection.",
  building: {
    name: "FORGE",
    description: "Autonomous Career Intelligence Platform",
    stack: ["MULTI-AGENT AI", "PYTHON", "LLMs"],
    status: "BUILDING",
    lastUpdated: "2025-08-11T10:00:00Z",
    repoUrl: "https://github.com/prkhrexists/forge",
    demoUrl: "https://forge.example.com"
  },
  projects: [
    {
      id: "p1",
      name: "FORGE — Autonomous Career Intelligence Platform",
      description: "Multi-agent AI system for resume analysis and career recommendations.",
      stack: ["PYTHON", "LLMs", "GITHUB API", "STREAMLIT"],
      repoUrl: "https://github.com/prkhrexists/forge",
      demoUrl: "https://forge.example.com"
    }
  ],
  reputationHistory: [
    { id: "rh1", event: "Helpful answer marked by Arjun", points: 18, date: "2025-08-10T14:00:00Z" },
    { id: "rh2", event: "Successful teammate collaboration", points: 25, date: "2025-08-05T10:00:00Z" },
    { id: "rh3", event: "Build shipped", points: 40, date: "2025-08-01T10:00:00Z" },
    { id: "rh4", event: "Build log contribution", points: 10, date: "2025-07-28T10:00:00Z" }
  ]
};

// ─────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
//  Internal: map profiles row → camelCase
// ─────────────────────────────────────────────────────────────
function mapProfile(row, authUser) {
  if (!row) return null;
  return {
    id:                   row.id,
    username:             row.username,
    name:                 row.name,
    college:              row.college,
    year:                 row.year,
    major:                row.major,
    githubVerified:       row.github_verified,
    githubUsername:       row.github_username,
    reputation:           row.reputation ?? 0,
    commitsThisWeek:      row.commits_this_week ?? 0,
    commitsChangePercent: row.commits_change_percent ?? 0,
    topLanguage:          row.top_language,
    topLanguagePercent:   row.top_language_percent,
    avatarUrl:            row.avatar_url,
    joinedDate:           row.created_at,
    email:                authUser?.email ?? row.email,
    bio:                  row.bio ?? "",
    availability:         row.availability ?? "OPEN TO BUILD",
    skills:               row.skills ?? [],
    lookingFor:           row.lookingFor ?? [],
    lookingForDetails:    row.lookingForDetails ?? "",
    building:             row.building ?? null,
    projects:             row.projects ?? [],
    reputationHistory:    row.reputationHistory ?? []
  };
}

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  // ── DEMO MODE boot ────────────────────────────────────────
  useEffect(() => {
    if (!isDemoMode) return;
    // In demo mode, start as logged-out but resolve loading immediately
    // so the app can navigate normally. The user must still "sign in".
    if (localStorage.getItem("forceGuestMode") === "true") {
      setUser({ id: DEMO_USER.id, email: DEMO_USER.email });
      setProfile({ ...DEMO_USER });
    }
    setLoading(false);
  }, []);

  // ── PRODUCTION boot ──────────────────────────────────────
  const hydrateProfile = useCallback(async (authUser) => {
    if (!authUser) {
      if (mounted.current) { setUser(null); setProfile(null); }
      return;
    }
    const { data: row } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!mounted.current) return;
    setUser(authUser);
    setProfile(
      row
        ? mapProfile(row, authUser)
        : {
            id:       authUser.id,
            email:    authUser.email,
            name:     authUser.user_metadata?.full_name ?? null,
            username: authUser.email?.split("@")[0] ?? null,
          }
    );
  }, []);

  useEffect(() => {
    if (isDemoMode) return; // skip when offline

    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      await hydrateProfile(session?.user ?? null);
      if (mounted.current) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await hydrateProfile(session?.user ?? null);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateProfile]);

  // ── signInWithEmail ───────────────────────────────────────
  const signInWithEmail = useCallback(async (email) => {
    if (isDemoMode) {
      // Demo: set mock user immediately
      if (mounted.current) {
        setUser({ id: DEMO_USER.id, email });
        setProfile({ ...DEMO_USER, email });
      }
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/board" },
    });
    if (error) throw error;
  }, []);

  // ── signInAsGuest ─────────────────────────────────────────
  const signInAsGuest = useCallback(async () => {
    localStorage.setItem("forceGuestMode", "true");
    window.location.href = "/board"; // Reload to activate demo mode
  }, []);

  // ── signOut ───────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (!isDemoMode) await supabase.auth.signOut();
    const wasGuest = localStorage.getItem("forceGuestMode") === "true";
    localStorage.removeItem("forceGuestMode");
    if (mounted.current) { setUser(null); setProfile(null); }
    if (wasGuest) window.location.href = "/";
  }, []);

  // ── refreshProfile ────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (isDemoMode) return; // mock profile doesn't need refreshing
    if (!user) return;
    const { data: row } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (mounted.current && row) setProfile(mapProfile(row, user));
  }, [user]);

  // ── Derived state ─────────────────────────────────────────
  const isLoggedIn        = user !== null;
  const needsProfileSetup = isLoggedIn && !isDemoMode && !profile?.githubUsername;

  const value = {
    user,
    profile,
    loading,
    signInWithEmail,
    signInAsGuest,
    signOut,
    refreshProfile,
    isLoggedIn,
    needsProfileSetup,
    isDemoMode,
    // Backward-compat aliases
    currentUser: profile,
    login:       signInWithEmail,
    logout:      signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
