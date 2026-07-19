import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const orderApi = {
  list: (params = {}) => apiClient.get('/orders', { params }).then(unwrap),
  getById: (id) => apiClient.get(`/orders/${id}`).then(unwrap),
  updateStatus: (id, orderStatus) =>
    apiClient.patch(`/orders/${id}`, { orderStatus }).then(unwrap),
};

