const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const { sendMail } = require('../services/emailService');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
    const content = `
        <h2>Your OTP for verification</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
    `;
    await sendMail(email, 'OTP Verification', content);
};

// Register with OTP
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { fullName, email, password, mobile, country, city } = req.body;

        // const profilePic = req.file ? req.file.filename : null;
        const profilePic = req.file ? req.file.filename : req.body.profilePic;
        if (!profilePic) {
            return res.status(400).json({ success: false, msg: 'Profile image is required.' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: 'User already exists with this email.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Create user (role and status are automatically default)
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            country,
            city,
            profilePic,
            otp,
            otpExpiry
        });

        await user.save();

        // Send OTP email
        await sendOtpEmail(email, otp);

        res.status(201).json({
            success: true,
            msg: 'OTP sent to your email. Please verify to complete registration.',
            data: { email }
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, msg: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ success: false, msg: 'User already verified.' });
        if (user.otp !== otp) return res.status(400).json({ success: false, msg: 'Invalid OTP.' });
        if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, msg: 'OTP has expired.' });

        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            msg: 'Account verified successfully.',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    country: user.country,
                    city: user.city,
                    profilePic: user.profilePic,
                    role: user.role,
                    status: user.status
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, msg: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ success: false, msg: 'User already verified.' });

        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendOtpEmail(email, otp);

        res.status(200).json({ success: true, msg: 'OTP resent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Login
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, msg: 'Invalid credentials.' });
        if (!user.isVerified) return res.status(400).json({ success: false, msg: 'Please verify your email first.' });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ success: false, msg: 'Invalid credentials.' });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            msg: 'Login successful.',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    country: user.country,
                    city: user.city,
                    profilePic: user.profilePic,
                    role: user.role,
                    status: user.status
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'If the email exists, a reset link will be sent.'
            });
        }

        const resetToken = randomstring.generate({ length: 40 });
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const content = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 1 hour.</p>
        `;

        await sendMail(email, 'Password Reset Request', content);

        res.status(200).json({ success: true, msg: 'Password reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ success: false, msg: 'User not found.' });

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch)
            return res.status(400).json({ success: false, msg: 'Current password is incorrect.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, msg: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// Update Profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const allowedFields = [
            "fullName",
            "email",
            "mobile",
            "country",
            "city",
            "profilePic"
        ];

        const updatedData = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updatedData[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            msg: "Profile updated successfully.",
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

module.exports = {
    register,
    verifyOtp,
    resendOtp,
    login,
    forgotPassword,
    changePassword,
    getProfile,
    updateProfile
};
