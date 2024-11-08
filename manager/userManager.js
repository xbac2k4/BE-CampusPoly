const activeUsers = new Map();

// Hàm thêm người dùng với userId là định danh chính
const addUser = (userId, socketId, userInfo) => {
  // Nếu người dùng đã tồn tại, chỉ cần cập nhật socketId mới
  if (activeUsers.has(userId)) {
    const existingUser = activeUsers.get(userId);
    activeUsers.set(userId, { ...existingUser, socketId });
  } else {
    // Nếu người dùng chưa tồn tại, thêm người dùng mới
    activeUsers.set(userId, { ...userInfo, socketId });
  }
};

const updateUserSocket = (userId, newSocketId) => {
  if (activeUsers.has(userId)) {
    const existingUser = activeUsers.get(userId);
    // Cập nhật socketId mới cho người dùng đã tồn tại
    activeUsers.set(userId, { ...existingUser, socketId: newSocketId });
  } else {
    // Nếu không tìm thấy userId, in ra cảnh báo (để kiểm tra debug)
    console.warn(`User with ID ${userId} not found in active users. Unable to update socket ID.`);
  }
};

// Hàm xóa người dùng khỏi danh sách dựa trên userId
const removeUser = (userId) => {
  activeUsers.delete(userId);
};

// Hàm lấy tất cả người dùng hiện đang hoạt động
const getUsers = () => {
  return Array.from(activeUsers.values());
};

const getUserSocketId = (userId) => {
  const user = activeUsers.get(userId);
  return user ? user.socketId : null;
};

module.exports = { addUser, updateUserSocket, removeUser, getUsers, getUserSocketId };
