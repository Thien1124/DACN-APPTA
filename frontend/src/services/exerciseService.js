import api from '../utils/api';

export const exerciseService = {
  // Lấy exercises theo lesson
  getByLesson: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/exercises`);
    return response.data;
  }
};

export default exerciseService;