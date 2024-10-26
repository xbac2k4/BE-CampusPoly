
const RoleService = require("../../services/roleService");
const HttpResponse = require("../../utils/httpResponse");

class RoleController {
    getAllRole = async (req, res) => {
        try {
            const data = await new RoleService().getAllRole();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = RoleController;
