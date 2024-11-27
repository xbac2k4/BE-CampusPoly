const { getUsers, addUser, removeUser } = require("../manager/userManager");

const initializeUserSocket = (io, socket) => {
    // Xử lý sự kiện khi User đăng nhập
    socket.on('user_login', (userInfo) => {
        const { _id: userId } = userInfo; // Giả sử `_id` là định danh duy nhất của user
        console.log(userId);

        // Lưu hoặc cập nhật thông tin người dùng với userId và Socket ID mới
        addUser(userId, socket.id, userInfo);
        // console.log(`${userInfo.full_name} đã đăng nhập với socket ID: ${socket.id}`);

        // Cập nhật danh sách user cho tất cả client
        updateUserList(io);
    });

    socket.on('get_users_online', () => {
        updateUserList(io);
        // console.log('get_users_online');
    });

    socket.on('disconnect', () => {
        updateUserList(io);    // Cập nhật danh sách online
        console.log(`Socket ${socket.id} đã ngắt kết nối.`);
    });

    socket.on('join_post', (postId) => {
        socket.join(postId);
    });

    socket.on('user_like_post', (newLike) => {
        // updateUserList(io);
        console.log('get_user_like_post');
        const { postId } = newLike;
        io.to(postId).emit('get_user_like_post', newLike);
    });

    socket.on('user_comment_post', (newComment) => {
        // updateUserList(io);
        console.log('get_user_comment_post');
        // console.log(newComment);
        const { postId } = newComment;
        io.to(postId).emit('get_user_comment_post', newComment);
    });

    // Hàm để cập nhật danh sách User cho tất cả client
    const updateUserList = (io) => {
        const users = getUsers();
        io.emit('update_user_list', users);
    };
};

module.exports = { initializeUserSocket };
