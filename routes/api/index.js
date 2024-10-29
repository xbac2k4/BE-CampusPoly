var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
// Routes
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const likeRoutes = require('./likeRoutes');
const commentRoutes = require('./commentRoutes');
const roleRoutes = require('./roleRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
