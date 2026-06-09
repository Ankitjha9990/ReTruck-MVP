/**
 * Booking Service — ReTruck MVP
 * CRUD operations for bookings via Supabase
 */

import supabase from './supabaseClient.js';

/**
 * Create a new booking
 */
async function createBooking(data) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var bookingData = Object.assign({}, data, {
    shipper_id: authResult.data.user.id,
    booking_ref: 'RT' + new Date().getFullYear() + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  });

  var result = await supabase
    .from('bookings')
    .insert(bookingData)
    .select('*, listing:listings(*, driver:profiles!listings_driver_id_fkey(name, phone, avatar_url, verified, rating), truck:trucks!listings_truck_id_fkey(truck_number, truck_type, capacity, photo_url))')
    .single();

  return result;
}

/**
 * Get bookings for the current shipper
 */
async function getBookingsForShipper(statusFilter) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var query = supabase
    .from('bookings')
    .select('*, listing:listings(from_city, from_state, to_city, to_state, trip_type, departure_date, price_per_km, estimated_distance), driver:profiles!bookings_driver_id_fkey(id, name, phone, avatar_url, verified, rating, city), truck:listings(truck:trucks!listings_truck_id_fkey(truck_number, truck_type, capacity, photo_url))')
    .eq('shipper_id', authResult.data.user.id)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  var result = await query;
  return result;
}

/**
 * Get bookings for the current driver
 */
async function getBookingsForDriver(statusFilter) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var query = supabase
    .from('bookings')
    .select('*, listing:listings(from_city, from_state, to_city, to_state, trip_type, departure_date, price_per_km, estimated_distance), shipper:profiles!bookings_shipper_id_fkey(id, name, phone, avatar_url, business_name, city)')
    .eq('driver_id', authResult.data.user.id)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  var result = await query;
  return result;
}

/**
 * Get a single booking by ID
 */
async function getBookingById(bookingId) {
  var result = await supabase
    .from('bookings')
    .select('*, listing:listings(*, driver:profiles!listings_driver_id_fkey(id, name, phone, avatar_url, verified, rating, city, experience), truck:trucks!listings_truck_id_fkey(*)), shipper:profiles!bookings_shipper_id_fkey(id, name, phone, avatar_url, business_name, city)')
    .eq('id', bookingId)
    .single();

  return result;
}

/**
 * Get a booking by booking reference
 */
async function getBookingByRef(bookingRef) {
  var result = await supabase
    .from('bookings')
    .select('*, listing:listings(*, driver:profiles!listings_driver_id_fkey(id, name, phone, avatar_url, verified, rating, city), truck:trucks!listings_truck_id_fkey(truck_number, truck_type, capacity, photo_url)), shipper:profiles!bookings_shipper_id_fkey(id, name, phone, avatar_url, business_name)')
    .eq('booking_ref', bookingRef)
    .single();

  return result;
}

/**
 * Update booking status (driver accepts/rejects, shipper cancels)
 */
async function updateBookingStatus(bookingId, status) {
  var result = await supabase
    .from('bookings')
    .update({ status: status })
    .eq('id', bookingId)
    .select()
    .single();

  return result;
}

/**
 * Get booking stats for dashboard
 */
async function getBookingStats(role) {
  var authResult = await supabase.auth.getUser();
  if (authResult.error || !authResult.data.user) {
    return { data: null, error: authResult.error || new Error('Not authenticated') };
  }

  var userId = authResult.data.user.id;
  var filterField = role === 'driver' ? 'driver_id' : 'shipper_id';

  var result = await supabase
    .from('bookings')
    .select('status, estimated_price')
    .eq(filterField, userId);

  if (result.error) return result;

  var stats = {
    total: result.data.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    totalSpent: 0,
    totalEarnings: 0
  };

  result.data.forEach(function (booking) {
    stats[booking.status] = (stats[booking.status] || 0) + 1;
    if (booking.status === 'completed' || booking.status === 'confirmed') {
      stats.totalSpent += booking.estimated_price || 0;
      stats.totalEarnings += booking.estimated_price || 0;
    }
  });

  return { data: stats, error: null };
}

export {
  createBooking,
  getBookingsForShipper,
  getBookingsForDriver,
  getBookingById,
  getBookingByRef,
  updateBookingStatus,
  getBookingStats
};
