const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        default: 'admin',
    },
    full_name: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    role: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'role'
        }],
        default: ['670c86268cfc1be4b41b180c']  // Default to an array with one ObjectId
    },
    user_status_id: {
        type: Schema.Types.ObjectId, ref: 'status',
        required: true,
        default: "67089cc2862f7badead53eb9"
    },
    avatar: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    background: {
        type: String,
        default: ""
    },
    birthday: {
        type: Date,
        default: null // Hoặc có thể để undefined
    },
    last_login: {
        type: Date,
        default: Date.now()
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('user', userModel);
