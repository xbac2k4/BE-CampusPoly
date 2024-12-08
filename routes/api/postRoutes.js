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
router.get('/admin-search', new PostController().searchPostsAdmin);
router.get('/get-posts-by-user-interaction', new PostController().getPostsByUserInteraction);
router.get('/get-posts-by-friends', new PostController().getPostByFriends);
router.get('/visible-posts', new PostController().getVisiblePosts);
router.put('/update-block-post/:id', new PostController().updateBlockPost);

module.exports = router;
