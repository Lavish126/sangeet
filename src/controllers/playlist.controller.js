const mongoose = require("mongoose");
const playlistModel = require("../models/playlist.model");
const musicModel = require("../models/music.model");
const {POPULATE_MUSICS} = require("./music.controller");

// Playlists are private: every route only sees the logged-in user's own playlists
async function findMine(req,res){
    const {playlistId} = req.params;
    const playlist = mongoose.isValidObjectId(playlistId)
        ? await playlistModel.findOne({_id: playlistId, owner: req.user.id})
        : null;
    if(!playlist){
        res.status(404).json({
            message:"Playlist not found"
        })
    }
    return playlist;
}

function serverError(res, message, error){
    return res.status(500).json({
        message,
        error:error.message
    })
}

async function getMyPlaylists(req,res){
    try{
        const playlists = await playlistModel.find({owner: req.user.id}).sort({updatedAt: -1}).select("name musics");
        res.status(200).json({
            message:"Playlists fetched successfully",
            playlists
        })
    }catch(error){
        serverError(res, "Error fetching playlists", error);
    }
}

async function createPlaylist(req,res){
    try{
        const name = req.body.name?.trim();
        if(!name){
            return res.status(400).json({
                message:"name is required"
            })
        }
        const playlist = await playlistModel.create({name, owner: req.user.id, musics: []});
        res.status(201).json({
            message:"Playlist created successfully",
            playlist
        })
    }catch(error){
        serverError(res, "Error creating playlist", error);
    }
}

async function getPlaylist(req,res){
    try{
        const playlist = await findMine(req,res);
        if(!playlist) return;
        await playlist.populate(POPULATE_MUSICS);
        res.status(200).json({
            message:"Playlist fetched successfully",
            playlist
        })
    }catch(error){
        serverError(res, "Error fetching playlist", error);
    }
}

async function renamePlaylist(req,res){
    try{
        const name = req.body.name?.trim();
        if(!name){
            return res.status(400).json({
                message:"name is required"
            })
        }
        const playlist = await findMine(req,res);
        if(!playlist) return;
        playlist.name = name;
        await playlist.save();
        res.status(200).json({
            message:"Playlist renamed successfully",
            playlist
        })
    }catch(error){
        serverError(res, "Error renaming playlist", error);
    }
}

async function deletePlaylist(req,res){
    try{
        const playlist = await findMine(req,res);
        if(!playlist) return;
        await playlistModel.deleteOne({_id: playlist._id});
        res.status(200).json({
            message:"Playlist deleted successfully"
        })
    }catch(error){
        serverError(res, "Error deleting playlist", error);
    }
}

// POST /:playlistId/musics  { musicId }
async function addMusic(req,res){
    try{
        const {musicId} = req.body;
        if(!mongoose.isValidObjectId(musicId) || !(await musicModel.exists({_id: musicId}))){
            return res.status(404).json({
                message:"Music not found"
            })
        }
        const playlist = await findMine(req,res);
        if(!playlist) return;
        await playlistModel.updateOne({_id: playlist._id}, {$addToSet:{musics: musicId}});
        res.status(200).json({
            message:"Music added to playlist"
        })
    }catch(error){
        serverError(res, "Error adding music to playlist", error);
    }
}

async function removeMusic(req,res){
    try{
        const playlist = await findMine(req,res);
        if(!playlist) return;
        if(!mongoose.isValidObjectId(req.params.musicId)){
            return res.status(404).json({
                message:"Music not found"
            })
        }
        await playlistModel.updateOne({_id: playlist._id}, {$pull:{musics: req.params.musicId}});
        res.status(200).json({
            message:"Music removed from playlist"
        })
    }catch(error){
        serverError(res, "Error removing music from playlist", error);
    }
}

module.exports = {getMyPlaylists, createPlaylist, getPlaylist, renamePlaylist, deletePlaylist, addMusic, removeMusic}
