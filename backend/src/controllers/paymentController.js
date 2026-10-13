const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { createNotification } = require('../services/notificationService');

// GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('ride').sort({ createdAt: -1 });
    return res.json({ success: true, data: payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/:rideId
exports.getPaymentByRide = async (req, res) => {
  try {
    const payment = await Payment.findOne({ ride: req.params.rideId }).populate('ride');
    if (!payment) return res.status(404).json({ success: false, message: 'No payment found for this ride' });
    return res.json({ success: true, data: payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments
exports.processPayment = async (req, res) => {
  try {
    const { rideId, method } = req.body;

    if (!rideId || !method) {
      return res.status(400).json({ success: false, message: 'rideId and method are required' });
    }
    if (!['UPI', 'Card', 'Cash'].includes(method)) {
      return res.status(400).json({ success: false, message: 'method must be UPI, Card, or Cash' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Payment can only be processed for completed rides' });
    }

    // Prevent duplicate payment
    const existing = await Payment.findOne({ ride: rideId, status: 'Paid' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payment already completed for this ride', data: existing });
    }

    // Simulate transaction ID
    const transactionId = `TXN${Date.now().toString(36).toUpperCase()}`;

    const payment = await Payment.findOneAndUpdate(
      { ride: rideId },
      {
        ride: rideId,
        amount: ride.fare,
        method,
        status: 'Paid',
        transactionId,
        paidAt: new Date(),
      },
      { upsert: true, new: true }
    );

    ride.payment = payment._id;
    await ride.save();

    await createNotification('PAYMENT_PROCESSED', ride._id, { amount: ride.fare });

    return res.json({ success: true, data: payment, message: 'Payment processed successfully (simulated)' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
