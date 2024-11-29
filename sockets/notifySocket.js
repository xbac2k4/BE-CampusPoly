const { getUsers } = require("../manager/userManager");
const { messgaeNotify, sendOne, notifyAddFriend, sendNotification } = require("../notification/Notification");

const initializeNotifySocket = (io, socket) => {
    socket.on('send_message', async (data) => {
        const { _id, conversation_id, sender_id, receiver_id, content, sent_at, createdAt, updatedAt, sender_name } = data;
        const users = getUsers();
        const receiverUser = users.filter((user) => user._id === receiver_id);
        if (receiverUser) {
            await messgaeNotify(sender_name, content, receiver_id, sender_id)
            io.to(receiverUser[0]?.socketId).emit('new_message', {
                conversation_id,
                sender_id,
                content,
                _id,
                sent_at,
                createdAt,
                updatedAt,
                receiver_id
            });
            io.to(receiverUser[0]?.socketId).emit('load_conversation');
        } else {
            // Nếu người nhận không còn online, gửi thông báo đẩy
            // sendPushNotification(receiver_id, message);
        }
    });

    // socket.on('send_notification', (data) => {
    //     const { userId, title, body, imageUrl, icon, sound } = data;
    //     const users = getUsers();
    //     const receiverUser = users.filter((user) => user._id === userId);
    //     if (receiverUser) {
    //         io.to(receiverUser[0]?.socketId).emit('new_notification', {
    //             title,
    //             body,
    //             imageUrl,
    //             icon,
    //             sound
    //         });
    //     }
    // });
    socket.on('send_notify', async (data) => {
        const { receiver_id, body, sender_name, sender_id, type, post_id } = data;
        console.log(data);

        await sendOne(sender_name, body, receiver_id, sender_id, type, post_id)
        socket.emit('load_notification')
        console.log('123');
    });
    socket.on('send_notification_to_multiple', async (data) => {
        const { list_receiver_id, body, sender_name, sender_id, type, post_id } = data;
        console.log(data);
        if (!list_receiver_id || list_receiver_id.length === 0) {
            return console.log('không có bạn bè');
        }
        
        await sendNotification(sender_name, body, list_receiver_id, sender_id, type, post_id)
        socket.emit('load_notification')
    });
};

module.exports = { initializeNotifySocket };
