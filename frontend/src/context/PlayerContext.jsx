import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current) audioRef.current = new Audio();

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const current = queue[index] || null;
  const hasNext = index + 1 < queue.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1 < queue.length ? i + 1 : i));
  }, [queue.length]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    // Restart the song if it is a few seconds in, like most players
    if (audio.currentTime > 3) audio.currentTime = 0;
    else setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Load a new source whenever the current track changes
  useEffect(() => {
    if (!current) return;
    const audio = audioRef.current;
    audio.src = current.uri;
    setCurrentTime(0);
    setDuration(0);
    audio.play().catch(() => setIsPlaying(false));
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => (hasNext ? next() : setIsPlaying(false));
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [hasNext, next]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  // Clicking the song that is already loaded pauses/resumes instead of restarting it
  const playQueue = (tracks, startIndex = 0) => {
    const track = tracks[startIndex];
    if (current && track && current._id === track._id) {
      toggle();
      return;
    }
    setQueue(tracks);
    setIndex(startIndex);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <PlayerContext.Provider
      value={{
        current, isPlaying, currentTime, duration, volume, hasNext,
        hasPrev: index > 0,
        playQueue, toggle, next, prev, seek, setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
