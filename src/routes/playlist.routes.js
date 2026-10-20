const express = require("express");
const playlist = require("../controllers/playlist.controller");
const {authUser} = require("../middlewares/auth.middleware");

const router = express.Router();

// every playlist route needs a logged-in user (listener or artist)
router.use(authUser);

router.get("/", playlist.getMyPlaylists);
router.post("/", playlist.createPlaylist);
router.get("/:playlistId", playlist.getPlaylist);
router.patch("/:playlistId", playlist.renamePlaylist);
router.delete("/:playlistId", playlist.deletePlaylist);
router.post("/:playlistId/musics", playlist.addMusic);
router.delete("/:playlistId/musics/:musicId", playlist.removeMusic);


module.exports = router;
