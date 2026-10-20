const mongoose = require("mongoose");
const musicModel = require("../models/music.model");
const {uploadFile, deleteFile} = require("../services/storage.service");
const albumModel = require("../models/album.model");
const playlistModel = require("../models/playlist.model");
const userModel = require("../models/user.model");

// Only these artist fields are ever sent to the client (never the password hash)
const ARTIST_FIELDS = "userName email";
const MAX_LIMIT = 50;
// Songs inside albums/playlists/likes come with their artist filled in
const POPULATE_MUSICS = {path:"musics", populate:{path:"artist", select:ARTIST_FIELDS}};

async function uploadCover(file){
   const result = await uploadFile(file.buffer.toString('base64'), "cover");
   return {coverUrl: result.url, coverFileId: result.fileId};
}

// musics can arrive as a real array (JSON body) or as a JSON string (multipart form)
function parseIdList(value){
   if(value === undefined) return undefined;
   let list = value;
   if(typeof value === "string"){
      try{
         list = JSON.parse(value);
      }catch{
         return null;
      }
   }
   if(!Array.isArray(list) || !list.every((id) => mongoose.isValidObjectId(id))) return null;
   return [...new Set(list.map(String))];
}

// Artists can only put their own songs in their albums
async function ownsAllMusics(musics, artistId){
   const ownedCount = await musicModel.countDocuments({
      _id: {$in: musics},
      artist: artistId,
   })
   return ownedCount === musics.length;
}

function serverError(res, message, error){
   return res.status(500).json({
      message,
      error:error.message
   })
}

async function createMusic(req,res){
  try{
   const title = req.body.title?.trim();
   const file = req.files?.music?.[0];
   const cover = req.files?.cover?.[0];

   if(!file){
      return res.status(400).json({
         message:"music file is required"
      })
   }
   if(!title){
      return res.status(400).json({
         message:"title is required"
      })
   }

   const result = await uploadFile(file.buffer.toString('base64'), "music");
   const coverData = cover ? await uploadCover(cover) : {};
   const music = await musicModel.create({
      uri:result.url,
      fileId:result.fileId,
      title,
      artist: req.user.id,
      ...coverData,
   })

   res.status(201).json({
    message:"music created successfully",
    id: music._id,
    title: music.title,
    uri: music.uri,
    coverUrl: music.coverUrl,
    artist: music.artist
   })
  }catch(error){
     serverError(res, "Error uploading music", error);
  }
}

// PATCH /musics/:musicId  (title and/or a new cover)
async function updateMusic(req,res){
  try{
   const music = await findOwned(musicModel, req.params.musicId, req.user.id, res, "Music");
   if(!music) return;

   if(req.body.title !== undefined){
      const title = req.body.title.trim();
      if(!title){
         return res.status(400).json({
            message:"title can't be empty"
         })
      }
      music.title = title;
   }
   if(req.file){
      const oldCoverId = music.coverFileId;
      Object.assign(music, await uploadCover(req.file));
      await deleteFile(oldCoverId);
   }
   await music.save();

   res.status(200).json({
      message:"music updated successfully",
      music
   })
  }catch(error){
     serverError(res, "Error updating music", error);
  }
}

async function deleteMusic(req,res){
  try{
   const music = await findOwned(musicModel, req.params.musicId, req.user.id, res, "Music");
   if(!music) return;

   await Promise.all([
      musicModel.deleteOne({_id: music._id}),
      albumModel.updateMany({musics: music._id}, {$pull:{musics: music._id}}),
      playlistModel.updateMany({musics: music._id}, {$pull:{musics: music._id}}),
      userModel.updateMany({likedMusics: music._id}, {$pull:{likedMusics: music._id}}),
   ])
   await Promise.all([deleteFile(music.fileId), deleteFile(music.coverFileId)]);

   res.status(200).json({
      message:"music deleted successfully"
   })
  }catch(error){
     serverError(res, "Error deleting music", error);
  }
}



