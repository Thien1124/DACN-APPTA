import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1124/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);
    
    if (error.response) {
      console.error(`🔴 Status: ${error.response.status}`);
      console.error('🔴 Data:', error.response.data);
      console.error('🔴 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔴 No response received:', error.request);
    } else {
      console.error('🔴 Error message:', error.message);
    }
    
    // Xử lý 401 Unauthorized
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // ✅ Luôn reject để component có thể catch
    return Promise.reject(error);
  }
);

export default api;