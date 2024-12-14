const ReportedPostService = require('../../services/reportedPostService');
const HttpResponse = require("../../utils/httpResponse");

class ReportedPostController {
    // Xử lý yêu cầu tạo báo cáo bài viết
    createReport = async (req, res) => {
        const { reported_by_user_id, post_id, report_type_id } = req.body;
    
        console.log("Received data from form-data:", req.body);
    
        if (!reported_by_user_id || !post_id || !report_type_id) {
            return res
                .status(400)
                .json(HttpResponse.fail('All fields (reported_by_user_id, post_id, report_type_id) are required.'));
        }
    
        try {
            const result = await new ReportedPostService().createReport({
                reported_by_user_id,
                post_id,
                report_type_id,
            });
    
            console.log("Service result:", result);
    
            if (result) {
                return res.json(HttpResponse.result(result));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    };
    
    // Lấy tất cả các báo cáo bài viết
    getAllReports = async (req, res) => {
        try {
            const result = await new ReportedPostService().getAllReports();

            if (result) {
                return res.status(200).json(HttpResponse.success(result));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }

    // Lấy báo cáo theo ID
    getReportByID = async (req, res) => {
        const { report_id } = req.params;  // Lấy ID từ URL params

        try {
            const result = await new ReportedPostService().getReportByID(report_id);

            if (result.success) {
                return res.status(200).json(HttpResponse.success(result.data));
            } else {
                return res.status(404).json(HttpResponse.fail(result.message));
            }
        } catch (error) {
            console.error('Error in getReportByIDHandler:', error);
            return res.status(500).json(HttpResponse.error('Internal server error.', error.message));
        }
    }

    // Lấy báo cáo theo phân trang
    getReportsByPage = async (req, res) => {
        const { page, limit, status, totalreporter, totalReporter } = req.query;  // Lấy các tham số từ query string
        try {
            // Gọi service để lấy báo cáo theo trang
            const data = await new ReportedPostService().getReportsByPage(page, limit, status, totalreporter, totalReporter);
            if (data) {
                // Trả về kết quả nếu có dữ liệu
                return res.json(HttpResponse.success(data));
            } else {
                // Trả về lỗi nếu không tìm thấy dữ liệu
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            // Trả về lỗi nếu có lỗi trong quá trình xử lý
            return res.json(HttpResponse.error(error));
        }
    };

    deleteReport = async (req, res) => {
        const { report_id } = req.params; // Lấy report_id từ URL params

        if (!report_id) {
            return res
                .status(400)
                .json(HttpResponse.fail('Report ID is required.'));
        }

        try {
            const result = await new ReportedPostService().deleteReport(report_id);

            if (result.success) {
                return res
                    .status(200)
                    .json(HttpResponse.success(result.data, 'Report deleted successfully.'));
            } else {
                return res
                    .status(404)
                    .json(HttpResponse.fail(result.message || 'Report not found.'));
            }
        } catch (error) {
            console.error('Error in deleteReport:', error);
            return res
                .status(500)
                .json(HttpResponse.error('Internal server error.', error.message));
        }
    };
}

module.exports = ReportedPostController;
