var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
// Routes
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const likeRoutes = require('./likeRoutes');
const commentRoutes = require('./commentRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api/v1/likes', likeRoutes);
router.use('/api/v1/comments', commentRoutes);

module.exports = router;
