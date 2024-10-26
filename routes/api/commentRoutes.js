const express = require('express');
const router = express.Router();
const CommentController = require('../../controllers/api/commentController');

router.get('/get-all-comment', new CommentController().getAllComment);
router.get('/get-comment-by-post', new CommentController().getCommentByPost);
router.post('/add-comment-to-post', new CommentController().addCommentToPost);
router.delete('/remove-comment-from-post/:id', new CommentController().removeCommentFromPost);

module.exports = router;
