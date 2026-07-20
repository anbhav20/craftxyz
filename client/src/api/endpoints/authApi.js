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
  // _silent: a failed refresh here just means "not signed in yet" —
  // completely normal for every first-time visitor, so it shouldn't
  // surface as an error toast the way a real API failure would.
  refresh: () => apiClient.post('/auth/refresh', null, { _isRefreshCall: true, _silent: true }).then(unwrap),

  logout: () => apiClient.post('/auth/logout').then(unwrap),

  me: () => apiClient.get('/auth/me').then(unwrap),

  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then(unwrap),
  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }).then(unwrap),
};
