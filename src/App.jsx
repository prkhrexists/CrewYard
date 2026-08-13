import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CatProvider } from "./context/CatContext";
import AppLayout from "./components/AppLayout";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import Home from "./pages/Home";
import Board from "./pages/Board";
import PostAsk from "./pages/PostAsk";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Groups from "./pages/Groups";
import CompleteProfile from "./pages/CompleteProfile";
import CampusPods from "./pages/CampusPods";
import Crew from "./pages/Crew";
import Signals from "./pages/Signals";
import SignalDetail from "./pages/SignalDetail";
import MyAsks from "./pages/MyAsks";
import Saved from "./pages/Saved";

function App() {
  return (
    <CatProvider>
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
            <Route path="/campus-pods" element={<CampusPods />} />
            <Route path="/crew"        element={<Crew />} />
            <Route path="/signals"     element={<Signals />} />
            <Route path="/signals/:id" element={<SignalDetail />} />
            <Route path="/my-asks"     element={<MyAsks />} />
            <Route path="/saved"       element={<Saved />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CatProvider>
  );
}

export default App;
