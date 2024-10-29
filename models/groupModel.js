const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupModel = new Schema({
    group_name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    },
    background_image: {
        type: String,
        default: ""
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
    },
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'user',
        default: []
    }],
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('group', groupModel);
