import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import AlbumGrid from "../components/AlbumGrid";
import TrackList from "../components/TrackList";
import { SearchIcon } from "../components/Icons";
import { coverStyle } from "../utils";

export default function Search() {
  // The query lives in the URL (?q=...) so results survive refresh and back/forward
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // Wait until the user stops typing for a moment before searching
  useEffect(() => {
    const id = setTimeout(() => {
      const q = input.trim();
      setParams(q ? { q } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [input, setParams]);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setError("");
    api.search(query)
      .then((data) => !cancelled && setResults(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const empty = results && !results.musics.length && !results.albums.length && !results.artists.length;

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Discover</p>
          <h1>Search</h1>
        </div>
      </header>

      <label className="search-box">
        <SearchIcon />
        <input
          type="search"
          autoFocus
          placeholder="Songs, albums or artists"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Search"
        />
      </label>

      {error && <p className="error">{error}</p>}
      {!query && <p className="muted">Start typing to find music.</p>}
      {empty && <p className="muted">Nothing found for “{query}”.</p>}

      {results?.artists.length > 0 && (
        <div className="result-block">
          <h2>Artists</h2>
          <div className="artist-row">
            {results.artists.map((a) => (
              <Link key={a._id} to={`/artist/${a._id}`} className="artist-chip">
                <span className="artist-avatar" style={coverStyle(a._id)}>{a.userName[0]?.toUpperCase()}</span>
                {a.userName}
              </Link>
            ))}
          </div>
        </div>
      )}
      {results?.musics.length > 0 && (
        <div className="result-block">
          <h2>Songs</h2>
          <TrackList tracks={results.musics} />
        </div>
      )}
      {results?.albums.length > 0 && (
        <div className="result-block">
          <h2>Albums</h2>
          <AlbumGrid albums={results.albums} />
        </div>
      )}
    </section>
  );
}
