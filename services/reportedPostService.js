const PostReporter = require("../models/postReporterModel");
const ReportedPost = require("../models/reportedPostModel");
const ReportType = require("../models/reportTypeModel");
const Post = require("../models/postModel");
const PostService = require("./postService");
const HttpResponse = require("../utils/httpResponse");

class ReportedPostService {
    // Tạo báo cáo bài viết
    createReport = async ({ reported_by_user_id, post_id, report_type_id }) => {
        try {
            console.log("Creating report with data:", { reported_by_user_id, post_id, report_type_id });

            // Kiểm tra xem báo cáo đã tồn tại chưa
            const existingReport = await PostReporter.findOne({
                reported_by_user_id,
                report_post_id: post_id,
            });

            if (existingReport) {
                console.log("Existing report found:", existingReport);
                return HttpResponse.fail('Bạn đã báo cáo bài viết này, không thể báo cáo lại.');
            }

            if (!post_id) {
                return HttpResponse.fail('Báo cáo bài viết không hợp lệ.');
            }
            const reportType = await ReportType.findById(report_type_id);
            const violationPoint = reportType.violation_point;
            console.log("Violation point:", violationPoint);

            // Tạo bản ghi trong PostReporter
            const newReport = new PostReporter({
                reported_by_user_id,
                report_type_id,
                report_post_id: post_id,
            });
            await newReport.save();
            console.log("New report created:", newReport);

            // Kiểm tra hoặc tạo mới ReportedPost
            let reportedPost = await ReportedPost.findOne({ post_id });
            if (!reportedPost) {
                // Nếu không có ReportedPost, tạo mới
                reportedPost = new ReportedPost({
                    post_id,
                    post_reporter_id: [newReport._id], // Lưu mảng các ID người báo cáo
                    violation_point: violationPoint,
                    total_reports: 0,
                });
            } else {
                // Nếu có ReportedPost, tăng số báo cáo và điểm vi phạm
                reportedPost.post_reporter_id.push(newReport._id);
                // Chỉ tăng violation_point khi vi phạm thực sự xảy ra
                reportedPost.violation_point += violationPoint;
                // Kiểm tra nếu violation_point >= 10 thì thay đổi trạng thái
                if (reportedPost.violation_point >= 20) {
                    // ID của trạng thái mới
                    const newStatusId = '675437f55efa7f0643e94b29'; // Đảm bảo ID đúng
                    reportedPost.report_status_id = newStatusId;
                    // Gọi PostService để cập nhật trạng thái is_blocked
                    await new PostService().blockPost(post_id);
                    console.log(`Post with ID ${post_id} is now blocked.`); 
                    reportedPost.total_reports++;
                    // if( reportedPost.total_reports >= 2){
                    //     const post = await Post.findById(post_id); // Lấy thông tin bài viết
                    //     if (post) {
                    //         // Gọi hàm deletePost từ PostService để xóa bài viết
                    //         await new PostService().deletePost(post_id, post.user_id, 'Admin');
                    //         console.log(`Post is now deleted due to multiple reports.`);
                    //     }
                    // }
                }
            }

            // Lưu lại cập nhật
            await reportedPost.save();
            console.log("Updated reported post:", reportedPost);
            if( reportedPost.total_reports >= 2){
                const post = await Post.findById(post_id); // Lấy thông tin bài viết
                if (post) {
                    // Gọi hàm deletePost từ PostService để xóa bài viết
                    await new PostService().deletePost(post_id, post.user_id, 'Admin');
                    console.log(`Post is now deleted due to multiple reports.`);
                }
            }
            return HttpResponse.success('Report submitted successfully.', {
                report_id: newReport._id,
                post_id,
            });
        } catch (error) {
            console.error('Error creating report:', error);
            return HttpResponse.error('Error creating report.', error.message);
        }
    };

    // Lấy tất cả các báo cáo bài viết
    getAllReports = async () => {
        try {
            const reports = await ReportedPost.find()
                .populate({
                    path: "post_reporter_id", // Populate tất cả các người báo cáo
                    populate: {
                        path: "reported_by_user_id", // Lấy thông tin người báo cáo
                        select: "full_name avatar",
                    },
                })
                .populate("post_id", "title content") // Lấy thông tin bài viết bị báo cáo
                .populate("report_status_id", "status_name") // Lấy trạng thái báo cáo
                .exec();

            if (!reports || reports.length === 0) {
                return HttpResponse.fail("No reports found");
            }

            return HttpResponse.success({ reports }, "Reports fetched successfully");
        } catch (error) {
            console.error("Error fetching reports:", error);
            return HttpResponse.error("Error fetching reports", error.message);
        }
    };

