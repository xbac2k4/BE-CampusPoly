const express = require('express');
const router = express.Router();
const ReportController = require('../../controllers/api/reportController');

router.post('/add-report', new ReportController().addReport);
router.get('/get-report-by-id/:id', new ReportController().getReportById);
router.put('/update-report-status/:id', new ReportController().updateReportStatus);
router.get('/get-all-report', new ReportController().getAllReport);
router.delete('/delete-report/:id', new ReportController().deleteReport);
router.get('/get-report-by-page', new ReportController().getReportsByPage);

module.exports = router;
