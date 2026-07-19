import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const productApi = {
  // params: { q, category, minPrice, maxPrice, featured, page, limit, sort }
  list: (params = {}) => apiClient.get('/products', { params }).then(unwrap),

  getBySlug: (slug) => apiClient.get(`/products/${slug}`).then(unwrap),

  // `fields` is a plain object; `images` (optional) is a FileList/array
  // of File objects. Built as multipart/form-data since the backend
  // accepts image uploads on the same request.
  create: (fields, images = []) => {
    const form = buildProductForm(fields, images);
    return apiClient.post('/products', form).then(unwrap);
  },

  update: (slug, fields, images = []) => {
    const form = buildProductForm(fields, images);
    return apiClient.patch(`/products/${slug}`, form).then(unwrap);
  },

  remove: (slug) => apiClient.delete(`/products/${slug}`).then(unwrap),
};

function buildProductForm(fields, images) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  Array.from(images || []).forEach((file) => form.append('images', file));
  return form;
}

