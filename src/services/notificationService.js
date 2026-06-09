/**
 * Notification Service — ReTruck MVP
 * Operations for in-app notifications via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Get notifications for the current user
 */
async function getNotifications(limit) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authResult.data.user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  var result = await query;
  return result;
}

/**
 * Get unread notification count
 */
async function getUnreadCount() {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { count: 0, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', authResult.data.user.id)
    .eq('read', false);

  return { count: result.count || 0, error: result.error };
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId) {
  var result = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  return result;
}

/**
 * Mark all notifications as read for current user
 */
async function markAllAsRead() {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', authResult.data.user.id)
    .eq('read', false)
    .select();

  return result;
}

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
