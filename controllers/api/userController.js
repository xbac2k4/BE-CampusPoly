const UserService = require("../../services/userService");
const HttpResponse = require("../../utils/httpResponse");

class UserController {
    postLogin = async (req, res) => {
        const { email, password } = req.body;
        // console.log(email, password);

        try {
            const data = await new UserService().login(email, password);

            if (data) {
                // console.log(data);

                // Cập nhật trạng thái người dùng trong MongoDB
                data.status == 200 ? req.session.admin = data : null; // Store user in session
                // req.app.get('io').emit('user-login', data);
                return res.json(HttpResponse.resultAuth(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    postRegister = async (req, res) => {
        const { email, password, full_name, sex, role } = req.body;
        // console.log(res.body);

        try {
            const data = await new UserService().register(email, password, full_name, sex, role);

            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getAllUser = async (req, res) => {
        try {
            const data = await new UserService().getAllUser();
            // console.log('data: ', data);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getUserByPage = async (req, res) => {
        const { page, limit } = req.query;
        try {
            const data = await new UserService().getUserByPage(page, limit);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getUserByID = async (req, res,) => {
        const { id } = req.params;
        try {
            const data = await new UserService().getUserByID(id);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    putUser = async (req, res) => {
        const file = req.file;
        const { id } = req.params;
        const { email, password, full_name, sex, role, user_status_id, bio, last_login, birthday, isVerified } = req.body;
        let avatar = file?.filename === undefined ? undefined : `${req.protocol}://${req.get("host")}/uploads/${file?.filename}`;        

        try {
            const data = await new UserService().putUser(id, email, password, full_name, sex, role, user_status_id, avatar, bio, last_login, birthday, isVerified);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    deleteUser = async (req, res) => {
        const { id } = req.params;
        try {
            const data = await new UserService().deleteUser(id);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    loginWithGoogle = async (req, res) => {
        const user = req.body;
        try {
            const data = await new UserService().loginWithGoogle(user);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = UserController;
