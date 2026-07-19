import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Lets the browser send/receive the HttpOnly refreshToken cookie —
  // required for /auth/refresh and /auth/logout to work at all.
  withCredentials: true,
});
