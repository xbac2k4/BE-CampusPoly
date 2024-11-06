
const ReportTypeService = require("../../services/reportTypeService");
const HttpResponse = require("../../utils/httpResponse");

class ReportTypeController {
    getAllType = async (req, res) => {
        try {
            const data = await new ReportTypeService().getAllType();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = ReportTypeController;
