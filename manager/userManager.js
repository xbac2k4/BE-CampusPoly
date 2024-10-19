// driverManager.js

const activeUsers = new Map();

const addUser = (socketId, userInfo) => {
  activeUsers.set(socketId, { ...userInfo, latitude: null, longitude: null, socketId: socketId });
};

// const updateDriverLocation = (socketId, driverId, latitude, longitude) => {
//   const driver = activeDrivers.get(socketId);
//   if (driver) {
//     // Tạo một bản sao của tài xế với thông tin mới
//     const updatedDriver = { ...driver, latitude: latitude, longitude: longitude, status: 'waiting' };
//     // Cập nhật tài xế trong activeDrivers
//     activeDrivers.set(socketId, updatedDriver);
//   }
// };

const removeUser = (userId) => {
  activeUsers.delete(userId);
};
const getUser = (socketId) => {
  return activeUsers.get(socketId);
};

const getUsers = () => {
  return Array.from(activeUsers.values());
};

module.exports = {addUser, removeUser, getUsers, getUser};