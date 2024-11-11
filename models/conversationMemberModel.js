const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationMemberModel = new Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: "conversation" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    joined_at: { type: Date, default: Date.now },
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('conversationmember', ConversationMemberModel);
