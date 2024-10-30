var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
// Routes
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const reportRoutes = require('./reportRoutes');
const likeRoutes = require('./likeRoutes');
const commentRoutes = require('./commentRoutes');
const roleRoutes = require('./roleRoutes');
const reporttypeRoutes = require('./reportTypeRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api/v1/reports', reportRoutes);
router.use('/api/v1/likes', likeRoutes);
router.use('/api/v1/comments', commentRoutes);
router.use('/api/v1/roles', roleRoutes);
router.use('/api/v1/reporttypes', reporttypeRoutes);

module.exports = router;
