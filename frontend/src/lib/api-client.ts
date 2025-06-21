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

// You can add interceptors here for authentication, error handling, etc.
// apiClient.interceptors.request.use(
//   (config) => {
//     // Add auth token, etc.
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle global errors
//     return Promise.reject(error);
//   }
// );
