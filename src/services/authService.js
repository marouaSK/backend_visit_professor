// src/services/authService.js
const supabase = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.adminLogin = async (email, password) => {
  // Using 'admin_email' from your DDL
  const { data: adminUser, error: dbError } = await supabase
    .from('admin') // table name assumed 'admin'
    .select('id, admin_email, password') // ensure 'admin' table has these columns
    .eq('admin_email', email) // ensure 'admin_email' is the correct column
    .single(); // Use .single() which errors if not exactly one row (or zero with PostgREST error)

  if (dbError || !adminUser) {
    // dbError could be 'PGRST116' if no rows, or other DB errors
    let message = 'Admin user not found.';
    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 means "The result contains 0 rows"
        message = `Database error during admin lookup: ${dbError.message}`;
    }
    console.error(`Admin login failed for ${email}: ${message}`, dbError || '');
    throw new Error(message);
  }

  const isMatch = await bcrypt.compare(password, adminUser.password);
  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  const payload = {
    id: adminUser.id,
    email: adminUser.admin_email,
    role: 'admin',
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  return {
    message: 'Admin login successful',
    token,
    admin: { id: adminUser.id, email: adminUser.admin_email },
  };
};