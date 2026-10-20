import { usePlayer } from "../context/PlayerContext";
import { artistName, formatTime } from "../utils";
import Cover from "./Cover";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon } from "./Icons";

export default function PlayerBar() {
  const {
    current, isPlaying, currentTime, duration, volume, hasNext,
    toggle, next, prev, seek, setVolume,
  } = usePlayer();

  return (
    <footer className="player">
      <div className="player-track">
        {current ? (
          <>
            <Cover url={current.coverUrl} seed={current._id} className="cover-sm" />
            <div className="player-meta">
              <strong>{current.title}</strong>
              <small>{artistName(current.artist)}</small>
            </div>
          </>
        ) : (
          <small className="muted">Pick a song to start listening</small>
        )}
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="icon-btn" onClick={prev} disabled={!current} aria-label="Previous">
            <PrevIcon />
          </button>
          <button className="play-btn" onClick={toggle} disabled={!current} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="icon-btn" onClick={next} disabled={!hasNext} aria-label="Next">
            <NextIcon />
          </button>
        </div>
        <div className="seek">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!current}
            aria-label="Seek"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <VolumeIcon />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}
