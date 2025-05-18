// src/routes/criteriaRoutes.js
console.log("--- criteriaRoutes.js --- File loaded and router being configured."); // DEBUG LOG 1
const express = require('express');
const criteriaController = require('../controllers/criteriaController');
const router = express.Router();

router.get('/', criteriaController.fetchAllCriteria);
console.log("--- criteriaRoutes.js --- GET '/' route configured. Controller function type:", typeof criteriaController.fetchAllCriteria); // DEBUG LOG 2 (Modified to show type)

module.exports = router;