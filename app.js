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
app.use(express.urlencoded({ extended: false }));
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
app.use('/', indexRouter);
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

// socket.js or the main server file
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);

app.set('io', io);
// Socket.IO server-side
const { initializeAdminSocket } = require('./sockets/adminSocket.js');
//
// A simple in-memory object to store online users
const onlineUsers = {};

io.on('connection', (socket) => {
    // When a user logs in or connects, store their status
    // socket.on('user-login', (user) => {
    //     // Store the user as online
    //     onlineUsers[user.id] = { user, socketId: socket.id };
    //     console.log(`${user.full_name} is now online`);

    //     // Notify other users that this user is online
    //     socket.broadcast.emit('user-online', { userId: user.id });
    //     socket.emit('redirect', '/post');  // Emit an event to trigger redirect on the client side
    // });

    initializeAdminSocket(io, socket);

    // When the user disconnects
    socket.on('disconnect', () => {
        // Find the user by their socket ID and mark them as offline
        for (const userId in onlineUsers) {
            if (onlineUsers[userId].socketId === socket.id) {
                console.log(`${onlineUsers[userId].user.full_name} has gone offline`);
                
                // Notify others that the user is now offline
                socket.broadcast.emit('user-offline', { userId });

                // Remove the user from the online users list
                delete onlineUsers[userId];
                break;
            }
        }
    });
});

//
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
