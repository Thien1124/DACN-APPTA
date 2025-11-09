import api from '../utils/api';

export const progressService = {
  getUserProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },

  updateLessonProgress: async (lessonId, progressData) => {
    console.log('📤 Updating lesson progress:', { lessonId, progressData });
    try {
      const response = await api.put(`/progress/lessons/${lessonId}`, progressData);
      console.log('✅ Progress update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Progress update error:', error);
      throw error;
    }
  }
};

export default progressService;