// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { listNotifications } = require('../controllers/notificationController');

router.get('/', listNotifications);

module.exports = router;
