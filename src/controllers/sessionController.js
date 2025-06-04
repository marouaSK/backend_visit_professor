const sessionService = require('../services/sessionService');

// GET all sessions (if still needed)
exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.fetchAllSessions();
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// GET sessions by specific date (start OR end date)
exports.getSessionsByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid or missing date parameter. Use YYYY-MM-DD format.' });
    }
    const sessions = await sessionService.fetchSessionsByDate(date);
    res.status(200).json(sessions || []); // Ensure an array is returned
  } catch (error) {
    next(error);
  }
};

// NEW: GET the latest session
exports.getLatestSession = async (req, res, next) => {
  try {
    const latestSession = await sessionService.fetchLatestSessionDetails();
    // Return null if no latest session is found, so frontend can handle it gracefully
    res.status(200).json(latestSession);
  } catch (error) {
    next(error);
  }
};

// GET stats for a specific session
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

// GET evaluated teachers for a specific session with pagination and search
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
      limit: parseInt(limit) || 5, // Default limit
    };
    const data = await sessionService.fetchEvaluatedTeachersForSession(parseInt(sessionId), options);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// REMINDER: Ensure your Express router (e.g., in routes/sessionRoutes.js) includes:
// router.get('/latest', sessionController.getLatestSession);
// And other routes like:
// router.get('/', sessionController.getAllSessions); // If used
// router.get('/by-date', sessionController.getSessionsByDate);
// router.get('/:sessionId/stats', sessionController.getSessionStats);
// router.get('/:sessionId/evaluated-teachers', sessionController.getEvaluatedTeachersForSession);