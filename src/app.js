const path = require("path")
const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const multer = require("multer")
const authRoutes = require("./routes/auth.routes")
const musicRoutes = require("./routes/music.routes")
const playlistRoutes = require("./routes/playlist.routes")

const app = express();

// Hosts like Render sit behind a proxy; needed for correct client IPs in rate limiting
app.set("trust proxy", 1);

app.use(helmet({
    contentSecurityPolicy:{
        directives:{
            // songs are streamed from ImageKit
            mediaSrc:["'self'", "https://ik.imagekit.io"],
            // cover images are also hosted on ImageKit
            imgSrc:["'self'", "data:", "https://ik.imagekit.io"],
        }
    }
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/music",musicRoutes);
app.use("/api/playlists",playlistRoutes);

// In production the built React app is served from the same origin as the API
if(process.env.NODE_ENV === "production"){
    const distPath = path.join(__dirname, "..", "frontend", "dist");
    app.use(express.static(distPath));
    // Let React Router handle page routes like /albums/:id
    app.use((req,res,next)=>{
        if(req.method !== "GET" || req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    })
}

app.use((req,res)=>{
    res.status(404).json({
        message:"route not found"
    })
})

// Errors that reach here (bad JSON body, upload errors, ...) are sent back as JSON
app.use((err,req,res,next)=>{
    let status = err.status || err.statusCode || 500;
    if(err instanceof multer.MulterError){
        status = 400;
        if(err.code === "LIMIT_FILE_SIZE") err.message = "file is too large (max 20 MB)";
    }
    if(status === 500) console.log("Error",err);
    res.status(status).json({
        message: status === 500 ? "something went wrong" : err.message
    })
})


module.exports = app;
