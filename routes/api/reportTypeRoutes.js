const express = require('express');
const router = express.Router();
const ReportTypeController = require('../../controllers/api/reportTypeController');

router.get('/get-all-type', new ReportTypeController().getAllType);

module.exports = router;
