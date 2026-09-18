import React, { useState, useEffect } from 'react';
import { batchAPI } from '../services/api';

function SubmissionHistory() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    grade: '',
    sort: 'received_at',
    order: 'DESC'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBatches();
  }, [filters, pagination.page]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        sort: filters.sort,
        order: filters.order,
        ...(filters.status && { status: filters.status }),
        ...(filters.grade && { grade: filters.grade })
      };
      
      const response = await batchAPI.getHistory(params);
      setBatches(response.data.batches);
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const response = await batchAPI.getAll(searchTerm);
        setBatches(response.data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      loadBatches();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Approved': { bg: '#d4edda', color: '#155724' },
      'Review': { bg: '#fff3cd', color: '#856404' },
      'Rejected': { bg: '#f8d7da', color: '#721c24' }
    };
    return colors[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': '#28a745',
      'B': '#17a2b8',
      'C': '#ffc107',
      'Reject': '#dc3545'
    };
    return colors[grade] || '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>Submission History</h1>
          <p style={{ color: '#6c757d' }}>
            Total Batches: {pagination.total}
          </p>
        </div>
        
        {/* Search */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="🔍 Search batch, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              width: '300px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '150px' }}
        >
          <option value="">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Review">Review</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={filters.grade}
          onChange={(e) => {
            setFilters({ ...filters, grade: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '150px' }}
        >
          <option value="">All Grades</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="Reject">Rejected</option>
        </select>

        <select
          value={`${filters.sort}-${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setFilters({ ...filters, sort, order });
          }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '150px' }}
        >
          <option value="received_at-DESC">Newest First</option>
          <option value="received_at-ASC">Oldest First</option>
          <option value="quantity-DESC">Quantity: High to Low</option>
          <option value="quantity-ASC">Quantity: Low to High</option>
        </select>

        <button
          onClick={() => {
            setFilters({ status: '', grade: '', sort: 'received_at', order: 'DESC' });
            setSearchTerm('');
            setPagination({ ...pagination, page: 1 });
            loadBatches();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading...</div>
        </div>
      ) : (
        <>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={tableHeaderStyle}>Batch ID</th>
                    <th style={tableHeaderStyle}>Vendor</th>
                    <th style={tableHeaderStyle}>Product</th>
                    <th style={tableHeaderStyle}>Category</th>
                    <th style={tableHeaderStyle}>Quantity</th>
                    <th style={tableHeaderStyle}>Warehouse</th>
                    <th style={tableHeaderStyle}>Expiry Date</th>
                    <th style={tableHeaderStyle}>Grade</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Received At</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => {
                      const statusStyle = getStatusColor(batch.status);
                      return (
                        <tr 
                          key={batch.batch_id} 
                          style={{ 
                            borderBottom: '1px solid #eee',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => alert(`
Batch Details:
ID: ${batch.batch_id}
Vendor: ${batch.vendor_name}
Product: ${batch.product_name}
Quantity: ${batch.quantity} ${batch.uom}
Barcode: ${batch.barcode || 'N/A'}
Inspector: ${batch.inspector || 'N/A'}
Certification: ${batch.certification_no || 'N/A'}
                          `)}
                        >
                          <td style={tableCellStyle}>
                            <span style={{ fontWeight: '500', color: '#007bff' }}>
                              {batch.batch_id}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{batch.vendor_name}</div>
                              <div style={{ fontSize: '12px', color: '#6c757d' }}>{batch.state}</div>
                            </div>
                          </td>
                          <td style={tableCellStyle}>{batch.product_name}</td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              {batch.category}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{ fontWeight: '500' }}>
                              {batch.quantity} {batch.uom}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{batch.warehouse_location}</td>
                          <td style={tableCellStyle}>
                            <span style={{ 
                              color: new Date(batch.expiry_date) < new Date() ? '#dc3545' : '#28a745',
                              fontWeight: new Date(batch.expiry_date) < new Date() ? '600' : '400'
                            }}>
                              {formatDate(batch.expiry_date)}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              fontWeight: '600',
                              color: getGradeColor(batch.quality_grade),
                              fontSize: '14px'
                            }}>
                              Grade {batch.quality_grade}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              display: 'inline-block'
                            }}>
                              • {batch.status}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div>
                              <div style={{ fontSize: '13px' }}>{formatDate(batch.received_at)}</div>
                              <div style={{ fontSize: '11px', color: '#6c757d' }}>{formatTime(batch.received_at)}</div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.page === 1 ? '#e9ecef' : '#007bff',
                  color: pagination.page === 1 ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Previous
              </button>
              
              <span style={{ color: '#6c757d', fontSize: '14px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.page === pagination.totalPages ? '#e9ecef' : '#007bff',
                  color: pagination.page === pagination.totalPages ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6c757d',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap'
};

const tableCellStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: '#333'
};

export default SubmissionHistory;