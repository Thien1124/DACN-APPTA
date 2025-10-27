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

  // Get user's decks
  getMyDecks: async () => {
    try {
      const response = await api.get('/decks/my-decks');
      return response.data;
    } catch (error) {
      console.error('Get my decks error:', error);
      throw new Error(error.response?.data?.message || 'Could not fetch decks');
    }
  },

  // Create new deck
  create: async (data) => {
    try {
      const response = await api.post('/decks', data);
      return response.data;
    } catch (error) {
      console.error('Create deck error:', error);
      throw new Error(error.response?.data?.message || 'Could not create deck');
    }
  },

  // Update deck
  update: async (id, data) => {
    try {
      const response = await api.put(`/decks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update deck error:', error);
      throw new Error(error.response?.data?.message || 'Could not update deck');
    }
  },

  // Delete deck
  delete: async (id) => {
    try {
      const response = await api.delete(`/decks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete deck error:', error);
      throw new Error(error.response?.data?.message || 'Could not delete deck');
    }
  }
};