const User = require("../models/userModel");
const UserService = require("../services/userService");
const HttpResponse = require("../utils/httpResponse");

class UserController {
    userLogin = async (req, res) => {
        const { email, password } = req.body;

        try {
            // Find the user based on the provided email and password
            const data = await User.findOne({ email: email, password: password }).populate('role').populate('');

            if (data) {       
                const userRoles = data.role.map(r => r.role_name);
                
                if (userRoles.includes("Admin")) {
                    // Set the session if the user has the "Admin" role
                    req.session.admin = data;
                    return res.json({ success: true, message: 'Login successful!' });
                } else {
                    // Return an error if the user does not have the "Admin" role
                    return res.json({ success: false, message: 'Access denied. Only users with Admin role can log in.' });
                }
            } else {
                // Return an error if the user is not found
                return res.json({ success: false, message: 'Invalid email or password. Please try again.' });
            }
        } catch (error) {
            // Handle any unexpected errors
            return res.json({ success: false, message: 'An error occurred. Please try again.' });
        }
    };

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
        const { email, password, full_name, sex, role, user_status_id, bio, last_login } = req.body;
        let avatar = file?.filename === undefined ? '' : `${req.protocol}://${req.get("host")}/uploads/${file?.filename}}`;

        try {
            const data = await new UserService().putUser(id, email, password, full_name, sex, role, user_status_id, avatar, bio, last_login);
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
}

module.exports = UserController;
