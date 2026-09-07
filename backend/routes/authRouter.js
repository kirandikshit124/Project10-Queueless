const path = require('path')
const express = require("express")
const authRouter = express.Router()
const controller = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
authRouter.post("/register", controller.registerUser)
authRouter.post("/login", controller.loginUser)
authRouter.post("/forgot-password", controller.forgotPassword)
authRouter.post("/reset-password/:token", controller.resetPassword)

// Protected routes
authRouter.get("/profile", authMiddleware, controller.getUserProfile)
authRouter.put("/profile", authMiddleware, controller.updateUserProfile)
authRouter.put("/change-password", authMiddleware, controller.changePassword)

module.exports = authRouter;