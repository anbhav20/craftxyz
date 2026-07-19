import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard').then(unwrap),
  listCustomers: (params = {}) => apiClient.get('/admin/customers', { params }).then(unwrap),
  getSettings: () => apiClient.get('/admin/settings').then(unwrap),
  updateSettings: (fields) => apiClient.patch('/admin/settings', fields).then(unwrap),
  listAdmins: () => apiClient.get('/admin/admins').then(unwrap),
  createAdmin: (fields) => apiClient.post('/admin/admins', fields).then(unwrap),
};
