import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Cover from "../components/Cover";

// Image picker with a live preview of the chosen file (or the current cover)
function CoverInput({ file, onChange, currentUrl, seed, label = "Cover image (optional)" }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label className="cover-input">
      <Cover url={preview || currentUrl} seed={seed} className="cover-sm" />
      <span>
        {label}
        <small className="muted">{file ? file.name : "PNG or JPG"}</small>
      </span>
      <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files[0] || null)} />
    </label>
  );
}

function SongPicker({ songs, selected, onChange }) {
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="picker">
      <span className="picker-label">Songs ({selected.length} selected)</span>
      {songs.length === 0 ? (
        <p className="muted">Upload a song first, then add it to an album.</p>
      ) : (
        songs.map((song) => (
          <label key={song._id} className="picker-row">
            <input type="checkbox" checked={selected.includes(song._id)} onChange={() => toggle(song._id)} />
            <span>{song.title}</span>
          </label>
        ))
      )}
    </div>
  );
}

function UploadSong({ onDone }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleFile = (e) => {
    const picked = e.target.files[0] || null;
    setFile(picked);
    // Suggest a title from the file name if none was typed
    if (picked && !title) setTitle(picked.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus({ type: "loading", message: "" });
    try {
      const data = await api.uploadMusic(title.trim(), file, cover);
      setStatus({ type: "success", message: `"${data.title}" was uploaded.` });
      setTitle("");
      setFile(null);
      setCover(null);
      e.target.reset();
      onDone();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Upload a song</h2>
      <label className="dropzone">
        <input type="file" accept="audio/*" onChange={handleFile} required />
        <strong>{file ? file.name : "Choose an audio file"}</strong>
        <small className="muted">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "MP3, WAV, M4A… up to 20 MB"}</small>
      </label>
      <label>
        Song title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <CoverInput file={cover} onChange={setCover} seed={title} />
      {status.type === "error" && <p className="error">{status.message}</p>}
      {status.type === "success" && <p className="success">{status.message}</p>}
      <button className="btn" disabled={status.type === "loading" || !file}>
        {status.type === "loading" ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}

function CreateAlbum({ songs, onDone }) {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState(null);
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });
    try {
      const data = await api.createAlbum({ title: title.trim(), musics: selected, cover });
      setStatus({ type: "success", message: `"${data.album.title}" was created.` });
      setTitle("");
      setCover(null);
      setSelected([]);
      onDone();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Create an album</h2>
      <label>
        Album title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <CoverInput file={cover} onChange={setCover} seed={title} />
      <SongPicker songs={songs} selected={selected} onChange={setSelected} />
      {status.type === "error" && <p className="error">{status.message}</p>}
      {status.type === "success" && <p className="success">{status.message}</p>}
      <button className="btn" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Creating…" : "Create album"}
      </button>
    </form>
  );
}

function SongRow({ song, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(song.title);
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.updateMusic(song._id, { title: title.trim(), cover });
      setEditing(false);
      setCover(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${song.title}"? It will also be removed from albums, playlists and likes.`)) return;
    setBusy(true);
    try {
      await api.deleteMusic(song._id);
      onChanged();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="manage-row editing">
        <form onSubmit={save} className="manage-form">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <CoverInput file={cover} onChange={setCover} currentUrl={song.coverUrl} seed={song._id} label="Change cover" />
          {error && <p className="error">{error}</p>}
          <div className="row-actions">
            <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" className="btn-ghost" onClick={() => { setEditing(false); setTitle(song.title); setCover(null); }}>Cancel</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="manage-row">
      <Cover url={song.coverUrl} seed={song._id} className="cover-xs" />
      <strong className="manage-title">{song.title}</strong>
      {error && <span className="error">{error}</span>}
      <div className="row-actions">
        <button className="btn-ghost" onClick={() => setEditing(true)} disabled={busy}>Edit</button>
        <button className="btn-ghost danger" onClick={remove} disabled={busy}>Delete</button>
      </div>
    </li>
  );
}

function AlbumRow({ album, songs, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(album.albumTitle);
  const [cover, setCover] = useState(null);
  const [selected, setSelected] = useState(album.musics.map(String));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startEditing = () => {
    setTitle(album.albumTitle);
    setSelected(album.musics.map(String));
    setCover(null);
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.updateAlbum(album._id, { title: title.trim(), musics: selected, cover });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the album "${album.albumTitle}"? Its songs will not be deleted.`)) return;
    setBusy(true);
    try {
      await api.deleteAlbum(album._id);
      onChanged();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="manage-row editing">
        <form onSubmit={save} className="manage-form">
          <label>
            Album title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <CoverInput file={cover} onChange={setCover} currentUrl={album.coverUrl} seed={album._id} label="Change cover" />
          <SongPicker songs={songs} selected={selected} onChange={setSelected} />
          {error && <p className="error">{error}</p>}
          <div className="row-actions">
            <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="manage-row">
      <Cover url={album.coverUrl} seed={album._id} className="cover-xs" />
      <Link to={`/albums/${album._id}`} className="manage-title">{album.albumTitle}</Link>
      <small className="muted">{album.musics.length} {album.musics.length === 1 ? "song" : "songs"}</small>
      {error && <span className="error">{error}</span>}
      <div className="row-actions">
        <button className="btn-ghost" onClick={startEditing} disabled={busy}>Edit</button>
        <button className="btn-ghost danger" onClick={remove} disabled={busy}>Delete</button>
      </div>
    </li>
  );
}

export default function Studio() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");

  // The artist page endpoint returns all of this artist's songs and albums
  const load = useCallback(() => {
    api.getArtist(user.id)
      .then((data) => {
        setSongs(data.musics);
        setAlbums(data.albums);
      })
      .catch((err) => setError(err.message));
  }, [user.id]);

  useEffect(load, [load]);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Artist studio</p>
          <h1>Share your music</h1>
        </div>
        <Link to={`/artist/${user.id}`} className="btn-ghost">View your artist page</Link>
      </header>
      {error && <p className="error">{error}</p>}

      <div className="studio-grid">
        <UploadSong onDone={load} />
        <CreateAlbum songs={songs} onDone={load} />
      </div>

      <div className="studio-grid manage">
        <div className="panel">
          <h2>Your songs ({songs.length})</h2>
          {songs.length === 0 ? (
            <p className="muted">You haven't uploaded any songs yet.</p>
          ) : (
            <ul className="manage-list">
              {songs.map((song) => <SongRow key={song._id} song={song} onChanged={load} />)}
            </ul>
          )}
        </div>
        <div className="panel">
          <h2>Your albums ({albums.length})</h2>
          {albums.length === 0 ? (
            <p className="muted">You haven't created any albums yet.</p>
          ) : (
            <ul className="manage-list">
              {albums.map((album) => <AlbumRow key={album._id} album={album} songs={songs} onChanged={load} />)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
