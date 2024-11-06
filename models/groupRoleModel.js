const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupRoleModel = new Schema({
    role_name: {
        type: String,
        required: true
    }
});

const GroupRoles = mongoose.model('grouprole', groupRoleModel);