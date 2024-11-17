var admin = require('./helper');
const User = require('../models/userModel'); // Import model User

const sendNotification = async (title, body, userList) => {
    try {
        // Lấy device_token của những người dùng trong danh sách
        const users = await User.find({ _id: { $in: userList } }).select('device_token');
        const tokens = users.map(user => user.device_token).filter(token => token); // Lọc ra các token hợp lệ
        // console.log('userList: ', userList);


        const result = await admin.messaging().sendEachForMulticast({
            notification: {
                title,
                body,
                imageUrl: 'https://play-lh.googleusercontent.com/DsyWoouXk7psjF7DCG6MJj_rX9RR9-liQskZXoKvcqQIu_ybUm4F5RntxWh1IZAVSLI',
            },
            android: {
                notification: {
                    sound: 'default',
                    icon: 'ic_campus_poly',
                    color: '#211d1e'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default'
                    }
                }
            },
            tokens,
        });
        console.log('Successfully sent message:', result);
        return {
            notification: 'This is a notification'
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
    }
};

const sendOne = async (title, body, token) => {
    try {
        const result = await admin.messaging().send({
            notification: {
                title,
                body,
                imageUrl: 'https://play-lh.googleusercontent.com/DsyWoouXk7psjF7DCG6MJj_rX9RR9-liQskZXoKvcqQIu_ybUm4F5RntxWh1IZAVSLI',
            },
            android: {
                notification: {
                    sound: 'default',
                    icon: 'ic_campus_poly',
                    color: '#211d1e'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default'
                    }
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

module.exports = { sendNotification, sendOne };