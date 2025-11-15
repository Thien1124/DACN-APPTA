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

      const response = await api.post('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      if (response.data.success) {
        // Lưu token và user
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
      } else {
        // ✅ Special case: 2FA required - don't throw error, return data for component to handle
        if (response.data.requires2FA) {
          return response.data;
        }
        
        // Normal error case
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('🔥 authService.login error:', error);

      // ✅ Quan trọng: Throw lại error để component có thể catch
      throw error; // Giữ nguyên error object với error.response
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

  // Xác thực OTP cho đăng ký
  verifyOtp: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        // Lưu token và user nếu có
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Xác thực OTP thất bại');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại');
    }
  },

  // Gửi lại OTP cho đăng ký
  resendOtp: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  },

  // ✅ Cập nhật profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);

      if (response.data.success && response.data.data?.user) {
        // Cập nhật localStorage với thông tin mới
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...response.data.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success && response.data.data?.user) {
        // ✅ Cập nhật localStorage với thông tin mới nhất
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  },

  // ✅ Lấy thông tin user hiện tại từ API
  getCurrentUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Handle social login
  handleSocialLogin: (provider) => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';
    const providerPath = provider.toLowerCase();
    const authUrl = `${backendUrl}/auth/${providerPath}`;

    console.log('🔄 Redirecting to:', authUrl);
    window.location.href = authUrl;
  },

  // ========== 2FA METHODS ==========
  setup2FA: async () => {
    try {
      const response = await api.post('/2fa/setup');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể thiết lập 2FA');
    }
  },

  enable2FA: async (token) => {
    try {
      const response = await api.post('/2fa/enable', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể bật 2FA');
    }
  },

  verify2FA: async (token) => {
    try {
      const response = await api.post('/2fa/verify', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xác thực 2FA thất bại');
    }
  },

  disable2FA: async (password, token) => {
    try {
      const response = await api.post('/2fa/disable', { password, token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tắt 2FA');
    }
  },

  get2FAStatus: async () => {
    try {
      const response = await api.get('/2fa/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy trạng thái 2FA');
    }
  },

  // ========== 2FA LOGIN VERIFICATION ==========
  verify2FALogin: async (userId, email, twoFactorCode) => {
    try {
      const response = await api.post('/auth/verify-2fa-login', {
        userId,
        email,
        twoFactorCode
      });
      
      if (response.data.success) {
        // Save token and user to localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('2FA Login Verification Error:', error);
      throw new Error(
        error.response?.data?.messageVietnamese || 
        error.response?.data?.message || 
        'Xác thực 2FA thất bại'
      );
    }
  },
};

