import { useEffect, useState } from "react";
import { api } from "../api";
import AlbumGrid from "../components/AlbumGrid";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAlbums()
      .then((data) => {
        setAlbums(data.albums || []);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Albums</h1>
        </div>
      </header>

      {status === "loading" && <p className="muted">Loading albums…</p>}
      {status === "error" && <p className="error">{error}</p>}
      {status === "ready" && albums.length === 0 && (
        <div className="empty">
          <h2>No albums yet</h2>
          <p className="muted">Artists can create albums from their Studio.</p>
        </div>
      )}

      <AlbumGrid albums={albums} />
    </section>
  );
}
