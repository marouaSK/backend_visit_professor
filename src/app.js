// src/app.js
const config = require('./config');
console.log('--- app.js: Starting application setup ---'); // DEBUG
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const mainRouter = require('./routes'); // This should point to src/routes/index.js
const errorHandler = require('./middleware/errorHandler');

const app = express();
console.log('--- app.js: Express app initialized ---'); // DEBUG

// Middleware
app.use(cors({ origin: '*' })); // Adjust for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log('--- app.js: Basic middleware configured ---'); // DEBUG

// API Routes
// THIS IS WHERE YOUR ROUTER IS MOUNTED
app.use('/api/v1', mainRouter);
console.log(`--- app.js: Main router mounted at /api/v1. Expecting requests like /api/v1/auth/... or /api/v1/sessions/... ---`); // DEBUG

// Not Found Handler (This catches requests that don't match any route above)
app.use((req, res, next) => {
  console.error(`--- app.js: 404 Handler Triggered for ${req.method} ${req.originalUrl} ---`); // DEBUG
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // Passes it to the global error handler
});
console.log('--- app.js: 404 handler configured ---'); // DEBUG

// Global Error Handler (Must be the LAST middleware)
app.use(errorHandler);
console.log('--- app.js: Global error handler configured ---'); // DEBUG

if (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY) {
    app.listen(config.PORT, () => {
        console.log(`\n🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
        console.log(`🌐 Connected to Supabase project: ${config.SUPABASE_URL.split('.')[0].replace('https://', '')}\n`);
    });
} else {
    console.error("\n❌ FATAL: Supabase configuration missing (URL or SERVICE_ROLE_KEY). Server cannot start.\nCheck your .env file.\n");
    process.exit(1);
}

module.exports = app;