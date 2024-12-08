const Reports = require("../models/reportModel");
const HttpResponse = require("../utils/httpResponse");
const Status = require('../models/statusModel')
const dotenv = require('dotenv');
dotenv.config();
const { use } = require("../routes/api");

class ReportService {
    addReport = async (reported_by_user_id, post_id, report_type_id) => {
        try {
            console.log("Received data in service:", { reported_by_user_id, post_id, report_type_id });
    
            // Kiểm tra xem dữ liệu có hợp lệ không
            if (!reported_by_user_id || !post_id || !report_type_id) {
                throw new Error("Missing required fields");
            }
            const report = new Reports({
                reported_by_user_id,
                post_id,
                report_type_id,
            });
    
            console.log("Report object to be saved:", report);
    
            const savedReport = await report.save();
            console.log("Saved report:", savedReport);
    
            return HttpResponse.success(savedReport, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log("Error in saving report:", error);
            return HttpResponse.error(error);
        }
    };   
    
    getReportById = async (id) => {
        try {
            const result = await Reports.findById(id)
                .populate('reported_by_user_id', 'full_name')  // Lấy full_name từ model User
                .populate('post_id', '_id')  // Lấy _id từ model Post
                .populate('report_status_id', 'status_name')  // Lấy status_name từ model Status
                .populate('report_type_id', 'report_name'); // Đảm bảo tên model trong ref phải đúng
    
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    
    

    async updateReportStatus(id, report_status_id, resolved_by_user_id) {
        console.log(`Updating status for report ${id} to ${report_status_id}`);
        try {
            const update = {
                report_status_id
            };
            const updatedReport = await Reports.findByIdAndUpdate(id, update, { new: true })
                .populate('report_status_id', 'status_name');
            if (!updatedReport) {
                console.log(`No report found with id: ${id}`);
                return { status: 404, message: "No report found" };
            }
    
            console.log(`Updated report: ${JSON.stringify(updatedReport)}`);
            return { status: 200, data: updatedReport };
        } catch (error) {
            console.error(`Error updating report status: ${error}`);
            return { status: 500, message: "Internal server error", error };
        }
    }
    

    getAllReport = async () => {
        try {            
            const reports = await Reports.find().populate('reported_by_user_id', 'full_name').populate('post_id', '_id').populate('report_status_id', 'status_name').populate('report_type_id','report_name');
            
            return HttpResponse.success(reports, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }

    deleteReport = async (id) => {
        try {
            const deletedReport = await Reports.findByIdAndDelete(id);
            if (deletedReport) {
                return HttpResponse.success(deletedReport, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getReportsByPage = async (page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const reports = await Reports.find()
                .skip(skip)
                .limit(parseInt(limit))
                .populate('reported_by_user_id', 'full_name')
                .populate({
                    path: 'post_id',
                    populate: {
                        path: 'user_id',
                        select: 'full_name'  // Chỉ lấy trường full_name
                    }
                })
                .populate('report_type_id', 'report_name')
                .populate('report_status_id', 'status_name');
                // .populate('post_id', '_id.user_id.full_name');
            const total = await Reports.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
    
            if (!reports) {
                throw new Error('No reports found');
            }
    
            return HttpResponse.success({ reports, totalPages }, 'Reports fetched successfully');
        } catch (error) {
            console.error("Error fetching reports by page:", error);
            return HttpResponse.error(error);
        }
    }
     
}

module.exports = ReportService;
