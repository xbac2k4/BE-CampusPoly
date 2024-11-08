const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationModel = new Schema({
    is_group: {
        type: Boolean,
        required: true,
        default: false
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
