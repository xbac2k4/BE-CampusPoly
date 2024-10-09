var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
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
const renderPartial = (partialName) => {
  const partialPath = path.join(__dirname, '../views/partials', `${partialName}.hbs`);
  return fs.readFileSync(partialPath, 'utf8');
};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'LOGIN' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LOGIN' });
});
router.get("/post", function(req, res, next) {
  const content = renderPartial('post');
  res.render('main', { 
      title: 'Bài viết',
      body: content,
  });
});
module.exports = router;
