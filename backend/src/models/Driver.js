const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    vehicle: {
      model: { type: String, required: true },
      registrationNumber: { type: String, required: true, unique: true },
      type: { type: String, enum: ['Economy', 'Premium', 'XL'], default: 'Economy' },
    },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    location: {
      address: { type: String, default: 'Unknown' },
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
    },
    availability: {
      type: String,
      enum: ['Available', 'Assigned', 'On Trip', 'Offline'],
      default: 'Available',
    },
    totalRides: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
