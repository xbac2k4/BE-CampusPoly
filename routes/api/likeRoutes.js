const express = require('express');
const router = express.Router();
const LikeController = require('../../controllers/api/likeController');

router.get('/get-all-like', new LikeController().getAllLike);
router.get('/get-like-by-post', new LikeController().getLikeByPost);
router.post('/add-like-to-post', new LikeController().addLikeToPost);
router.delete('/remove-like-from-post', new LikeController().removeLikeFromPost);

module.exports = router;
