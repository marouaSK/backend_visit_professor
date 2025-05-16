const express = require('express');
const evaluationController = require('../controllers/evaluationController');
const router = express.Router();

router.post('/', evaluationController.assignEvaluator);

module.exports = router;