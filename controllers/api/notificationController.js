const { sendOne } = require('../../notification/Notification');
const Notification = require('../../models/notificationModel');

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

    getNotificationsByUserId = async (req, res) => {
        const { userId } = req.query;
        console.log(userId);
        
        try {
            const notifications = await Notification.find({ receiver_id: userId });
            return res.json({ success: true, notifications });
        } catch (error) {
            console.error('Error getting notifications:', error);
            return res.status(500).json({ success: false, message: 'Failed to get notifications', error });
        }
    }

    readNotificationById = async (req, res) => {
        const { notificationId } = req.body;
        try {
            const result = await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            return res.json({ success: true, message: 'Đọc tin nhắn thành công', data: result });
        }
        catch (error) {
            console.error('Error reading notification:', error);
            return res.status(500).json({ success: false, message: 'Failed to read notification', error });
        }
    }

    readAllNotification = async (req, res) => {
        const { userId } = req.body;
        try {
            await Notification.updateMany({ userId }, { isRead: true });
            return res.json({ success: true, message: 'Đọc tất cả tin nhắn thành công' });
        } catch (error) {
            console.error('Error reading all notifications:', error);
            return res.status(500).json({ success: false, message: 'Failed to read all notifications', error });
        }
    }
}

module.exports = new NotificationController();