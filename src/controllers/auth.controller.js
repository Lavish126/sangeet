
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days, same as the JWT expiry

const cookieOptions = {
    httpOnly: true, // JavaScript in the browser can't read the token
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
}

function sendToken(res, user){
    const token = jwt.sign({
        id: user._id,
        role: user.role,
    },process.env.JWT_SECRET,{expiresIn:"7d"})

    res.cookie("token",token,{...cookieOptions, maxAge: TOKEN_MAX_AGE});
}

async function registerUser(req,res){
  try{
    const {userName, email, password, role="user"} = req.body;

    if(!userName || !email || !password){
        return res.status(400).json({
            message:"userName, email and password are required"
        })
    }
    if(!["user","artist"].includes(role)){
        return res.status(400).json({
            message:"role must be either user or artist"
        })
    }

    const isUserAlreadyExist = await userModel.findOne({
      $or: [  //Array
         {userName}, //objects
         {email},

      ]
    })
    if(isUserAlreadyExist){
        return res.status(409).json({
            message:"user Already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10);

     const user = await userModel.create({
        userName,
        email,
        password: hash,
        role
    })

    sendToken(res, user);

    res.status(201).json({
        message:"user registered successfully",
        user:{
            userName: user.userName,
            email: user.email,
            role: user.role,
            id: user._id,
        }
    })
  }catch(error){
    res.status(500).json({
        message:"Error registering user",
        error:error.message
    })
  }
}

async function loginUser(req,res){
  try{
   const {userName,email,password} = req.body;

   if((!userName && !email) || !password){
    return res.status(400).json({
        message:"userName or email, and password are required"
    })
   }

   // Only search by the identifiers that were actually sent
   const user = await userModel.findOne({
    $or:[
        userName && {userName},
        email && {email}
    ].filter(Boolean)
})
    if (!user) {
        return res.status(401).json({
            message:"invalid credentials"
        })
    }

   const isPasswordValid = await bcrypt.compare(
    password,
    user.password
   )

   if(!isPasswordValid){
    return res.status(401).json({
        message:"invalid credentials"
    })
   }

   sendToken(res, user);

   res.status(200).json({
    message:"user logged in successfully",
    user:{
        userName: user.userName,
        email: user.email,
        id: user._id,
        role: user.role
    }

   })
  }catch(error){
    res.status(500).json({
        message:"Error logging in",
        error:error.message
    })
  }
}

async function logoutUser(req,res){
    res.clearCookie("token",cookieOptions)
    res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {registerUser, loginUser, logoutUser}
