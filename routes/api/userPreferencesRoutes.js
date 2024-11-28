const express = require('express');
const router = express.Router();
const UserPreferencesController = require('../../controllers/api/userPreferencesController');

router.post('/interaction-scoring', new UserPreferencesController().updateInteractionScore);

module.exports = router;
