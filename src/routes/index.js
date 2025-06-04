// src/routes/index.js
console.log('--- Main router (routes/index.js) file is being loaded ---'); // DEBUG
const express = require('express');
const router = express.Router();

// --- Import all your route handlers ---
const authRoutes = require('./authRoutes');
const sessionRoutes = require('./sessionRoutes');
const teacherRoutes = require('./teacherRoutes');
const applicantRoutes = require('./applicantRoutes');
const evaluationRoutes = require('./evaluationRoutes');
const notificationRoutes = require('./notificationRoutes'); // General notifications
const evaluationStatusRoutes = require('./evaluationStatusRoutes');
const visitReportRoutes = require('./visitReportRoutes');
const NotificationTeacherRoutes = require('./NotificationTeacherRoutes'); // Teacher-specific notifications?

// ***** NEW: Import the teacher profile routes *****
const teacherProfileRoutes = require('./teacherProfileRoutes');
// ************************************************

// --- Mount routes ---

// Mount auth routes under /auth
router.use('/auth', authRoutes);
console.log("'/auth' routes mounted in main router.");

// Mount session routes under /sessions
router.use('/sessions', sessionRoutes);
console.log("'/sessions' routes mounted in main router.");

// Mount teacher routes under /teachers
router.use('/teachers', teacherRoutes);
console.log("'/teachers' routes mounted in main router.");

// Mount applicant routes under /applicants
router.use('/applicants', applicantRoutes);
console.log("'/applicants' routes mounted in main router.");

// Mount evaluation routes under /evaluations
router.use('/evaluations', evaluationRoutes);
console.log("'/evaluations' routes mounted in main router.");

// Mount general notification routes under /notifications
router.use('/notifications', notificationRoutes);
console.log("'/notifications' (general) routes mounted in main router.");

// Mount evaluation status routes under /evaluation-status
router.use('/evaluation-status', evaluationStatusRoutes);
console.log("'/evaluation-status' routes mounted in main router.");

// Mount visit report routes under /visit-reports
router.use('/visit-reports', visitReportRoutes);
console.log("'/visit-reports' routes mounted in main router.");

// Mount teacher-specific notification routes also under /notifications
// WARNING: This might conflict with or override the 'notificationRoutes' above.
// Consider merging or using a more specific path like '/notifications/teacher'.
router.use('/notifications', NotificationTeacherRoutes);
console.log("'/notifications' (teacher-specific) routes mounted in main router. Potential conflict here.");

// ***** NEW: Mount teacher profile routes *****
// This will make routes defined in teacherProfileRoutes.js available under /teacher-profile
// e.g., GET /api/v1/teacher-profile/:id
router.use('/teacher-profile', teacherProfileRoutes);
console.log("'/teacher-profile' routes mounted in main router.");
// *******************************************

// Health check
router.get('/health', (req, res) => {
  console.log('--- Health check endpoint hit ---');
  res.status(200).json({ status: 'UP', message: 'Main router is healthy', timestamp: new Date().toISOString() });
});

console.log('Main router (routes/index.js) fully configured.'); // DEBUG

module.exports = router;