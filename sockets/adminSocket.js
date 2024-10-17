const initializeAdminSocket = (io, socket) => {
  socket.on('admin_login', () => {
    // const drivers = getDrivers();
    // socket.emit('send_driver_list_from_admin_socket_to_manage_driver_page', drivers);
    
  });

  socket.on('admin_connect_from_manage_customer_page_to_get_customers', () => {
    // const customers = getCustomers();
    // socket.emit('send_customer_list_from_admin_socket_to_manage_customer_page', customers);
  });
};

module.exports = initializeAdminSocket;
