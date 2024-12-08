const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postReporterModel = new Schema({
    reported_by_user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'user', // Liên kết với bảng 'users'
        required: true
    },
    report_type_id: {
        type: Schema.Types.ObjectId, 
        ref: 'reporttype', 
        required: true
    },
    report_post_id: {  // Thêm trường report_post_id để liên kết với bài viết
        type: Schema.Types.ObjectId, 
        ref: 'reportedpost',  // Liên kết với bảng reportedpost
        required: true
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

// Đảm bảo không cho phép báo cáo trùng lặp cho cùng một người dùng và bài viết
postReporterModel.index({ reported_by_user_id: 1, report_post_id: 1 }, { unique: true });

module.exports = mongoose.model('postreporter', postReporterModel);
