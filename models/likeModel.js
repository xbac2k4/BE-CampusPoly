const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeModel = new Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    user_id_like: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('like', likeModel);
