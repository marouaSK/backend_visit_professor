const express = require('express');
const applicantController = require('../controllers/applicantController');
const router = express.Router();

router.get('/', applicantController.getApplicants); // Changed from getUnassignedApplicants for clarity

module.exports = router;