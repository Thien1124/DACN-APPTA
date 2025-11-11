// frontend/src/services/practiceService.js
import api from '../utils/api';

export const practiceService = {
  // Get exercises với filter
  getExercises: async (filters = {}) => {
    try {
      const response = await api.get('/practice/exercises', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get exercise by ID
  getExerciseById: async (id) => {
    try {
      const response = await api.get(`/practice/exercises/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit answer
  submitAnswer: async (id, userAnswer, timeSpent) => {
    try {
      const response = await api.post(`/practice/exercises/${id}/submit`, {
        userAnswer,
        timeSpent
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get history
  getHistory: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/practice/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get stats
  getStats: async () => {
    try {
      const response = await api.get('/practice/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};