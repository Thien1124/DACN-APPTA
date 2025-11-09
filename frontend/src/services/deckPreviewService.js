import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';

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

export const deckPreviewService = {
  // GET /api/decks/:id/preview
  getDeckPreview: async (deckId) => {
    const response = await axiosInstance.get(`/decks/${deckId}/preview`);
    return response.data;
  },

  // GET /api/decks/:id/stats
  getDeckStats: async (deckId) => {
    const response = await axiosInstance.get(`/decks/${deckId}/stats`);
    return response.data;
  },

  // GET /api/decks/:id/sample
  getSampleCards: async (deckId, limit = 5) => {
    const response = await axiosInstance.get(`/decks/${deckId}/sample`, {
      params: { limit },
    });
    return response.data;
  },

  // GET /api/decks/:id/reviews
  getReviews: async (deckId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/decks/${deckId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  // POST /api/decks/:id/reviews
  addReview: async (deckId, rating, comment) => {
    const response = await axiosInstance.post(`/decks/${deckId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  },

  // PUT /api/decks/:deckId/reviews/:reviewId
  updateReview: async (deckId, reviewId, rating, comment) => {
    const response = await axiosInstance.put(`/decks/${deckId}/reviews/${reviewId}`, {
      rating,
      comment,
    });
    return response.data;
  },

  // DELETE /api/decks/:deckId/reviews/:reviewId
  deleteReview: async (deckId, reviewId) => {
    const response = await axiosInstance.delete(`/decks/${deckId}/reviews/${reviewId}`);
    return response.data;
  },
};

export default deckPreviewService;