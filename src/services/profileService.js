/**
 * Profile Service — ReTruck MVP
 * CRUD operations for user profiles via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Get current user's profile
 */
async function getMyProfile() {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authResult.data.user.id)
    .single();

  return result;
}

/**
 * Get a profile by user ID
 */
async function getProfile(userId) {
  var result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return result;
}

/**
 * Get a driver's profile with their truck info
 */
async function getDriverProfile(driverId) {
  var result = await supabase
    .from('profiles')
    .select('*, trucks(*)')
    .eq('id', driverId)
    .eq('role', 'driver')
    .single();

  return result;
}

/**
 * Update the current user's profile
 */
async function updateProfile(data) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('profiles')
    .update(data)
    .eq('id', authResult.data.user.id)
    .select()
    .single();

  return result;
}

/**
 * Get all drivers (for public listing)
 */
async function getDrivers() {
  var result = await supabase
    .from('profiles')
    .select('*, trucks(*)')
    .eq('role', 'driver')
    .order('rating', { ascending: false });

  return result;
}

export {
  getMyProfile,
  getProfile,
  getDriverProfile,
  updateProfile,
  getDrivers
};
