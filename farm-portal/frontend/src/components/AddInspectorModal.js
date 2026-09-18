// src/components/AddInspectorModal.js
import React, { useState } from 'react';
import { inspectorAPI } from '../services/api';

function AddInspectorModal({ isOpen, onClose, onInspectorAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    phone: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Inspector name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await inspectorAPI.create(formData);
      onInspectorAdded(response.data);
      setFormData({ name: '', department: '', email: '', phone: '', specialization: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add inspector');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>👤 Add New Inspector</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dr. Ananya Singh"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Department</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Food Safety">Food Safety</option>
                <option value="Lab Testing">Lab Testing</option>
                <option value="Regulatory">Regulatory</option>
              </select>
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Specialization</option>
                <option value="Grains & Pulses">Grains & Pulses</option>
                <option value="Spices & Condiments">Spices & Condiments</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Oilseeds & Processed">Oilseeds & Processed</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Organic Certification">Organic Certification</option>
                <option value="FSSAI Compliance">FSSAI Compliance</option>
              </select>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="inspector@farmportal.in"
                style={styles.input}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : '➕ Add Inspector'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    width: '500px',
    maxWidth: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    animation: 'slideIn 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    color: '#333',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#999',
    cursor: 'pointer',
    padding: '0 8px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #f5c6cb',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    fontSize: '13px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    backgroundColor: '#fafafa',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AddInspectorModal;