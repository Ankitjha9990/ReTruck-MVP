/**
 * Review Service — ReTruck MVP
 * Operations for driver reviews via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Get reviews for a driver
 */
async function getDriverReviews(driverId) {
  var result = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, name, avatar_url, business_name)')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false });

  return result;
}

/**
 * Create a review for a completed booking
 */
async function createReview(data) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var reviewData = Object.assign({}, data, {
    reviewer_id: authResult.data.user.id
  });

  var result = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();

  return result;
}

/**
 * Check if current user has reviewed a booking
 */
async function hasReviewed(bookingId) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return false;
  }

  var result = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('reviewer_id', authResult.data.user.id)
    .single();

  return !!result.data;
}

export {
  getDriverReviews,
  createReview,
  hasReviewed
};
