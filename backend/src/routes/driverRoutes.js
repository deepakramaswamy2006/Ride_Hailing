const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.get('/available', driverController.getAvailableDrivers);
router.get('/', driverController.getDrivers);
router.post('/', driverController.createDriver);
router.patch('/:id/availability', driverController.updateAvailability);

module.exports = router;
