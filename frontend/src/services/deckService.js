import axios from 'axios';
import api from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  },

  // THÊM CÁC API MỚI:

  // GET /api/decks/search
  searchDecks: async (query, filters = {}) => {
    const response = await axiosInstance.get('/decks/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  // GET /api/decks/public
  getPublicDecks: async (page = 1, limit = 20, filters = {}) => {
    const response = await axiosInstance.get('/decks/public', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // GET /api/decks/trending
  getTrendingDecks: async (limit = 10) => {
    const response = await axiosInstance.get('/decks/trending', {
      params: { limit },
    });
    return response.data;
  },

  // POST /api/decks/:id/favorite
  favoriteDeck: async (deckId) => {
    const response = await axiosInstance.post(`/decks/${deckId}/favorite`);
    return response.data;
  },

  // DELETE /api/decks/:id/favorite
  unfavoriteDeck: async (deckId) => {
    const response = await axiosInstance.delete(`/decks/${deckId}/favorite`);
    return response.data;
  },

  // GET /api/decks/favorites
  getFavoriteDecks: async () => {
    const response = await axiosInstance.get('/decks/favorites');
    return response.data;
  },

  // POST /api/decks/:id/subscribe
  subscribeDeck: async (deckId) => {
    const response = await axiosInstance.post(`/decks/${deckId}/subscribe`);
    return response.data;
  },

  // DELETE /api/decks/:id/subscribe
  unsubscribeDeck: async (deckId) => {
    const response = await axiosInstance.delete(`/decks/${deckId}/subscribe`);
    return response.data;
  },

  // GET /api/decks/subscribed
  getSubscribedDecks: async () => {
    const response = await axiosInstance.get('/decks/subscribed');
    return response.data;
  },

  cloneDeck: async (deckId, newTitle, isPublic) => {
    const response = await api.post(`/decks/${deckId}/clone`, {
      newTitle,
      isPublic
    });
    return response.data;
  },

  mergeDecks: async (deckIds, newTitle, isPublic) => {
    const response = await api.post('/decks/merge', {
      deckIds,
      newTitle,
      isPublic
    });
    return response.data;
  },

  splitDeck: async (deckId, splitBy, criteria) => {
    const response = await api.post(`/decks/${deckId}/split`, {
      splitBy,
      criteria
    });
    return response.data;
  }
};

export default deckService;