const express = require('express');
const router = express.Router();
const FriendController = require('../../controllers/api/friendController');

router.get('/get-all-friend', new FriendController().getAllFriend);
router.get('/get-friend-by-userID', new FriendController().getFriendByUserID);
router.post('/add-friend', new FriendController().addFriend);
router.put('/update-friend', new FriendController().updateFriend);
router.delete('/remove-friend', new FriendController().removeFriend);

module.exports = router;
