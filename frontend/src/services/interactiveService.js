import api from '../utils/api';

export const interactiveService = {
  // Image Match Game
  startImageMatch: async (deckId, options = {}) => {
    const response = await api.post(`/interactive/image-match/${deckId}/start`, options);
    return response.data;
  },

  submitImageMatch: async (attemptId, answers) => {
    const response = await api.post(`/interactive/image-match/${attemptId}/submit`, { answers });
    return response.data;
  },

  // Multiple Choice Game
  startMultipleChoice: async (deckId, options = {}) => {
    const response = await api.post(`/interactive/multiple-choice/${deckId}/start`, options);
    return response.data;
  },

  submitMultipleChoice: async (attemptId, answers) => {
    const response = await api.post(`/interactive/multiple-choice/${attemptId}/submit`, { answers });
    return response.data;
  },

  // Matching Pairs Game
  startMatching: async (deckId, options = {}) => {
    const response = await api.post(`/interactive/matching/${deckId}/start`, options);
    return response.data;
  },

  submitMatching: async (attemptId, matches) => {
    const response = await api.post(`/interactive/matching/${attemptId}/submit`, { matches });
    return response.data;
  },

  // Spelling Bee Game
  startSpellingBee: async (deckId, options = {}) => {
    const response = await api.post(`/interactive/spelling-bee/${deckId}/start`, options);
    return response.data;
  },

  submitSpellingBee: async (attemptId, spellings) => {
    const response = await api.post(`/interactive/spelling-bee/${attemptId}/submit`, { spellings });
    return response.data;
  },

  checkSpelling: async (flashcardId, userSpelling) => {
    const response = await api.post('/interactive/spelling-bee/check', { flashcardId, userSpelling });
    return response.data;
  },

  // Statistics & History
  getStats: async () => {
    const response = await api.get('/interactive/stats');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/interactive/history', { params });
    return response.data;
  },

  getLeaderboard: async (gameType, limit = 10) => {
    const response = await api.get('/interactive/leaderboard', { params: { gameType, limit } });
    return response.data;
  }
};

export default interactiveService;