const { ImageKit } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

// file: base64 string, prefix: "music" | "cover"
async function uploadFile(file, prefix = "music"){
    const result =  await ImageKitClient.files.upload({
       file,
       fileName: prefix + "_" + Date.now(),
       folder: prefix === "cover" ? "sangeet/covers" : "sangeet/songs"
     })
     return result;
}

// Removing a file from ImageKit should never break the request that triggered it
async function deleteFile(fileId){
    if(!fileId) return;
    try{
        await ImageKitClient.files.delete(fileId);
    }catch(error){
        console.log("ImageKit delete failed", fileId, error.message);
    }
}

module.exports = {uploadFile, deleteFile}
