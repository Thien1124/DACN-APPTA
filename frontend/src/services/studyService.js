import api from '../utils/api';

export const studyService = {
  // Start study session
  startSession: async (deckId, mode, sessionType) => {
    const response = await api.post('/study/sessions/start', {
      deckId,
      studyMode: mode,
      sessionType,
    });
    return response.data;
  },

  // Submit card review
  submitAnswer: async (sessionId, flashcardId, userAnswer, isCorrect, responseTime) => {
    const response = await api.post(`/study/sessions/${sessionId}/answer`, {
      flashcardId,
      userAnswer,
      isCorrect,
      responseTime,
    });
    return response.data;
  },

  // End study session
  completeSession: async (sessionId) => {
    const response = await api.post(`/study/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get study statistics
  getStats: async () => {
    const response = await api.get('/study/stats');
    return response.data;
  },

  // Get progress
  getProgress: async (deckId) => {
    const response = await api.get(`/study/progress/${deckId}`);
    return response.data;
  },
};

export default studyService;