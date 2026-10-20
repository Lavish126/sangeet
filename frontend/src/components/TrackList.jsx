import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import { artistName } from "../utils";
import Cover from "./Cover";
import { CloseIcon, HeartIcon, PauseIcon, PlayIcon, PlusIcon } from "./Icons";

// Small popover listing the user's playlists, plus a quick "new playlist" field
function AddToPlaylist({ musicId, onClose }) {
  const { playlists, addToPlaylist, createPlaylist } = useLibrary();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => !ref.current?.contains(e.target) && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const add = async (playlist) => {
    try {
      await addToPlaylist(playlist._id, musicId);
      setMessage(`Added to ${playlist.name}`);
      setTimeout(onClose, 700);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const playlist = await createPlaylist(name.trim());
      await add(playlist);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="popover" ref={ref} role="dialog" aria-label="Add to playlist">
      <p className="popover-title">Add to playlist</p>
      {message ? (
        <p className="popover-msg">{message}</p>
      ) : (
        <>
          {playlists.map((p) => (
            <button key={p._id} className="popover-item" onClick={() => add(p)}>
              {p.name}
              {p.musics.includes(musicId) && <small className="muted"> · added</small>}
            </button>
          ))}
          <form className="popover-new" onSubmit={createAndAdd}>
            <input placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="icon-btn" aria-label="Create playlist"><PlusIcon /></button>
          </form>
        </>
      )}
    </div>
  );
}

// onRemove: optional, shows a remove (x) button on each row (used in playlists)
export default function TrackList({ tracks, onRemove }) {
  const { current, isPlaying, playQueue } = usePlayer();
  const { likedIds, toggleLike } = useLibrary();
  const [menuFor, setMenuFor] = useState(null);

  return (
    <ol className="tracklist">
      {tracks.map((track, i) => {
        const active = current?._id === track._id;
        const liked = likedIds.has(track._id);
        const artistId = track.artist?._id;
        return (
          <li key={track._id} className={active ? "track active" : "track"}>
            <button
              className="track-play"
              onClick={() => playQueue(tracks, i)}
              aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
            >
              <span className="track-num">{i + 1}</span>
              <span className="track-icon">{active && isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
            </button>
            <Cover url={track.coverUrl} seed={track._id} className="cover-xs" />
            <div className="track-meta">
              <strong>{track.title}</strong>
              {artistId ? (
                <Link to={`/artist/${artistId}`} className="artist-link">{artistName(track.artist)}</Link>
              ) : (
                <small>{artistName(track.artist)}</small>
              )}
            </div>

            <div className="track-actions">
              <button
                className={liked ? "icon-btn liked" : "icon-btn"}
                onClick={() => toggleLike(track._id)}
                aria-label={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
                aria-pressed={liked}
              >
                <HeartIcon filled={liked} width={18} height={18} />
              </button>
              <div className="popover-anchor">
                <button className="icon-btn" onClick={() => setMenuFor(menuFor === track._id ? null : track._id)} aria-label="Add to playlist">
                  <PlusIcon width={18} height={18} />
                </button>
                {menuFor === track._id && <AddToPlaylist musicId={track._id} onClose={() => setMenuFor(null)} />}
              </div>
              {onRemove && (
                <button className="icon-btn" onClick={() => onRemove(track)} aria-label="Remove from playlist">
                  <CloseIcon width={18} height={18} />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