async function createAlbum(req,res){
  try{
  const title = req.body.title?.trim();
  const musics = parseIdList(req.body.musics) || (req.body.musics === undefined ? [] : null);

  if(!title){
    return res.status(400).json({
      message:"title is required"
    })
  }
  if(!musics){
    return res.status(400).json({
      message:"musics must be an array of music ids"
    })
  }
  if(!(await ownsAllMusics(musics, req.user.id))){
    return res.status(400).json({
      message:"some musics don't exist or don't belong to you"
    })
  }

  const coverData = req.file ? await uploadCover(req.file) : {};
  const album = await albumModel.create({
    albumTitle:title,
    artist: req.user.id,
    musics: musics,
    ...coverData,
  })
  res.status(201).json({
    message:"album created successfully",
    album:{
       id: album._id,
       title: album.albumTitle,
       musics: album.musics,
       coverUrl: album.coverUrl,
       artist:album.artist
    }
  })
  }catch(error){
    serverError(res, "Error creating album", error);
  }
}

// PATCH /albums/:albumId  (title, musics and/or a new cover)
async function updateAlbum(req,res){
  try{
   const album = await findOwned(albumModel, req.params.albumId, req.user.id, res, "Album");
   if(!album) return;

   if(req.body.title !== undefined){
      const title = req.body.title.trim();
      if(!title){
         return res.status(400).json({
            message:"title can't be empty"
         })
      }
      album.albumTitle = title;
   }
   if(req.body.musics !== undefined){
      const musics = parseIdList(req.body.musics);
      if(!musics){
         return res.status(400).json({
            message:"musics must be an array of music ids"
         })
      }
      if(!(await ownsAllMusics(musics, req.user.id))){
         return res.status(400).json({
            message:"some musics don't exist or don't belong to you"
         })
      }
      album.musics = musics;
   }
   if(req.file){
      const oldCoverId = album.coverFileId;
      Object.assign(album, await uploadCover(req.file));
      await deleteFile(oldCoverId);
   }
   await album.save();

   res.status(200).json({
      message:"album updated successfully",
      album
   })
  }catch(error){
     serverError(res, "Error updating album", error);
  }
}

async function deleteAlbum(req,res){
  try{
   const album = await findOwned(albumModel, req.params.albumId, req.user.id, res, "Album");
   if(!album) return;

   // Songs stay; only the album and its cover are removed
   await albumModel.deleteOne({_id: album._id});
   await deleteFile(album.coverFileId);

   res.status(200).json({
      message:"album deleted successfully"
   })
  }catch(error){
     serverError(res, "Error deleting album", error);
  }
}


// GET /allMusics?page=1&limit=10&artist=<userId>
async function  getAllMusics(req,res){
try{
       const page = Math.max(parseInt(req.query.page) || 1, 1);
       const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), MAX_LIMIT);

       const filter = {};
       if(req.query.artist){
          if(!mongoose.isValidObjectId(req.query.artist)){
             return res.status(400).json({
                message:"invalid artist id"
             })
          }
          filter.artist = req.query.artist;
       }

       const [musics, total] = await Promise.all([
          musicModel
            .find(filter)
            .sort({_id: -1}) // newest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("artist", ARTIST_FIELDS),
          musicModel.countDocuments(filter),
       ])

    res.status(200).json({
    message:"Musics fetched successfully",
    musics:musics,
    pagination:{
       page,
       limit,
       total,
       totalPages: Math.ceil(total / limit),
    }
   })
}catch(error){
     serverError(res, "Musics fetched error", error);
}
}

async function getAllAlbums(req,res){
    try{
  const albums =   await albumModel.find().sort({_id: -1}).select("albumTitle artist musics coverUrl").populate("artist", ARTIST_FIELDS)
         return res.status(200).json({
            message:"Album fetched successfully",
            albums:albums
         })
    }catch(error){
        return serverError(res, "Album not fetched successfully", error);
    }
}

async function getAlbumById(req,res){
    try{
    const albumId = req.params.albumId;
    if(!mongoose.isValidObjectId(albumId)){
        return res.status(404).json({
            message:"Album not found"
        })
    }
    const album = await albumModel.findById(albumId).populate("artist", ARTIST_FIELDS).populate(POPULATE_MUSICS)
    if(!album){
        return res.status(404).json({
            message:"Album not found"
        })
    }
    return res.status(200).json({
        message:"Album fetched successfully",
        album:album
    })
}catch(error){
        return serverError(res, "Error fetching album", error);
    }
}

