var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
const { isAuthenticated } = require('../middlewares/authMiddleware');
const managerRouter = require('./managerRouter');
const UserController = require('../controllers/userController');
//====================== Sử dụng ==========================//
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'LOGIN' });
});
// router.post('/login', new UserController().userLogin);
router.use(['/', '/post', '/user', '/group', '/report', '/login'], isAuthenticated);
router.use("/", managerRouter);

module.exports = router;
