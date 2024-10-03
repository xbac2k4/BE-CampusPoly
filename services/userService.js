const Users = require("../models/userModel");
const JWT = require('jsonwebtoken');
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
dotenv.config();
const SECRETKEY = process.env.SECRETKEY

class UserService {
    login = async (email, password) => {
        try {
            const user = await Users.findOne({ email, password })
            if (user) {
                //Token người dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
                const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
                //Khi token hết hạn, người dùng sẽ call 1 api khác để lấy token mới
                //Lúc này người dùng sẽ truyền refreshToken lên để nhận về 1 cặp token,refreshToken mới
                //Nếu cả 2 token đều hết hạn người dùng sẽ phải thoát app và đăng nhập lại
                const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' })
                //expiresIn thời gian token
                return HttpResponse.auth(user, token, refreshToken)
            } else {
                // Nếu thêm không thành công result null, thông báo không thành công
                return HttpResponse.fail(HttpResponse.getErrorMessages('loginFail'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = UserService;