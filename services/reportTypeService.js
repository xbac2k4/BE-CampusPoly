const Role = require("../models/reportTypeModel");
const HttpResponse = require("../utils/httpResponse");

class ReportTypeService {
    getAllType = async () => {
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

module.exports = ReportTypeService;