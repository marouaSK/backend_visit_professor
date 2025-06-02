// src/controllers/notificationController.js
const { getAllNotifications } = require('../services/notificationService');

async function listNotifications(req, res) {
  try {
    const notifications = await getAllNotifications();
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listNotifications };
