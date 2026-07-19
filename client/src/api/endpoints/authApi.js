import { apiClient } from '../client.js';

// Every backend success response is { success, message, data } —
// unwrap to `data` here so slices/thunks never deal with the envelope.
const unwrap = (res) => res.data.data;

export const authApi = {
  googleLogin: (idToken) => apiClient.post('/auth/google', { idToken }).then(unwrap),

  adminLogin: (email, password) =>
    apiClient.post('/auth/admin-login', { email, password }).then(unwrap),

  // Marked so the response interceptor never tries to "refresh and
  // retry" a refresh call itself — that would recurse forever.
  refresh: () => apiClient.post('/auth/refresh', null, { _isRefreshCall: true }).then(unwrap),

  logout: () => apiClient.post('/auth/logout').then(unwrap),

  me: () => apiClient.get('/auth/me').then(unwrap),
};
