const { sendOne } = require('../../notification/Notification');

class NotificationController {
    sendNotificationToUsers = async (req, res) => {
        const { title, body, userId } = req.body;
        try {
            const result = await sendOne(title, body, userId);
            return res.json({ success: true, result });
        } catch (error) {
            console.error('Error sending notification:', error);
            return res.status(500).json({ success: false, message: 'Failed to send notification', error });
        }
    }
}

module.exports = new NotificationController();