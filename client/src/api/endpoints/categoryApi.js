import { apiClient } from '../client.js';

const unwrap = (res) => res.data.data;

export const categoryApi = {
  list: () => apiClient.get('/categories').then(unwrap),
  getBySlug: (slug) => apiClient.get(`/categories/${slug}`).then(unwrap),

  create: (fields, image) => {
    const form = buildCategoryForm(fields, image);
    return apiClient.post('/categories', form).then(unwrap);
  },

  update: (slug, fields, image) => {
    const form = buildCategoryForm(fields, image);
    return apiClient.patch(`/categories/${slug}`, form).then(unwrap);
  },

  remove: (slug) => apiClient.delete(`/categories/${slug}`).then(unwrap),
};

function buildCategoryForm(fields, image) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  if (image) form.append('image', image);
  return form;
}

