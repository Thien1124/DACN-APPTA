import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const deckManagementService = {
  // POST /api/decks/:id/clone
  cloneDeck: async (deckId) => {
    const response = await axiosInstance.post(`/decks/${deckId}/clone`);
    return response.data;
  },

  // POST /api/decks/:id/share
  shareDeck: async (deckId, settings) => {
    const response = await axiosInstance.post(`/decks/${deckId}/share`, settings);
    return response.data;
  },

  // GET /api/decks/:id/export
  exportDeck: async (deckId, format = 'json') => {
    const response = await axiosInstance.get(`/decks/${deckId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // POST /api/decks/import
  importDeck: async (file, format = 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    const response = await axiosInstance.post('/decks/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // POST /api/decks/:id/archive
  archiveDeck: async (deckId) => {
    const response = await axiosInstance.post(`/decks/${deckId}/archive`);
    return response.data;
  },

  // POST /api/decks/:id/unarchive
  unarchiveDeck: async (deckId) => {
    const response = await axiosInstance.post(`/decks/${deckId}/unarchive`);
    return response.data;
  },

  // GET /api/decks/archived
  getArchivedDecks: async () => {
    const response = await axiosInstance.get('/decks/archived');
    return response.data;
  },

  // POST /api/decks/merge
  mergeDecks: async (sourceDeckIds, targetDeckId) => {
    const response = await axiosInstance.post('/decks/merge', {
      sourceDeckIds,
      targetDeckId,
    });
    return response.data;
  },
};

export default deckManagementService;