/**
 * Data Adapters — ReTruck MVP
 * Transform Supabase snake_case joined responses into
 * the flat camelCase shape the UI components expect.
 */

/**
 * Adapt a Supabase listing row (with driver + truck joins) to the flat shape
 * used by TruckSearch cards, TruckDetails, etc.
 */
function adaptListing(row) {
  if (!row) return null;
  var driver = row.driver || {};
  var truck = row.truck || {};
  var distance = row.estimated_distance || 500;
  var pricePerKm = row.price_per_km || 40;
  var total = distance * pricePerKm;
  var market = row.trip_type === 'return' ? Math.round(total * 1.7) : total;
  var discount = row.trip_type === 'return' ? Math.round((1 - total / market) * 100) : 0;

  return {
    id: String(row.id),
    driverId: driver.id || row.driver_id,
    driverName: driver.name || 'Driver',
    driverAvatar: driver.avatar_url || 'https://picsum.photos/seed/driver/100',
    driverRating: driver.rating || 0,
    driverVerified: driver.verified || false,
    tripsCompleted: driver.trips_completed || 0,
    truckType: truck.truck_type || 'full',
    truckCapacity: truck.capacity || row.available_capacity || 20,
    truckNumber: truck.truck_number || '',
    truckPhoto: truck.photo_url || 'https://picsum.photos/seed/truck/400/250',
    from: row.from_city || '',
    to: row.to_city || '',
    fromState: row.from_state || '',
    toState: row.to_state || '',
    departureDate: row.departure_date || '',
    tripType: row.trip_type || 'standard',
    availableCapacity: row.available_capacity || 0,
    pricePerKm: pricePerKm,
    cargoTypes: row.cargo_types || [],
    notes: row.notes || '',
    estimatedDistance: distance,
    estimatedTotal: total,
    marketRate: market,
    discountPercent: discount,
    status: row.status || 'active',
    createdAt: row.created_at || ''
  };
}

/**
 * Adapt an array of Supabase listing rows
 */
function adaptListings(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(adaptListing);
}

/**
 * Adapt a Supabase booking row (with listing + driver/shipper joins) to flat shape.
 * Works for both driver-view and shipper-view bookings.
 */
function adaptBooking(row) {
  if (!row) return null;
  var listing = row.listing || {};
  var driver = row.driver || listing.driver || {};
  var shipper = row.shipper || {};
  var truck = listing.truck || (row.truck && row.truck.truck) || {};

  return {
    id: String(row.id),
    bookingRef: row.booking_ref || '',
    listingId: row.listing_id ? String(row.listing_id) : '',
    shipperId: row.shipper_id || shipper.id || '',
    shipperName: shipper.name || '',
    shipperBusiness: shipper.business_name || shipper.name || '',
    shipperPhone: shipper.phone || '',
    driverId: row.driver_id || driver.id || '',
    driverName: driver.name || '',
    driverAvatar: driver.avatar_url || 'https://picsum.photos/seed/driver/100',
    driverRating: driver.rating || 4.7,
    driverVerified: driver.verified || false,
    truckType: truck.truck_type || 'full',
    truckNumber: truck.truck_number || '',
    from: listing.from_city || row.from_city || '',
    to: listing.to_city || row.to_city || '',
    departureDate: listing.departure_date || row.departure_date || '',
    tripType: listing.trip_type || row.trip_type || 'standard',
    cargoType: row.cargo_type || '',
    weight: row.weight || 0,
    pickupAddress: row.pickup_address || '',
    deliveryAddress: row.delivery_address || '',
    notes: row.notes || '',
    estimatedPrice: row.estimated_price || 0,
    status: row.status || 'pending',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

/**
 * Adapt an array of Supabase booking rows
 */
function adaptBookings(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(adaptBooking);
}

/**
 * Adapt a Supabase notification row to flat shape
 */
function adaptNotification(row) {
  if (!row) return null;

  // Calculate relative time
  var timeStr = '';
  if (row.created_at) {
    var diff = Date.now() - new Date(row.created_at).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) timeStr = 'Just now';
    else if (mins < 60) timeStr = mins + 'm ago';
    else if (mins < 1440) timeStr = Math.floor(mins / 60) + 'h ago';
    else timeStr = Math.floor(mins / 1440) + 'd ago';
  }

  return {
    id: row.id,
    title: row.title || '',
    message: row.message || '',
    time: timeStr,
    read: row.read || false,
    type: row.type || 'system',
    bookingId: row.booking_id ? String(row.booking_id) : null,
    truckId: null
  };
}

/**
 * Adapt an array of notification rows
 */
function adaptNotifications(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(adaptNotification);
}

export {
  adaptListing,
  adaptListings,
  adaptBooking,
  adaptBookings,
  adaptNotification,
  adaptNotifications
};
