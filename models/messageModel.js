const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageModel = new Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation"
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: {
        type: String,
    },
    viewed: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('message', messageModel);
