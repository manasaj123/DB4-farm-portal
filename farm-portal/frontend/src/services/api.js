// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

export const vendorAPI = {
  getAll: () => API.get('/vendors'),
  getTop: () => API.get('/vendors/top'),
  create: (data) => API.post('/vendors', data),
  update: (id, data) => API.put(`/vendors/${id}`, data)
};

export const batchAPI = {
  getAll: (search) => API.get('/batches', { params: { search } }),
  getRecent: () => API.get('/batches/recent'),
  getHistory: (params) => API.get('/batches/history', { params }),
  create: (data) => API.post('/batches', data),
  getStats: () => API.get('/batches/stats'),
  getMonthly: () => API.get('/batches/monthly')
};

export const inspectorAPI = {
  getAll: (params) => API.get('/inspectors', { params }),
  getById: (id) => API.get(`/inspectors/${id}`),
  create: (data) => API.post('/inspectors', data),
  update: (id, data) => API.put(`/inspectors/${id}`, data),
  delete: (id) => API.delete(`/inspectors/${id}`)
};

export const barcodeAPI = {
  validate: (barcode) => API.get(`/barcode/validate/${barcode}`),
  lookup: (barcode) => API.get(`/barcode/lookup/${barcode}`),
  generateImage: (barcode, params = {}) => {
    const queryParams = new URLSearchParams({ barcode, ...params });
    return API.get(`/barcode/generate?${queryParams.toString()}`, { responseType: 'blob' });
  },
  generateValid: (prefix = '890') => API.get(`/barcode/generate-valid?prefix=${prefix}`),
  recordScan: (data) => API.post('/barcode/scan', data),
  getScanHistory: (params) => API.get('/barcode/scan-history', { params }),
  getStats: () => API.get('/barcode/stats'),
  getProducts: () => API.get('/barcode/products'),
  createProduct: (data) => API.post('/barcode/products', data),
  updateProduct: (id, data) => API.put(`/barcode/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/barcode/products/${id}`)
};