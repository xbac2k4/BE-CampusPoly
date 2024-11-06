const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupMemberModel = new Schema({
    joined_at: { 
        type: Date, 
        default: Date.now 
    },
    group_id: { 
        type: String, 
        required: true 
    },
    user_id_in_group: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true 
    },
    group_role_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'grouprole',
        required: true
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('groupmember', groupMemberModel);
