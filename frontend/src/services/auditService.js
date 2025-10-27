import api from '../utils/api';

export const auditService = {
  // Lấy audit logs của user hiện tại
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/audit/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Lấy thống kê audit logs của user
  getStats: async (days = 7) => {
    try {
      const response = await api.get('/audit/logs/stats', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  },

  // Admin only - Lấy tất cả audit logs
  getAllLogs: async (params = {}) => {
    try {
      const response = await api.get('/audit/logs/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all audit logs:', error);
      throw error;
    }
  },

  // Admin only - Lấy thống kê tổng hợp
  getAllStats: async (days = 7) => {
    try {
      const response = await api.get('/audit/logs/stats/all', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all audit stats:', error);
      throw error;
    }
  }
};
