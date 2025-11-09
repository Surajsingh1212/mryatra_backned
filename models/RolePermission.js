const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    role: {
        type: Number,
        required: true // 0 => Normal User, 1=> Admin, 2 => Sub Admin, 3 => Editor
    },
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
        required: true
    },
    create: {
        type: Boolean,
        default: false
    },
    read: {
        type: Boolean,
        default: false
    },
    update: {
        type: Boolean,
        default: false
    },
    delete: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);