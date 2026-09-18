// models/Batch.js - Fixed to handle empty decimal values
const db = require('../config/database');

class Batch {
  static async findAll(search = '') {
    let query = `
      SELECT b.*, v.name as vendor_name, v.state 
      FROM batches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
    `;
    let params = [];

    if (search) {
      query += ` WHERE b.batch_id LIKE ? OR v.name LIKE ? OR b.barcode LIKE ?`;
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += ` ORDER BY b.received_at DESC LIMIT 50`;
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findRecent(limit = 10) {
    const [rows] = await db.query(`
      SELECT b.*, v.name as vendor_name, v.state 
      FROM batches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      ORDER BY b.received_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  static async findHistory(filters = {}) {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'received_at', 
      order = 'DESC', 
      status, 
      vendor, 
      grade,
      inspector
    } = filters;

    let query = `
      SELECT b.*, v.name as vendor_name, v.state 
      FROM batches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM batches b
      WHERE 1=1
    `;
    let params = [];
    let countParams = [];

    if (status) {
      query += ` AND b.status = ?`;
      countQuery += ` AND b.status = ?`;
      params.push(status);
      countParams.push(status);
    }
    if (vendor) {
      query += ` AND b.vendor_id = ?`;
      countQuery += ` AND b.vendor_id = ?`;
      params.push(vendor);
      countParams.push(vendor);
    }
    if (grade) {
      query += ` AND b.quality_grade = ?`;
      countQuery += ` AND b.quality_grade = ?`;
      params.push(grade);
      countParams.push(grade);
    }
    if (inspector) {
      query += ` AND b.inspector = ?`;
      countQuery += ` AND b.inspector = ?`;
      params.push(inspector);
      countParams.push(inspector);
    }

    const allowedSorts = ['received_at', 'quantity', 'batch_id', 'status', 'quality_grade', 'inspector'];
    const sortField = allowedSorts.includes(sort) ? sort : 'received_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY b.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    
    const [rows] = await db.query(query, [...params, parseInt(limit), offset]);
    const [countResult] = await db.query(countQuery, countParams);
    
    return {
      batches: rows,
      total: countResult[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult[0].total / parseInt(limit))
    };
  }

  static async getStats() {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) as total_batches,
        COALESCE(SUM(quantity), 0) as total_quantity,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'Review' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN quality_grade = 'A' THEN 1 END) as grade_a,
        COUNT(CASE WHEN quality_grade = 'B' THEN 1 END) as grade_b,
        COUNT(CASE WHEN quality_grade = 'C' THEN 1 END) as grade_c,
        COUNT(CASE WHEN quality_grade = 'Reject' THEN 1 END) as grade_reject,
        COUNT(CASE WHEN inspector IS NOT NULL AND inspector != '' THEN 1 END) as has_inspector
      FROM batches
    `);
    return rows[0];
  }

  static async getMonthlyIntake() {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(received_at, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM batches
      WHERE received_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(received_at, '%Y-%m')
      ORDER BY month ASC
    `);
    return rows;
  }

  static async create(batchData) {
    const {
      batch_id, vendor_id, product_name, category, barcode,
      quantity, uom, warehouse_location, manufacturing_date,
      expiry_date, shelf_life, quality_grade, moisture_level, foreign_matter,
      inspector, certification_no, invoice_no, driver_name, vehicle_registration,
      vendor_notes, inspection_notes, status
    } = batchData;

    const safeInspector = inspector || 'Pending Assignment';
    const safeStatus = status || 'Review';

    // Convert empty strings to null for decimal/numeric fields
    const safeMoistureLevel = moisture_level !== undefined && moisture_level !== '' && !isNaN(moisture_level) 
      ? parseFloat(moisture_level) 
      : null;
    
    const safeForeignMatter = foreign_matter !== undefined && foreign_matter !== '' && !isNaN(foreign_matter) 
      ? parseFloat(foreign_matter) 
      : null;
    
    const safeQuantity = quantity !== undefined && quantity !== '' && !isNaN(quantity) 
      ? parseFloat(quantity) 
      : 0;

    const [result] = await db.query(`
      INSERT INTO batches 
      (batch_id, vendor_id, product_name, category, barcode,
       quantity, uom, warehouse_location, manufacturing_date,
       expiry_date, shelf_life, quality_grade, moisture_level, foreign_matter,
       inspector, certification_no, invoice_no, driver_name, vehicle_registration,
       vendor_notes, inspection_notes, status, received_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      batch_id, 
      vendor_id, 
      product_name, 
      category, 
      barcode,
      safeQuantity, 
      uom || 'kg', 
      warehouse_location, 
      manufacturing_date || null,
      expiry_date, 
      shelf_life || null, 
      quality_grade, 
      safeMoistureLevel, 
      safeForeignMatter,
      safeInspector, 
      certification_no, 
      invoice_no, 
      driver_name, 
      vehicle_registration,
      vendor_notes, 
      inspection_notes, 
      safeStatus
    ]);
    
    return result.insertId;
  }
}

module.exports = Batch;