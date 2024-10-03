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
        required: true
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
        type: Number,
        required: true,
        default: 1 // 0: admin, 1: người dùng
    },
    user_status_id: {
        type: Schema.Types.ObjectId, ref: 'userStatus',
        required: true, 
    },
    avatar: {
        type: String,
        default: "avatar"    
    },
    last_login: {
        type: Date
    },
});

module.exports = mongoose.model('users', userModel);
