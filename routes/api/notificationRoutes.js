const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/api/notificationController');

// Route để gửi thông báo
router.post('/send-notification', NotificationController.sendNotificationToUsers);

module.exports = router;