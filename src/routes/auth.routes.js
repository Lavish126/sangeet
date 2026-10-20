const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Slow down password guessing and mass sign-ups: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {message:"too many attempts, please try again later"},
})

router.post("/register",authLimiter,authController.registerUser);
router.post("/login",authLimiter,authController.loginUser)
router.post("/logout",authController.logoutUser)


module.exports = router;
