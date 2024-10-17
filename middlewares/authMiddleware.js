
// Middleware để kiểm tra xem người dùng đã đăng nhập hay chưa
const isAuthenticated = (req, res, next) => {
    // console.log("check--------------:", req.session);
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (req.cookies && req.cookies.admin) {
        // Nếu cookie tồn tại, chuyển hướng người dùng đến trang chủ
        return res.redirect('/home'); // Đường dẫn trang chủ của bạn
    }
    if (req.session && req.session.admin) {
        // Nếu người dùng đã đăng nhập, cho phép tiếp tục xử lý request
        return next();
    } else {
        // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
        res.redirect('/login');
    }
};

// Middleware để kiểm tra xem người dùng có đủ quyền truy cập không
const isAuthorized = (role) => {
    return (req, res, next) => {
        console.log("check role: ", req.session[role])
        // Kiểm tra xem người dùng có đủ quyền truy cập vào URL bắt đầu bằng role hay không
        if (req.session && req.session[role]) {
            // Nếu người dùng có đủ quyền, kiểm tra xem URL bắt đầu bằng role hay không
            const urlRole = req.originalUrl.split('/')[1];
            if (urlRole === role) {
                // Nếu URL bắt đầu bằng role, cho phép tiếp tục xử lý request
                return next();
            } else {
                // Nếu không, chuyển hướng về trang chính của người dùng hiện tại
                res.redirect(`/${role}`);
            }
        } else {
            // Nếu không có quyền, chuyển hướng về trang chính
            res.redirect('/');
        }
    };
};

// Middleware nếu chưa đăng nhập thì cho đi qua, dùng cho trang login và register
const redirectToHomeIfLoggedIn = (req, res, next) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (req.session.admin) {
        // Nếu đã đăng nhập, chuyển hướng về trang chính
        return res.redirect('/');
    }
    // Nếu chưa đăng nhập, cho phép tiếp tục xử lý middleware tiếp theo
    next();
};

module.exports = {isAuthenticated, redirectToHomeIfLoggedIn, isAuthorized}