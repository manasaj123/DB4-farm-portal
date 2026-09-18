// routes/inspectorRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all inspectors
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM inspectors';
    const params = [];
    
    if (active === 'true') {
      query += ' WHERE active = 1';
    } else if (active === 'false') {
      query += ' WHERE active = 0';
    }
    
    query += ' ORDER BY name';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new inspector
router.post('/', async (req, res) => {
  try {
    const { name, department, email, phone, specialization } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if inspector already exists
    const [existing] = await db.query('SELECT id FROM inspectors WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Inspector already exists' });
    }
    
    const [result] = await db.query(
      `INSERT INTO inspectors (name, department, email, phone, specialization) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, department, email, phone, specialization]
    );
    
    const [newInspector] = await db.query('SELECT * FROM inspectors WHERE id = ?', [result.insertId]);
    res.status(201).json(newInspector[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;