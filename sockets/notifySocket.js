const { getUsers } = require("../manager/userManager");

const initializeNotifySocket = (io, socket) => {
    socket.on('send_message', (data) => {
        const { _id, conversation_id, sender_id, receiver_id, content, sent_at, createdAt, updatedAt } = data;
        const users = getUsers();
        const receiverUser = users.filter((user) => user._id === receiver_id);
        if (receiverUser) {
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
            sendPushNotification(receiver_id, message);
        }
    });

    socket.on('send_notification', (data) => {
        const { userId, title, body, imageUrl, icon, sound } = data;
        const users = getUsers();
        const receiverUser = users.filter((user) => user._id === userId);
        if (receiverUser) {
            io.to(receiverUser[0]?.socketId).emit('new_notification', {
                title,
                body,
                imageUrl,
                icon,
                sound
            });
        }
    });
};

module.exports = { initializeNotifySocket };
