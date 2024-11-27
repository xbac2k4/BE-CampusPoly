var admin = require('./helper');
const User = require('../models/userModel'); // Import model User
const NotificationService = require('../services/notificationService');

const sendNotification = async (title, body, userList, sender_id, type, post_id) => {
    try {
        // Lấy device_token của những người dùng trong danh sách
        const users = await User.find({ _id: { $in: userList } }).select('device_token');
        const tokens = users.map(user => user.device_token).filter(token => token); // Lọc ra các token hợp lệ
        const userIds = users.map(user => user._id.toString()); // Lấy danh sách ID của các user
        const userAvatar = await User.findById(sender_id).select('avatar');

        const imageUrl = userAvatar?.avatar;
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
            await NotificationService.addNotification(sender_id, userId, title, body, imageUrl, new Date(), icon, sound, type, post_id);
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

const sendOne = async (title, body, receiver_id, sender_id, type, post_id) => {
    try {
        // Lấy device_token từ userId
        const user = await User.findById(receiver_id).select('device_token');
        const userAvatar = await User.findById(sender_id).select('avatar');
        // console.log(user);

        if (!user || !user.device_token) {
            throw new Error('User not found or device token is missing');
        }
        const token = user.device_token;

        const imageUrl = userAvatar?.avatar;
        const icon = 'ic_campus_poly';
        const sound = 'default';

        const result = await admin.messaging().send({
            data: {
                type: String(type), // Giá trị chuỗi
                // senderId: String(userId), // Ép `userId` sang chuỗi
                // actions: JSON.stringify([
                //     { action: 'accept', label: 'Chấp nhận' },
                //     { action: 'decline', label: 'Hủy' },
                // ]), // Mảng được chuyển thành chuỗi JSON
            },
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
        await NotificationService.addNotification(sender_id, receiver_id, title, body, imageUrl, new Date(), icon, sound, type, post_id);

        return {
            notification: 'This is a notification'
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
    }
}

const messgaeNotify = async (title, body, receiver_id, sender_id) => {
    try {
        // Lấy device_token từ userId
        const user = await User.findById(receiver_id).select('device_token');
        const userAvatar = await User.findById(sender_id).select('avatar');
        if (!user || !user.device_token) {
            throw new Error('User not found or device token is missing');
        }
        const token = user.device_token;

        const imageUrl = userAvatar?.avatar;
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

        return {
            notification: 'This is a notification'
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
    }
}

module.exports = { sendNotification, sendOne, messgaeNotify };