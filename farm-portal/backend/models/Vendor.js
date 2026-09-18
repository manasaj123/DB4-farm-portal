// models/Vendor.js
const db = require('../config/database');

class Vendor {
  static async findAll() {
    try {
      const [rows] = await db.query('SELECT * FROM vendors ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  static async getTopVendors(limit = 5) {
    try {
      const [rows] = await db.query(`
        SELECT v.*, COUNT(b.id) as batch_count,
               AVG(CASE WHEN b.quality_grade != 'Reject' THEN 100 ELSE 0 END) as quality_percentage
        FROM vendors v
        LEFT JOIN batches b ON v.id = b.vendor_id
        GROUP BY v.id
        ORDER BY batch_count DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Error in getTopVendors:', error);
      throw error;
    }
  }

  static async create(vendorData) {
    try {
      const { name, state, status, type, active } = vendorData;
      const [result] = await db.query(
        'INSERT INTO vendors (name, state, status, type, active) VALUES (?, ?, ?, ?, ?)',
        [name, state, status || 'verified', type || 'vendor', active !== undefined ? active : true]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { name, state, status, type, active } = data;
      
      let updates = [];
      let values = [];
      
      if (name !== undefined && name !== null) {
        updates.push('name = ?');
        values.push(name);
      }
      if (state !== undefined && state !== null) {
        updates.push('state = ?');
        values.push(state);
      }
      if (status !== undefined && status !== null) {
        updates.push('status = ?');
        values.push(status);
      }
      if (type !== undefined && type !== null) {
        updates.push('type = ?');
        values.push(type);
      }
      if (active !== undefined && active !== null) {
        updates.push('active = ?');
        values.push(active ? 1 : 0);
      }
      
      if (updates.length === 0) {
        console.log('No fields to update for vendor:', id);
        return false;
      }
      
      values.push(id);
      const query = `UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`;
      console.log('Update query:', query);
      console.log('Values:', values);
      
      const [result] = await db.query(query, values);
      console.log('Update result:', result);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM vendors WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }
}

module.exports = Vendor;