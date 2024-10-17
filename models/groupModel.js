const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupModel = new Schema({
    group_name: {
        type: String,
        required: true
    },
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    description: {
        type: String,
        required: false
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('group', groupModel);
