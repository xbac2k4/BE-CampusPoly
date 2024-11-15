const express = require('express');
const router = express.Router();
const ConversationsController = require('../../controllers/api/conversationsController');
const MessageController = require('../../controllers/api/messageController');

router.get('/get-message-by-conversation/:conversationID', new MessageController().getMessageByConversation);
router.post('/add-message', new MessageController().addMessage);

module.exports = router;
