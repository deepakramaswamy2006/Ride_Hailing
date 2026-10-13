const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { estimateFare } = require('../services/fareService');
const { findBestDriver, assignDriver, releaseDriver } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');

// POST /api/rides/estimate
exports.estimateFareHandler = async (req, res) => {
  try {
    const { rideType = 'Economy', estimatedDistance } = req.body;
    if (!estimatedDistance || estimatedDistance <= 0) {
      return res.status(400).json({ success: false, message: 'Valid estimatedDistance is required' });
    }
    const fare = estimateFare(rideType, estimatedDistance);
    const availableCount = await Driver.countDocuments({ availability: 'Available' });
    return res.json({ success: true, fare, availableDrivers: availableCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rides
exports.createRide = async (req, res) => {
  try {
    const { passengerName, pickup, destination, rideType, estimatedDistance } = req.body;

    if (!passengerName || !pickup || !destination || !estimatedDistance) {
      return res.status(400).json({ success: false, message: 'passengerName, pickup, destination, and estimatedDistance are required' });
    }
    if (estimatedDistance <= 0) {
      return res.status(400).json({ success: false, message: 'estimatedDistance must be positive' });
    }

    const fare = estimateFare(rideType || 'Economy', estimatedDistance);

    const ride = await Ride.create({
      passenger: { name: passengerName },
      pickup,
      destination,
      rideType: rideType || 'Economy',
      estimatedDistance,
      fare,
      status: 'Requested',
    });

    await createNotification('RIDE_REQUESTED', ride._id);

    // Attempt to match and assign a driver
    const bestDriver = await findBestDriver(rideType || 'Economy');
    if (bestDriver) {
      const assignedDriver = await assignDriver(bestDriver._id);
      if (assignedDriver) {
        ride.driver = assignedDriver._id;
        ride.status = 'Assigned';
        await ride.save();
        await createNotification('DRIVER_ASSIGNED', ride._id, { driverName: assignedDriver.name });
      }
    }

    const populated = await Ride.findById(ride._id).populate('driver');
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides
exports.getRides = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'All' ? { status } : {};
    const rides = await Ride.find(filter).populate('driver').sort({ createdAt: -1 });
    return res.json({ success: true, data: rides });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides/:id
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver').populate('payment');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    return res.json({ success: true, data: ride });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rides/:id/cancel
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (['Completed', 'Cancelled'].includes(ride.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ride with status: ${ride.status}` });
    }
    if (ride.status === 'In Progress') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a ride that is already in progress' });
    }

    const driverId = ride.driver?._id || ride.driver;
    ride.status = 'Cancelled';
    ride.cancellationReason = req.body.reason || 'Cancelled by user';
    ride.driver = null;
    await ride.save();

    await releaseDriver(driverId);
    await createNotification('RIDE_CANCELLED', ride._id);

    return res.json({ success: true, data: ride, message: 'Ride cancelled successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rides/:id/start
exports.startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: `Cannot start a ride with status: ${ride.status}. Ride must be Assigned first.` });
    }

    ride.status = 'In Progress';
    ride.startTime = new Date();
    await ride.save();

    // Update driver status to On Trip
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver._id || ride.driver, { availability: 'On Trip' });
    }

    await createNotification('TRIP_STARTED', ride._id);

    const updated = await Ride.findById(ride._id).populate('driver');
    return res.json({ success: true, data: updated, message: 'Trip started successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rides/:id/complete
exports.completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.status !== 'In Progress') {
      return res.status(400).json({ success: false, message: `Cannot complete a ride with status: ${ride.status}. Ride must be In Progress.` });
    }

    const driverId = ride.driver?._id || ride.driver;
    ride.status = 'Completed';
    ride.endTime = new Date();
    await ride.save();

    // Release driver and increment totalRides
    await Driver.findByIdAndUpdate(driverId, {
      $set: { availability: 'Available' },
      $inc: { totalRides: 1 },
    });

    await createNotification('TRIP_COMPLETED', ride._id);

    const updated = await Ride.findById(ride._id).populate('driver');
    return res.json({ success: true, data: updated, message: 'Trip completed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides/stats
exports.getStats = async (req, res) => {
  try {
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ status: { $in: ['Requested', 'Assigned', 'In Progress'] } });
    const availableDrivers = await Driver.countDocuments({ availability: 'Available' });
    const completedRides = await Ride.find({ status: 'Completed' });
    const totalRevenue = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);

    return res.json({ success: true, data: { totalRides, activeRides, availableDrivers, totalRevenue } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
