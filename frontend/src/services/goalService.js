import api from '../utils/api';

export const goalService = {
  create: async (data) => {
    try {
      // Format data before sending
      const formattedData = {
        title: data.title,
        description: data.description,
        type: data.type,
        target: parseInt(data.target),
        deadline: new Date(data.deadline).toISOString(),
        skill: data.skill,
        current: 0,
        status: 'ACTIVE'
      };

      const response = await api.post('/goals', formattedData);
      return response.data;
    } catch (error) {
      console.error('Goal service error:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await api.get('/goals');
      console.log('API Response:', response.data);

      if (!response.data.success) {
        throw new Error('API request failed');
      }

      return {
        success: true,
        goals: response.data.data.goals // Lấy goals từ data object
      };
    } catch (error) {
      console.error('Get goals error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin mục tiêu');
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/goals/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật mục tiêu');
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể xóa mục tiêu');
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/goals/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê');
    }
  }
};