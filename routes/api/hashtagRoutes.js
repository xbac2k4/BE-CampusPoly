const express = require('express');
const router = express.Router();
const HashtagController = require('../../controllers/api/hashtagController');

router.get('/get-all-hashtag', new HashtagController().getAllHashtag);
router.get('/get-hashtag-by-id/:id', new HashtagController().getHashtagByID);
router.get('/get-hashtag-by-postID', new HashtagController().getHashtagByPostID);
router.post('/add-hashtag', new HashtagController().addHashtag);
// router.get('/admin-search', new HashtagController().searchPostsAdmin);
module.exports = router;
