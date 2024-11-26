const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationModel = new Schema({
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    sentTime: {
        type: Date,
        default: Date.now
    },
    smallIcon: {
        type: String,
        default: 'ic_campus_poly'
    },
    sound: {
        type: String,
        default: 'default'
    },
    type: {
        type: String,
        required: true
    },
    post_id: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('notifications', notificationModel);