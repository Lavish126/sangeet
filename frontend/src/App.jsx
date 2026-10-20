import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import PlayerBar from "./components/PlayerBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Studio from "./pages/Studio";
import Search from "./pages/Search";
import Liked from "./pages/Liked";
import PlaylistDetail from "./pages/PlaylistDetail";
import ArtistPage from "./pages/ArtistPage";

function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}

function ArtistOnly({ children }) {
  const { user } = useAuth();
  return user?.role === "artist" ? children : <Navigate to="/" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:albumId" element={<AlbumDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/liked" element={<Liked />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
        <Route path="/artist/:artistId" element={<ArtistPage />} />
        <Route path="/studio" element={<ArtistOnly><Studio /></ArtistOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
