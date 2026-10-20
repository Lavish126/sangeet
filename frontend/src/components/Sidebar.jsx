import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { APP_NAME } from "../utils";
import { AlbumIcon, HeartIcon, HomeIcon, LogoIcon, PlaylistIcon, PlusIcon, SearchIcon, StudioIcon } from "./Icons";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { playlists, createPlaylist } = useLibrary();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate("/login");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const playlist = await createPlaylist(name.trim());
      setName("");
      setCreating(false);
      navigate(`/playlist/${playlist._id}`);
    } catch {
      // keep the form open so the user can retry
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <LogoIcon width={26} height={26} />
        <span>{APP_NAME}</span>
      </div>

      <nav className="nav">
        <NavLink to="/" end><HomeIcon /> <span>Home</span></NavLink>
        <NavLink to="/search"><SearchIcon /> <span>Search</span></NavLink>
        <NavLink to="/albums"><AlbumIcon /> <span>Albums</span></NavLink>
        <NavLink to="/liked"><HeartIcon filled /> <span>Liked Songs</span></NavLink>
        {user?.role === "artist" && (
          <NavLink to="/studio"><StudioIcon /> <span>Studio</span></NavLink>
        )}
      </nav>

      <div className="library">
        <div className="library-head">
          <span>Your playlists</span>
          <button className="icon-btn" onClick={() => setCreating(!creating)} aria-label="New playlist">
            <PlusIcon width={18} height={18} />
          </button>
        </div>
        {creating && (
          <form onSubmit={handleCreate} className="library-new">
            <input autoFocus placeholder="Playlist name" value={name} onChange={(e) => setName(e.target.value)} />
          </form>
        )}
        <div className="library-list">
          {playlists.length === 0 && !creating && <small className="muted">No playlists yet</small>}
          {playlists.map((p) => (
            <NavLink key={p._id} to={`/playlist/${p._id}`}>
              <PlaylistIcon width={18} height={18} /> <span>{p.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="account">
        <div className="avatar">{user?.userName?.[0]?.toUpperCase()}</div>
        <div className="account-info">
          <strong>{user?.userName}</strong>
          <small>{user?.role === "artist" ? "Artist" : "Listener"}</small>
        </div>
        <button className="btn-ghost" onClick={handleLogout}>Log out</button>
      </div>
    </aside>
  );
}
