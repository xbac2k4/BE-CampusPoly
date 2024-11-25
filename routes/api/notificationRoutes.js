const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/api/notificationController');

// Route để gửi thông báo
router.post('/send-notification', NotificationController.sendNotificationToUsers);

router.get('/get-notifications-by-user-id', NotificationController.getNotificationsByUserId);

// dã đọc thông báo theo id
router.put('/read-notification', NotificationController.readNotificationById);

// đọc tất cả thông báo
router.put('/read-all-notification', NotificationController.readAllNotification);

module.exports = router;