const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/api/userController');
const Upload = require('../../config/common/upload');

router.post('/login', new UserController().postLogin);
router.post('/register', new UserController().postRegister);
router.get('/get-all-user', new UserController().getAllUser);
router.get('/get-user-by-page', new UserController().getUserByPage);
router.get('/get-user-by-id/:id', new UserController().getUserByID);
router.put('/update-user/:id', Upload.single('avatar'), new UserController().putUser);
router.delete('/delete-user/:id', new UserController().deleteUser);

module.exports = router;
