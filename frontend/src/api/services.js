import api from './axios';

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: (period = 'daily') => api.get(`/dashboard?period=${period}`),
};

// ─── Customers ──────────────────────────────────────────────────────────────
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  getHistory: (id) => api.get(`/customers/${id}/history`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// ─── Products ───────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
  getLowStock: () => api.get('/products/low-stock/alerts'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  upload: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Sales ──────────────────────────────────────────────────────────────────
export const saleAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getOne: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  getDailySummary: () => api.get('/sales/daily/summary'),
};

// ─── Udhaar ─────────────────────────────────────────────────────────────────
export const udhaarAPI = {
  getAll: (params) => api.get('/udhaar', { params }),
  create: (data) => api.post('/udhaar', data),
  recordPayment: (id, data) => api.post(`/udhaar/${id}/payment`, data),
  getHistory: (id) => api.get(`/udhaar/${id}/history`),
  getPendingSummary: () => api.get('/udhaar/pending/summary'),
};

// ─── Suppliers ──────────────────────────────────────────────────────────────
export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getPurchases: (id) => api.get(`/suppliers/${id}/purchases`),
};

// ─── Purchases ──────────────────────────────────────────────────────────────
export const purchaseAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
  recordPayment: (id, data) => api.post(`/purchases/${id}/payment`, data),
};

// ─── Reports ────────────────────────────────────────────────────────────────
export const reportAPI = {
  sales: (params) => api.get('/reports/sales', { params }),
  profit: (params) => api.get('/reports/profit', { params }),
  udhaar: () => api.get('/reports/udhaar'),
};

// ─── Notifications ──────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
};
