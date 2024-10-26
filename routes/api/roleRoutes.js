const express = require('express');
const router = express.Router();
const RoleController = require('../../controllers/api/roleController');

router.get('/get-all-role', new RoleController().getAllRole);

module.exports = router;
