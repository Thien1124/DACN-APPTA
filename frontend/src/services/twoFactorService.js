import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const twoFactorService = {
  // Enable 2FA
  enable2FA: async () => {
    const response = await axiosInstance.post('/two-factor/enable');
    return response.data;
  },

  // Verify 2FA setup
  verify2FA: async (token) => {
    const response = await axiosInstance.post('/two-factor/verify', { token });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (token) => {
    const response = await axiosInstance.post('/two-factor/disable', { token });
    return response.data;
  },

  // Verify 2FA login
  verify2FALogin: async (token) => {
    const response = await axiosInstance.post('/two-factor/verify-login', { token });
    return response.data;
  },
};

export default twoFactorService;