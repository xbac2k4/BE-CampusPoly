const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationModel = new Schema({
    type: { 
        type: String, 
        required: true 
    },
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'user',
        default: []
    }],
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('conversation', conversationModel);
