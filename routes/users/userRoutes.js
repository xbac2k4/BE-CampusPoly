const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/userController');
const Upload = require('../../config/common/upload');

router.post('/login', new UserController().postLogin);
router.post('/register', new UserController().postRegister);

module.exports = router;