    // Lấy báo cáo theo ID (ID của báo cáo)
    getReportByID = async (report_id) => {
        try {
            const report = await ReportedPost.findById(report_id)
                .populate({
                    path: "post_reporter_id",
                    populate: {
                        path: "reported_by_user_id", // Lấy thông tin người báo cáo
                        select: "full_name avatar",
                    },
                })
                .populate("post_id", "title content") // Lấy thông tin bài viết bị báo cáo
                .populate("report_status_id", "status_name") // Lấy trạng thái báo cáo
                .exec();

            if (!report) {
                return HttpResponse.fail("Report not found");
            }

            return HttpResponse.success({ report }, "Report fetched successfully");
        } catch (error) {
            console.error("Error fetching report by ID:", error);
            return HttpResponse.error("Error fetching report by ID", error.message);
        }
    };

    // Lấy báo cáo bài viết theo phân trang
    getReportsByPage = async (page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Lấy các báo cáo bài viết với phân trang
            const reports = await ReportedPost.find()
                .skip(skip) // Phân trang
                .limit(parseInt(limit)) // Giới hạn số báo cáo trên mỗi trang
                .populate({
                    path: "post_id",
                    select: "title content",
                    populate: {
                        path: "user_id",
                        select: "full_name",
                    },
                })
                .populate("report_status_id", "status_name") // Lấy trạng thái báo cáo
                .lean(); // Chuyển đổi kết quả mongoose thành đối tượng thuần

            // Tính tổng số báo cáo để tính tổng số trang
            const totalReports = await ReportedPost.countDocuments();
            const totalPages = Math.ceil(totalReports / parseInt(limit));

            // Nếu không có dữ liệu báo cáo
            if (!reports || reports.length === 0) {
                return HttpResponse.fail(HttpResponse.getErrorMessages("dataNotFound"));
            }

            // Xử lý từng báo cáo để lấy thông tin chi tiết người báo cáo
            const reportsWithDetails = await Promise.all(
                reports.map(async (report) => {
                    // Lấy danh sách người đã báo cáo bài viết từ bảng PostReporter
                    const reporters = await PostReporter.find({
                        report_post_id: report.post_id,
                    })
                        .select("reported_by_user_id report_type_id createdAt") // Lấy các trường cần thiết
                        .populate("reported_by_user_id", "full_name avatar") // Lấy thông tin người dùng đã báo cáo
                        .populate("report_type_id", "report_name") // Lấy loại báo cáo
                        .lean();

                    // Chuyển đổi danh sách người báo cáo sang định dạng mong muốn
                    const reportersDetails = reporters.map((reporter) => ({
                        user: {
                            _id: reporter.reported_by_user_id?._id,
                            full_name: reporter.reported_by_user_id?.full_name,
                            avatar: reporter.reported_by_user_id?.avatar,
                        },
                        report_type: reporter.report_type_id?.report_name,
                        reported_at: reporter.createdAt,
                    }));

                    // Trả về thông tin chi tiết báo cáo
                    return {
                        ...report, // Thông tin từ bảng ReportedPost
                        reporters: reportersDetails, // Thêm danh sách người đã báo cáo vào báo cáo
                    };
                })
            );

            // Trả về kết quả thành công với dữ liệu và tổng số trang
            return HttpResponse.success(
                { reports: reportsWithDetails, totalPages },
                HttpResponse.getErrorMessages("getDataSuccess")
            );
        } catch (error) {
            console.error("Error fetching reports by page:", error);
            return HttpResponse.error(
                "Error fetching reports by page",
                error.message
            );
        }
    };
    // Hàm xóa báo cáo
    deleteReport = async (report_id) => {
        try {
            // Tìm và xóa báo cáo trong bảng ReportedPost
            const reportedPost = await ReportedPost.findById(report_id);
            if (!reportedPost) {
                return HttpResponse.fail('Report not found.');
            }
            // Xóa tất cả bản ghi trong PostReporter liên quan đến report này
            await PostReporter.deleteMany({ report_post_id: reportedPost.post_id });
            // Xóa báo cáo trong ReportedPost
            await ReportedPost.findByIdAndDelete(report_id);
            return HttpResponse.success(null, 'Report and related records deleted successfully.');
        } catch (error) {
            console.error('Error deleting report:', error);
            return HttpResponse.error('Error deleting report.', error.message);
        }
    };

}

module.exports = ReportedPostService;
