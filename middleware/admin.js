const admin = (req, res, next) => {
    if (req.user.role !== 1) {
        return res.status(403).json({
            success: false,
            msg: 'Access denied. Admin only.'
        });
    }
    next();
};

module.exports = admin;