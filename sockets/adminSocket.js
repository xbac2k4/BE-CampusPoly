const { getUsers, addUser } = require("../manager/userManager");

const initializeAdminSocket = (io, socket) => {
  socket.on('admin_login', (adminInfo) => {
      addUser(socket.id, adminInfo);
      // updateDriverList(io);
      // notifyOnlineCustomers(io, driverInfo);
  });
  socket.on('admin_connect_from_manage_user_page_to_get_admins', () => {
    const users = getUsers();
    socket.emit('send_user_list_from_admin_socket_to_manage_user_page', users);
  });

  socket.on('admin_connect_from_manage_customer_page_to_get_customers', () => {
    // const customers = getCustomers();
    // socket.emit('send_customer_list_from_admin_socket_to_manage_customer_page', customers);
  });
};

module.exports = initializeAdminSocket;
