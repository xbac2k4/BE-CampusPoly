const Users = require("../models/userModel");
const status = require("../models/statusModel");
const Role = require("../models/roleModel");
const JWT = require('jsonwebtoken');
const HttpResponse = require("../utils/httpResponse");
const UtilsFunctions = require("../utils/utilsFunction");
const dotenv = require('dotenv');
const transporter = require("../config/common/mail");
const nodemailer = require("nodemailer");
const Friend = require("../models/friendModel");
dotenv.config();
const SECRETKEY = process.env.SECRETKEY

class UserService {
    login = async (email, password) => {
        try {
            const user = await Users.findOne({ email, password }).populate('user_status_id').populate('role');
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
    // register = async (email, password, full_name, sex, role) => {
    //     try {
    //         const existing = await Users.findOne({
    //             email
    //         });
    //         // console.log(existingShowtime);
    //         if (existing) {
    //             return HttpResponse.fail(HttpResponse.getErrorMessages('registerEmailExists'));
    //         }
    //         const passwordEncryption = await UtilsFunctions.passwordEncryption(password);
    //         const newUser = new Users({
    //             email,
    //             password: password ?? passwordEncryption,
    //             full_name,
    //             sex,
    //             role
    //         });
    //         const result = await newUser.save();
    //         if (result) {
    //             return HttpResponse.success(result, HttpResponse.getErrorMessages('registerSuccess'));
    //         } else {
    //             return HttpResponse.fail(HttpResponse.getErrorMessages('registerFail'));
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return HttpResponse.error(error);
    //     }
    // }
    register = async (email, password, full_name, sex, role) => {
        try {
            // Kiểm tra xem email đã tồn tại chưa
            const existing = await Users.findOne({ email });
            if (existing) {
                return HttpResponse.fail(HttpResponse.getErrorMessages('registerEmailExists'));
            }

            // Mã hóa mật khẩu
            const passwordEncryption = await UtilsFunctions.passwordEncryption(password);

            // Tạo mã xác thực ngẫu nhiên
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Tạo người dùng mới
            const newUser = new Users({
                email,
                password: passwordEncryption,
                full_name,
                sex,
                role,
                verificationCode, // Thêm mã xác thực vào cơ sở dữ liệu
                isVerified: false  // Giả sử có thêm cờ xác thực tài khoản
            });

            // Lưu người dùng vào cơ sở dữ liệu
            const result = await newUser.save();

            if (result) {
                // Cấu hình nội dung email xác nhận
                const mailOptions = {
                    from: {
                        name: 'CampusPoly',
                        address: process.env.EMAIL
                    },
                    to: email,
                    subject: 'Xác nhận đăng ký tài khoản',
                    html: `
                        <div style="white-space: pre-line;">
                            Xin chào <strong>${full_name}</strong>,

                            Cảm ơn bạn đã đăng ký tài khoản. Mã xác thực của bạn là: <strong>${verificationCode}</strong>.
                            Vui lòng nhập mã này để kích hoạt tài khoản của bạn.

                            Trân trọng!
                        </div>
                    `,
                };

                // Gửi email
                await transporter.sendMail(mailOptions);

                // Phản hồi thành công
                return HttpResponse.success({ result, verificationCode }, HttpResponse.getErrorMessages('registerSuccess'));
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
            // Tìm tất cả người dùng và đính kèm thông tin về trạng thái và vai trò
            const users = await Users.find().populate('user_status_id', '-_id').populate('role');

            // Tạo một mảng để chứa thông tin người dùng và bạn bè của họ
            const usersWithFriends = await Promise.all(users.map(async (user) => {
                // Tìm danh sách bạn bè cho từng người dùng
                const friends = await Friend.find({ user_id: user._id })
                    .select('user_friend_id status_id')
                    .populate('status_id', 'status_name -_id') // Chỉ lấy các trường cần thiết
                    .populate('user_friend_id', 'full_name avatar');
                return {
                    ...user.toObject(), // Chuyển đổi đối tượng mongoose thành đối tượng thuần
                    friends // Thêm danh sách bạn bè vào đối tượng người dùng
                };
            }));

            // console.log(usersWithFriends);

            if (usersWithFriends.length > 0) {
                return HttpResponse.success(usersWithFriends, HttpResponse.getErrorMessages('success'));
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
            const users = await Users.find().skip(skip).limit(parseInt(limit)).populate('user_status_id', '-_id').populate('role');
            const total = await Users.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
            // console.log('data: ', data);
            // const data = {
            //     users,
            //     totalPages
            // }
            const userData = await Promise.all(users.map(async (user) => {
                // Tìm danh sách bạn bè cho từng người dùng
                const friends = await Friend.find({ user_id: user._id })
                    .select('user_friend_id status_id')
                    .populate('status_id', 'status_name -_id') // Chỉ lấy các trường cần thiết
                    .populate('user_friend_id', 'full_name avatar');
                return {
                    ...user.toObject(), // Chuyển đổi đối tượng mongoose thành đối tượng thuần
                    friends,
                    // Thêm danh sách bạn bè vào đối tượng người dùng
                };
            }));

            // console.log(userData);

            if (userData.length > 0) {
                return HttpResponse.success({ userData, totalPages }, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
            // return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getUserByID = async (id) => {
        try {
            // Tìm người dùng theo ID và populate các trường liên quan
            const user = await Users.findById(id)
                .populate('user_status_id')
                .populate('role');

            if (!user) {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }

            // Tìm danh sách bạn bè của người dùng
            const friends = await Friend.find({ user_id: user._id })
                .select('user_friend_id status_id')
                .populate('status_id', 'status_name -_id') // Chỉ lấy các trường cần thiết
                .populate('user_friend_id', 'full_name avatar');

            // Tạo đối tượng người dùng kèm danh sách bạn bè
            const userData = {
                ...user.toObject(), // Chuyển đổi đối tượng mongoose thành đối tượng thuần
                friends, // Thêm danh sách bạn bè vào đối tượng người dùng
            };

            return HttpResponse.success(userData, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    putUser = async (id, email, password, full_name, sex, role, user_status_id, avatar, background, bio, last_login, birthday, isVerified) => {
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
                    newUpdate.avatar = !avatar ? newUpdate.avatar : avatar,
                    newUpdate.background = !background ? newUpdate.background : background,
                    newUpdate.bio = bio ?? newUpdate.bio,
                    newUpdate.last_login = last_login ?? newUpdate.last_login,
                    newUpdate.birthday = birthday ?? newUpdate.birthday,
                    newUpdate.isVerified = isVerified ?? newUpdate.isVerified;

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
    // loginWithGoogle = async (user) => {
    //     try {
    //         // Gọi Google People API để lấy thêm thông tin ngày sinh và giới tính
    //         const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=genders,birthdays', {
    //             headers: {
    //                 Authorization: `Bearer ${user.accessToken}`, // Gửi accessToken
    //             },
    //         });
    //         const data = await response.json();
    //         const birthday = await data.birthdays;
    //         const gender = await data.genders;
    //         console.log(user);

    //         console.log('Ngày sinh:', birthday[0].date);
    //         console.log('Giới tính:', gender[0].value);
    //         console.log('Access Token:', user.accessToken);

    //         // Trả về thông tin người dùng
    //         const { accessToken, ...userWithoutToken } = user;

    //         let result;

    //         const existingUser = await Users.findOne({ email: user.email });
    //         if (existingUser) {
    //             result = await Users.findByIdAndUpdate(existingUser._id, {
    //                 // ...userWithoutToken,
    //                 // birthday: `${birthday[0].date.day}-${birthday[0].date.month}-${birthday[0].date.year}`,
    //                 // sex: gender[0].value,
    //                 ...existingUser,
    //                 last_login: Date.now()
    //             })
    //         } else {
    //             const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    //             const newUser = new Users({
    //                 ...userWithoutToken,
    //                 birthday: UtilsFunctions.convertStringToISODate(`${birthday[0].date.day}-${birthday[0].date.month}-${birthday[0].date.year}`),
    //                 sex: gender[0].value,
    //             });

    //             result = await newUser.save();
    //             // if (result) {
    //             //     const mailOptions = {
    //             //         from: {
    //             //             name: 'CampusPoly',
    //             //             address: process.env.EMAIL
    //             //         },
    //             //         to: user.email,
    //             //         subject: 'Xác nhận đăng ký tài khoản',
    //             //         html: `
    //             //             <div style="white-space: pre-line;">
    //             //                 Xin chào <strong>${user.full_name}</strong>,

    //             //                 Cảm ơn bạn đã đăng ký tài khoản. Mã xác thực của bạn là: <strong>${verificationCode}</strong>.
    //             //                 Vui lòng nhập mã này để kích hoạt tài khoản của bạn.

    //             //                 Trân trọng!
    //             //             </div>
    //             //         `,
    //             //     };

    //             //     // Gửi email
    //             //     await transporter.sendMail(mailOptions);

    //             //     result = {
    //             //         user: result,
    //             //         verificationCode
    //             //     }
    //             // }
    //         }
    //         // console.log(result);

    //         if (result) {
    //             return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
    //         } else {
    //             return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return HttpResponse.error(error);
    //     }
    // }
    loginWithGoogle = async (user) => {
        try {
            // Gọi Google People API để lấy thêm thông tin ngày sinh và giới tính
            const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=genders,birthdays', {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`, // Gửi accessToken
                },
            });
            const data = await response.json();
            const birthdayData = data.birthdays;
            const genderData = data.genders;
            console.log(data);

            // Kiểm tra và lấy ngày sinh
            let birthday;
            if (birthdayData && birthdayData[0] && birthdayData[0].date) {
                const { day, month, year } = birthdayData[0].date;
                birthday = new Date(year, month - 1, day); // Tháng - 1 vì Date của JS bắt đầu từ 0
            }

            const gender = genderData && genderData[0] && genderData[0].value !== 'unspecified' ? genderData[0].value : 'other';

            console.log('Ngày sinh:', birthday);
            console.log('Giới tính:', gender);
            console.log('Access Token:', user.accessToken);

            const { accessToken, ...userWithoutToken } = user;
            let result;

            // Kiểm tra nếu người dùng đã tồn tại
            const existingUser = await Users.findOne({ email: user.email });
            if (existingUser) {
                result = await Users.findByIdAndUpdate(existingUser._id, {
                    ...existingUser,
                    last_login: Date.now(),
                });
            } else {
                const newUser = new Users({
                    ...userWithoutToken,
                    birthday, // Sử dụng giá trị Date hợp lệ cho birthday
                    sex: gender,
                });
                console.log(newUser);


                result = await newUser.save();
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
}

module.exports = UserService;