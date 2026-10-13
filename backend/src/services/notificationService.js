const Notification = require('../models/Notification');
const { publishEvent } = require('../config/rabbitmq');

const MESSAGES = {
  RIDE_REQUESTED: (id) => `New ride requested. Ride ID: ${id}`,
  DRIVER_ASSIGNED: (id, driverName) => `Driver ${driverName} assigned to Ride ${id}`,
  DRIVER_ACCEPTED: (id, driverName) => `Driver ${driverName} accepted Ride ${id}`,
  TRIP_STARTED: (id) => `Trip started for Ride ${id}`,
  TRIP_COMPLETED: (id) => `Trip completed for Ride ${id}`,
  RIDE_CANCELLED: (id) => `Ride ${id} was cancelled`,
  PAYMENT_PROCESSED: (id, amount) => `Payment of ₹${amount} processed for Ride ${id}`,
};

/**
 * Create a notification, persist to MongoDB, and optionally publish to RabbitMQ.
 */
const createNotification = async (eventType, rideId, extraData = {}) => {
  try {
    const shortId = rideId ? String(rideId).slice(-6).toUpperCase() : 'N/A';
    let message = '';

    switch (eventType) {
      case 'RIDE_REQUESTED':
        message = MESSAGES.RIDE_REQUESTED(shortId);
        break;
      case 'DRIVER_ASSIGNED':
        message = MESSAGES.DRIVER_ASSIGNED(shortId, extraData.driverName || 'Unknown');
        break;
      case 'DRIVER_ACCEPTED':
        message = MESSAGES.DRIVER_ACCEPTED(shortId, extraData.driverName || 'Unknown');
        break;
      case 'TRIP_STARTED':
        message = MESSAGES.TRIP_STARTED(shortId);
        break;
      case 'TRIP_COMPLETED':
        message = MESSAGES.TRIP_COMPLETED(shortId);
        break;
      case 'RIDE_CANCELLED':
        message = MESSAGES.RIDE_CANCELLED(shortId);
        break;
      case 'PAYMENT_PROCESSED':
        message = MESSAGES.PAYMENT_PROCESSED(shortId, extraData.amount || 0);
        break;
      default:
        message = `Event: ${eventType} for Ride ${shortId}`;
    }

    const notification = await Notification.create({
      eventType,
      message,
      ride: rideId || null,
    });

    // Publish to RabbitMQ (non-blocking, best-effort)
    await publishEvent(eventType, rideId, { message });

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotification };
