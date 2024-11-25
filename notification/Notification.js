var admin = require('./helper');
const User = require('../models/userModel'); // Import model User
const NotificationService = require('../services/notificationService');

const sendNotification = async (title, body, userList) => {
    try {
        // Lấy device_token của những người dùng trong danh sách
        const users = await User.find({ _id: { $in: userList } }).select('device_token');
        const tokens = users.map(user => user.device_token).filter(token => token); // Lọc ra các token hợp lệ
        const userIds = users.map(user => user._id.toString()); // Lấy danh sách ID của các user

        const imageUrl = 'https://play-lh.googleusercontent.com/DsyWoouXk7psjF7DCG6MJj_rX9RR9-liQskZXoKvcqQIu_ybUm4F5RntxWh1IZAVSLI';
        const icon = 'ic_campus_poly';
        const sound = 'default';

        const result = await admin.messaging().sendEachForMulticast({
            notification: {
                title,
                body,
                imageUrl
            },
            android: {
                notification: {
                    sound,
                    icon,
                    color: '#211d1e',
                }
            },
            tokens
        });

        console.log('Successfully sent message:', result);

        // Gọi hàm addNotification để lưu thông báo vào cơ sở dữ liệu cho từng userId
        for (const userId of userIds) {
            await NotificationService.addNotification(userId, title, body, imageUrl, new Date(), icon, sound);
        }

        if (result.failureCount > 0) {
            result.responses.forEach((response, idx) => {
                if (!response.success) {
                    console.error(`Error sending message to token ${tokens[idx]}:`, response.error);
                }
            });
        }

        return {
            notification: 'This is a notification',
            
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
    }
};

const sendOne = async (title, body, userId) => {
    try {
        // Lấy device_token từ userId
        const user = await User.findById(userId).select('device_token');
        if (!user || !user.device_token) {
            throw new Error('User not found or device token is missing');
        }
        const token = user.device_token;

        const imageUrl = 'https://play-lh.googleusercontent.com/DsyWoouXk7psjF7DCG6MJj_rX9RR9-liQskZXoKvcqQIu_ybUm4F5RntxWh1IZAVSLI';
        const icon = 'ic_campus_poly';
        const sound = 'default';

        const result = await admin.messaging().send({
            notification: {
                title,
                body,
                imageUrl
            },
            android: {
                notification: {
                    sound,
                    icon,
                    color: '#211d1e'
                }
            },
            token,
        });

        console.log('Successfully sent message:', result);

        // Gọi hàm addNotification để lưu thông báo vào cơ sở dữ liệu
        await NotificationService.addNotification(userId, title, body, imageUrl, new Date(), icon, sound);

        // Phát sự kiện socket để gửi thông báo
        // global.io.to(user.socketId).emit('new_notification', {
        //     title,
        //     body,
        //     imageUrl,
        //     icon,
        //     sound
        // });
        global.io.emit('new_notification', {
            userId,
            title,
            body,
            imageUrl,
            sentTime: new Date(),
            icon,
            sound
        });

        return {
            notification: 'This is a notification'
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
    }
}

module.exports = { sendNotification, sendOne };