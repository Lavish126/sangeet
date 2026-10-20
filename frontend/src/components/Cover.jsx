import { coverStyle } from "../utils";

// Shows the uploaded cover image, or a generated gradient when there is none
export default function Cover({ url, seed, className = "" }) {
  if (url) return <img className={`cover ${className}`} src={url} alt="" loading="lazy" />;
  return <div className={`cover ${className}`} style={coverStyle(seed)} />;
}
