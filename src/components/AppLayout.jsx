import { Outlet } from "react-router-dom";
import MarketingNav from "./MarketingNav";

/**
 * Public (marketing) layout — wraps the Home page and any other unauthenticated routes.
 */
export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <MarketingNav />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
