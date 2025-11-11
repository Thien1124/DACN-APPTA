import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1124/api',
  withCredentials: true, // Đảm bảo cookies được gửi
  timeout: 300000,
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
    console.log('API Request Config:', config); // Add this log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
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