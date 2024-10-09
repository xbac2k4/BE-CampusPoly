const express = require('express');
const router = express.Router();
const PostController = require('../../controllers/postController');

router.get('/get-all-post', new PostController().getAllPost);
router.get('/get-post-by-page', new PostController().getPostByPage);

module.exports = router;
