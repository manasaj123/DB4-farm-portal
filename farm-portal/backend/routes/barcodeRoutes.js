// routes/barcodeRoutes.js - FIXED
const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcodeController');

// Barcode validation and lookup
router.get('/validate/:barcode', barcodeController.validateBarcode);
router.get('/lookup/:barcode', barcodeController.lookupBarcode);
router.get('/generate', barcodeController.generateBarcode);

// Barcode scanning
router.post('/scan', barcodeController.recordScan);
router.get('/scan-history', barcodeController.getScanHistory);
router.get('/stats', barcodeController.getBarcodeStats);

// Product management - REMOVED put and delete since they don't exist in controller
router.get('/products', barcodeController.getAllProducts);
router.post('/products', barcodeController.createProduct);
// Comment out these lines since the controller methods don't exist yet
// router.put('/products/:id', barcodeController.updateProduct);
// router.delete('/products/:id', barcodeController.deleteProduct);

// Generate valid barcode
router.get('/generate-valid', barcodeController.generateValidEAN13);

module.exports = router;