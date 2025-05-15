// src/controllers/authController.js
const authService = require('../services/authService');

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error; // Will be caught by catch block
    }
    const data = await authService.adminLogin(email, password);
    res.status(200).json(data);
  } catch (error) {
    // Let specific error messages from service propagate if status not set
    if (!error.statusCode) {
        if (error.message.includes('not found') || error.message.includes('Invalid credentials')) {
            error.statusCode = 401;
        } else {
            error.statusCode = 500; // Default for unexpected service errors
        }
    }
    next(error);
  }
};