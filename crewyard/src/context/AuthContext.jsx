import { createContext, useContext, useState, useCallback } from "react";
import { mockUsers } from "../data/mockData.js";
import { setCurrentUser } from "../data/mockDb.js";

// ─────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState(null); // null = logged out

  /** Logs in as mockUsers[0] (Arjun Sharma) */
  const login = useCallback(() => {
    const user = mockUsers[0];
    setCurrentUser(user.id);   // sync to mockDb module state
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);      // sync to mockDb module state
    setUser(null);
  }, []);

  const value = {
    currentUser,
    isLoggedIn: currentUser !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
