const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'RIDE_REQUESTED',
        'DRIVER_ASSIGNED',
        'DRIVER_ACCEPTED',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'RIDE_CANCELLED',
        'PAYMENT_PROCESSED',
      ],
      required: true,
    },
    message: { type: String, required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
