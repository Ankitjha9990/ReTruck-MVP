/**
 * Mock Driver Data — ReTruck MVP
 * Used for demo login and dashboard display
 * Schema matches TRD Section 11 User Object
 */

var MOCK_DRIVER = {
  id: 'usr_abc123',
  role: 'driver',
  name: 'Raju Kumar',
  phone: '9876543210',
  city: 'Patna',
  bio: '12 years of experience on NH-30 and NH-19 corridors. Specialize in FMCG and textile transport across Bihar, UP, and Delhi NCR.',
  experience: 12,
  licenseNo: 'BR20110012345',
  avatar: 'https://picsum.photos/seed/raju/100',
  verified: true,
  rating: 4.7,
  tripsCompleted: 342,
  truck: {
    number: 'BR01AB1234',
    type: 'full',
    capacity: 20,
    photo: 'https://picsum.photos/seed/truck1/400/250'
  },
  businessName: '',
  createdAt: '2026-01-15T08:00:00Z'
};

export { MOCK_DRIVER };
export default MOCK_DRIVER;
