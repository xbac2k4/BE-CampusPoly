const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPreferencesModel = new Schema({
    hashtag_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hashtag',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    interaction_score: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true // Kích hoạt tính năng tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('userpreferences', userPreferencesModel);
