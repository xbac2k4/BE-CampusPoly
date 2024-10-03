const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/userController');
const Upload = require('../../config/common/upload');

router.post('/login', new UserController().postLogin);

module.exports = router;
