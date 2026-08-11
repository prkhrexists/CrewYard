import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppNav from "./AppNav";
import AppSidebar from "./AppSidebar";

/**
 * AuthenticatedLayout — protects all logged-in routes.
 *
 * Holds the mobileNavOpen boolean that coordinates the hamburger
 * in AppNav with the slide-out drawer in AppSidebar.
 *
 * Layout:
 *   ┌─────────────────────────────────────┐
 *   │  AppNav  (sticky, full-width)       │
 *   ├────────┬────────────────────────────┤
 *   │Sidebar │  <Outlet /> (page content) │
 *   └────────┴────────────────────────────┘
 *   On mobile the sidebar collapses; hamburger in AppNav opens the drawer.
 */
export default function AuthenticatedLayout() {
  const { isLoggedIn }          = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-cy-bg">
      {/* Sticky top nav — receives menu-open callback */}
      <AppNav onMenuClick={() => setMobileNavOpen(true)} />

      {/* Body row: sidebar (static on desktop / drawer on mobile) + page */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 md:p-8 bg-cy-bg"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
