// Thin wrapper around the backend's REST API (proxied to localhost:3000 by Vite)

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, { credentials: "include", ...options });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response (e.g. Express default error page)
  }

  if (!res.ok) {
    // A missing/invalid cookie on a protected route means the session is gone
    if (res.status === 401 && !path.startsWith("/auth")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

const jsonBody = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Builds multipart form data; arrays are sent as JSON strings, empty values are skipped
function formBody(method, fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    form.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
  }
  return { method, body: form };
}

export const api = {
  register: (body) => request("/auth/register", jsonBody("POST", body)),
  login: (body) => request("/auth/login", jsonBody("POST", body)),
  logout: () => request("/auth/logout", { method: "POST" }),

  // params: { page, limit, artist }
  getMusics: (params = {}) => request(`/music/allMusics?${new URLSearchParams(params)}`),
  // text fields go before files so multer sees them
  uploadMusic: (title, file, cover) => request("/music/upload", formBody("POST", { title, music: file, cover })),
  updateMusic: (id, { title, cover }) => request(`/music/musics/${id}`, formBody("PATCH", { title, cover })),
  deleteMusic: (id) => request(`/music/musics/${id}`, { method: "DELETE" }),

  getAlbums: () => request("/music/albums"),
  getAlbum: (id) => request(`/music/albums/${id}`),
  createAlbum: ({ title, musics, cover }) => request("/music/album", formBody("POST", { title, musics, cover })),
  updateAlbum: (id, { title, musics, cover }) => request(`/music/albums/${id}`, formBody("PATCH", { title, musics, cover })),
  deleteAlbum: (id) => request(`/music/albums/${id}`, { method: "DELETE" }),

  search: (q) => request(`/music/search?${new URLSearchParams({ q })}`),
  getArtist: (id) => request(`/music/artists/${id}`),

  getLiked: () => request("/music/liked"),
  like: (id) => request(`/music/musics/${id}/like`, { method: "POST" }),
  unlike: (id) => request(`/music/musics/${id}/like`, { method: "DELETE" }),

  getPlaylists: () => request("/playlists"),
  getPlaylist: (id) => request(`/playlists/${id}`),
  createPlaylist: (name) => request("/playlists", jsonBody("POST", { name })),
  renamePlaylist: (id, name) => request(`/playlists/${id}`, jsonBody("PATCH", { name })),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: "DELETE" }),
  addToPlaylist: (id, musicId) => request(`/playlists/${id}/musics`, jsonBody("POST", { musicId })),
  removeFromPlaylist: (id, musicId) => request(`/playlists/${id}/musics/${musicId}`, { method: "DELETE" }),
};
