var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/api/index');
const routes = require('./routes/routes.js');

var app = express();

// view engine setup
const exphbs = require('express-handlebars');
//
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'components')));

//======================================================//
// khai báo
const database = require('./config/db');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
// sử dụng
database.connect();
//======================================================//
// Cấu hình session middleware
app.use(session({
  secret: process.env.SECRETKEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Đặt secure: true nếu bạn sử dụng HTTPS
}));
app.use('/api/v1', indexRouter);
app.use('/', routes);
// Cấu hình body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const cron = require('node-cron');
const Users = require('./models/userModel');
const UserService = require('./services/userService');

// cron.schedule('* * * * * *', async () => {
cron.schedule('0 0 * * *', async () => {  // Chạy vào 00:00 mỗi ngày
    try {
        const users = await Users.find({
            user_status_id: '67089ccb862f7badead53eba',
            block_reason: 'violation',
        });
        for (let user of users) {
            await new UserService().checkAndUnblockUser(user._id); // Gọi hàm kiểm tra và mở khóa người dùng
        }
        // console.log('Cron job completed: Checked and unblocked users.');
    } catch (error) {
        console.error('Error running cron job:', error);
    }
});




// socket.js or the main server file
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);
global.io = io; // Lưu io như biến toàn cục

app.set('io', io);
// Import custom socket logic
const { addUser, removeUser, getUsers, updateUserSocket, getUserSocketId } = require('./manager/userManager');
const { initializeUserSocket } = require('./sockets/userSocket.js');
const { initializeNotifySocket } = require('./sockets/notifySocket.js');

// Hàm chỉ để lấy ra _id và socketId và in ra log
const logOnlineUsers = () => {
  const users = getUsers();
  const userLog = users.map(user => ({ userId: user._id, socketId: user.socketId }));
  // console.log('Current online users:', userLog);
};

// Handle connection event
io.on('connection', (socket) => {
  // console.log('A user connected:', socket.id);
  // console.log('Danh sách online khi admin chưa đăng nhập:');
  logOnlineUsers(); // Log danh sách người dùng hiện tại
  initializeUserSocket(io, socket);
  initializeNotifySocket(io, socket);
  // Handle admin login
  socket.on('admin_login', (userData) => {
    const { _id: userId } = userData;

    // Thêm hoặc cập nhật người dùng dựa trên `_id` và socketId
    addUser(userId, socket.id, userData);
    console.log(`${userData.full_name} is now online with socket ID: ${socket.id} and user ID: ${userId}`);

    // Notify all clients about the user login
    // io.emit('user-login-notification', {
    //   message: `${userData.full_name} has logged in.`,
    //   userId,
    // });

    // Log danh sách người dùng hiện tại
    console.log('Danh sách online sau khi admin đã đăng nhập:');
    logOnlineUsers();
  });

  // mobile socket đăng nhập
  // addUser

  // Handle cập nhật socket khi người dùng đã đăng nhập
  socket.on('update_socket', (userData) => {
    const { _id: userId } = userData;

    // Chỉ cập nhật socketId mới cho userId đã tồn tại
    updateUserSocket(userId, socket.id);
    console.log(`Updated socket ID for user with user ID: ${userId} to new socket ID: ${socket.id}`);
    console.log('Danh sách online sau khi admin đã đăng nhập và reload lại trang:');
    logOnlineUsers();
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    // Tìm userId dựa trên socketId
    const users = getUsers();
    let disconnectedUserId = null;

    // Kiểm tra xem socketId nào tương ứng với user
    for (const user of users) {
      if (user.socketId === socket.id) {
        disconnectedUserId = user._id;
        break;
      }
    }

    if (disconnectedUserId) {
      // Đặt timeout để chờ xem người dùng có kết nối lại không
      setTimeout(() => {
        // Sử dụng getUser từ userManager để kiểm tra thông tin người dùng
        const user = getUsers().find(user => user._id === disconnectedUserId);
        // Nếu socketId của người dùng không phải là socket ID mới, nghĩa là họ đã thực sự ngắt kết nối
        if (!user || user.socketId === socket.id) {
          // Xóa người dùng khỏi danh sách dựa trên _id
          removeUser(disconnectedUserId);
          console.log(`User with userId ${disconnectedUserId} has disconnected.`);

          // Notify all clients about the user disconnect
          io.emit('user-offline', {
            userId: disconnectedUserId,
          });

          // Log danh sách người dùng hiện tại
          // console.log('Current users online:');
          logOnlineUsers();
        }
      }, 2000);
    }
  });
});
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
