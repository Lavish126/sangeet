import { Link } from "react-router-dom";
import { artistName } from "../utils";
import Cover from "./Cover";

export default function AlbumGrid({ albums, showArtist = true }) {
  return (
    <div className="album-grid">
      {albums.map((album) => {
        const count = album.musics?.length ?? 0;
        return (
          <Link key={album._id} to={`/albums/${album._id}`} className="album-card">
            <Cover url={album.coverUrl} seed={album._id} className="cover-lg" />
            <strong>{album.albumTitle || "Untitled album"}</strong>
            <small>
              {showArtist && `${artistName(album.artist)} · `}
              {count} {count === 1 ? "song" : "songs"}
            </small>
          </Link>
        );
      })}
    </div>
  );
}
