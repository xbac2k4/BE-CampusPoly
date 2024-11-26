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

module.exports = {
    addNotification
}