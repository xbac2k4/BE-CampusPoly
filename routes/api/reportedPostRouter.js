const express = require('express');
const router = express.Router();
const ReportedPostController = require('../../controllers/api/reportedPostController');

router.post('/create-report', new ReportedPostController().createReport);
router.get('/all-reports', new ReportedPostController().getAllReports);
router.get('/report/:report_id', new ReportedPostController().getReportByID);
router.get('/get-report-by-page', new ReportedPostController().getReportsByPage);

module.exports = router;
