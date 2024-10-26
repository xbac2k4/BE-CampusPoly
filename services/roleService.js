const Role = require("../models/roleModel");
const HttpResponse = require("../utils/httpResponse");

class RoleService {
    getAllRole = async () => {
        try {
            const data = await Role.find();
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = RoleService;