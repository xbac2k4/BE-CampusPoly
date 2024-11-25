const Notification = require("../models/notificationModel");

const addNotification = (userId, title, body, imageUrl, sentTime, smallIcon, sound) => {
    // Add a new notification
    try {
        console.log('adding notification');
        
        const newNotification = new Notification({
            userId,
            title,
            body,
            imageUrl,
            sentTime,
            smallIcon,
            sound
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