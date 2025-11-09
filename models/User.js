const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    },
    role: {
        type: Number,
        default: 0, // 0 => Normal User, 1=> Admin, 2 => Sub Admin, 3 => Editor
    },
    status: {
        type: String,
        default: 'Active', // Active, Inactive
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);