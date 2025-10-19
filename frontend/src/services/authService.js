import api from '../utils/api';

export const authService = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Lưu token vào localStorage
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error(error.response?.data?.message || error.message || 'Đăng ký thất bại');
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Lưu token và user info vào localStorage
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  },

  // Đăng xuất (blacklist token)
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout'); // Backend sẽ blacklist token
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      // Vẫn xóa local storage ngay cả khi API fail
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Quên mật khẩu - gửi OTP
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gửi OTP thất bại');
    }
  },

  // Reset mật khẩu với OTP
  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  },

  // Xác thực OTP sau đăng ký
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại');
    }
  },

  // Gửi lại OTP
  resendOTP: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  },

  // Lấy thông tin profile từ API
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Lấy profile thất bại');
    }
  },

  // Cập nhật profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      
      // Cập nhật localStorage nếu có user data mới
      if (response.data.success && response.data.data?.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Cập nhật profile thất bại');
    }
  },
};