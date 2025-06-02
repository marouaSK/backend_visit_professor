const supabase = require('../config/db');

async function getAllNotifications() {
  const { data, error } = await supabase
    .from('Notification_Admin')
    .select('title, text, status');

  if (error) throw error;
  return data;
}

module.exports = { getAllNotifications };
