// src/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController'); // Ensure path is correct

// ** NO GLOBAL AUTH MIDDLEWARE HERE IF THESE ARE PUBLIC **
// // const { verifyBackendToken, isAdmin } = require('../middleware/authMiddleware'); 
// // router.use(verifyBackendToken); // DO NOT APPLY GLOBALLY
// // router.use(isAdmin);           // DO NOT APPLY GLOBALLY

// --- Define PUBLIC GET routes for sessions ---
// These routes will NOT go through verifyBackendToken or isAdmin
router.get('/latest', sessionController.getLatestSession);
router.get('/by-date', sessionController.getSessionsByDate);
router.get('/:sessionId/stats', sessionController.getSessionStats);
router.get('/:sessionId/evaluated-teachers', sessionController.getEvaluatedTeachersForSession);
router.get('/', sessionController.getAllSessions); // If this should also be public

// --- Example: If you have OTHER session routes that DO require admin login ---
// For example, a POST route to create a new session
/*
const { verifyBackendToken, isAdmin } = require('../middleware/authMiddleware'); // Import them here specifically
router.post(
    '/', // Example: POST /api/v1/sessions/
    verifyBackendToken, // Apply auth middleware only to this route
    isAdmin,            // Apply role check only to this route
    sessionController.createSession // Example controller function
);
*/

module.exports = router;