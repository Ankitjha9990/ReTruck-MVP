/**
 * Mock Route Listings — ReTruck MVP
 * Driver's active route listings displayed on dashboard
 * Schema matches TRD Section 11 Listing Object
 */

function getDateFromNow(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

var MOCK_ROUTES = [
  {
    id: 'lst_001',
    driverId: 'usr_abc123',
    driverName: 'Raju Kumar',
    driverAvatar: 'https://picsum.photos/seed/raju/100',
    driverRating: 4.7,
    driverVerified: true,
    truckType: 'full',
    truckCapacity: 20,
    truckNumber: 'BR01AB1234',
    truckPhoto: 'https://picsum.photos/seed/truck1/400/250',
    from: 'Mumbai',
    to: 'Delhi',
    fromState: 'Maharashtra',
    toState: 'Delhi',
    departureDate: getDateFromNow(3),
    tripType: 'return',
    availableCapacity: 10,
    pricePerKm: 35,
    cargoTypes: ['general', 'fmcg'],
    notes: 'Returning after delivery. Open body truck, flexible on cargo type.',
    estimatedDistance: 1400,
    estimatedTotal: 49000,
    marketRate: 84000,
    discountPercent: 42,
    status: 'active',
    tripsCompleted: 342,
    createdAt: '2026-05-28T10:00:00Z'
  },
  {
    id: 'lst_002',
    driverId: 'usr_abc123',
    driverName: 'Raju Kumar',
    driverAvatar: 'https://picsum.photos/seed/raju/100',
    driverRating: 4.7,
    driverVerified: true,
    truckType: 'full',
    truckCapacity: 20,
    truckNumber: 'BR01AB1234',
    truckPhoto: 'https://picsum.photos/seed/truck1/400/250',
    from: 'Pune',
    to: 'Bangalore',
    fromState: 'Maharashtra',
    toState: 'Karnataka',
    departureDate: getDateFromNow(5),
    tripType: 'standard',
    availableCapacity: 5,
    pricePerKm: 40,
    cargoTypes: ['auto parts', 'electronics'],
    notes: 'Container truck. Handle with care for electronics.',
    estimatedDistance: 840,
    estimatedTotal: 33600,
    marketRate: 33600,
    discountPercent: 0,
    status: 'active',
    tripsCompleted: 342,
    createdAt: '2026-05-29T14:00:00Z'
  },
  {
    id: 'lst_003',
    driverId: 'usr_abc123',
    driverName: 'Raju Kumar',
    driverAvatar: 'https://picsum.photos/seed/raju/100',
    driverRating: 4.7,
    driverVerified: true,
    truckType: 'full',
    truckCapacity: 20,
    truckNumber: 'BR01AB1234',
    truckPhoto: 'https://picsum.photos/seed/truck1/400/250',
    from: 'Patna',
    to: 'Kolkata',
    fromState: 'Bihar',
    toState: 'West Bengal',
    departureDate: getDateFromNow(7),
    tripType: 'return',
    availableCapacity: 18,
    pricePerKm: 30,
    cargoTypes: ['agriculture', 'general'],
    notes: 'Empty return from Kolkata drop. Great rate for agri goods.',
    estimatedDistance: 580,
    estimatedTotal: 17400,
    marketRate: 29000,
    discountPercent: 40,
    status: 'active',
    tripsCompleted: 342,
    createdAt: '2026-05-30T08:00:00Z'
  }
];

export { MOCK_ROUTES };
export default MOCK_ROUTES;
