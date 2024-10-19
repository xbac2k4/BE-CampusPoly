var express = require('express');
var router = express.Router();

//====================== Khai báo ==========================//
// Routes
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
//====================== Sử dụng ==========================//
//Routes
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/posts', postRoutes);

module.exports = router;
