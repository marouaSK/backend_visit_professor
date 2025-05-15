
// src/middleware/errorHandler.js
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("ERROR STACK:", err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || (err.status && Number.isInteger(err.status) ? err.status : 500);
  const message = err.message || 'Internal Server Error';

  // Handle Supabase specific errors if needed (err.code, err.details)
  // For example, from postgrest-js: err.code, err.details, err.hint, err.message

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }), // Only show stack in development
  });
};

module.exports = errorHandler;