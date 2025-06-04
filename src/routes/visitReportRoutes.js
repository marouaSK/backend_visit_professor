// src/routes/visitReportRoutes.js
const express = require('express');
const router = express.Router();
const visitReportController = require('../controllers/visitReportController'); // Make sure this controller exists too
const { verifyBackendToken, isAdmin } = require('../middleware/authMiddleware'); // Make sure this middleware exists

console.log('--- visitReportRoutes.js file is being loaded ---'); // DEBUG

// Protect report URL generation
router.use(verifyBackendToken);
router.use(isAdmin);

// Route to get a signed URL for a specific visit report
router.get('/:visitReportId/signed-url', visitReportController.getReportSignedUrl);
console.log("Route GET /:visitReportId/signed-url configured in visitReportRoutes.js"); // DEBUG

module.exports = router;