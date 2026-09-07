const User = require("../models/User") 
const bcrypt = require("bcryptjs") 
const jwt = require("jsonwebtoken") 
const validator = require("validator") 
const crypto = require("crypto") 
const nodemailer = require("nodemailer") 

const JWT_SECRET = process.env.JWT_SECRET 
const TOKEN_EXPIRES = "4d" 
const createToken = (userId) => {
    return jwt.sign( { userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES }) 
}

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body 
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all fields"
        }) 
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email"
        }) 
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        }) 
    }
    try {
        const existingUser = await User.findOne({ email }) 
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            }) 
        }
        const hashedPassword = await bcrypt.hash(password, 10) 
        const user = await User.create({ name, email, password: hashedPassword}) 
        const token = createToken(user._id) 
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
exports.loginUser = async (req, res) => {
    const { email, password } = req.body 
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all fields"
        })
    }
    try {
        const user = await User.findOne({ email }) 
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const isMatch = await bcrypt.compare( password, user.password ) 
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const token = createToken(user._id) 
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
exports.forgotPassword = async (req, res) => {
    const { email } = req.body 
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email"
        })
    }
    try {
        const user = await User.findOne({ email })
        //  We intentionally return the same response whether the email exists or not. This prevents attackers from discovering which emails are registered.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset link has been sent."
            })
        }
        const resetToken = crypto.randomBytes(32).toString("hex")  // random token
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")  //hash the token
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000  //expires in 15 min
        await user.save()
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        await transporter.sendMail({
            from: `"QueueLess" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "QueueLess - Password Reset",
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Reset Your QueueLess Password</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your QueueLess password.</p>
                    <p>Click the button below to create a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px;">
                        Reset Password
                    </a>
                    <p>This link will expire in 15 minutes.</p>
                    <p> If you did not request this, you can safely ignore this email. </p>
                    <p>— QueueLess Team</p>
                </div>`
        }) 
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent."
        }) 
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request"
        }) 
    }
}
exports.resetPassword = async (req, res) => {
    const { token } = req.params 
    const { newPassword } = req.body 
    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        }) 
    }
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        }) 
    }
    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")   // Hash token received from URL
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }) 
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired"
            }) 
        }
        user.password = await bcrypt.hash(newPassword, 10)   // Hash new password
        user.resetPasswordToken = null  // Clear reset token
        user.resetPasswordExpires = null 
        await user.save() 
        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        }) 
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }) 
    }
}
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("name email role") 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            }) 
        }
        return res.status(200).json({
            success: true,
            user
        }) 
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }) 
    }
}
exports.updateUserProfile = async (req, res) => {
    const { name, email } = req.body 
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid name and email"
        }) 
    }
    try {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id }}) 
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            }) 
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true, select: "name email role" }
        ) 
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        }) 
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }) 
    }
}
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body 
    if (!currentPassword || !newPassword || newPassword.length < 8 ) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid password"
        }) 
    }
    try {
        const user = await User.findById(req.user._id).select("password") 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            }) 
        }
        const isMatch = await bcrypt.compare( currentPassword, user.password ) 
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            }) 
        }
        user.password = await bcrypt.hash( newPassword, 10 )
        await user.save()
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}