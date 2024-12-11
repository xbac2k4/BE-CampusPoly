const Notification = require("../models/notificationModel");

const addNotification = (sender_id, receiver_id, title, body, imageUrl, sentTime, smallIcon, sound, type, post_id) => {
    // Add a new notification
    try {
        console.log('adding notification');

        const newNotification = new Notification({
            sender_id,
            receiver_id,
            title,
            body,
            imageUrl,
            sentTime,
            smallIcon,
            sound,
            type,
            post_id,
        });

        const notification = newNotification.save();
        return notification
    } catch (error) {
        console.error('Error adding notification:', error);
        throw new Error('Failed to add notification');
    }
}

const countNotifications = async (receiver_id) => {
    return await Notification.countDocuments({ receiver_id });
};

const deleteOldNotifications = async (receiver_id, limit) => {
    const oldNotifications = await Notification.find({ receiver_id })
        .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tạo tăng dần
        .limit(limit);
    const oldNotificationIds = oldNotifications.map(notification => notification._id);
    await Notification.deleteMany({ _id: { $in: oldNotificationIds } });
};

module.exports = {
    addNotification,
    countNotifications,
    deleteOldNotifications,
};