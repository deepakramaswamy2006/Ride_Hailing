const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

router.get('/stats', rideController.getStats);
router.post('/estimate', rideController.estimateFareHandler);
router.post('/', rideController.createRide);
router.get('/', rideController.getRides);
router.get('/:id', rideController.getRideById);
router.post('/:id/cancel', rideController.cancelRide);
router.post('/:id/start', rideController.startRide);
router.post('/:id/complete', rideController.completeRide);

module.exports = router;
