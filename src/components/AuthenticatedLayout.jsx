import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppNav from "./AppNav";
import AppSidebar from "./AppSidebar";
import PixelCat from "./PixelCat/PixelCat";

/**
 * AuthenticatedLayout — protects all logged-in routes.
 *
 * Layout (CSS):
 *   div.h-screen.flex-col          ← fills viewport, no scroll
 *     AppNav (shrink-0)            ← fixed height, never pushes out
 *     div.flex.flex-1.overflow-hidden  ← remaining height, clips sidebar+main
 *       AppSidebar (h-full)        ← fills its column, scrolls internally
 *       main (flex-1, overflow-y-auto) ← only this scrolls
 *
 * This is the correct pattern: do NOT use sticky on sidebar, do NOT use
 * overflow-hidden on the parent div if sidebar needs sticky — instead just
 * fix the total height so there's nothing to scroll past.
 */
export default function AuthenticatedLayout() {
  const { user, loading, needsProfileSetup } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const isFullBleed = location.pathname === "/board";

  if (loading) {
    return (
      <div className="h-screen bg-cy-bg flex items-center justify-center">
        <p className="font-mono text-xs text-cy-muted">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (needsProfileSetup) return <Navigate to="/complete-profile" replace />;

  return (
    // h-screen + flex-col: total height is exactly the viewport. Nothing overflows here.
    <div className="h-screen flex flex-col bg-cy-bg overflow-hidden relative">
      {/* Sticky top nav — shrink-0 so it never grows/shrinks */}
      <AppNav onMenuClick={() => setMobileNavOpen(true)} />

      {/* Body row: flex-1 takes remaining height, overflow-hidden clips children */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: h-full keeps it pinned, overflow-y-auto lets IT scroll internally */}
        <AppSidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main content: flex-1 + overflow-y-auto = only this column scrolls */}
        <main
          id="main-content"
          className={`flex-1 bg-cy-bg h-full ${isFullBleed ? "p-0 overflow-hidden" : "p-6 md:p-8 overflow-y-auto"}`}
        >
          <Outlet />
        </main>
      </div>
      <PixelCat />
    </div>
  );
}

