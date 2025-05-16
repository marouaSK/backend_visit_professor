// src/routes/evaluationStatusRoutes.js
const express = require('express');
const evaluationStatusController = require('../controllers/evaluationStatusController');
const router = express.Router();

router.get('/', evaluationStatusController.getStatuses);

module.exports = router;