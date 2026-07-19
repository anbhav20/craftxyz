import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const userApi = {
  listAddresses: () => apiClient.get('/users/me/addresses').then(unwrap),
  addAddress: (address) => apiClient.post('/users/me/addresses', address).then(unwrap),
  updateAddress: (addressId, address) =>
    apiClient.patch(`/users/me/addresses/${addressId}`, address).then(unwrap),
  deleteAddress: (addressId) => apiClient.delete(`/users/me/addresses/${addressId}`).then(unwrap),
};
