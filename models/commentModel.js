const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentModel = new Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    user_id_comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    comment_content: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('comment', commentModel);
