import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import Cover from "../components/Cover";
import TrackList from "../components/TrackList";
import { PlayIcon } from "../components/Icons";
import { artistName } from "../utils";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAlbum(null);
    setError("");
    api.getAlbum(albumId)
      .then((data) => setAlbum(data.album))
      .catch((err) => setError(err.message));
  }, [albumId]);

  if (error) {
    return (
      <section>
        <p className="error">{error}</p>
        <Link to="/albums">← Back to albums</Link>
      </section>
    );
  }
  if (!album) return <p className="muted">Loading album…</p>;

  // Songs without their own cover use the album's cover
  const tracks = (album.musics || []).map((m) => ({ ...m, coverUrl: m.coverUrl || album.coverUrl }));
  const isOwner = album.artist?._id === user?.id;

  return (
    <section>
      <Link to="/albums" className="back-link">← Albums</Link>
      <header className="album-hero">
        <Cover url={album.coverUrl} seed={album._id} className="cover-xl" />
        <div>
          <p className="eyebrow">Album</p>
          <h1>{album.albumTitle}</h1>
          <p className="muted">
            <Link to={`/artist/${album.artist?._id}`} className="artist-link">{artistName(album.artist)}</Link>
            {" · "}{tracks.length} {tracks.length === 1 ? "song" : "songs"}
          </p>
          <div className="hero-actions">
            {tracks.length > 0 && (
              <button className="btn btn-icon" onClick={() => playQueue(tracks, 0)}>
                <PlayIcon /> Play album
              </button>
            )}
            {isOwner && <Link to="/studio" className="btn-ghost">Edit in Studio</Link>}
          </div>
        </div>
      </header>

      {tracks.length === 0 ? <p className="muted">This album has no songs yet.</p> : <TrackList tracks={tracks} />}
    </section>
  );
}
