import { Outlet } from "react-router-dom";
import MarketingNav from "./MarketingNav";

/**
 * Public (marketing) layout — wraps the Home page and any other unauthenticated routes.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
