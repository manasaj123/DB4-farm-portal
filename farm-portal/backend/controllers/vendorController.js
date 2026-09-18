// controllers/vendorController.js
const Vendor = require('../models/Vendor');

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTopVendors = async (req, res) => {
  try {
    const vendors = await Vendor.getTopVendors();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, state, status, type, active } = req.body;
    const vendorId = await Vendor.create({ name, state, status, type, active });
    const newVendor = await Vendor.findById(vendorId);
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state, status, type, active } = req.body;
    
    console.log('=== UPDATE VENDOR REQUEST ===');
    console.log('Vendor ID:', id);
    console.log('Data received:', { name, state, status, type, active });
    
    // Check if vendor exists
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    console.log('Current vendor data:', vendor);
    
    // Update vendor
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (active !== undefined) updateData.active = active;
    
    console.log('Update data:', updateData);
    
    const updated = await Vendor.update(id, updateData);
    if (updated) {
      const updatedVendor = await Vendor.findById(id);
      console.log('Updated vendor:', updatedVendor);
      return res.json({ 
        message: 'Vendor updated successfully', 
        vendor: updatedVendor 
      });
    }
    res.status(404).json({ error: 'Vendor not found' });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: error.message });
  }
};