
// // src/config/db.config.js
// require('dotenv').config(); // Make sure to load .env variables

// module.exports = {
//   HOST: process.env.DB_HOST,
//   USER: process.env.DB_USER,
//   PASSWORD: process.env.DB_PASSWORD,
//   DB: process.env.DB_NAME,
//   dialect: process.env.DB_DIALECT,
//   port: process.env.DB_PORT, // Optional, Sequelize might infer
//   pool: { // Optional: configure connection pooling
//     max: 5,     // Maximum number of connections in pool
//     min: 0,     // Minimum number of connections in pool
//     acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
//     idle: 10000     // Maximum time, in milliseconds, that a connection can be idle before being released
//   }
// };
// src/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase URL or Service Role Key is missing. Check your .env file.");
}

// Initialize the Supabase client with the service_role key for backend operations
// This client will bypass RLS.
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    // autoRefreshToken: false, // Optional: manage token refresh manually if needed
    // persistSession: false    // Optional: don't persist session for server-side client
  }
});

module.exports = supabase;