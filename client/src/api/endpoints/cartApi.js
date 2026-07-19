import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const cartApi = {
  get: () => apiClient.get('/cart').then(unwrap),
  addItem: (productId, quantity = 1) => apiClient.post('/cart', { productId, quantity }).then(unwrap),
  updateItem: (productId, quantity) =>
    apiClient.patch(`/cart/item/${productId}`, { quantity }).then(unwrap),
  removeItem: (productId) => apiClient.delete(`/cart/item/${productId}`).then(unwrap),
  clear: () => apiClient.delete('/cart').then(unwrap),
};
