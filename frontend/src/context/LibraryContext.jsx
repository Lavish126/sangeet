import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

// The logged-in user's liked songs and playlists, shared by every page
const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [playlists, setPlaylists] = useState([]);

  const refreshPlaylists = useCallback(() => {
    return api.getPlaylists()
      .then((data) => setPlaylists(data.playlists))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set());
      setPlaylists([]);
      return;
    }
    api.getLiked()
      .then((data) => setLikedIds(new Set(data.musics.map((m) => m._id))))
      .catch(() => {});
    refreshPlaylists();
  }, [user, refreshPlaylists]);

  // Optimistic: flip the heart immediately, undo it if the request fails
  const toggleLike = async (musicId) => {
    const wasLiked = likedIds.has(musicId);
    const flip = (liked) =>
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (liked) next.add(musicId);
        else next.delete(musicId);
        return next;
      });
    flip(!wasLiked);
    try {
      await (wasLiked ? api.unlike(musicId) : api.like(musicId));
    } catch {
      flip(wasLiked);
    }
  };

  const createPlaylist = async (name) => {
    const data = await api.createPlaylist(name);
    await refreshPlaylists();
    return data.playlist;
  };

  const addToPlaylist = async (playlistId, musicId) => {
    await api.addToPlaylist(playlistId, musicId);
    await refreshPlaylists();
  };

  return (
    <LibraryContext.Provider value={{ likedIds, toggleLike, playlists, refreshPlaylists, createPlaylist, addToPlaylist }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
