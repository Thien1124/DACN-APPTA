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

// ==================== AI ENDPOINTS (TASK 21) ====================

export const geminiService = {
  // POST /api/ai/analyze - Phân tích từ
  analyze: async (word, context = '') => {
    try {
      const response = await axiosInstance.post('/ai/analyze', {
        word,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini analyze error:', error);
      throw error;
    }
  },

  // POST /api/ai/analyze-and-create - Phân tích & tạo flashcard
  analyzeAndCreate: async (deckId, word, context = '') => {
    try {
      const response = await axiosInstance.post('/ai/analyze-and-create', {
        deckId,
        word,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini analyze and create error:', error);
      throw error;
    }
  },

  // POST /api/ai/detect-polysemy - Phát hiện đa nghĩa
  detectPolysemy: async (word) => {
    try {
      const response = await axiosInstance.post('/ai/detect-polysemy', {
        word,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini detect polysemy error:', error);
      throw error;
    }
  },

  // POST /api/ai/generate-examples - Sinh câu ví dụ
  generateExamples: async (word, meaning = '', count = 3) => {
    try {
      const response = await axiosInstance.post('/ai/generate-examples', {
        word,
        meaning,
        count,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini generate examples error:', error);
      throw error;
    }
  },

  // POST /api/ai/suggest-images - Gợi ý từ khóa hình ảnh
  suggestImages: async (word, meaning = '') => {
    try {
      const response = await axiosInstance.post('/ai/suggest-images', {
        word,
        meaning,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini suggest images error:', error);
      throw error;
    }
  },

  // POST /api/ai/suggest-collocations - Gợi ý collocations
  suggestCollocations: async (word, partOfSpeech = '') => {
    try {
      const response = await axiosInstance.post('/ai/suggest-collocations', {
        word,
        partOfSpeech,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini suggest collocations error:', error);
      throw error;
    }
  },

  // POST /api/ai/enrich/:id - Làm giàu flashcard
  enrichFlashcard: async (flashcardId, regenerate = false) => {
    try {
      const response = await axiosInstance.post(`/ai/enrich/${flashcardId}`, {
        regenerate,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini enrich flashcard error:', error);
      throw error;
    }
  },

  // POST /api/ai/batch-create - Tạo flashcards hàng loạt
  batchCreate: async (deckId, words) => {
    try {
      // Validate input
      if (!deckId) {
        throw new Error('Deck ID is required');
      }
      
      if (!Array.isArray(words) || words.length === 0) {
        throw new Error('Words array is required and cannot be empty');
      }

      // Limit to 10 words
      const limitedWords = words.slice(0, 10);

      console.log('Batch create request:', { deckId, words: limitedWords });

      // ✅ Backend endpoint: POST /api/ai/batch-create
      const response = await axiosInstance.post('/ai/batch-create', {
        deckId,
        words: limitedWords
      });

      console.log('Batch create response:', response.data);

      // ✅ Backend response format: { success: true, message: "...", data: [...flashcards] }
      return response.data;
    } catch (error) {
      console.error('Gemini batch create error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // POST /api/ai/generate-vocabulary - Tạo danh sách từ vựng
  generateVocabulary: async (topic, category, level, count = 10) => {
    try {
      const response = await axiosInstance.post('/ai/generate-vocabulary', {
        topic,
        category,
        level,
        count
      });
      return response.data;
    } catch (error) {
      console.error('Generate vocabulary error:', error);
      throw error;
    }
  },

  // POST /api/ai/batch-create-with-images - Tạo flashcards với hình ảnh
  batchCreateWithImages: async (deckId, words) => {
    try {
      console.log('🖼️ Calling batchCreateWithImages API with:', words.length, 'words');
      
      const response = await axiosInstance.post('/ai/batch-create-with-images', {
        deckId,
        words
      });
      
      console.log('🖼️ batchCreateWithImages response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Batch create with images error:', error);
      throw error;
    }
  },
};

export default geminiService;