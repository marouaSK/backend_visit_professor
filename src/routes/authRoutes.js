// src/routes/authRoutes.js
console.log('--- authRoutes.js file is being loaded ---'); // DEBUG
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/admin/login', authController.adminLogin);
console.log('POST /admin/login route configured in authRoutes.js'); // DEBUG

module.exports = router;