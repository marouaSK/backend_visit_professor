// src/routes/index.js
console.log('--- Main router (routes/index.js) file is being loaded ---'); // DEBUG
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const sessionRoutes = require('./sessionRoutes');

// Mount auth routes under /auth
router.use('/auth', authRoutes);
console.log("'/auth' routes mounted in main router."); // DEBUG

// Mount session routes under /sessions
router.use('/sessions', sessionRoutes);
console.log("'/sessions' routes mounted in main router."); // DEBUG

// Health check (useful for seeing if the router itself is responding)
router.get('/health', (req, res) => {
  console.log('--- Health check endpoint hit ---');
  res.status(200).json({ status: 'UP', message: 'Main router is healthy', timestamp: new Date().toISOString() });
});
console.log('Main router (routes/index.js) fully configured.'); // DEBUG

module.exports = router;