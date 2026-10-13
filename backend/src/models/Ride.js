const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    passenger: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: '' },
    },
    pickup: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    rideType: { type: String, enum: ['Economy', 'Premium', 'XL'], default: 'Economy' },
    estimatedDistance: { type: Number, required: true, min: 0.1 },
    fare: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Requested', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
