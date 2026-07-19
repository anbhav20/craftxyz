import { apiClient } from './client.js';
import { authApi } from './endpoints/authApi.js';
import { setCredentials, clearCredentials } from '../features/auth/authSlice.js';
import { addToast } from '../features/ui/uiSlice.js';
import { normalizeApiError } from '../utils/apiError.js';

// Shared across all in-flight requests so two things 401'ing at once
// don't trigger two separate refresh calls (and two rotations of the
// same refresh token, which would invalidate each other).
let refreshPromise = null;

/**
 * Call once, after the store is created (see main.jsx). Kept separate
 * from client.js so there's no circular import between the axios
 * instance and the redux store.
 *
 * Every error that reaches the end of this chain also dispatches a
 * toast — components don't need to catch and display API errors
 * themselves, just handle the happy path and let this be the single
 * place errors surface to the person using the app.
 */
export function setupInterceptors(store) {
  apiClient.interceptors.request.use((config) => {
    const { accessToken } = store.getState().auth;
    if (accessToken && !config._isRefreshCall) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config || {};
      const status = error.response?.status;

      // Only ever one retry per request, and never for the refresh
      // call itself — that would recurse forever.
      if (status === 401 && !config._isRefreshCall && !config._retried) {
        config._retried = true;
        try {
          if (!refreshPromise) {
            refreshPromise = authApi.refresh().finally(() => {
              refreshPromise = null;
            });
          }
          const { accessToken } = await refreshPromise;
          store.dispatch(setCredentials({ accessToken }));
          config.headers = { ...config.headers, Authorization: `Bearer ${accessToken}` };
          return apiClient(config);
        } catch (refreshError) {
          store.dispatch(clearCredentials());
          const normalized = normalizeApiError(refreshError);
          if (!config._silent) store.dispatch(addToast({ message: normalized.message }));
          return Promise.reject(normalized);
        }
      }

      const normalized = normalizeApiError(error);
      // Pass { _silent: true } in a request's config when a caller
      // wants to handle its own error UI instead of a generic toast
      // (e.g. inline form field errors) — none of the current calls
      // use this yet, but it's there for the checkout form later.
      if (!config._silent) store.dispatch(addToast({ message: normalized.message }));
      return Promise.reject(normalized);
    }
  );
}
