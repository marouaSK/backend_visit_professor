
// src/controllers/sessionController.js
const sessionService = require('../services/sessionService');

exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.fetchAllSessions();
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

exports.getLatestSessionDetails = async (req, res, next) => {
  try {
    const latestSession = await sessionService.fetchLatestSession();
    if (!latestSession) {
      return res.status(404).json({ message: 'No sessions found.' });
    }
    res.status(200).json(latestSession);
  } catch (error) {
    next(error);
  }
};

exports.getSessionStats = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (isNaN(parseInt(sessionId))) {
        return res.status(400).json({ message: 'Invalid session ID format.' });
    }
    const stats = await sessionService.calculateSessionStats(parseInt(sessionId));
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getEvaluatedTeachersForSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (isNaN(parseInt(sessionId))) {
        return res.status(400).json({ message: 'Invalid session ID format.' });
    }
    const { search, page, limit } = req.query;
    const options = {
      search: search || '',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 5, // Default to 5 items per page
    };
    const data = await sessionService.fetchEvaluatedTeachersForSession(parseInt(sessionId), options);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};