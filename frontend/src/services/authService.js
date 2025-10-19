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
        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post('/auth/logout');
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

  // Kiểm tra role admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  // Kiểm tra tài khoản đã kích hoạt
  isActive: () => {
    const user = authService.getCurrentUser();
    return user?.isActive === true;
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
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Reset mật khẩu thất bại');
    }
  },

  // Xác thực OTP
  verifyOTP: async (data) => {
    try {
      const response = await api.post('/auth/verify-otp', data);
      
      if (response.data.success) {
        // Cập nhật user info sau khi verify
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
      }
      throw new Error(response.data.message || 'Xác thực OTP thất bại');
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

  // Lấy thông tin profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success && response.data.data?.user) {
        // Cập nhật localStorage với thông tin mới nhất
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  }
};