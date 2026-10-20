const express = require("express");
const music = require("../controllers/music.controller");
const {authArtist, authUser} = require("../middlewares/auth.middleware");
const multer = require("multer");

// "music" must be audio, "cover" must be an image
const ALLOWED_TYPES = {music:"audio/", cover:"image/"};

const upload = multer({
    storage:multer.memoryStorage(),
    limits:{fileSize: 20 * 1024 * 1024}, // 20 MB
    fileFilter:(req, file, cb) => {
        const allowed = ALLOWED_TYPES[file.fieldname];
        if(allowed && file.mimetype.startsWith(allowed)) return cb(null, true);
        const error = new Error(file.fieldname === "cover"
            ? "cover must be an image file"
            : "only audio files can be uploaded");
        error.status = 400;
        cb(error);
    }
})

const router = express.Router();

// songs
router.post("/upload", authArtist, upload.fields([{name:"music", maxCount:1}, {name:"cover", maxCount:1}]), music.createMusic);
router.get("/allMusics",authUser, music.getAllMusics);
router.patch("/musics/:musicId", authArtist, upload.single("cover"), music.updateMusic);
router.delete("/musics/:musicId", authArtist, music.deleteMusic);

// albums
router.post("/album", authArtist, upload.single("cover"), music.createAlbum);
router.get("/albums",authUser, music.getAllAlbums);
router.get("/albums/:albumId",authUser, music.getAlbumById);
router.patch("/albums/:albumId", authArtist, upload.single("cover"), music.updateAlbum);
router.delete("/albums/:albumId", authArtist, music.deleteAlbum);

// discovery
router.get("/search", authUser, music.search);
router.get("/artists/:artistId", authUser, music.getArtist);

// likes
router.get("/liked", authUser, music.getLikedMusics);
router.post("/musics/:musicId/like", authUser, music.likeMusic);
router.delete("/musics/:musicId/like", authUser, music.unlikeMusic);


module.exports = router;
