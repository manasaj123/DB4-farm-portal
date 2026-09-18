// controllers/batchController.js
const db = require('../config/database');
const Batch = require('../models/Batch');

exports.getAllBatches = async (req, res) => {
  try {
    const { search } = req.query;
    const batches = await Batch.findAll(search);
    res.json(batches);
  } catch (error) {
    console.error('Error in getAllBatches:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentBatches = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const batches = await Batch.findRecent(parseInt(limit));
    res.json(batches);
  } catch (error) {
    console.error('Error in getRecentBatches:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createBatch = async (req, res) => {
  try {
    console.log('Received batch data:', req.body); // Debug log

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const batchId = `BATCH-${dateStr}-${random}`;
    
    // Ensure all fields are properly formatted
    const batchData = {
      ...req.body,
      batch_id: batchId,
      inspector: req.body.inspector || 'Pending Assignment',
      status: req.body.status || 'Review'
    };
    
    const batchIdResult = await Batch.create(batchData);
    
    res.status(201).json({ 
      id: batchIdResult, 
      batch_id: batchId,
      message: 'Batch created successfully' 
    });
  } catch (error) {
    console.error('Error in createBatch:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.sqlMessage || 'Database error'
    });
  }
};

exports.getBatchHistory = async (req, res) => {
  try {
    const result = await Batch.findHistory(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error in getBatchHistory:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBatchStats = async (req, res) => {
  try {
    const stats = await Batch.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in getBatchStats:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMonthlyIntake = async (req, res) => {
  try {
    const data = await Batch.getMonthlyIntake();
    res.json(data);
  } catch (error) {
    console.error('Error in getMonthlyIntake:', error);
    res.status(500).json({ error: error.message });
  }
};