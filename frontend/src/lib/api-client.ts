import axios from 'axios';
import { env } from './env';
import i18n from './i18n';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS requests
});

apiClient.interceptors.request.use(
  config => {
    if (env.VITE_USE_BEARER) {
      // Retrieve the auth token from localStorage and attach it to the Authorization header
      const token = localStorage.getItem('bearer_token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    config.headers['Accept-Language'] = i18n.language;

    return config;
  },
  error => Promise.reject(error),
);

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle global errors
//     return Promise.reject(error);
//   }
// );
