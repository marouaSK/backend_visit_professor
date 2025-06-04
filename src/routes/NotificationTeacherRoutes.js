// src/routes/NotificationTeacherRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationTeacherController'); // Make sure path is correct

console.log('--- NotificationTeacherRoutes.js file is being loaded ---');

// GET /api/v1/notifications/teacher/:teacherId
router.get('/teacher/:teacherId', notificationController.getNotificationsByTeacherId);
console.log("Route GET /teacher/:teacherId configured in NotificationTeacherRoutes.js");

// PATCH /api/v1/notifications/:notificationId/read
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);
console.log("Route PATCH /:notificationId/read configured in NotificationTeacherRoutes.js");

// POST /api/v1/notifications/
router.post('/', notificationController.createNotification);
console.log("Route POST / configured in NotificationTeacherRoutes.js");

module.exports = router;