import api from '../utils/api';

export const progressService = {
  getUserProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },

  updateLessonProgress: async (lessonId, progressData) => {
    const response = await api.post('/progress/lesson', {
      lessonId,
      ...progressData
    });
    return response.data;
  }
};

export default progressService;