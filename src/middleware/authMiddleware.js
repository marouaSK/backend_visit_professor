// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const supabase = require('../config/db');

exports.verifyBackendToken = (req, res, next) => {
  console.log('Attempting to verify token. Headers:', JSON.stringify(req.headers.authorization || 'No Auth Header', null, 2));
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized: No token provided or malformed Bearer token.');
    error.statusCode = 401;
    return next(error);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    console.log('Token verified for user ID:', req.user.id, 'Role:', req.user.role);
    next();
  } catch (err) {
    const error = new Error(`Unauthorized: Invalid or expired token. Details: ${err.message}`);
    error.statusCode = 401;
    return next(error);
  }
};

exports.isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Forbidden: Administrator access required. User role is: ' + (req.user ? req.user.role : 'undefined'));
    error.statusCode = 403;
    return next(error);
  }
  // Optional: Double-check if admin ID from token exists in DB
  try {
    const { data: adminRecord, error: dbError } = await supabase
        .from('admin')
        .select('id')
        .eq('id', req.user.id)
        .maybeSingle(); // Use maybeSingle to handle null gracefully

    if (dbError) throw dbError; // Propagate actual DB error

    if (!adminRecord) {
        console.warn(`Admin verification failed: No admin record found in DB for ID ${req.user.id} from token.`);
        const error = new Error('Forbidden: Admin identity could not be validated in database.');
        error.statusCode = 403;
        return next(error);
    }
    console.log('isAdmin check passed for admin ID:', req.user.id);
    next();
  } catch (catchError) {
    console.error('Error during isAdmin database check:', catchError);
    next(catchError); // Pass to global error handler
  }
};