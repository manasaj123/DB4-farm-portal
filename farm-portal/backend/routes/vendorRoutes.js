// routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.get('/', vendorController.getAllVendors);
router.get('/top', vendorController.getTopVendors);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);

module.exports = router;