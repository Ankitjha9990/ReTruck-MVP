/**
 * Listing Service — ReTruck MVP
 * CRUD operations for truck route listings via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Get listings with filters (for search page)
 * Joins driver profile and truck data
 */
async function getListings(filters) {
  var query = supabase
    .from('listings')
    .select('*, driver:profiles!listings_driver_id_fkey(id, name, phone, avatar_url, verified, rating, trips_completed, city, experience), truck:trucks!listings_truck_id_fkey(id, truck_number, truck_type, capacity, photo_url, insurance_valid, gps_enabled)')
    .eq('status', 'active');

  if (filters) {
    if (filters.from) {
      query = query.ilike('from_city', '%' + filters.from + '%');
    }
    if (filters.to) {
      query = query.ilike('to_city', '%' + filters.to + '%');
    }
    if (filters.tripType && filters.tripType !== 'all') {
      query = query.eq('trip_type', filters.tripType);
    }
    if (filters.date) {
      // Search within ±3 days of target date
      var targetDate = new Date(filters.date);
      var minDate = new Date(targetDate);
      minDate.setDate(minDate.getDate() - 3);
      var maxDate = new Date(targetDate);
      maxDate.setDate(maxDate.getDate() + 3);
      query = query.gte('departure_date', minDate.toISOString().split('T')[0]);
      query = query.lte('departure_date', maxDate.toISOString().split('T')[0]);
    }
    if (filters.truckType && filters.truckType.length > 0) {
      query = query.in('truck_id', []);
      // Filter via truck type through the joined truck
      // We'll handle this client-side after fetch for simplicity
    }
    if (filters.minCapacity) {
      query = query.gte('available_capacity', filters.minCapacity);
    }
    if (filters.maxCapacity) {
      query = query.lte('available_capacity', filters.maxCapacity);
    }
    if (filters.minPrice) {
      query = query.gte('price_per_km', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price_per_km', filters.maxPrice);
    }
  }

  // Sort
  var sortField = 'price_per_km';
  var sortAsc = true;
  if (filters && filters.sort) {
    if (filters.sort === 'price_desc') {
      sortField = 'price_per_km';
      sortAsc = false;
    } else if (filters.sort === 'price_asc') {
      sortField = 'price_per_km';
      sortAsc = true;
    } else if (filters.sort === 'date_asc') {
      sortField = 'departure_date';
      sortAsc = true;
    }
  }

  query = query.order(sortField, { ascending: sortAsc });

  var result = await query;

  // Client-side truck type filtering (since it's on a joined table)
  if (result.data && filters && filters.truckType && filters.truckType.length > 0) {
    result.data = result.data.filter(function (listing) {
      return listing.truck && filters.truckType.indexOf(listing.truck.truck_type) !== -1;
    });
  }

  return result;
}

/**
 * Get a single listing by ID with full driver and truck data
 */
async function getListingById(listingId) {
  var result = await supabase
    .from('listings')
    .select('*, driver:profiles!listings_driver_id_fkey(id, name, phone, avatar_url, verified, rating, trips_completed, city, experience, bio), truck:trucks!listings_truck_id_fkey(*)')
    .eq('id', listingId)
    .single();

  return result;
}

/**
 * Get listings for the current driver
 */
async function getMyListings() {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var result = await supabase
    .from('listings')
    .select('*, truck:trucks!listings_truck_id_fkey(truck_number, truck_type, capacity, photo_url)')
    .eq('driver_id', authResult.data.user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  return result;
}

/**
 * Create a new listing
 */
async function createListing(data) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var listingData = Object.assign({}, data, {
    driver_id: authResult.data.user.id
  });

  var result = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single();

  return result;
}

/**
 * Update a listing
 */
async function updateListing(listingId, data) {
  var result = await supabase
    .from('listings')
    .update(data)
    .eq('id', listingId)
    .select()
    .single();

  return result;
}

/**
 * Soft-delete a listing
 */
async function deleteListing(listingId) {
  var result = await supabase
    .from('listings')
    .update({ status: 'deleted' })
    .eq('id', listingId)
    .select()
    .single();

  return result;
}

export {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing
};
