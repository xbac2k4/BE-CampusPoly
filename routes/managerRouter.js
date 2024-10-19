var express = require('express');
const managerRouter = express.Router();

const fs = require('fs');
const path = require('path');
const renderPartial = (partialName) => {
    const partialPath = path.join(__dirname, '../views/partials', `${partialName}.hbs`);
    return fs.readFileSync(partialPath, 'utf8');
};

// Điều hướng cho trang quản lý tài xế của admin
managerRouter.get('/post', (req, res) => {
    const admin = req.session.admin;
    console.log(admin);

    const drivers = [];
    const content = renderPartial('post'); // Giả sử bạn có hàm renderPartial để tạo nội dung
    res.render('main', {
        title: 'Bài viết',
        body: content,
        admin, // Gửi ID người dùng tới view nếu cần
    });
});
managerRouter.use("/user", function (req, res, next) {
    const admin = req.session.admin;
    console.log(admin);

    const drivers = [];
    const content = renderPartial('user');
    res.render('main', {
        title: 'Người dùng',
        body: content,
    });
});
managerRouter.use("/group", function (req, res, next) {
    const admin = req.session.admin;
    console.log(admin);

    const drivers = [];
    const content = renderPartial('group');
    res.render('main', {
        title: 'Nhóm',
        body: content,
    });
});
managerRouter.use("/report", function (req, res, next) {
    const admin = req.session.admin;
    console.log(admin);
    
    const drivers = [];
    const content = renderPartial('report');
    res.render('main', {
        title: 'Báo cáo',
        body: content,
    });
});

// Điều hướng cho trang chính của admin
managerRouter.get('/', (req, res) => {
    const admin = req.session.admin;
    console.log(admin);
    const drivers = [];
    const content = renderPartial('post'); // Giả sử bạn có hàm renderPartial để tạo nội dung
    res.render('main', {
        title: 'Bài viết',
        body: content,
        admin, // Gửi ID người dùng tới view nếu cần
    });
});

module.exports = managerRouter;
