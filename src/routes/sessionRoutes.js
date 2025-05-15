
// src/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyBackendToken, isAdmin } = require('../middleware/authMiddleware');

// All session routes are protected and require admin access
router.use(verifyBackendToken); // Or verifySupabaseToken if using Supabase JWTs directly
router.use(isAdmin);

router.get('/', sessionController.getAllSessions); // For the "Search session date" dropdown
router.get('/latest', sessionController.getLatestSessionDetails);
router.get('/:sessionId/stats', sessionController.getSessionStats);
router.get('/:sessionId/evaluated-teachers', sessionController.getEvaluatedTeachersForSession);

module.exports = router;