// GET /search?q=  → matching songs, albums and artists (case-insensitive)
async function search(req,res){
  try{
   const q = req.query.q?.trim();
   if(!q){
      return res.status(200).json({
         message:"Search results",
         musics:[], albums:[], artists:[]
      })
   }
   // escape regex special characters so user input is matched literally
   const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 100), "i");

   const [musics, albums, artists] = await Promise.all([
      musicModel.find({title: pattern}).limit(20).populate("artist", ARTIST_FIELDS),
      albumModel.find({albumTitle: pattern}).limit(20).select("albumTitle artist musics coverUrl").populate("artist", ARTIST_FIELDS),
      userModel.find({role:"artist", userName: pattern}).limit(20).select("userName"),
   ])

   res.status(200).json({
      message:"Search results",
      musics, albums, artists
   })
  }catch(error){
     serverError(res, "Error searching", error);
  }
}

// GET /artists/:artistId  → artist profile with their songs and albums
async function getArtist(req,res){
  try{
   const {artistId} = req.params;
   const artist = mongoose.isValidObjectId(artistId)
      ? await userModel.findOne({_id: artistId, role:"artist"}).select("userName")
      : null;
   if(!artist){
      return res.status(404).json({
         message:"Artist not found"
      })
   }

   const [musics, albums] = await Promise.all([
      musicModel.find({artist: artist._id}).sort({_id: -1}).populate("artist", ARTIST_FIELDS),
      albumModel.find({artist: artist._id}).sort({_id: -1}).select("albumTitle artist musics coverUrl"),
   ])

   res.status(200).json({
      message:"Artist fetched successfully",
      artist, musics, albums
   })
  }catch(error){
     serverError(res, "Error fetching artist", error);
  }
}

// GET /liked  → the logged-in user's liked songs, most recently liked first
async function getLikedMusics(req,res){
  try{
   const user = await userModel.findById(req.user.id).select("likedMusics").populate({
      path:"likedMusics",
      populate:{path:"artist", select:ARTIST_FIELDS}
   })
   if(!user){
      return res.status(401).json({
         message:"unauthorized"
      })
   }
   res.status(200).json({
      message:"Liked musics fetched successfully",
      musics: user.likedMusics.filter(Boolean).reverse()
   })
  }catch(error){
     serverError(res, "Error fetching liked musics", error);
  }
}

async function likeMusic(req,res){
  try{
   const {musicId} = req.params;
   if(!mongoose.isValidObjectId(musicId) || !(await musicModel.exists({_id: musicId}))){
      return res.status(404).json({
         message:"Music not found"
      })
   }
   await userModel.updateOne({_id: req.user.id}, {$addToSet:{likedMusics: musicId}});
   res.status(200).json({
      message:"music liked"
   })
  }catch(error){
     serverError(res, "Error liking music", error);
  }
}

async function unlikeMusic(req,res){
  try{
   const {musicId} = req.params;
   if(!mongoose.isValidObjectId(musicId)){
      return res.status(404).json({
         message:"Music not found"
      })
   }
   await userModel.updateOne({_id: req.user.id}, {$pull:{likedMusics: musicId}});
   res.status(200).json({
      message:"music unliked"
   })
  }catch(error){
     serverError(res, "Error unliking music", error);
  }
}

// Loads a song/album and makes sure the logged-in artist owns it; sends 404/403 otherwise
async function findOwned(model, id, userId, res, label){
   const doc = mongoose.isValidObjectId(id) ? await model.findById(id) : null;
   if(!doc){
      res.status(404).json({
         message:`${label} not found`
      })
      return null;
   }
   if(!doc.artist.equals(userId)){
      res.status(403).json({
         message:`you can only change your own ${label.toLowerCase()}s`
      })
      return null;
   }
   return doc;
}




module.exports = {
   createMusic, updateMusic, deleteMusic,
   createAlbum, updateAlbum, deleteAlbum,
   getAllMusics, getAllAlbums, getAlbumById,
   search, getArtist,
   getLikedMusics, likeMusic, unlikeMusic,
   POPULATE_MUSICS,
}
