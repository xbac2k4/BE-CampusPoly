const { getUsers, addUser, removeUser } = require("../manager/userManager");

const initializeNotifySocket = (io, socket) => {
    socket.on('send_message', (data) => {
        //         conversation_id: '67205524ad20835d1c1e8161',
        //   sender_id: '673233257d277b9a9a2e4064',
        //   content: '123',
        //   _id: '67349263167e655c185ddfe0',
        //   sent_at: '2024-11-13T11:49:55.041Z',
        //   createdAt: '2024-11-13T11:49:55.041Z',
        //   updatedAt: '2024-11-13T11:49:55.041Z',
        //   __v: 0,
        //   receiver_id: '672dc9dd373315318ce3d646'
        // console.log(data);
        const { _id, conversation_id, sender_id, receiver_id, content, sent_at, createdAt, updatedAt } = data;
        // console.log(data);

        // Lưu tin nhắn vào cơ sở dữ liệu (giả sử MongoDB)
        // saveMessage(sender_id, receiver_id, message);

        // Gửi tin nhắn cho người nhận nếu họ đang online
        const users = getUsers();
        // console.log(users);
        const receiverUser = users.filter((user) => user._id === receiver_id);
        if (receiverUser) {
            // console.log(receiverUser[0]);
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
};

module.exports = { initializeNotifySocket };
