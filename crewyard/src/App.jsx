import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import Home from "./pages/Home";
import Board from "./pages/Board";
import PostAsk from "./pages/PostAsk";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Groups from "./pages/Groups";
import BuildLogs from "./pages/BuildLogs";
import Messages from "./pages/Messages";
import CompleteProfile from "./pages/CompleteProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (MarketingNav) ─────────────────── */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* ── Protected routes (AppNav + AppSidebar) ────────── */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/board"       element={<Board />} />
          <Route path="/ask/new"     element={<PostAsk />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/search"      element={<Search />} />
          <Route path="/groups"      element={<Groups />} />
          <Route path="/build-logs"  element={<BuildLogs />} />
          <Route path="/messages"    element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
