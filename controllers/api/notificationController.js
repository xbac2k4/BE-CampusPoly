const { sendOne } = require('../../notification/Notification');

class NotificationController {
    sendNotificationToUsers = async (req, res) => {
        const { title, body, device_token } = req.body;
        try {
            const result = await sendOne(title, body, device_token);
            return res.json({ success: true, result });
        } catch (error) {
            console.error('Error sending notification:', error);
            return res.status(500).json({ success: false, message: 'Failed to send notification', error });
        }
    }
}

module.exports = new NotificationController();