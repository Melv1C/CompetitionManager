import axios from 'axios';
import { env } from './env';

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
    // Retrieve the auth token from localStorage and attach it to the Authorization header
    const token = localStorage.getItem('bearer_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
