const db = require('../config/database');
const bwipjs = require('bwip-js');

// Validate EAN-13 barcode
exports.validateBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const cleanBarcode = barcode.replace(/[^0-9]/g, '');
    const result = validateEAN13(cleanBarcode);
    
    res.json({
      barcode: cleanBarcode,
      valid: result,
      format: result ? 'EAN-13' : 'Invalid',
      length: cleanBarcode.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lookup product by barcode
exports.lookupBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const cleanBarcode = barcode.replace(/[^0-9]/g, '');
    
    // Check if valid EAN-13
    const isValid = validateEAN13(cleanBarcode);
    
    // Search in product database
    const [products] = await db.query(
      'SELECT * FROM barcode_products WHERE barcode = ?',
      [cleanBarcode]
    );
    
    // Check if barcode already exists in batches
    const [existingBatches] = await db.query(
      'SELECT COUNT(*) as count FROM batches WHERE barcode = ?',
      [cleanBarcode]
    );
    
    res.json({
      barcode: cleanBarcode,
      valid: isValid,
      product: products[0] || null,
      exists_in_batches: existingBatches[0].count > 0,
      batch_count: existingBatches[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate barcode image
exports.generateBarcode = async (req, res) => {
  try {
    const { barcode, format = 'ean13', height = 60, width = 2, scale = 3 } = req.query;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode number required' });
    }
    
    const cleanBarcode = barcode.replace(/[^0-9]/g, '');
    
    // Generate barcode as image
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: format,
      text: cleanBarcode,
      scale: parseInt(scale) || 3,
      height: parseInt(height) || 60,
      width: parseInt(width) || 2,
      includetext: true,
      textxalign: 'center',
      textsize: 12,
      textyoffset: -6,
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename=barcode-${cleanBarcode}.png`);
    res.send(barcodeBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record barcode scan
exports.recordScan = async (req, res) => {
  try {
    const { barcode, batch_id, scan_location, notes, inspector } = req.body;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }
    
    const cleanBarcode = barcode.replace(/[^0-9]/g, '');
    const isValid = validateEAN13(cleanBarcode);
    
    const [result] = await db.query(`
      INSERT INTO barcode_scans 
      (barcode, batch_id, scan_location, notes, status, inspector)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      cleanBarcode,
      batch_id || null,
      scan_location || 'Unknown',
      notes || null,
      'pending',
      inspector || null
    ]);
    
    // If batch_id provided, update the batch
    if (batch_id) {
      await db.query(
        'UPDATE batches SET is_barcode_scanned = TRUE, scan_method = ? WHERE id = ?',
        ['scanner', batch_id]
      );
    }
    
    // Lookup product info
    const [product] = await db.query(
      'SELECT * FROM barcode_products WHERE barcode = ?',
      [cleanBarcode]
    );
    
    res.status(201).json({
      id: result.insertId,
      barcode: cleanBarcode,
      valid: isValid,
      product: product[0] || null,
      message: 'Scan recorded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get scan history
exports.getScanHistory = async (req, res) => {
  try {
    const { limit = 50, status, barcode } = req.query;
    
    let query = `
      SELECT s.*, 
             b.batch_id, 
             b.product_name as batch_product,
             v.name as vendor_name,
             p.product_name as product_name,
             p.category as product_category
      FROM barcode_scans s
      LEFT JOIN batches b ON s.batch_id = b.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      LEFT JOIN barcode_products p ON s.barcode = p.barcode
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    
    if (barcode) {
      query += ' AND s.barcode LIKE ?';
      params.push(`%${barcode}%`);
    }
    
    query += ` ORDER BY s.scanned_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get barcode statistics
exports.getBarcodeStats = async (req, res) => {
  try {
    // Total scans today
    const [todayScans] = await db.query(`
      SELECT COUNT(*) as total_today 
      FROM barcode_scans 
      WHERE DATE(scanned_at) = CURDATE()
    `);
    
    // Scans by status
    const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM barcode_scans 
      GROUP BY status
    `);
    
    // Most scanned barcodes
    const [topBarcodes] = await db.query(`
      SELECT s.barcode, 
             COUNT(*) as scan_count,
             p.product_name,
             p.category,
             (SELECT COUNT(*) FROM batches WHERE barcode = s.barcode) as batch_count
      FROM barcode_scans s
      LEFT JOIN barcode_products p ON s.barcode = p.barcode
      GROUP BY s.barcode
      ORDER BY scan_count DESC
      LIMIT 10
    `);
    
    // Total unique barcodes
    const [uniqueBarcodes] = await db.query(`
      SELECT COUNT(DISTINCT barcode) as unique_count 
      FROM barcode_scans
    `);
    
    // Total scans overall
    const [totalScans] = await db.query(`
      SELECT COUNT(*) as total 
      FROM barcode_scans
    `);
    
    res.json({
      total_scans: totalScans[0].total,
      total_today: todayScans[0].total_today,
      unique_barcodes: uniqueBarcodes[0].unique_count,
      by_status: statusCounts,
      top_barcodes: topBarcodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all barcode products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM barcode_products ORDER BY product_name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create barcode product
exports.createProduct = async (req, res) => {
  try {
    const { barcode, product_name, category, brand, manufacturer, unit, standard_quantity } = req.body;
    
    if (!barcode || !product_name) {
      return res.status(400).json({ error: 'Barcode and product name are required' });
    }
    
    const cleanBarcode = barcode.replace(/[^0-9]/g, '');
    
    const [result] = await db.query(`
      INSERT INTO barcode_products 
      (barcode, product_name, category, brand, manufacturer, unit, standard_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      cleanBarcode,
      product_name,
      category || null,
      brand || null,
      manufacturer || null,
      unit || 'kg',
      standard_quantity || null
    ]);
    
    const [newProduct] = await db.query('SELECT * FROM barcode_products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate valid EAN-13 barcode
exports.generateValidEAN13 = async (req, res) => {
  try {
    const { prefix = '890' } = req.query;
    
    // Generate random 9 digits
    let random = '';
    for (let i = 0; i < 9; i++) {
      random += Math.floor(Math.random() * 10);
    }
    
    const partial = prefix + random;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const barcode = partial + checkDigit;
    
    res.json({
      barcode: barcode,
      format: 'EAN-13',
      valid: true,
      prefix: prefix
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// backend/controllers/authController.js - Add this method

// Direct password reset (no email, single field - username)
exports.resetPasswordDirect = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    console.log('Reset password attempt for username:', username);

    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Username and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.username);

    // Update password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashedPassword);

    console.log('Password updated for user:', user.username);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
};

// Helper function to validate EAN-13 barcode
function validateEAN13(barcode) {
  const clean = barcode.replace(/[^0-9]/g, '');
  
  if (clean.length !== 13) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return parseInt(clean[12]) === checkDigit;
}