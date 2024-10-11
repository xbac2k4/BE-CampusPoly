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
        type: String,
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
    post_type: {
        type: String, 
        required: true
    },
    is_pinned: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('post', postModel);
