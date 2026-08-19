import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tbs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize every error into a plain object: { status, message, errors }
// so components never need to know about axios response shapes.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Session expired / invalid token: clear local auth state. The
      // AuthContext listens for this event to log the user out cleanly.
      if (status === 401) {
        window.dispatchEvent(new CustomEvent('tbs:unauthorized'));
      }

      return Promise.reject({
        status,
        message: data?.message || 'Something went wrong. Please try again later.',
        errors: data?.errors || null,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to reach the server. Check your connection and try again.',
        errors: null,
      });
    }

    return Promise.reject({ status: -1, message: error.message || 'Unexpected error', errors: null });
  }
);

export default apiClient;
