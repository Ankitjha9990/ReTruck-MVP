/**
 * Truck Service — ReTruck MVP
 * CRUD operations for truck management via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Get current driver's trucks
 */
async function getMyTrucks() {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('trucks')
    .select('*')
    .eq('owner_id', authResult.data.user.id)
    .order('created_at', { ascending: false });

  return result;
}

/**
 * Get a single truck by ID
 */
async function getTruckById(truckId) {
  var result = await supabase
    .from('trucks')
    .select('*, owner:profiles!trucks_owner_id_fkey(id, name, avatar_url, verified, rating)')
    .eq('id', truckId)
    .single();

  return result;
}

/**
 * Add a new truck for the current driver
 */
async function addTruck(data) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var truckData = Object.assign({}, data, {
    owner_id: authResult.data.user.id
  });

  var result = await supabase
    .from('trucks')
    .insert(truckData)
    .select()
    .single();

  return result;
}

/**
 * Update a truck
 */
async function updateTruck(truckId, data) {
  var result = await supabase
    .from('trucks')
    .update(data)
    .eq('id', truckId)
    .select()
    .single();

  return result;
}

/**
 * Delete a truck
 */
async function deleteTruck(truckId) {
  var result = await supabase
    .from('trucks')
    .delete()
    .eq('id', truckId);

  return result;
}

export {
  getMyTrucks,
  getTruckById,
  addTruck,
  updateTruck,
  deleteTruck
};
