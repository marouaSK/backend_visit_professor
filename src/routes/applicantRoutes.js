const express = require('express');
const applicantController = require('../controllers/applicantController'); // Or your chosen name
const router = express.Router();

router.get('/', applicantController.getApplicants);

module.exports = router;