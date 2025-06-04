// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/NotificationTeacherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // Important for cookies or authorization headers
}));
app.use(express.json()); // To parse JSON request bodies

// Routes
app.use('/api/notifications', notificationRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Notification API is running!');
});

// Global error handler (very basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});