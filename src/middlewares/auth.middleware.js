const jwt = require("jsonwebtoken");

async function authArtist(req,res,next){
    const token = req.cookies.token;

    if(!token){
        console.log("token not found")
        return res.status(401).json({
            message:"unauthorized"
        })
    }
    try{
 const decoded =  jwt.verify(token,process.env.JWT_SECRET);

 if(decoded.role != "artist"){
   return res.status(403).json({
    message:"only artists can do this"
   })
 }
 req.user = decoded;

   next()
 
    }
    
    catch(err){
        console.log("Error",err);
        return res.status(401).json({
            message:"unauthorized"
        })
    }
}

async function authUser(req,res,next){
    try{
   const token = req.cookies.token;
   if(!token){
    console.log("token not found")
    return res.status(401).json({
        message:"unauthorized"
    })
   }
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = decoded;

   if(decoded.role !== "user" && decoded.role !== "artist"){
    return res.status(403).json({
        message:"you don't have an access"
    })
   }
   next();
    }catch(error){
        return res.status(401).json({
            message:"unauthorized",
            error:error.message
        })
    }
}
module.exports = {authArtist, authUser}