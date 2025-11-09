const RolePermission = require('../models/RolePermission');
const Permission = require('../models/Permission');

const checkPermission = (permissionSlug, action) => {
    return async (req, res, next) => {
        try {
            // Admin has all permissions
            if (req.user.role === 1) {
                return next();
            }

            const permission = await Permission.findOne({ slug: permissionSlug });
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    msg: 'Permission not found.'
                });
            }

            const rolePermission = await RolePermission.findOne({
                role: req.user.role,
                permission: permission._id
            });

            if (!rolePermission || !rolePermission[action]) {
                return res.status(403).json({
                    success: false,
                    msg: 'Access denied. Insufficient permissions.'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: 'Server error while checking permissions.'
            });
        }
    };
};

module.exports = checkPermission;