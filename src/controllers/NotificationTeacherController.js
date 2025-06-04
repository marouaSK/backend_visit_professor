// src/controllers/notificationController.js
const db = require('../config/db'); // ENSURE THIS PATH IS CORRECT (points to your Supabase client export)

// Get all notifications for a specific teacher
exports.getNotificationsByTeacherId = async (req, res, next) => { // Added next for error handling
  const { teacherId } = req.params;
  console.log(`[CTRL] getNotificationsByTeacherId called for teacherId param: ${teacherId}`);

  if (!teacherId) {
    console.log("[CTRL] Teacher ID is missing in params.");
    return res.status(400).json({ error: 'Teacher ID is required' });
  }

  const profIdAsInt = parseInt(teacherId, 10);
  if (isNaN(profIdAsInt)) {
    console.log(`[CTRL] Invalid Teacher ID (not a number): ${teacherId}`);
    return res.status(400).json({ error: 'Teacher ID must be a valid number' });
  }

  console.log(`[CTRL] Attempting to fetch notifications for Prof_id: ${profIdAsInt}`);

  try {
    const { data: notifications, error: dbError } = await db
      .from('Notif_Teachers')
      .select('Not_id, Created_at, Prof_id, Message, is_read, Not_Title, Not_Type')
      .eq('Prof_id', profIdAsInt)
      .order('Created_at', { ascending: false });

    if (dbError) {
      console.error('[CTRL] Supabase error fetching notifications:', JSON.stringify(dbError, null, 2));
      // Pass the error to the global error handler
      const err = new Error('Database error while fetching notifications.');
      err.statusCode = 500;
      err.details = dbError;
      return next(err); // Use next for server-side errors
    }

    if (!notifications) {
        // This case might not happen if dbError is properly caught.
        // Supabase usually returns an empty array [] if no data, not null.
        console.log(`[CTRL] No notifications data array returned (null) for Prof_id: ${profIdAsInt}. Sending empty array.`);
        return res.json([]);
    }
    
    console.log(`[CTRL] Found ${notifications.length} notifications for Prof_id: ${profIdAsInt}.`);
    res.json(notifications);

  } catch (err) {
    console.error('[CTRL] Unexpected error in getNotificationsByTeacherId:', err);
    // Pass to global error handler
    const error = new Error('Internal server error during notification fetch.');
    error.statusCode = 500; // Or another appropriate status
    next(error);
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  const { notificationId } = req.params;
  console.log(`[CTRL] markNotificationAsRead called for notificationId param: ${notificationId}`);

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }
  const notificationIdAsInt = parseInt(notificationId, 10);
  if (isNaN(notificationIdAsInt)) {
    return res.status(400).json({ error: 'Notification ID must be a valid number' });
  }

  console.log(`[CTRL] Attempting to mark notification Not_id: ${notificationIdAsInt} as read`);
  try {
    const { data: updatedNotification, error: dbError } = await db
      .from('Notif_Teachers')
      .update({ is_read: true })
      .eq('Not_id', notificationIdAsInt)
      .select()
      .single();

    if (dbError) {
      console.error('[CTRL] Supabase error marking notification as read:', JSON.stringify(dbError, null, 2));
      if (dbError.code === 'PGRST116') { // "Zero rows returned" by .single()
          console.log(`[CTRL] Notification Not_id: ${notificationIdAsInt} not found to mark as read.`);
          return res.status(404).json({ error: 'Notification not found' });
      }
      const err = new Error('Database error while marking notification as read.');
      err.statusCode = 500;
      err.details = dbError;
      return next(err);
    }
    
    console.log(`[CTRL] Notification Not_id: ${notificationIdAsInt} marked as read.`);
    res.json(updatedNotification);

  } catch (err) {
    console.error('[CTRL] Unexpected error in markNotificationAsRead:', err);
    next(err);
  }
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  const { Prof_id, Message, Not_Title, Not_Type } = req.body;
  console.log(`[CTRL] createNotification called with body:`, req.body);

  if (!Prof_id || !Message || !Not_Title || !Not_Type) {
    return res.status(400).json({ error: 'Prof_id, Message, Not_Title, and Not_Type are required' });
  }
  const profIdAsInt = parseInt(Prof_id, 10);
  if (isNaN(profIdAsInt)) {
    return res.status(400).json({ error: 'Prof_id must be a valid number' });
  }
  console.log(`[CTRL] Attempting to create notification for Prof_id: ${profIdAsInt}`);
  try {
    const { data: newNotification, error: dbError } = await db
      .from('Notif_Teachers')
      .insert([{ Prof_id: profIdAsInt, Message, Not_Title, Not_Type }])
      .select()
      .single();

    if (dbError) {
      console.error('[CTRL] Supabase error creating notification:', JSON.stringify(dbError, null, 2));
      if (dbError.code === '23503' && dbError.message.includes('fk_teacher_notification')) {
        return res.status(400).json({ error: `Invalid Prof_id: Teacher with ID ${profIdAsInt} does not exist.` });
      }
      const err = new Error('Database error while creating notification.');
      err.statusCode = 500;
      err.details = dbError;
      return next(err);
    }
    
    console.log(`[CTRL] Notification created with Not_id: ${newNotification.Not_id}`);
    res.status(201).json(newNotification);

  } catch (err) {
    console.error('[CTRL] Unexpected error in createNotification:', err);
    next(err);
  }
};