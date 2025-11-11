import api from '../utils/api';

export const roadmapTopicService = {
  // Generate roadmap for topic
  generate: async (startLevel, endLevel, topic = 'General English', stepsPerLevel = 20, easyRatio = 35, mediumRatio = 35, hardRatio = 30) => {
    const response = await api.post('/roadmap-topic/generate', {
      startLevel,
      endLevel,
      topic,
      stepsPerLevel,
      easyRatio,
      mediumRatio,
      hardRatio
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

  // Get exercises for a step
  getStepExercises: async (roadmapId, stepNumber) => {
    try {
      const response = await api.get(`/roadmap-topic/${roadmapId}/step/${stepNumber}/exercises`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};