const User = require("../models/userModel");
const UserService = require("../services/userService");
const HttpResponse = require("../utils/httpResponse");

class UserController {
    postLogin = async (req, res) => {
        const { email, password } = req.body;
        // console.log(email, password);
        
        try {
            const data = await new UserService().login(email, password);
            
            if (data) {
                return res.json(HttpResponse.resultAuth(data));
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
