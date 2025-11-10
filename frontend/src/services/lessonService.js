import api from '../utils/api';

export const lessonService = {
  // Lấy chi tiết lesson + vocabularies + exercises
  getLessonById: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // Lấy vocabularies của lesson
  getVocabularies: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/vocabularies`);
    return response.data;
  },

  // Lấy exercises của lesson
  getExercises: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/exercises`);
    return response.data;
  },// Lấy lessons của unit
  getLessonsByUnit: async (unitId) => {
    const response = await api.get(`/units/${unitId}/lessons`);
    return response.data;
  }
};

export default lessonService;