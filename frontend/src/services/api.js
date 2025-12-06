import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tenant APIs
export const loginTenant = async (email) => {
  const response = await api.post('/api/tenants/login', { email });
  return response.data;
};

export const getTenants = async () => {
  const response = await api.get('/api/tenants');
  return response.data;
};

// Ingestion APIs
export const syncAllData = async (tenantId) => {
  const response = await api.post('/api/ingestion/sync-all', { tenantId });
  return response.data;
};

export const getProducts = async (tenantId) => {
  const response = await api.get(`/api/ingestion/products?tenantId=${tenantId}`);
  return response.data;
};

export const getCustomers = async (tenantId) => {
  const response = await api.get(`/api/ingestion/customers?tenantId=${tenantId}`);
  return response.data;
};

export const getOrders = async (tenantId) => {
  const response = await api.get(`/api/ingestion/orders?tenantId=${tenantId}`);
  return response.data;
};

// Analytics APIs
export const getOverview = async (tenantId) => {
  const response = await api.get(`/api/metrics/overview?tenantId=${tenantId}`);
  return response.data;
};

export const getOrdersByDate = async (tenantId, range = '30d') => {
  const response = await api.get(`/api/metrics/orders-by-date?tenantId=${tenantId}&range=${range}`);
  return response.data;
};

export const getTopCustomers = async (tenantId, limit = 5) => {
  const response = await api.get(`/api/metrics/top-customers?tenantId=${tenantId}&limit=${limit}`);
  return response.data;
};

export const getProductStats = async (tenantId) => {
  const response = await api.get(`/api/metrics/products?tenantId=${tenantId}`);
  return response.data;
};

export const getTopProducts = async (tenantId, limit = 5) => {
  const response = await api.get(`/api/metrics/top-products?tenantId=${tenantId}&limit=${limit}`);
  return response.data;
};

export const getProductBreakdown = async (tenantId) => {
  const response = await api.get(`/api/metrics/product-breakdown?tenantId=${tenantId}`);
  return response.data;
};

export const getInventoryAlerts = async (tenantId) => {
  const response = await api.get(`/api/metrics/inventory-alerts?tenantId=${tenantId}`);
  return response.data;
};

export default api;
