import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import TrackList from "../components/TrackList";
import { PlayIcon, PlaylistIcon } from "../components/Icons";

const PAGE_SIZE = 20;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const { playlists } = useLibrary();
  const [tracks, setTracks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadPage = (page) => {
    setStatus("loading");
    api.getMusics({ page, limit: PAGE_SIZE })
      .then((data) => {
        setTracks((prev) => (page === 1 ? data.musics : [...prev, ...data.musics]));
        setPagination(data.pagination);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  };

  useEffect(() => loadPage(1), []);

  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">{greeting()}, {user?.userName}</p>
          <h1>Latest songs</h1>
          {pagination && pagination.total > 0 && (
            <p className="muted subtitle">{pagination.total} {pagination.total === 1 ? "song" : "songs"}</p>
          )}
        </div>
        {tracks.length > 0 && (
          <button className="btn btn-icon" onClick={() => playQueue(tracks, 0)}>
            <PlayIcon /> Play all
          </button>
        )}
      </header>

      {/* On phones the sidebar playlist list is hidden, so show playlists here */}
      {playlists.length > 0 && (
        <div className="home-playlists">
          {playlists.map((p) => (
            <Link key={p._id} to={`/playlist/${p._id}`} className="artist-chip">
              <PlaylistIcon width={18} height={18} /> {p.name}
            </Link>
          ))}
        </div>
      )}

      {status === "error" && <p className="error">{error}</p>}
      {status === "ready" && tracks.length === 0 && (
        <div className="empty">
          <h2>No songs yet</h2>
          <p className="muted">When artists upload music it will show up here.</p>
        </div>
      )}
      {tracks.length > 0 && <TrackList tracks={tracks} />}

      {status === "loading" && <p className="muted">Loading songs…</p>}
      {hasMore && status === "ready" && (
        <div className="load-more">
          <button className="btn-ghost" onClick={() => loadPage(pagination.page + 1)}>Load more</button>
        </div>
      )}
    </section>
  );
}
