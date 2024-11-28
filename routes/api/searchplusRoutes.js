const express = require('express');
const router = express.Router();
const SearchplusController = require('../../controllers/api/searchplusController');

router.get('/search-plus', new SearchplusController().searchPlus);
router.get('/search-by-hashtag', new SearchplusController().searchPostsByHashtag);
module.exports = router;
