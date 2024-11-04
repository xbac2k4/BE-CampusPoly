const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportModel = new Schema({
    reported_by_user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'user', // Liên kết với bảng 'users'
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId, 
        ref: 'post', // Liên kết với bảng 'post'
        required: true
    },
    report_type_id: {
        type: Schema.Types.ObjectId, 
        ref: 'reporttype', // Chắc chắn rằng tên này phải trùng với tên model đã đăng ký
        required: true
    },
    report_status_id: {
        type: Schema.Types.ObjectId, ref: 'status',
        required: true,
        default: "671b72d45b9c34320966d260"
    },
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});
module.exports = mongoose.model('report', reportModel);
