import api from '../utils/api';

export const roadmapTopicService = {
  // Tạo lộ trình học cá nhân hóa toàn diện
  generate: async (startLevel, endLevel, topic) => {
    const response = await api.post('/roadmap-topic/generate', {
      startLevel,
      endLevel,
      topic
    });
    return response.data;
  },

  // Get current roadmap
  getCurrent: async () => {
    try {
      const response = await api.get('/roadmap-topic/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete a step
  completeStep: async (roadmapId, stepNumber, score) => {
    try {
      const response = await api.post(`/roadmap-topic/${roadmapId}/complete-step`, {
        stepNumber,
        score
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get exercises for a step (alias: getStep)
  getStep: async (roadmapId, stepNumber) => {
    try {
      const response = await api.get(`/roadmap-topic/${roadmapId}/step/${stepNumber}/exercises`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get exercises for a step
  getStepExercises: async (roadmapId, stepNumber) => {
    try {
      const response = await api.get(`/roadmap-topic/${roadmapId}/step/${stepNumber}/exercises`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all roadmaps for user
  getAll: async () => {
    try {
      const response = await api.get('/roadmap-topic/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get roadmap by ID
  getById: async (roadmapId) => {
    try {
      const response = await api.get(`/roadmap-topic/${roadmapId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};