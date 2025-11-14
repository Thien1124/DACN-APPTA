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

// ✅ Thêm method getAllByDeck
export const flashcardService = {
  // ✅ GET /api/decks/:deckId - Lấy deck info only (không có flashcards)
  getByDeck: async (deckId) => {
    try {
      // ✅ Change from /decks/:id/flashcards to /decks/:id
      const response = await axiosInstance.get(`/decks/${deckId}`);
      return response.data;
    } catch (error) {
      console.error('Get deck by id error:', error);
      throw error;
    }
  },
  getByDeck1: async (deckId) => {
  try {
    const response = await axios.get(`${API_URL}/flashcards/deck/${deckId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải flashcards' };
  }
},

  // ✅ Get all flashcards by deck ID
  getAllByDeck: async (deckId) => {
    try {
      const response = await axiosInstance.get(`/decks/${deckId}/flashcards`);
      return response.data;
    } catch (error) {
      console.error('Get flashcards by deck error:', error);
      throw error;
    }
  },

  // ✅ POST /api/study/sessions/start - Bắt đầu study session
  startSession: async (deckId, mode = 'FLIP', sessionType = 'REVIEW', cardLimit = 50) => {
    try {
      const response = await axiosInstance.post('/study/sessions/start', {
        deckId,
        studyMode: mode,
        sessionType: sessionType,
        cardLimit: cardLimit
      });
      // ✅ Backend will return flashcards in session response
      return response.data;
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  },

  // ✅ POST /api/study/sessions/:sessionId/answer - Submit answer
  submitAnswer: async (sessionId, flashcardId, quality, responseTime = 0) => {
    try {
      const response = await axiosInstance.post(
        `/study/sessions/${sessionId}/answer`,
        {
          flashcardId,
          quality, // 0-5 (SM-2 algorithm)
          responseTime
        }
      );
      return response.data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  // ✅ POST /api/study/sessions/:sessionId/complete - Hoàn thành session
  completeSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(
        `/study/sessions/${sessionId}/complete`
      );
      return response.data;
    } catch (error) {
      console.error('Complete session error:', error);
      throw error;
    }
  },

  // ✅ GET /api/study/progress/:deckId - Lấy tiến độ deck
  getDeckProgress: async (deckId) => {
    try {
      const response = await axiosInstance.get(`/study/progress/${deckId}`);
      return response.data;
    } catch (error) {
      console.error('Get deck progress error:', error);
      throw error;
    }
  },

  // ✅ GET /api/study/stats - Lấy thống kê tổng quan
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/study/stats');
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  // ✅ Thêm/bỏ star (bookmark)
  toggleStar: async (flashcardId) => {
    try {
      const response = await axiosInstance.post(
        `/flashcards/${flashcardId}/toggle-star`
      );
      return response.data;
    } catch (error) {
      console.error('Toggle star error:', error);
      throw error;
    }
  },

  // ✅ GET /api/study/sessions/:sessionId - Get session details
  getSessionDetails: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/study/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get session details error:', error);
      throw error;
    }
  },

  // ✅ POST /api/study/sessions/:sessionId/abandon - Abandon session
  abandonSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/study/sessions/${sessionId}/abandon`);
      return response.data;
    } catch (error) {
      console.error('Abandon session error:', error);
      throw error;
    }
  },
};

export default flashcardService;