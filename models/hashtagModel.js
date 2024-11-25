const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashtagModel = new Schema({
    hashtag_name: {
        type: String, 
        required: true
    },
    hashtag_count: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});
module.exports = mongoose.model('hashtag', hashtagModel);
