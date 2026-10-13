const Driver = require('../models/Driver');

const DEMO_DRIVERS = [
  {
    name: 'Arjun Sharma',
    phone: '9876543201',
    vehicle: { model: 'Maruti Swift', registrationNumber: 'KA01AB1234', type: 'Economy' },
    rating: 4.8,
    location: { address: 'Koramangala, Bangalore', latitude: 12.9352, longitude: 77.6245 },
    availability: 'Available',
    isDemo: true,
  },
  {
    name: 'Priya Nair',
    phone: '9876543202',
    vehicle: { model: 'Toyota Innova', registrationNumber: 'KA02CD5678', type: 'XL' },
    rating: 4.9,
    location: { address: 'Indiranagar, Bangalore', latitude: 12.9784, longitude: 77.6408 },
    availability: 'Available',
    isDemo: true,
  },
  {
    name: 'Ravi Kumar',
    phone: '9876543203',
    vehicle: { model: 'Honda City', registrationNumber: 'KA03EF9012', type: 'Premium' },
    rating: 4.7,
    location: { address: 'Whitefield, Bangalore', latitude: 12.9698, longitude: 77.7499 },
    availability: 'Available',
    isDemo: true,
  },
  {
    name: 'Meena Reddy',
    phone: '9876543204',
    vehicle: { model: 'Hyundai i20', registrationNumber: 'KA04GH3456', type: 'Economy' },
    rating: 4.6,
    location: { address: 'HSR Layout, Bangalore', latitude: 12.9116, longitude: 77.6389 },
    availability: 'Available',
    isDemo: true,
  },
  {
    name: 'Suresh Patil',
    phone: '9876543205',
    vehicle: { model: 'BMW 3 Series', registrationNumber: 'KA05IJ7890', type: 'Premium' },
    rating: 4.95,
    location: { address: 'MG Road, Bangalore', latitude: 12.9757, longitude: 77.6011 },
    availability: 'Available',
    isDemo: true,
  },
];

const seedDrivers = async () => {
  try {
    const existingCount = await Driver.countDocuments({ isDemo: true });
    if (existingCount > 0) {
      console.log(`ℹ️  Demo drivers already seeded (${existingCount} found). Skipping.`);
      return;
    }
    await Driver.insertMany(DEMO_DRIVERS);
    console.log(`✅ Seeded ${DEMO_DRIVERS.length} demo drivers.`);
  } catch (err) {
    console.error('⚠️  Seeding error:', err.message);
  }
};

module.exports = { seedDrivers };
