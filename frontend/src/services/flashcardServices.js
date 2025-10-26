import api from '../utils/api';

export const flashcardServices = {
  getAll: async () => {
    try {
      const response = await api.get('/flashcards');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByDeck: async (deckId) => {
    try {
      const response = await api.get(`/flashcards/deck/${deckId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/flashcards', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/flashcards/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default flashcardServices;