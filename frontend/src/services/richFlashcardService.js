import api from '../utils/api';

export const richFlashcardService = {
  // Get rich flashcard by ID
  getRichFlashcard: async (flashcardId) => {
    const response = await api.get(`/flashcards-rich/${flashcardId}`);
    return response.data;
  },

  // Update rich content
  updateRichContent: async (flashcardId, richData) => {
    const response = await api.put(`/flashcards-rich/${flashcardId}`, richData);
    return response.data;
  },

  // Add audio to flashcard
  addAudio: async (flashcardId, audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await api.post(`/flashcards-rich/${flashcardId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Add image to flashcard
  addImage: async (flashcardId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/flashcards-rich/${flashcardId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addSynonym: async (id, synonym) => {
    const response = await api.post(`/flashcards-rich/${id}/synonyms`, { synonym });
    return response.data;
  },

  addAntonym: async (id, antonym) => {
    const response = await api.post(`/flashcards-rich/${id}/antonyms`, { antonym });
    return response.data;
  },

  addCollocation: async (id, collocation) => {
    const response = await api.post(`/flashcards-rich/${id}/collocations`, { collocation });
    return response.data;
  },
};

export default richFlashcardService;