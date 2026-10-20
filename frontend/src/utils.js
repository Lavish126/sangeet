export const APP_NAME = "Music App";

// The backend populates `artist` with different fields depending on the route
export function artistName(artist) {
  if (!artist || typeof artist === "string") return "Unknown artist";
  return artist.userName || artist.email?.split("@")[0] || "Unknown artist";
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Deterministic gradient "cover art", since the backend stores no images
export function coverStyle(seed = "") {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 65% 58%), hsl(${(hue + 50) % 360} 60% 32%))`,
  };
}
