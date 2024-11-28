var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
// Routes
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const hashtagRoutes = require('./hashtagRoutes');
const reportRoutes = require('./reportRoutes');
const likeRoutes = require('./likeRoutes');
const commentRoutes = require('./commentRoutes');
const roleRoutes = require('./roleRoutes');
const groupRoutes = require('./groupRoutes');
const friendRoutes = require('./friendRoutes');
const reporttypeRoutes = require('./reportTypeRoutes');
const conversationRoutes = require('./conversationRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const searchplus = require('./searchplusRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/hashtags', hashtagRoutes);
router.use('/reports', reportRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);
router.use('/roles', roleRoutes);
router.use('/groups', groupRoutes);
router.use('/friends', friendRoutes);
router.use('/reporttypes', reporttypeRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/searchpluss', searchplus);

module.exports = router;
