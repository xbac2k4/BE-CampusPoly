const Users = require("../models/userModel");
const UserStatus = require("../models/userStatusModel");
const JWT = require('jsonwebtoken');
const HttpResponse = require("../utils/httpResponse");
const UtilsFunctions = require("../utils/utilsFunction");
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
    register = async (email, password, full_name, sex) => {
        try {
            const existing = await Users.findOne({
                email
            });
            // console.log(existingShowtime);
            if (existing) {
                return HttpResponse.fail(HttpResponse.getErrorMessages('registerEmailExists'));
            }
            const passwordEncryption = await UtilsFunctions.passwordEncryption(password);
            const newUser = new Users({
                email,
                password: password ?? passwordEncryption,
                full_name,
                sex
            });
            const result = await newUser.save();
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('registerSuccess'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('registerFail'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getAllUser = async (req, res) => {
        try {
            const result = await Users.find().populate('user_status_id');
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getUserByPage = async (page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const users = await Users.find().skip(skip).limit(parseInt(limit)).populate('user_status_id');
            const total = await Users.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
            // console.log('data: ', data);
            const data = {
                users,
                totalPages
            }
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getUserByID = async (id) => {
        try {
            const result = await Users.findById(id).populate('user_status_id');
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    putUser = async (id, email, password, full_name, sex, role, user_status_id, avatar, bio, last_login) => {
        try {
            const newUpdate = await Users.findById(id);

            let result = null;
            if (newUpdate) {
                newUpdate.email = email ?? newUpdate.email,
                newUpdate.password = password ?? newUpdate.password,
                newUpdate.full_name = full_name ?? newUpdate.full_name,
                newUpdate.sex = sex ?? newUpdate.sex,
                newUpdate.role = role ?? newUpdate.role,
                newUpdate.user_status_id = user_status_id ?? newUpdate.user_status_id,
                newUpdate.avatar = avatar ?? newUpdate.avatar,
                newUpdate.bio = bio ?? newUpdate.bio,
                newUpdate.last_login = last_login ?? newUpdate.last_login,

                result = await newUpdate.save();
            }
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }

        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    deleteUser = async (id) => {
        try {
            const result = await Users.findByIdAndDelete(id);
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = UserService;