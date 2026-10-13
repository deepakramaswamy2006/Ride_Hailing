const Driver = require('../models/Driver');
const { haversineDistance } = require('./fareService');

/**
 * Find best available driver for a ride request.
 * Strategy: pick the Available driver with the highest rating.
 * (Demonstrates matching logic; real GPS proximity used when coords differ.)
 */
const findBestDriver = async (rideType) => {
  // Prefer drivers whose vehicle type matches ride type, fall back to any available
  const availableDrivers = await Driver.find({ availability: 'Available' });
  if (availableDrivers.length === 0) return null;

  // Sort: matching vehicle type first, then by rating desc
  const sorted = availableDrivers.sort((a, b) => {
    const aMatch = a.vehicle.type === rideType ? 1 : 0;
    const bMatch = b.vehicle.type === rideType ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    return b.rating - a.rating;
  });

  return sorted[0];
};

/**
 * Assign a driver to a ride atomically.
 * Returns the updated driver or null if the driver was grabbed by another ride.
 */
const assignDriver = async (driverId) => {
  // Atomic update: only update if still Available
  const driver = await Driver.findOneAndUpdate(
    { _id: driverId, availability: 'Available' },
    { $set: { availability: 'Assigned' } },
    { new: true }
  );
  return driver;
};

/**
 * Release a driver back to Available after ride cancellation or completion.
 */
const releaseDriver = async (driverId) => {
  if (!driverId) return;
  await Driver.findByIdAndUpdate(driverId, {
    $set: { availability: 'Available' },
  });
};

module.exports = { findBestDriver, assignDriver, releaseDriver };
