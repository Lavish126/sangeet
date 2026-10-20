const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({

    albumTitle:{
        type:String,
        required:true
    },
    musics:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"music"
    }],
    artist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    coverUrl:{
        type:String,
    },
    coverFileId:{
        type:String,
    }
})

// ImageKit file ids are internal; keep them out of API responses
albumSchema.set("toJSON", {
  transform(doc, ret){
    delete ret.fileId;
    delete ret.coverFileId;
    return ret;
  }
})

const albumModel = mongoose.model("album",albumSchema);

module.exports = albumModel;
