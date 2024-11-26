const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postModel = new Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'user', // Liên kết với bảng 'users'
        required: true
    },
    group_id: {
        type: Schema.Types.ObjectId, 
        ref: 'group', // Liên kết với bảng 'groups'
        default: null // Mặc định là null
    },
    image: {
        type: Array,
        default: null // Mặc định là null
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    hashtag: {
        type: Schema.Types.ObjectId, 
        ref: 'hashtag', // Liên kết với bảng 'hashtags'
        default: null,
    },
    is_pinned: {
        type: Boolean,
        default: false
    },
    like_count: {
        type: Number,
        default: 0
    },
    comment_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});
module.exports = mongoose.model('post', postModel);
