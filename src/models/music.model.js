const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
  uri:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true
  },
  artist:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true

  },
  coverUrl:{
    type:String,
  },
  // ImageKit ids, used to delete the files when the song is deleted
  fileId:{
    type:String,
  },
  coverFileId:{
    type:String,
  }
})

// ImageKit file ids are internal; keep them out of API responses
musicSchema.set("toJSON", {
  transform(doc, ret){
    delete ret.fileId;
    delete ret.coverFileId;
    return ret;
  }
})

const musicModel = mongoose.model("music",musicSchema)


module.exports = musicModel;
