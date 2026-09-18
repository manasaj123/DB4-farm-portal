const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.get('/', batchController.getAllBatches);
router.get('/recent', batchController.getRecentBatches);
router.get('/history', batchController.getBatchHistory);
router.post('/', batchController.createBatch);
router.get('/stats', batchController.getBatchStats);
router.get('/monthly', batchController.getMonthlyIntake);

module.exports = router;