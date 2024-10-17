var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
const userController = require('../controllers/userController');
// Routes
const userRouter = require('./users/userRoutes');
const postRoutes = require('./posts/postRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/api/v1/users', userRouter);
router.use('/api/v1/posts', postRoutes);

//
const fs = require('fs');
const path = require('path');
const { log } = require('console');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const renderPartial = (partialName) => {
  const partialPath = path.join(__dirname, '../views/partials', `${partialName}.hbs`);
  return fs.readFileSync(partialPath, 'utf8');
};

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LOGIN' });
});
router.use(['/', '/post', '/user', '/group', '/report'], isAuthenticated);
router.get("/", function(req, res, next) {
  const content = renderPartial('post'); // Giả sử bạn có hàm renderPartial để tạo nội dung
  res.render('main', { 
      title: 'Bài viết',
      body: content,
      admin: req.session.admin, // Gửi ID người dùng tới view nếu cần
  });
});
router.use("/post", function(req, res, next) {
  const content = renderPartial('post'); // Giả sử bạn có hàm renderPartial để tạo nội dung
  res.render('main', { 
      title: 'Bài viết',
      body: content,
      admin: req.session.admin, // Gửi ID người dùng tới view nếu cần
  });
});

router.use("/user", function(req, res, next) {
  const content = renderPartial('user');
  res.render('main', { 
      title: 'Người dùng',
      body: content,
  });
});
router.use("/group", function(req, res, next) {
  const content = renderPartial('group');
  res.render('main', { 
      title: 'Nhóm',
      body: content,
  });
});
router.use("/report", function(req, res, next) {
  const content = renderPartial('report');
  res.render('main', { 
      title: 'Báo cáo',
      body: content,
  });
});
module.exports = router;
