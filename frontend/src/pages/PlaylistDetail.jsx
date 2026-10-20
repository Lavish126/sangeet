import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import TrackList from "../components/TrackList";
import { PlayIcon, PlaylistIcon } from "../components/Icons";
import { coverStyle } from "../utils";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playlists, refreshPlaylists } = useLibrary();
  const { playQueue } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");

  const summary = playlists.find((p) => p._id === playlistId);

  // Reload when songs are added from elsewhere (the sidebar list changes)
  useEffect(() => {
    setError("");
    api.getPlaylist(playlistId)
      .then((data) => setPlaylist(data.playlist))
      .catch((err) => setError(err.message));
  }, [playlistId, summary?.musics.length]);

  if (error) return <p className="error">{error}</p>;
  if (!playlist) return <p className="muted">Loading playlist…</p>;

  const tracks = playlist.musics.filter(Boolean);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const data = await api.renamePlaylist(playlistId, name.trim());
      setPlaylist({ ...playlist, name: data.playlist.name });
      setRenaming(false);
      refreshPlaylists();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the playlist "${playlist.name}"? Songs won't be deleted.`)) return;
    try {
      await api.deletePlaylist(playlistId);
      await refreshPlaylists();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (track) => {
    try {
      await api.removeFromPlaylist(playlistId, track._id);
      setPlaylist({ ...playlist, musics: playlist.musics.filter((m) => m?._id !== track._id) });
      refreshPlaylists();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <header className="album-hero">
        <div className="cover cover-xl liked-cover" style={coverStyle(playlist._id)}>
          <PlaylistIcon width={64} height={64} />
        </div>
        <div>
          <p className="eyebrow">Playlist</p>
          {renaming ? (
            <form onSubmit={handleRename} className="rename-form">
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="Playlist name" />
              <button className="btn">Save</button>
              <button type="button" className="btn-ghost" onClick={() => setRenaming(false)}>Cancel</button>
            </form>
          ) : (
            <h1>{playlist.name}</h1>
          )}
          <p className="muted">{tracks.length} {tracks.length === 1 ? "song" : "songs"}</p>
          <div className="hero-actions">
            {tracks.length > 0 && (
              <button className="btn btn-icon" onClick={() => playQueue(tracks, 0)}>
                <PlayIcon /> Play
              </button>
            )}
            {!renaming && (
              <button className="btn-ghost" onClick={() => { setName(playlist.name); setRenaming(true); }}>Rename</button>
            )}
            <button className="btn-ghost danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </header>

      {tracks.length === 0 ? (
        <div className="empty">
          <h2>This playlist is empty</h2>
          <p className="muted">Use the + button on any song to add it here.</p>
        </div>
      ) : (
        <TrackList tracks={tracks} onRemove={handleRemove} />
      )}
    </section>
  );
}
