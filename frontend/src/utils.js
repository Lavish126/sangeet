export const APP_NAME = "Sangeet";

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

// Fisher–Yates shuffle on a copy, so the original list keeps its order
export function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
