const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getPayments);
router.get('/ride/:rideId', paymentController.getPaymentByRide);
router.post('/', paymentController.processPayment);

module.exports = router;
