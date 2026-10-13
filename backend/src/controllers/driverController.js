const Driver = require('../models/Driver');

// GET /api/drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: drivers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/drivers/available
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ availability: 'Available' });
    return res.json({ success: true, data: drivers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/drivers/:id/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const validStatuses = ['Available', 'Offline'];
    if (!validStatuses.includes(availability)) {
      return res.status(400).json({ success: false, message: `Manual toggle only supports: ${validStatuses.join(', ')}` });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Prevent manual override of active assignment
    if (['Assigned', 'On Trip'].includes(driver.availability)) {
      return res.status(400).json({
        success: false,
        message: `Driver is currently ${driver.availability}. Cannot change availability while on an active ride.`,
      });
    }

    driver.availability = availability;
    await driver.save();
    return res.json({ success: true, data: driver, message: `Driver is now ${availability}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/drivers  (create a driver)
exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    return res.status(201).json({ success: true, data: driver });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
