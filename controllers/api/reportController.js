const ReportService = require("../../services/reportService");
const HttpResponse = require("../../utils/httpResponse");

class ReportController {
    // addReport = async (req, res) => {
    //     try {
    //         const { reported_by_user_id, post_id, report_reason } = req.body;
    //         const data = await new ReportService().addReport(reported_by_user_id, post_id, report_reason);
    //         if (data) {
    //             return res.json(HttpResponse.result(data));
    //         } else {
    //             return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return res.json(HttpResponse.error(error));
    //     }
    // };
    addReport = async (req, res, next) => {
        try {
            // Log tất cả dữ liệu trong request (bao gồm cả headers và body)
            console.log("Request Headers:", req.headers);
            console.log("Raw Body:", req.body);
    
            // Kiểm tra nếu body bị trống, log chi tiết hơn
            if (Object.keys(req.body).length === 0) {
                console.log("Body is empty, check Content-Type in Postman or the request structure.");
            }
    
            // Lấy các tham số từ req.body
            const { reported_by_user_id, post_id, report_type_id } = req.body;
    
            // Log body nhận được để kiểm tra
            console.log("Received body:", req.body);
    
            // Kiểm tra dữ liệu trước khi truyền vào service
            if (!reported_by_user_id || !post_id || !report_type_id) {
                return res.status(400).json({ message: "Missing required fields" });
            }
    
            // Log các tham số đã lấy từ body
            console.log("Reported by user ID:", reported_by_user_id);
            console.log("Post ID:", post_id);
            console.log("Report type ID:", report_type_id);
    
            // Gọi service với các tham số đã lấy từ req.body
            const createdReport = await new ReportService().addReport(reported_by_user_id, post_id, report_type_id);
    
            // Kiểm tra xem báo cáo đã được tạo thành công hay chưa
            if (createdReport) {
                return res.json(HttpResponse.result(createdReport));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log("Error in controller:", error);
            return res.json(HttpResponse.error(error));
        }
    };    


    getReportById = async (req, res,) => {
        const { id } = req.params;
        try {
            const data = await new ReportService().getReportById(id);
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

    updateReportStatus = async (req, res) => {
        const { id } = req.params;
        const { report_status_id } = req.body;
        console.log(`Received update status request: id=${id}, status=${report_status_id}`);
        const result = await new ReportService().updateReportStatus(id, report_status_id);
        console.log(`Update result: ${JSON.stringify(result)}`);
        
        return res.status(result.status).json(result.data || { message: result.message });
    };
    

    getAllReport = async (req, res) => {
        try {
            const data = await new ReportService().getAllReport();
            console.log(data);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    };

    deleteReport = async (req, res) => {
         const { id } = req.params  
        try {
            const data = await new ReportService().deleteReport(id);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            return res.json(HttpResponse.error(error));
        }
    };
    getReportsByPage = async (req, res) => {
        const { page, limit } = req.query;
        try {
            const data = await new ReportService().getReportsByPage(page, limit);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    };
    
}

module.exports =  ReportController;
