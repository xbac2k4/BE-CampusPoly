const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportedPostModel = new Schema({
    post_id: {
        type: Schema.Types.ObjectId, 
        ref: 'post', // Liên kết với bảng 'post'
        required: true
    },
    post_reporter_id: [{
        type: Schema.Types.ObjectId, 
        ref: 'postreporter', 
        required: true
    }],
    report_status_id: {
        type: Schema.Types.ObjectId, ref: 'status',
        required: true,
        default: "67571c815a8315a938d40c97"
    },
    violation_point:{
        type: Number,
        default: 0
    },
    total_reports: {  // Tổng số lượt báo cáo
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('reportedpost', reportedPostModel);
