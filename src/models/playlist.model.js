const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    musics:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"music"
    }]
},{timestamps:true})

const playlistModel = mongoose.model("playlist",playlistSchema);

module.exports = playlistModel;
