import { useEffect, useState } from "react";
import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import TrackList from "../components/TrackList";
import { HeartIcon, PlayIcon } from "../components/Icons";

export default function Liked() {
  const { likedIds } = useLibrary();
  const { playQueue } = usePlayer();
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getLiked()
      .then((data) => setTracks(data.musics))
      .catch((err) => setError(err.message));
  }, []);

  // Un-hearting a song here removes it from the list straight away
  const visible = (tracks || []).filter((t) => likedIds.has(t._id));

  return (
    <section>
      <header className="album-hero">
        <div className="cover cover-xl liked-cover"><HeartIcon filled width={72} height={72} /></div>
        <div>
          <p className="eyebrow">Playlist</p>
          <h1>Liked Songs</h1>
          <p className="muted">{visible.length} {visible.length === 1 ? "song" : "songs"}</p>
          {visible.length > 0 && (
            <button className="btn btn-icon" onClick={() => playQueue(visible, 0)}>
              <PlayIcon /> Play
            </button>
          )}
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {!tracks && !error && <p className="muted">Loading…</p>}
      {tracks && visible.length === 0 && (
        <div className="empty">
          <h2>Songs you like will appear here</h2>
          <p className="muted">Tap the heart on any song to save it.</p>
        </div>
      )}
      {visible.length > 0 && <TrackList tracks={visible} />}
    </section>
  );
}
