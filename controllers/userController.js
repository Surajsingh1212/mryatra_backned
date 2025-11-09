const User = require('../models/User');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const { sendMail } = require('../services/emailService');
const { validationResult } = require('express-validator');

// const createUser = async (req, res) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Validation errors',
//                 errors: errors.array()
//             });
//         }

//         const { name, email, role } = req.body;
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'User already exists with this email.'
//             });
//         }
//         const password = randomstring.generate(8);
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({
//             name,
//             email,
//             password: hashedPassword,
//             role: role || 0,
//             isVerified: true 
//         });

//         await user.save();
//         const content = `
//             <h2>Your account has been created</h2>
//             <p>Your login credentials:</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Password:</strong> ${password}</p>
//             <p>Please change your password after first login.</p>
//         `;
//         await sendMail(email, 'Account Created', content);
//         res.status(201).json({
//             success: true,
//             msg: 'User created successfully. Credentials sent to email.',
//             data: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             msg: error.message
//         });
//     }
// };

const createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { name, email, mobile, country, city, role, status } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: 'User already exists with this email.'
            });
        }

        // Generate random password
        const password = randomstring.generate(8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user - map all fields properly
        const user = new User({
            fullName: name, // Map 'name' from request to 'fullName' in database
            email,
            password: hashedPassword,
            mobile: mobile || '',
            country: country || '',
            city: city || '',
            role: role || 0,
            status: status || 'Active',
            isVerified: true
        });

        await user.save();

        // Send email with credentials
        const content = `
            <h2>Your account has been created</h2>
            <p>Your login credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please change your password after first login.</p>
        `;

        await sendMail(email, 'Account Created', content);

        res.status(201).json({
            success: true,
            msg: 'User created successfully. Credentials sent to email.',
            data: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};
// Get All Users (Admin only)
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role } = req.query;

        const filter = { role: { $ne: 1 } };

        const users = await User.find(filter)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

// Get User by ID (Admin only)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

// Update User (Admin only)
const updateUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { name, email, mobile, country, city, role, status, password } = req.body;
        const userId = req.params.id;

        console.log('Update request received:', { userId, body: req.body }); // Add this log

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found.'
            });
        }

        // Build update object - FIX: Use fullName instead of name
        const updateData = {
            fullName: name || user.fullName, // This is the key fix
            email: email || user.email,
            mobile: mobile || user.mobile,
            country: country || user.country,
            city: city || user.city,
            role: role !== undefined ? parseInt(role) : user.role,
            status: status || user.status
        };

        // Handle password update if provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Handle profile picture upload
        if (req.file) {
            updateData.profilePic = req.file.path;
        }

        console.log('Update data:', updateData); // Add this log

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            msg: 'User updated successfully.',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};
// Delete User (Admin only)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Direct delete without auth check (temporary fix)
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found.'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'User deleted successfully.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};
module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};