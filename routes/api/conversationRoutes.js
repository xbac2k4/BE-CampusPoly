const express = require('express');
const router = express.Router();
const ConversationsController = require('../../controllers/api/conversationsController');

router.get('/get-user-conversation/:userId', new ConversationsController().getUserConversations);

module.exports = router;
