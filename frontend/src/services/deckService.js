import api from '../utils/api';

export const deckService = {
  browseDecks: async () => {
    try {
      const response = await api.get('/decks/browse');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách deck');
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/decks/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải danh mục');
    }
  },

  getFeaturedDecks: async () => {
    try {
      const response = await api.get('/decks/featured');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải deck nổi bật');
    }
  },

  getPopularDecks: async () => {
    try {
      const response = await api.get('/decks/popular');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tải deck phổ biến');
    }
  },

  incrementView: async (id) => {
    try {
      const response = await api.post(`/decks/${id}/view`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật lượt xem');
    }
  },

  incrementStudy: async (id) => {
    try {
      const response = await api.post(`/decks/${id}/study`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật lượt học');
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/decks', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAll: async () => {
    try {
      const response = await api.get('/decks');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  generateAIFlashcards: async (deckId, topic) => {
    try {
      const response = await api.post(`/decks/${deckId}/generate-ai`, { topic });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};