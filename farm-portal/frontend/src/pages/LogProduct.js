// src/pages/LogProduct.js - With date validation
import React, { useState, useEffect, useRef } from 'react';
import Barcode from 'react-barcode';
import { batchAPI, vendorAPI, inspectorAPI } from '../services/api';
import AddInspectorModal from '../components/AddInspectorModal';
import BarcodeScanner from '../components/BarcodeScanner';

// ---------- Add Vendor Modal ----------
const AddVendorModal = ({ isOpen, onClose, onVendorAdded }) => {
  const [newVendor, setNewVendor] = useState({ 
    name: '', 
    state: '', 
    status: 'verified',
    type: 'vendor',
    active: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVendor({ 
      ...newVendor, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.state) {
      setError('Name and State are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await vendorAPI.create(newVendor);
      onVendorAdded(response.data);
      setNewVendor({ 
        name: '', 
        state: '', 
        status: 'verified',
        type: 'vendor',
        active: true 
      });
      onClose();
    } catch (err) {
      setError('Failed to add vendor: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000
    }}>
      <div style={{
        background: 'white', 
        padding: '30px', 
        borderRadius: '12px',
        width: '450px', 
        maxWidth: '95%', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ 
          marginBottom: '5px', 
          fontSize: '22px', 
          fontWeight: '600',
          color: '#1a1a2e'
        }}>
          Add New Vendor
        </h2>
        <p style={{ 
          color: '#6c757d', 
          fontSize: '14px', 
          marginBottom: '20px' 
        }}>
          Register a new vendor or farmer in the system
        </p>

        {error && (
          <div style={{ 
            color: '#dc3545', 
            marginBottom: '15px', 
            fontSize: '14px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vendor Type - Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px',
              color: '#333'
            }}>
              Type *
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              background: '#f8f9fa',
              padding: '4px',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setNewVendor({ ...newVendor, type: 'vendor' })}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: newVendor.type === 'vendor' ? '#007bff' : 'transparent',
                  color: newVendor.type === 'vendor' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🏪 Vendor
              </button>
              <button
                type="button"
                onClick={() => setNewVendor({ ...newVendor, type: 'farmer' })}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: newVendor.type === 'farmer' ? '#28a745' : 'transparent',
                  color: newVendor.type === 'farmer' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🌾 Farmer
              </button>
            </div>
          </div>

          {/* Vendor Name */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px',
              color: '#333'
            }}>
              {newVendor.type === 'vendor' ? 'Vendor Name' : 'Farmer Name'} *
            </label>
            <input
              type="text"
              name="name"
              value={newVendor.name}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
              placeholder={newVendor.type === 'vendor' ? "Enter vendor name" : "Enter farmer name"}
              required
            />
          </div>

          {/* State */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px',
              color: '#333'
            }}>
              State *
            </label>
            <input
              type="text"
              name="state"
              value={newVendor.state}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
              placeholder="e.g., Maharashtra"
              required
            />
          </div>

          {/* Status - Verified/Unverified */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px',
              color: '#333'
            }}>
              Status
            </label>
            <select
              name="status"
              value={newVendor.status}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="verified">✅ Verified</option>
              <option value="unverified">⚠️ Unverified</option>
            </select>
          </div>

          {/* Active/Inactive Toggle */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}>
              <div>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  {newVendor.active ? '🟢 Active' : '🔴 Inactive'}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6c757d', 
                  display: 'block',
                  marginTop: '2px'
                }}>
                  {newVendor.active 
                    ? 'Vendor/Farmer will appear in dropdown' 
                    : 'Vendor/Farmer will be hidden from dropdown'}
                </span>
              </div>
              <div 
                onClick={() => setNewVendor({ ...newVendor, active: !newVendor.active })}
                style={{
                  width: '50px',
                  height: '26px',
                  backgroundColor: newVendor.active ? '#28a745' : '#dc3545',
                  borderRadius: '13px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: newVendor.active ? '26px' : '2px',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'flex-end',
            marginTop: '10px',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.3s',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#218838';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#28a745';
              }}
            >
              {loading ? '⏳ Adding...' : `➕ Add ${newVendor.type === 'vendor' ? 'Vendor' : 'Farmer'}`}
            </button>
          </div>
        </form>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                transform: translateY(30px);
                opacity: 0;
              }
              to { 
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

// ---------- Add Warehouse Modal ----------
const AddWarehouseModal = ({ isOpen, onClose, onWarehouseAdded }) => {
  const [newWarehouse, setNewWarehouse] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newWarehouse.trim()) {
      onWarehouseAdded(newWarehouse.trim().toUpperCase());
      setNewWarehouse('');
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '30px', borderRadius: '12px',
        width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Add New Warehouse</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Warehouse Code *</label>
            <input
              type="text"
              value={newWarehouse}
              onChange={(e) => setNewWarehouse(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="e.g., WH-DL-02"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Add Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------- Custom Vendor Selector with Active/Inactive Toggles ----------
const VendorSelector = ({ vendors, selectedId, onChange, onAddVendor, onToggleActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [localVendors, setLocalVendors] = useState(vendors);
  const dropdownRef = useRef(null);

  // Update local vendors when props change
  useEffect(() => {
    setLocalVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeVendors = localVendors.filter(v => v.active !== false);
  const inactiveVendors = localVendors.filter(v => v.active === false);
  const allVendors = [...activeVendors, ...inactiveVendors];

  const selectedVendor = localVendors.find(v => v.id === selectedId);

  const handleToggleActive = async (vendorId, e) => {
    e.stopPropagation();
    setUpdatingId(vendorId);
    
    try {
      const vendor = localVendors.find(v => v.id === vendorId);
      const newStatus = !vendor.active;
      
      // Call API to update vendor
      const response = await vendorAPI.update(vendorId, { 
        active: newStatus 
      });
      
      console.log('Update response:', response.data);
      
      // Update local state
      setLocalVendors(localVendors.map(v => 
        v.id === vendorId ? { ...v, active: newStatus } : v
      ));
      
      // Notify parent
      onToggleActive(vendorId, newStatus);
      
    } catch (error) {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor status: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelect = (vendorId) => {
    onChange(vendorId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      {/* Selected value display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '42px'
        }}
      >
        <span style={{ color: selectedVendor ? '#333' : '#999' }}>
          {selectedVendor ? (
            <>
              {selectedVendor.type === 'farmer' ? '🌾' : '🏪'} {selectedVendor.name} ({selectedVendor.state})
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                backgroundColor: selectedVendor.status === 'verified' ? '#d4edda' : '#fff3cd',
                color: selectedVendor.status === 'verified' ? '#155724' : '#856404'
              }}>
                {selectedVendor.status === 'verified' ? '✅ Verified' : '⚠️ Unverified'}
              </span>
            </>
          ) : 'Select vendor or farmer ...'}
        </span>
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 100,
          padding: '4px 0'
        }}>
          {allVendors.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
              No vendors found
            </div>
          ) : (
            allVendors.map(vendor => {
              const isActive = vendor.active !== false;
              const typeLabel = vendor.type === 'farmer' ? '🌾' : '🏪';
              const statusLabel = vendor.status === 'verified' ? '✅' : '⚠️';
              const statusText = vendor.status === 'verified' ? 'Verified' : 'Unverified';
              
              return (
                <div
                  key={vendor.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: selectedId === vendor.id ? '#f0f7ff' : 'transparent',
                    borderBottom: '1px solid #f8f9fa',
                    transition: 'background-color 0.2s',
                    opacity: isActive ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== vendor.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== vendor.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Vendor info - clickable to select */}
                  <div 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                    onClick={() => handleSelect(vendor.id)}
                  >
                    <span>{typeLabel}</span>
                    <span style={{ fontWeight: selectedId === vendor.id ? '600' : '400' }}>
                      {vendor.name}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6c757d' }}>
                      ({vendor.state})
                    </span>
                    <span style={{
                      padding: '1px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      backgroundColor: vendor.status === 'verified' ? '#d4edda' : '#fff3cd',
                      color: vendor.status === 'verified' ? '#155724' : '#856404'
                    }}>
                      {statusLabel} {statusText}
                    </span>
                    {!isActive && (
                      <span style={{
                        padding: '1px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        backgroundColor: '#f8d7da',
                        color: '#dc3545'
                      }}>
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Active/Inactive toggle button */}
                  <button
                    onClick={(e) => handleToggleActive(vendor.id, e)}
                    disabled={updatingId === vendor.id}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: isActive ? '#28a745' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      cursor: updatingId === vendor.id ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      opacity: updatingId === vendor.id ? 0.6 : 1,
                      transition: 'all 0.3s',
                      whiteSpace: 'nowrap',
                      minWidth: '60px',
                      flexShrink: 0
                    }}
                  >
                    {updatingId === vendor.id ? '⏳' : (isActive ? '🟢 Active' : '🔴 Inactive')}
                  </button>
                </div>
              );
            })
          )}

          {/* Footer with Add New button */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 8px 8px',
            position: 'sticky',
            bottom: 0
          }}>
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              {activeVendors.length} active · {inactiveVendors.length} inactive
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onAddVendor();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              + Add New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Main LogProduct Component ----------
function LogProduct() {
  const [step, setStep] = useState(1);
  const [vendors, setVendors] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [showAddInspector, setShowAddInspector] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [dateError, setDateError] = useState('');
  const [warehouses, setWarehouses] = useState(['WH-MH-01', 'WH-PB-01', 'WH-KA-01', 'WH-HR-01']);
  const [formData, setFormData] = useState({
    vendor_id: '',
    product_name: '',
    category: '',
    barcode: '',
    quantity: '',
    uom: 'kg',
    warehouse_location: '',
    manufacturing_date: '',
    expiry_date: '',
    quality_grade: '',
    moisture_level: '',
    foreign_matter: '',
    inspector: '',
    certification_no: '',
    invoice_no: '',
    driver_name: '',
    vendor_notes: '',
    inspection_notes: '',
    vehicle_registration: '',
    shelf_life: '',
    inspection_description: ''
  });

  useEffect(() => {
    loadVendors();
    loadInspectors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadInspectors = async () => {
    try {
      const response = await inspectorAPI.getAll({ active: true });
      setInspectors(response.data);
    } catch (error) {
      console.error('Error loading inspectors:', error);
    }
  };

  const generateBarcode = () => {
    let barcode = '';
    for (let i = 0; i < 12; i++) {
      barcode += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    barcode += checkDigit;
    setFormData({ ...formData, barcode });
  };

  const handleScannedBarcode = (scannedCode, productInfo) => {
    const cleanCode = scannedCode.replace(/[^0-9]/g, '');
    
    setFormData(prev => ({
      ...prev,
      barcode: cleanCode,
      product_name: productInfo?.product_name || prev.product_name,
      category: productInfo?.category || prev.category,
      uom: productInfo?.unit || prev.uom,
    }));
    
    setShowScanner(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear date error when user changes any date
    if (name === 'manufacturing_date' || name === 'expiry_date') {
      setDateError('');
    }
    
    setFormData({ ...formData, [name]: value });
  };

  // Validate dates before proceeding to step 3 or submitting
  const validateDates = () => {
    const { manufacturing_date, expiry_date } = formData;
    
    // If both dates are provided, validate
    if (manufacturing_date && expiry_date) {
      const manufacturing = new Date(manufacturing_date);
      const expiry = new Date(expiry_date);
      
      if (manufacturing > expiry) {
        setDateError('❌ Manufacturing/Harvest Date cannot be after Expiry/Best Before Date');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 2) {
      // Validate dates before going to step 3
      if (!validateDates()) {
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    // Validate dates before submitting
    if (!validateDates()) {
      return;
    }
    
    try {
      const response = await batchAPI.create(formData);
      alert(`✅ Batch created successfully!\nBatch ID: ${response.data.batch_id}`);
      setStep(1);
      setDateError('');
      setFormData({
        vendor_id: '',
        product_name: '',
        category: '',
        barcode: '',
        quantity: '',
        uom: 'kg',
        warehouse_location: '',
        manufacturing_date: '',
        expiry_date: '',
        quality_grade: '',
        moisture_level: '',
        foreign_matter: '',
        inspector: '',
        certification_no: '',
        invoice_no: '',
        driver_name: '',
        vendor_notes: '',
        inspection_notes: '',
        vehicle_registration: '',
        shelf_life: '',
        inspection_description: ''
      });
    } catch (error) {
      alert('❌ Error creating batch: ' + error.message);
    }
  };

  const handleVendorAdded = (newVendor) => {
    setVendors([...vendors, { 
      id: newVendor.id, 
      name: newVendor.name, 
      state: newVendor.state, 
      status: newVendor.status,
      type: newVendor.type || 'vendor',
      active: newVendor.active !== undefined ? newVendor.active : true
    }]);
    setFormData({ ...formData, vendor_id: newVendor.id.toString() });
  };

  const handleVendorToggleActive = (vendorId, newStatus) => {
    setVendors(vendors.map(v => 
      v.id === vendorId ? { ...v, active: newStatus } : v
    ));
  };

  const handleInspectorAdded = (newInspector) => {
    setInspectors([...inspectors, newInspector]);
    setFormData({ ...formData, inspector: newInspector.name });
  };

  const handleWarehouseAdded = (code) => {
    setWarehouses([...warehouses, code]);
    setFormData({ ...formData, warehouse_location: code });
  };

  const getStepStyle = (stepNumber) => {
    if (step > stepNumber) return { bg: '#28a745', color: 'white' };
    if (step === stepNumber) return { bg: '#007bff', color: 'white' };
    return { bg: '#e9ecef', color: '#6c757d' };
  };

  const BarcodeDisplay = ({ number }) => {
    if (!number) return null;
    return (
      <div style={{
        marginTop: '15px',
        padding: '20px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px', fontWeight: '500' }}>
          Generated Barcode
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
          <Barcode
            value={number}
            format="EAN13"
            width={2}
            height={100}
            fontSize={16}
            margin={10}
            background="#ffffff"
            lineColor="#000000"
          />
        </div>
        <div style={{ fontSize: '12px', color: '#28a745', marginTop: '10px', fontWeight: '500' }}>
          ✓ Scannable EAN-13 Barcode
        </div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '5px', fontFamily: 'monospace', letterSpacing: '1px' }}>
          {number}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const selectedVendor = vendors.find(v => v.id === parseInt(formData.vendor_id));
    return (
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #b8daff'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>📋 Step Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {step >= 1 && selectedVendor && (
            <div>
              <strong>{selectedVendor.type === 'farmer' ? 'Farmer' : 'Vendor'}:</strong> {selectedVendor.name}
              {selectedVendor.type === 'farmer' && ' 🌾'}
              {selectedVendor.active === false && ' (Inactive)'}
            </div>
          )}
          {step >= 2 && (
            <>
              <div><strong>Product:</strong> {formData.product_name || '-'}</div>
              <div><strong>Category:</strong> {formData.category || '-'}</div>
              <div><strong>Qty:</strong> {formData.quantity || '0'} {formData.uom}</div>
              <div><strong>Warehouse:</strong> {formData.warehouse_location || '-'}</div>
              <div><strong>Barcode:</strong> {formData.barcode || '-'}</div>
              <div><strong>Manufacturing:</strong> {formData.manufacturing_date || '-'}</div>
              <div><strong>Expiry:</strong> {formData.expiry_date || '-'}</div>
            </>
          )}
          {step >= 3 && (
            <>
              <div><strong>Grade:</strong> {formData.quality_grade ? 'Grade ' + formData.quality_grade : '-'}</div>
              <div><strong>Inspector:</strong> {formData.inspector || '-'}</div>
              <div><strong>Shelf Life:</strong> {formData.shelf_life || '-'}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px' }}>
      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScannedBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Modals */}
      <AddVendorModal
        isOpen={showAddVendor}
        onClose={() => setShowAddVendor(false)}
        onVendorAdded={handleVendorAdded}
      />

      <AddWarehouseModal
        isOpen={showAddWarehouse}
        onClose={() => setShowAddWarehouse(false)}
        onWarehouseAdded={handleWarehouseAdded}
      />

      <AddInspectorModal
        isOpen={showAddInspector}
        onClose={() => setShowAddInspector(false)}
        onInspectorAdded={handleInspectorAdded}
      />

      <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>New Batch Intake</h1>
      <p style={{ color: '#6c757d', marginBottom: '30px' }}>Batch ID: Auto-generated</p>

      {/* Step Progress */}
      <div style={{ display: 'flex', marginBottom: '40px', gap: '10px' }}>
        {['Vendor Info', 'Product Details', 'Quality & Confirm'].map((label, index) => {
          const stepNum = index + 1;
          const style = getStepStyle(stepNum);
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: style.bg,
                color: style.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {step > stepNum ? '✓' : stepNum}
              </div>
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '500' }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Vendor Info */}
      {step === 1 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Vendor & Delivery Information</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              VENDOR / FARMER *
            </label>
            <VendorSelector
              vendors={vendors}
              selectedId={formData.vendor_id ? parseInt(formData.vendor_id) : null}
              onChange={(vendorId) => setFormData({ ...formData, vendor_id: vendorId.toString() })}
              onAddVendor={() => setShowAddVendor(true)}
              onToggleActive={handleVendorToggleActive}
            />
            
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setShowAddVendor(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                + Can't find your vendor? Add new
              </button>
              
              {vendors.filter(v => v.active === false).length > 0 && (
                <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: '10px' }}>
                  💡 {vendors.filter(v => v.active === false).length} inactive vendor(s) shown
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>DELIVERY DATE *</label>
            <input
              type="date"
              name="delivery_date"
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>INVOICE / CHALLAN NUMBER</label>
            <input
              type="text"
              name="invoice_no"
              value={formData.invoice_no}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="INV-2026-08-4421"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>DRIVER NAME</label>
            <input
              type="text"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>VEHICLE REGISTRATION</label>
            <input
              type="text"
              name="vehicle_registration"
              value={formData.vehicle_registration}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="e.g., MH12AB1234"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>VENDOR NOTES</label>
            <textarea
              name="vendor_notes"
              value={formData.vendor_notes}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="Any remarks from the vendor..."
            />
          </div>

          {renderSummary()}

          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Continue to Product Details →
          </button>
        </div>
      )}

      {/* Step 2: Product Details */}
      {step === 2 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Product Details & Barcode</h2>

          {/* Date Error Message */}
          {dateError && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{dateError}</span>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>PRODUCT NAME *</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="Basmati Rice"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CATEGORY</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            >
              <option value="">Select category ...</option>
              <option value="Cereals & Grains">Cereals & Grains</option>
              <option value="Pulses & Legumes">Pulses & Legumes</option>
              <option value="Spices & Condiments">Spices & Condiments</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Dairy Products">Dairy Products</option>
              <option value="Processed Foods">Processed Foods</option>
            </select>
          </div>

          {/* Barcode Section with Scanner */}
          <div style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: '600', fontSize: '16px' }}>
              📱 BARCODE NUMBER
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  letterSpacing: '2px'
                }}
                placeholder="Enter or generate barcode"
              />
              <button
                onClick={generateBarcode}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                🎲 Generate
              </button>
              <button
                onClick={() => setShowScanner(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📷 Scan
              </button>
            </div>
            
            {formData.barcode && (
              <div style={{
                fontSize: '12px',
                color: '#28a745',
                marginBottom: '10px',
                padding: '6px 12px',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                ✓ Barcode scanned / entered
              </div>
            )}
            
            <BarcodeDisplay number={formData.barcode} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>QUANTITY *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="1000"
              />
              <select
                name="uom"
                value={formData.uom}
                onChange={handleChange}
                style={{ width: '120px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="kg">kg</option>
                <option value="tonne">tonne</option>
                <option value="quintal">quintal</option>
                <option value="litre">litre</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
                <option value="bag">bag</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>WAREHOUSE LOCATION *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="warehouse_location"
                value={formData.warehouse_location}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              >
                <option value="">Select warehouse ...</option>
                {warehouses.map(wh => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddWarehouse(true)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Add New
              </button>
            </div>
          </div>

          {/* Date Fields with Validation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                MANUFACTURING / HARVEST DATE *
              </label>
              <input
                type="date"
                name="manufacturing_date"
                value={formData.manufacturing_date}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: formData.manufacturing_date && formData.expiry_date && 
                    new Date(formData.manufacturing_date) > new Date(formData.expiry_date) 
                    ? '2px solid #dc3545' 
                    : '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                EXPIRY / BEST BEFORE DATE *
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: formData.manufacturing_date && formData.expiry_date && 
                    new Date(formData.manufacturing_date) > new Date(formData.expiry_date) 
                    ? '2px solid #dc3545' 
                    : '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              {formData.manufacturing_date && formData.expiry_date && 
                new Date(formData.manufacturing_date) > new Date(formData.expiry_date) && (
                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '5px' }}>
                  ⚠️ Manufacturing date cannot be after expiry date
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>INSPECTION NOTES</label>
            <textarea
              name="inspection_notes"
              value={formData.inspection_notes}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="Detailed observations, defect description, or any remarks..."
            />
          </div>

          {renderSummary()}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Continue to Quality & Confirm →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Quality & Confirm */}
      {step === 3 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Quality Assessment & Confirmation</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>QUALITY GRADE *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {['A', 'B', 'C', 'Reject'].map((grade) => (
                <label key={grade} style={{
                  padding: '12px',
                  border: formData.quality_grade === grade ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: formData.quality_grade === grade ? '#f0f7ff' : 'white',
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="radio"
                    name="quality_grade"
                    value={grade}
                    checked={formData.quality_grade === grade}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{grade}</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>
                      {grade === 'A' && 'Premium'}
                      {grade === 'B' && 'Good'}
                      {grade === 'C' && 'Acceptable'}
                      {grade === 'Reject' && 'Reject'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>MOISTURE LEVEL (%)</label>
              <input
                type="number"
                step="0.1"
                name="moisture_level"
                value={formData.moisture_level}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="12.4"
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                Acceptable range: 10–14% for most grains
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>FOREIGN MATTER (%)</label>
              <input
                type="number"
                step="0.01"
                name="foreign_matter"
                value={formData.foreign_matter}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="0.25"
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                Maximum allowable: 2% for Grade A
              </div>
            </div>
          </div>

          {/* INSPECTOR SELECTION WITH ADD NEW BUTTON */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              QUALITY INSPECTOR *
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="inspector"
                value={formData.inspector}
                onChange={handleChange}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: formData.inspector ? '#f0f8ff' : 'white'
                }}
                required
              >
                <option value="">Select inspector ...</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.name}>
                    {inspector.name} {inspector.department ? `(${inspector.department})` : ''}
                    {inspector.specialization ? ` - ${inspector.specialization}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddInspector(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#138496'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#17a2b8'}
              >
                ➕ New Inspector
              </button>
            </div>
            {formData.inspector && (
              <div style={{
                fontSize: '13px',
                color: '#28a745',
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                ✓ Selected: {formData.inspector}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>QUALITY CERTIFICATION NO.</label>
            <input
              type="text"
              name="certification_no"
              value={formData.certification_no}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="APEDA-2026-MH-00441"
            />
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
              APEDA, FSSAI, or organic certification reference
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>SHELF LIFE</label>
            <input
              type="text"
              name="shelf_life"
              value={formData.shelf_life}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="e.g., 12 months from manufacture"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>INSPECTION DESCRIPTION</label>
            <textarea
              name="inspection_description"
              value={formData.inspection_description}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
              placeholder="Description of inspection process or findings..."
            />
          </div>

          {renderSummary()}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              ✅ Confirm & Log Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogProduct;