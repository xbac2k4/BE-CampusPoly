const { getUsers, addUser, removeUser } = require("../manager/userManager");

const initializeAdminSocket = (io, socket) => {
  // Xử lý sự kiện khi admin đăng nhập
  socket.on('admin_login', (adminInfo) => {
    const { _id: userId } = adminInfo; // Giả sử `_id` là định danh duy nhất của admin

    // Lưu hoặc cập nhật thông tin người dùng với userId và Socket ID mới
    addUser(userId, socket.id, adminInfo);
    console.log(`${adminInfo.full_name} đã đăng nhập với socket ID: ${socket.id}`);

    // Cập nhật danh sách admin cho tất cả client
    updateAdminList(io);
  });

  // Cập nhật danh sách admin khi kết nối hoặc ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`Socket ID ${socket.id} đã ngắt kết nối`);

    // Tìm userId tương ứng với socketId đã ngắt kết nối và xóa người dùng đó
    const users = getUsers();
    const disconnectedUser = users.find(user => user.socketId === socket.id);

    if (disconnectedUser) {
      removeUser(disconnectedUser._id); // Xóa người dùng dựa trên userId
      console.log(`${disconnectedUser.full_name} đã bị xóa khỏi danh sách online.`);
    }

    // Cập nhật danh sách admin sau khi ngắt kết nối
    updateAdminList(io);
  });

  // Hàm để cập nhật danh sách admin cho tất cả client
  const updateAdminList = (io) => {
    const users = getUsers();
    io.emit('update_user_list', users);
  };
};

module.exports = { initializeAdminSocket };
