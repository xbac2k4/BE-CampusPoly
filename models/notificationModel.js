const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
    }
});

module.exports = mongoose.model('notifications', notificationModel);