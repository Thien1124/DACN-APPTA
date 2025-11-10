import api from '../utils/api';

export const vocabularyBankService = {
  // Save flashcard to bank
  saveFlashcard: async (flashcardId) => {
    try {
      const response = await api.post(`/vocabulary-bank/save-flashcard/${flashcardId}`);
      return response.data;
    } catch (error) {
      console.error('Save flashcard error:', error);
      throw error;
    }
  },

  // Check if flashcard is already saved
  checkSaved: async (flashcardId) => {
    try {
      const response = await api.get(`/vocabulary-bank/check/${flashcardId}`);
      return response.data;
    } catch (error) {
      console.error('Check saved error:', error);
      throw error;
    }
  },

  // Get all vocabulary
  getAll: async (filter = 'all') => {
    try {
      const response = await api.get('/vocabulary-bank', {
        params: { filter }
      });
      return response.data;
    } catch (error) {
      console.error('Get all vocabulary error:', error);
      throw error;
    }
  },

  // Toggle star
  toggleStar: async (id) => {
    try {
      const response = await api.put(`/vocabulary-bank/${id}/star`);
      return response.data;
    } catch (error) {
      console.error('Toggle star error:', error);
      throw error;
    }
  },

  // Toggle learned
  toggleLearned: async (id) => {
    try {
      const response = await api.put(`/vocabulary-bank/${id}/learned`);
      return response.data;
    } catch (error) {
      console.error('Toggle learned error:', error);
      throw error;
    }
  },

  // Delete vocabulary
  delete: async (id) => {
    try {
      const response = await api.delete(`/vocabulary-bank/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete vocabulary error:', error);
      throw error;
    }
  }
};