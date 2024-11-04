const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendModel = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    user_friend_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    status_id: {
        type: Schema.Types.ObjectId,
        ref: 'status',
        required: true
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('friend', friendModel);
