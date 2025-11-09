const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../helpers/validation');

// Public routes
// router.post('/register', registerValidation, authController.register);
router.post('/register', upload.single('profilePic'), registerValidation, authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.post('/change-password', auth, authController.changePassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;