const express = require('express');
const router = express.Router();
const PostController = require('../../controllers/api/postController');
const upload = require('../../config/common/upload');

router.get('/get-all-post', new PostController().getAllPost);
router.get('/get-post-by-page', new PostController().getPostByPage);
router.get('/get-post-by-id/:id', new PostController().getPostByID);
router.get('/get-post-by-userID', new PostController().getPostByUserID);
router.post('/add-post', upload.array('image'), new PostController().addPost);
router.put('/update-post/:id', upload.array('image'), new PostController().updatePost);
router.delete('/delete-post/:id', new PostController().deletePost);
router.get('/search', new PostController().searchPosts);
module.exports = router;
