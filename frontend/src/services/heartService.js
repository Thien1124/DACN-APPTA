import axios from 'axios';
import api from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const heartService = {
  // Get current hearts
  getHearts: async () => {
    const response = await axiosInstance.get('/hearts');
    return response.data;
  },
refillHearts: async () => {
    try {
      const response = await api.get('/hearts/refill');
      return {
        success: true,
        hearts: response.data.hearts?.current || 5,
        maxHearts: response.data.hearts?.max || 5,
        refillTime: response.data.refillTime || null
      };
    } catch (error) {
      console.error('Error refilling hearts:', error);
      // Return default values instead of throwing
      return {
        success: false,
        hearts: 5,
        maxHearts: 5,
        refillTime: null
      };
    }
  },
  // Use a heart
  useHeart: async () => {
    const response = await axiosInstance.post('/hearts/use');
    return response.data;
  },

  buyHearts: async (amount) => {
    const response = await api.post('/hearts/buy', { amount });
    return response.data;
  }
};

export default heartService;