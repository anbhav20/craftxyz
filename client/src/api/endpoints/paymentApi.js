import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const paymentApi = {
  createOrder: (addressId) => apiClient.post('/payment/create-order', { addressId }).then(unwrap),
  verify: (payload) => apiClient.post('/payment/verify', payload).then(unwrap),
};
