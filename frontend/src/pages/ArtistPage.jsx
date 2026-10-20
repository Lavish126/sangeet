import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import AlbumGrid from "../components/AlbumGrid";
import TrackList from "../components/TrackList";
import { PlayIcon } from "../components/Icons";
import { coverStyle } from "../utils";

export default function ArtistPage() {
  const { artistId } = useParams();
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    api.getArtist(artistId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [artistId]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading artist…</p>;

  const { artist, musics, albums } = data;

  return (
    <section>
      <header className="album-hero">
        <div className="artist-hero-avatar" style={coverStyle(artist._id)}>{artist.userName[0]?.toUpperCase()}</div>
        <div>
          <p className="eyebrow">Artist</p>
          <h1>{artist.userName}</h1>
          <p className="muted">
            {musics.length} {musics.length === 1 ? "song" : "songs"} · {albums.length} {albums.length === 1 ? "album" : "albums"}
          </p>
          <div className="hero-actions">
            {musics.length > 0 && (
              <button className="btn btn-icon" onClick={() => playQueue(musics, 0)}>
                <PlayIcon /> Play
              </button>
            )}
            {user?.id === artist._id && <Link to="/studio" className="btn-ghost">Manage in Studio</Link>}
          </div>
        </div>
      </header>

      {musics.length === 0 && albums.length === 0 && <p className="muted">This artist hasn't released anything yet.</p>}
      {musics.length > 0 && (
        <div className="result-block">
          <h2>Songs</h2>
          <TrackList tracks={musics} />
        </div>
      )}
      {albums.length > 0 && (
        <div className="result-block">
          <h2>Albums</h2>
          <AlbumGrid albums={albums} showArtist={false} />
        </div>
      )}
    </section>
  );
}
