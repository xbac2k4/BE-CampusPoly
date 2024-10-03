const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatusModel = new Schema({
    user_status_name: {
        type: String,
    }
});

module.exports = mongoose.model('userstatus', userStatusModel);
